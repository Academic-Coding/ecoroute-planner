
import React, { useRef, useEffect } from 'react';
import { RouteOption, TransportMode } from '../types';
import { Car, Bus, Train, Bike, Footprints, Zap, Clock, Leaf } from 'lucide-react';

interface ResultCardProps {
  route: RouteOption;
  isFastest: boolean;
  isGreenest: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  route, 
  isFastest, 
  isGreenest, 
  isSelected = false,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view if selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  const getIcon = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.CAR_GAS: return <Car className="w-6 h-6 text-red-600" />;
      case TransportMode.CAR_EV: return <Zap className="w-6 h-6 text-blue-600" />;
      case TransportMode.BUS: return <Bus className="w-6 h-6 text-orange-600" />;
      case TransportMode.TRAIN: return <Train className="w-6 h-6 text-indigo-600" />;
      case TransportMode.BIKE: return <Bike className="w-6 h-6 text-emerald-600" />;
      case TransportMode.WALK: return <Footprints className="w-6 h-6 text-teal-600" />;
      default: return <Car className="w-6 h-6" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`;
    }
    return `${mins} min`;
  };

  return (
    <div 
      ref={cardRef}
      onClick={onClick}
      className={`relative p-5 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500 shadow-lg scale-[1.01]' 
          : isGreenest 
            ? 'bg-white border-brand-200 ring-1 ring-brand-200/50' 
            : 'bg-white border-slate-200'
      }`}
    >
      {isGreenest && (
        <div className="absolute -top-3 right-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm z-10">
          <Leaf className="w-3 h-3 mr-1" /> BEST ECO CHOICE
        </div>
      )}
      {isFastest && !isGreenest && (
        <div className="absolute -top-3 right-4 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
          FASTEST
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${isSelected ? 'bg-white border-brand-200' : 'bg-slate-100 border-slate-200'}`}>
            {getIcon(route.mode)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-black text-lg">{route.mode}</h3>
                {route.routeLabel && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                        {route.routeLabel}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-700">{route.distance} {route.distanceUnit} • {route.costEstimate}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end text-black font-bold text-xl">
            <Clock className="w-4 h-4 mr-1.5 text-slate-600" />
            {formatDuration(route.durationMinutes)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Emissions</p>
          <p className={`font-bold text-lg ${route.emissionsKg === 0 ? 'text-green-700' : 'text-black'}`}>
            {route.emissionsKg} kg CO₂
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Green Score</p>
          <div className="flex items-center">
             <div className="flex-1 h-2 bg-slate-200 rounded-full mr-2 overflow-hidden border border-slate-300">
                <div 
                  className={`h-full rounded-full ${route.greenScore > 80 ? 'bg-green-600' : route.greenScore > 50 ? 'bg-yellow-500' : 'bg-red-600'}`} 
                  style={{ width: `${route.greenScore}%` }}
                ></div>
             </div>
             <span className="text-sm font-bold text-slate-800">{route.greenScore}</span>
          </div>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-800 italic border-t border-slate-200 pt-3">
        "{route.description}"
      </p>
    </div>
  );
};
