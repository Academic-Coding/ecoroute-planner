
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RouteInput } from './components/RouteInput';
import { ResultCard } from './components/ResultCard';
import { EmissionsChart } from './components/Charts';
import { Map } from './components/Map';
import { PollutionGauge } from './components/PollutionGauge';
import { RegistrationModal } from './components/RegistrationModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ReviewsList } from './components/ReviewsList';
import { calculateEcoRoutes } from './services/geminiService';
import { TripData, TripInput, RouteOption, TransportMode, UserProfile, Review } from './types';
import { AlertCircle, Lock, ExternalLink, SlidersHorizontal, ArrowUpDown, XCircle, Github, Linkedin, IdCard, Facebook, MessageSquarePlus, Star } from 'lucide-react';

type SortOption = 'duration' | 'emissions' | 'greenScore' | 'cost';
type LanguageOption = 'english' | 'local';

// Mock Data for Reviews to populate the list initially
const INITIAL_REVIEWS: Review[] = [
  { id: '1', userName: 'Sarah M.', rating: 5, comment: 'Great app! Helped me save money on my commute.', status: 'approved', date: '2023-10-15' },
  { id: '2', userName: 'Ahmed K.', rating: 4, comment: 'Very accurate calculations. Needs more bus lines in my area though.', status: 'approved', date: '2023-11-02' },
];

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(true);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for language and last input to enable re-fetching
  const [language, setLanguage] = useState<LanguageOption>('local');
  const [lastInput, setLastInput] = useState<TripInput | null>(null);

  // Filter & Sort State
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('duration');

  // Selection State
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);

  // Feasibility Popup State
  const [showFeasibilityPopup, setShowFeasibilityPopup] = useState<boolean>(false);

  // --- Usage Limit & Registration State ---
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- Feedback & Reviews State ---
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showReviewsList, setShowReviewsList] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        // Check if VITE_GEMINI_API_KEY is set in environment
        const hasEnvKey = !!import.meta.env.VITE_GEMINI_API_KEY;
        setHasKey(hasEnvKey);
      } catch (e) {
        console.error("Error checking API key state", e);
        setHasKey(false);
      } finally {
        setIsLoadingKey(false);
      }
    };
    checkKey();
  }, []);

  // Load Usage, Registration, and Reviews from LocalStorage
  useEffect(() => {
    const storedCount = localStorage.getItem('eco_usage_count');
    if (storedCount) setUsageCount(parseInt(storedCount, 10));

    const storedProfile = localStorage.getItem('eco_user_profile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      setIsRegistered(true);
    }

    const storedReviews = localStorage.getItem('eco_reviews');
    if (storedReviews) {
      setReviews([...INITIAL_REVIEWS, ...JSON.parse(storedReviews)]);
    }
  }, []);

  // Reset filters and selection when new trip data arrives
  useEffect(() => {
    if (tripData) {
      if (tripData.isFeasible) {
        setSelectedModes(Object.values(TransportMode));
        setSelectedRouteIndex(null);
        setShowFeasibilityPopup(false);
      } else {
        setShowFeasibilityPopup(true);
      }
    }
  }, [tripData]);

  // Reset selection when filters/sort change to prevent index mismatch or stale selection
  useEffect(() => {
    setSelectedRouteIndex(null);
  }, [selectedModes, sortBy]);

  const handleKeySelection = async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && aiStudio.openSelectKey) {
        await aiStudio.openSelectKey();
        setHasKey(true);
      } else {
        setError("AI Studio API is not available in this environment.");
      }
    } catch (e) {
      setError("Failed to select API key. Please try again.");
    }
  };

  const fetchRoutes = async (origin: string, destination: string, langPreference: LanguageOption) => {
    setLoading(true);
    setError(null);
    setShowFeasibilityPopup(false);
    try {
      const data = await calculateEcoRoutes(origin, destination, langPreference);
      setTripData(data);

      // Show feedback modal occasionally after successful trip
      if (Math.random() > 0.7) { // 30% chance
        setTimeout(() => setShowFeedbackModal(true), 5000);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to calculate routes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = useCallback((input: TripInput) => {
    // Check Usage Limit
    if (!isRegistered && usageCount >= 3) {
      setShowRegistrationModal(true);
      return;
    }

    // Increment Usage
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('eco_usage_count', newCount.toString());

    setLastInput(input);
    fetchRoutes(input.origin, input.destination, language);
  }, [language, isRegistered, usageCount]);

  const handleRegistrationSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsRegistered(true);
    localStorage.setItem('eco_user_profile', JSON.stringify(profile));
    setShowRegistrationModal(false);

    // Continue with the calculation if input was ready, or just close
    if (lastInput) {
      // Optionally retry the calculation immediately
    }
    alert(`Welcome, ${profile.firstName}! Registration successful.`);
  };

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      userName: userProfile ? userProfile.firstName : 'Guest User',
      rating,
      comment,
      status: 'pending', // Needs approval
      date: new Date().toISOString()
    };

    // Save custom reviews to local storage (separate from Initial mock ones)
    const existingStored = JSON.parse(localStorage.getItem('eco_reviews') || '[]');
    const updatedStored = [...existingStored, newReview];
    localStorage.setItem('eco_reviews', JSON.stringify(updatedStored));

    // Update local state (it will show as pending in a real admin panel, but for now we just store it)
    // We won't add it to the 'displayed' list immediately because it needs approval

    // Simulate Email Notification
    console.log(`[EMAIL SIMULATION] To: Hassanghawy@gmail.com | Subject: New Review from ${newReview.userName} | Body: ${comment} (${rating} stars)`);
    alert("Thank you for your feedback! Your review has been sent for approval. A notification has been sent to the administrator.");
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'local' ? 'english' : 'local';
    setLanguage(newLanguage);

    // If we have active data, re-fetch with the new language
    if (lastInput) {
      fetchRoutes(lastInput.origin, lastInput.destination, newLanguage);
    }
  };

  const closeFeasibilityPopup = () => {
    setShowFeasibilityPopup(false);
    setTripData(null); // Clear the invalid trip data so UI resets
  };

  const getSpecialRoutes = (routes: RouteOption[]) => {
    if (!routes.length) return { fastestIndex: -1, greenestIndex: -1 };

    let fastestIndex = 0;
    let greenestIndex = 0;

    routes.forEach((route, index) => {
      if (route.durationMinutes < routes[fastestIndex].durationMinutes) fastestIndex = index;
      if (route.emissionsKg < routes[greenestIndex].emissionsKg) greenestIndex = index;
    });

    return { fastestIndex, greenestIndex };
  };

  const parseCost = (costStr: string): number => {
    if (!costStr) return 0;
    const lower = costStr.toLowerCase();
    if (lower.includes('free')) return 0;
    const match = costStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const toggleMode = (mode: TransportMode) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const getProcessedRoutes = () => {
    if (!tripData || !tripData.isFeasible) return [];

    const filtered = tripData.routes.filter(r => selectedModes.includes(r.mode));

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'duration': return a.durationMinutes - b.durationMinutes;
        case 'emissions': return a.emissionsKg - b.emissionsKg;
        case 'greenScore': return b.greenScore - a.greenScore; // Higher is better
        case 'cost': return parseCost(a.costEstimate) - parseCost(b.costEstimate);
        default: return 0;
      }
    });
  };

  if (isLoadingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-brand-700 font-medium">Loading configuration...</div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-brand-700" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Authentication Required</h2>
          <p className="text-slate-800 mb-8">
            To calculate eco-friendly routes using Gemini AI, please select your Google AI Studio API key.
          </p>
          <button
            onClick={handleKeySelection}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            Connect API Key
          </button>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <a
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-600 hover:text-brand-700 font-medium flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Review Billing & Usage Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  const processedRoutes = getProcessedRoutes();
  const { fastestIndex, greenestIndex } = getSpecialRoutes(processedRoutes);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header languagePreference={language} onToggleLanguage={handleLanguageToggle} />

      {/* Modals */}
      {showRegistrationModal && (
        <RegistrationModal onSubmit={handleRegistrationSubmit} />
      )}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <ReviewsList
        isOpen={showReviewsList}
        onClose={() => setShowReviewsList(false)}
        reviews={reviews}
      />

      {/* Feasibility Popup Modal */}
      {showFeasibilityPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={closeFeasibilityPopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Route Not Available</h3>
              <p className="text-slate-700 mb-6">
                There is no information about this trip because it is in a different region or zone.
              </p>
              <button
                onClick={closeFeasibilityPopup}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors"
              >
                Search Again
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black mb-4">
              Plan Your Trip, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-teal-600">Sustainably.</span>
            </h2>
            <p className="text-lg text-slate-800 max-w-2xl mx-auto font-medium">
              Compare travel modes by time, cost, and carbon footprint. Make a choice that fits your schedule and the environment.
            </p>

            {/* Access to Reviews */}
            <button
              onClick={() => setShowReviewsList(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 bg-brand-50 px-4 py-2 rounded-full border border-brand-200 hover:bg-brand-100 transition-colors"
            >
              <Star className="w-4 h-4 fill-brand-700" />
              See Community Reviews
            </button>
          </div>

          <RouteInput onCalculate={handleCalculate} isLoading={loading} />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-8 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {tripData && tripData.isFeasible && (
            <div className="space-y-8 animate-fade-in">
              {/* Summary and Pollution Section */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                  <h3 className="text-lg font-bold text-black mb-2">Trip Summary</h3>
                  <p className="text-slate-800 leading-relaxed">{tripData.summary}</p>
                </div>
                <div className="md:col-span-1 h-full">
                  <PollutionGauge
                    location={tripData.originCoordinates}
                    locationName={tripData.origin}
                  />
                </div>
              </div>

              {/* Map Section */}
              <div className="w-full">
                <h3 className="text-lg font-bold text-black mb-4">Route Map Preview</h3>
                {/* Pass processedRoutes so map matches list state */}
                <Map
                  tripData={tripData}
                  activeRoutes={processedRoutes}
                  selectedIndex={selectedRouteIndex}
                  onRouteSelect={setSelectedRouteIndex}
                />
                <p className="text-xs text-slate-500 mt-2 text-right italic">* Map paths are approximate AI-generated visualizations.</p>
              </div>

              {/* Filter & Sort Controls */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">

                  {/* Filter by Mode */}
                  <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-2 md:mb-0 text-sm font-bold text-black">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Filter Modes:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {Object.values(TransportMode).map(mode => (
                        <button
                          key={mode}
                          onClick={() => toggleMode(mode)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${selectedModes.includes(mode)
                              ? 'bg-brand-100 text-black border-brand-200'
                              : 'bg-slate-50 text-black border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="w-full md:w-auto flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-black">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Sort by:</span>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="block w-full md:w-auto pl-3 pr-10 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md bg-slate-50 text-black"
                    >
                      <option value="duration">Duration (Fastest)</option>
                      <option value="emissions">Emissions (Lowest)</option>
                      <option value="greenScore">Green Score (Best)</option>
                      <option value="cost">Cost (Cheapest)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Visualizations Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* Column 1: Stats */}
                <div className="md:col-span-3 lg:col-span-1 space-y-6">
                  {/* Emissions Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-bold text-black mb-4">Carbon Impact (kg CO₂)</h3>
                    <div className="flex-grow">
                      <EmissionsChart routes={processedRoutes} />
                    </div>
                    <p className="text-xs text-slate-600 mt-4 text-center font-medium">Lower is better</p>
                  </div>
                </div>

                {/* Column 2 & 3: Route Results */}
                <div className="md:col-span-3 lg:col-span-2 grid gap-4">
                  {processedRoutes.length > 0 ? (
                    processedRoutes.map((route, idx) => (
                      <ResultCard
                        key={`${route.mode}-${idx}-${route.routeLabel}`}
                        route={route}
                        isFastest={idx === fastestIndex}
                        isGreenest={idx === greenestIndex}
                        isSelected={idx === selectedRouteIndex}
                        onClick={() => setSelectedRouteIndex(idx)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                      <p className="text-slate-500">No routes match your filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Feedback Trigger - Always visible at bottom right */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-24 right-6 z-40 bg-white border border-slate-200 shadow-lg p-3 rounded-full text-brand-600 hover:bg-brand-50 transition-transform hover:scale-110"
        title="Leave Feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm font-medium">
          <p>All reserve to EcoRoute Planner &copy; 2025</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="https://github.com/HASSANM1973" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/hassan-m-abdelsalam-aaa322a9" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=100093527650274" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://x.com/hassan_moh73956" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://orcid.org/0000-0003-3940-7564" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-600 transition-colors" title="ORCID ID">
              <IdCard className="w-5 h-5" />
            </a>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              <strong>Disclaimer:</strong> This software is provided "AS IS", without warranty of any kind.
              Calculations are estimates for educational purposes only. The developers assume no liability for any
              actions taken based on this information.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
