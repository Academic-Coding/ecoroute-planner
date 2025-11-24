
export enum TransportMode {
  CAR_GAS = 'Car (Gas)',
  CAR_EV = 'Car (EV)',
  BUS = 'Bus',
  TRAIN = 'Train',
  BIKE = 'Bicycle',
  WALK = 'Walking',
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteOption {
  mode: TransportMode;
  routeLabel?: string;
  durationMinutes: number;
  distance: number;
  distanceUnit: string;
  emissionsKg: number;
  costEstimate: string;
  greenScore: number; // 0 to 100
  description: string;
  waypoints: Coordinate[];
}

export interface TripData {
  origin: string;
  destination: string;
  originCoordinates: Coordinate;
  destinationCoordinates: Coordinate;
  routes: RouteOption[];
  summary: string;
  isFeasible: boolean;
}

export interface TripInput {
  origin: string;
  destination: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  purpose: 'Commercial' | 'Educational' | 'Personal' | 'Other';
}

export interface Review {
  id: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved';
  date: string;
}
