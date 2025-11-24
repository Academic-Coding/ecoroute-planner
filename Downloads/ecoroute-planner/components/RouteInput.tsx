import React, { useState } from 'react';
import { Navigation, MapPin, Loader2, Locate } from 'lucide-react';
import { TripInput } from '../types';

interface RouteInputProps {
  onCalculate: (data: TripInput) => void;
  isLoading: boolean;
}

export const RouteInput: React.FC<RouteInputProps> = ({ onCalculate, isLoading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      onCalculate({ origin, destination });
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setOrigin(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        // Silent fail or user notification could go here, but keeping UI clean for now
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-black mb-1">From</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Navigation className="h-5 w-5 text-slate-600" />
            </div>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Times Square, NY"
              className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg leading-5 bg-white text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-150 ease-in-out sm:text-sm font-medium"
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-600 disabled:opacity-50 transition-colors"
              title="Use current location"
            >
              {isLocating ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
              ) : (
                <Locate className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-black mb-1">To</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-600" />
            </div>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Central Park, NY"
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-150 ease-in-out sm:text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !origin || !destination}
          className="w-full md:w-auto px-8 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Thinking...
            </>
          ) : (
            'Find Routes'
          )}
        </button>
      </form>
    </div>
  );
};