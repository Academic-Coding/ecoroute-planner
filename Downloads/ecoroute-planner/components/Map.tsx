
import React, { useEffect, useRef } from 'react';
import { TripData, TransportMode, RouteOption } from '../types';

// Declare Leaflet types since we are using CDN
declare global {
  interface Window {
    L: any;
  }
}

interface MapProps {
  tripData: TripData;
  activeRoutes: RouteOption[]; // Routes currently visible in the list
  selectedIndex: number | null;
  onRouteSelect: (index: number) => void;
}

export const Map: React.FC<MapProps> = ({ tripData, activeRoutes, selectedIndex, onRouteSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const layerGroup = useRef<any>(null);
  const routeLayers = useRef<any[]>([]); // Store references to route layers

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`;
    }
    return `${mins} min`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    if (!leafletMap.current) {
      const { lat, lng } = tripData.originCoordinates;
      leafletMap.current = window.L.map(mapRef.current).setView([lat, lng], 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);

      layerGroup.current = window.L.layerGroup().addTo(leafletMap.current);
    }
  }, []); // Only on mount (approx)

  // Draw Layers
  useEffect(() => {
    if (!leafletMap.current || !layerGroup.current) return;

    const L = window.L;
    layerGroup.current.clearLayers();
    routeLayers.current = []; // Reset layer storage

    // --- Markers ---
    const startIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const endIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([tripData.originCoordinates.lat, tripData.originCoordinates.lng], { icon: startIcon })
      .bindPopup(`<b>Start:</b> ${tripData.origin}`)
      .addTo(layerGroup.current);

    L.marker([tripData.destinationCoordinates.lat, tripData.destinationCoordinates.lng], { icon: endIcon })
      .bindPopup(`<b>End:</b> ${tripData.destination}`)
      .addTo(layerGroup.current);

    // --- Routes ---
    const bounds = L.latLngBounds([
      [tripData.originCoordinates.lat, tripData.originCoordinates.lng],
      [tripData.destinationCoordinates.lat, tripData.destinationCoordinates.lng]
    ]);

    // Iterate over activeRoutes to ensure index alignment with the UI list
    activeRoutes.forEach((route: RouteOption, index: number) => {
      if (!route.waypoints || route.waypoints.length === 0) return;

      const latLngs = route.waypoints.map((wp: any) => [wp.lat, wp.lng]);
      latLngs.forEach((point: any) => bounds.extend(point));

      let baseColor = '#94a3b8'; 
      let baseWeight = 5;
      let dashArray = null;
      let zIndex = 1;

      // Style based on mode
      if (route.mode === TransportMode.BUS) {
          baseColor = '#ea580c'; // Orange-600
          baseWeight = 6;
          zIndex = 10;
      } else if (route.mode === TransportMode.TRAIN) {
          baseColor = '#4f46e5'; // Indigo-600
          baseWeight = 5;
          zIndex = 5;
      } else if (route.mode === TransportMode.BIKE) {
          baseColor = '#10b981'; // Emerald-500
          dashArray = '5, 10';
      } else if (route.mode === TransportMode.WALK) {
          baseColor = '#0d9488'; // Teal-600
          dashArray = '1, 5';
      } else if (route.mode.includes('Car')) {
           baseColor = '#3b82f6'; // Blue-500
      }

      // Is this route currently selected?
      const isSelected = selectedIndex === index;
      
      const polyline = L.polyline(latLngs, {
        color: isSelected ? '#000' : baseColor, // Black highlighting if selected
        weight: isSelected ? 8 : baseWeight,
        dashArray,
        opacity: isSelected ? 1 : 0.7,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'route-polyline transition-all' // For CSS transitions if needed
      });

      // Add Tooltip (Hover content)
      const tooltipContent = `
        <div class="font-sans p-1">
          <div class="font-bold text-sm mb-1">${route.mode} ${route.routeLabel ? `(${route.routeLabel})` : ''}</div>
          <div class="text-xs">⏱️ ${formatDuration(route.durationMinutes)}</div>
          <div class="text-xs">💰 ${route.costEstimate}</div>
        </div>
      `;
      
      polyline.bindTooltip(tooltipContent, {
        sticky: true, // Follows mouse
        direction: 'top',
        className: 'bg-white px-2 py-1 rounded shadow-lg border border-slate-200'
      });

      // Interactions
      polyline.on('mouseover', (e: any) => {
        const layer = e.target;
        if (selectedIndex !== index) {
            layer.setStyle({ 
                weight: baseWeight + 3, 
                opacity: 1,
                color: baseColor // Keep original color but brighter
            });
        }
        layer.bringToFront();
      });

      polyline.on('mouseout', (e: any) => {
        const layer = e.target;
        if (selectedIndex !== index) {
            layer.setStyle({ 
                weight: baseWeight, 
                opacity: 0.7,
                color: baseColor 
            });
        }
      });

      polyline.on('click', () => {
        onRouteSelect(index);
      });

      polyline.addTo(layerGroup.current);
      routeLayers.current[index] = polyline;

      // Decorators (Simple circles for bus stops visualization)
      if (route.mode === TransportMode.BUS) {
        const midPoint = latLngs[Math.floor(latLngs.length / 2)];
        L.circleMarker(midPoint, {
           radius: 4,
           fillColor: '#fff',
           color: '#ea580c',
           weight: 2,
           opacity: 1,
           fillOpacity: 1,
           interactive: false
        }).addTo(layerGroup.current);
      }
    });

    // Fit bounds
    leafletMap.current.fitBounds(bounds, { padding: [50, 50] });

  }, [tripData, activeRoutes, selectedIndex]); // Re-render when these change

  return (
    <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div ref={mapRef} className="w-full h-96 z-0 relative" style={{ minHeight: '400px' }} />
    </div>
  );
};
