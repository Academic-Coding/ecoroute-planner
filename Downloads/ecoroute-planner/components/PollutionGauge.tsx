
import React, { useEffect, useState } from 'react';
import { Coordinate } from '../types';
import { CloudFog, Info, Loader2, AlertTriangle } from 'lucide-react';

interface PollutionGaugeProps {
  location: Coordinate;
  locationName: string;
}

export const PollutionGauge: React.FC<PollutionGaugeProps> = ({ location, locationName }) => {
  const [aqi, setAqi] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchAQI = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lng}&current=us_aqi`
        );
        const data = await response.json();
        if (data.current && typeof data.current.us_aqi === 'number') {
          setAqi(data.current.us_aqi);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Failed to fetch AQI", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchAQI();
    }
  }, [location]);

  const getAqiInfo = (value: number) => {
    if (value <= 50) return { label: 'Good', color: '#22c55e', text: 'text-green-600', bg: 'bg-green-100' };
    if (value <= 100) return { label: 'Moderate', color: '#eab308', text: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (value <= 150) return { label: 'Unhealthy (Sensitive)', color: '#f97316', text: 'text-orange-600', bg: 'bg-orange-100' };
    if (value <= 200) return { label: 'Unhealthy', color: '#ef4444', text: 'text-red-600', bg: 'bg-red-100' };
    if (value <= 300) return { label: 'Very Unhealthy', color: '#a855f7', text: 'text-purple-600', bg: 'bg-purple-100' };
    return { label: 'Hazardous', color: '#7f1d1d', text: 'text-red-900', bg: 'bg-red-200' };
  };

  const renderGauge = (value: number) => {
    // Clamp value between 0 and 300 for display purposes
    const clampedValue = Math.min(Math.max(value, 0), 300);
    // Map 0-300 to 180-0 degrees (semi-circle)
    const percentage = clampedValue / 300;
    const rotation = -180 + (percentage * 180);

    const info = getAqiInfo(value);

    return (
      <div className="relative flex flex-col items-center justify-center pt-2">
        {/* SVG Gauge */}
        <div className="relative w-48 h-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-48 rounded-full border-[16px] border-slate-100 box-border"></div>
          {/* Colored Arc using Conic Gradient via CSS masking or multiple segments is hard in pure CSS. 
              Using SVG for precision. */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
             {/* Background Track */}
             <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
             
             {/* Dynamic Color Track - Gradient Look */}
             <defs>
               <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#22c55e" />
                 <stop offset="33%" stopColor="#eab308" />
                 <stop offset="66%" stopColor="#ef4444" />
                 <stop offset="100%" stopColor="#7f1d1d" />
               </linearGradient>
             </defs>
             <path 
               d="M 20 100 A 80 80 0 0 1 180 100" 
               fill="none" 
               stroke="url(#gaugeGradient)" 
               strokeWidth="20" 
               strokeLinecap="round"
               strokeDasharray="251.2" // Circumference of semi-circle (PI * 80)
               strokeDashoffset="0"
               className="opacity-30"
             />

             {/* Needle */}
             <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 1s ease-out' }}>
               <line x1="100" y1="100" x2="20" y2="100" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
               <circle cx="100" cy="100" r="6" fill="#1e293b" />
             </g>
          </svg>
        </div>

        {/* Value Text */}
        <div className="text-center -mt-4 z-10">
           <div className="text-3xl font-extrabold text-slate-900">{value}</div>
           <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">US AQI</div>
           <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${info.bg} ${info.text}`}>
             {info.label}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
             <CloudFog className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-black">Real-time Pollution</h3>
        </div>
        <div className="group relative">
           <Info className="w-4 h-4 text-slate-400 cursor-help" />
           <div className="absolute right-0 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 mb-2 bottom-full">
             Air Quality Index (AQI) based on real-time measurements.
           </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center min-h-[160px]">
        {loading ? (
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">Measuring air quality...</span>
          </div>
        ) : error || aqi === null ? (
          <div className="text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm">Data unavailable for this location.</p>
          </div>
        ) : (
          renderGauge(aqi)
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          Location: <span className="font-medium text-slate-600">{locationName}</span>
        </p>
        <p className="text-[10px] text-slate-300 mt-1">
          Source: Open-Meteo (Copernicus, NOAA)
        </p>
      </div>
    </div>
  );
};
