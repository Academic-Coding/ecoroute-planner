
import { GoogleGenAI, Type } from "@google/genai";
import { TripData, TransportMode } from "../types";

// Helper to get the AI client.
// Note: We create a new instance per call to ensure we use the latest selected key if valid.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
};

export const calculateEcoRoutes = async (origin: string, destination: string, languagePreference: 'english' | 'local' = 'local'): Promise<TripData> => {
  const ai = getAiClient();

  const languageInstruction = languagePreference === 'english'
    ? `CRITICAL LANGUAGE INSTRUCTION:
       ALL output text regarding the trip details (summary, routeLabel, description, costEstimate) MUST BE IN ENGLISH.
       Do not use the local language for these fields. 
       However, names of places (origin/destination) should remain in their recognizable forms.`
    : `CRITICAL LANGUAGE INSTRUCTION:
    1. Detect the language of the input text OR the primary language of the region/country for the origin and destination.
    2. If the input is in Arabic or the location is in an Arab country, the fields 'summary', 'description', and 'routeLabel' MUST be in Arabic.
    3. If the location is in France, these fields MUST be in French.
    4. If the location is in Italy, these fields MUST be in Italian.
    5. In general, the output text for 'summary', 'description', and 'routeLabel' must match the language of the location/input.`;

  const prompt = `
    I am planning a trip from "${origin}" to "${destination}". 
    
    ${languageInstruction}

    CRITICAL FEASIBILITY CHECK:
    1. Analyze the geographical relationship between Origin and Destination.
    2. Determine if they are in different countries (unless they are connected neighbors like US/Canada or EU/Schengen countries where cross-border ground travel is common and seamless).
    3. Determine if they are separated by a major body of water (sea, ocean, wide river) where NO standard ground transport (bridge, tunnel, regular short-distance ferry) exists. 
       - Example: London to Paris is FEASIBLE (Channel Tunnel).
       - Example: New York to London is NOT FEASIBLE (Ocean).
       - Example: Tokyo to Osaka is FEASIBLE.
       - Example: Cairo to Riyadh is NOT FEASIBLE (requires complex border crossing/desert/sea logic often not covered by simple ground transit calculators).
    4. If the trip requires a flight, or is between disparate geopolitical zones without standard ground transit, set the field 'isFeasible' to FALSE and return an empty 'routes' array.
    5. Otherwise, set 'isFeasible' to TRUE.

    CRITICAL ENUM INSTRUCTION:
    The 'mode' field MUST remain in English (e.g., "Bus", "Car (Gas)", "Train") strictly to match the code enums, regardless of the output language.

    CRITICAL UNIT INSTRUCTION:
    1. Detect the standard distance unit for the region of the trip.
       - Use 'mi' (miles) if the trip is in the US, UK, or other regions that primarily use miles.
       - Use 'km' (kilometers) for most other regions (EU, Canada, Asia, etc.).
    2. Provide the 'distance' as a number in that unit.
    3. Provide the 'distanceUnit' string field as either "km" or "mi".

    Please generate a realistic travel estimation for the following modes of transport:
    Car (Gas), Car (EV), Bus, Train, Bicycle, and Walking.
    
    For each mode, consider if there are distinct route alternatives (e.g. "Fastest" vs "No Tolls" for Car, or different Bus lines). 
    Provide up to 2 distinct route options per mode if meaningful alternatives exist. If only one route is logical, provide just one.
    
    For the response, I need geographical coordinates:
    1. Extract the approximate Latitude and Longitude for the Origin and Destination.
    2. For EACH route, generate a list of 5-10 'waypoints' (lat/lng objects) that roughly trace the path of the route on a map. This is for visualization purposes. 
       - For BUS and TRAIN routes, try to follow the actual line/tracks roughly.
       - For WALKING/BIKING, follow paths/roads.
       - Ensure the waypoints connect the Origin to the Destination.

    For each route option, provide:
    1. Mode (from the list, IN ENGLISH).
    2. A short 'routeLabel' if applicable (Translated to target language if preference is local, else English).
    3. Estimated duration in minutes.
    4. Estimated distance value (number).
    5. The distance unit ('km' or 'mi').
    6. Estimated CO2 emissions in kg.
    7. A rough cost estimate (e.g. "$5-10", "€2", "Free").
    8. A 'greenScore' from 0 (worst) to 100 (best) based on eco-friendliness.
    9. A short, one-sentence description of the experience or a tip (Translated to target language if preference is local, else English).
    10. The 'waypoints' list.

    Also provide a brief 2-sentence overall summary of the trade-offs for this trip (Translated to target language if preference is local, else English).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          origin: { type: Type.STRING },
          destination: { type: Type.STRING },
          originCoordinates: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
            required: ["lat", "lng"]
          },
          destinationCoordinates: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
            required: ["lat", "lng"]
          },
          summary: { type: Type.STRING },
          isFeasible: { type: Type.BOOLEAN },
          routes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING, enum: Object.values(TransportMode) },
                routeLabel: { type: Type.STRING, nullable: true },
                durationMinutes: { type: Type.NUMBER },
                distance: { type: Type.NUMBER },
                distanceUnit: { type: Type.STRING },
                emissionsKg: { type: Type.NUMBER },
                costEstimate: { type: Type.STRING },
                greenScore: { type: Type.INTEGER },
                description: { type: Type.STRING },
                waypoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                    required: ["lat", "lng"]
                  }
                }
              },
              required: ["mode", "durationMinutes", "distance", "distanceUnit", "emissionsKg", "costEstimate", "greenScore", "description", "waypoints"]
            }
          }
        },
        required: ["origin", "destination", "routes", "summary", "originCoordinates", "destinationCoordinates", "isFeasible"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data received from Gemini.");
  }

  return JSON.parse(text) as TripData;
};