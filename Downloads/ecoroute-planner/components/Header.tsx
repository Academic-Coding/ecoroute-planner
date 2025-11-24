
import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Menu, X, ChevronRight, ArrowLeft, Globe } from 'lucide-react';

interface HeaderProps {
  languagePreference: 'english' | 'local';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ languagePreference, onToggleLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setActiveSection(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setActiveSection(null);
    } else {
      setIsMenuOpen(true);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return (
          <section className="animate-in fade-in slide-in-from-right-5 duration-200">
             <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-2">About</h3>
             <p className="text-sm text-slate-700 leading-relaxed">
               Optimize your delivery routes with our advanced route calculator. Save time, reduce costs, and minimize your carbon footprint.
             </p>
          </section>
        );
      case 'services':
        return (
           <section className="animate-in fade-in slide-in-from-right-5 duration-200">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-2">Services</h3>
            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4 marker:text-brand-500">
              <li>Route Optimization</li>
              <li>Real-time Traffic Analysis</li>
              <li>Cost Calculation</li>
              <li>Carbon Footprint Tracking</li>
            </ul>
          </section>
        );
      case 'contact':
        return (
          <section className="animate-in fade-in slide-in-from-right-5 duration-200">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-2">Contact us</h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p><span className="font-semibold">Email:</span> hassanghawy@gmail.com</p>
              <p><span className="font-semibold">Phone:</span> +1 (321) 872-4951</p>
            </div>
          </section>
        );
      case 'privacy':
        return (
          <section className="animate-in fade-in slide-in-from-right-5 duration-200">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-2">Privacy Policy</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              We respect your privacy and are committed to protecting your personal data. Your information is securely stored and never shared with third parties.
            </p>
          </section>
        );
      case 'terms':
         return (
          <section className="animate-in fade-in slide-in-from-right-5 duration-200">
            <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-2">Terms of Service</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              By using our service, you agree to our terms and conditions. Please use the service responsibly and in accordance with local regulations.
            </p>
          </section>
         );
      default:
        return null;
    }
  };

  const menuItems = [
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-brand-100 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-brand-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight">EcoRoute Planner</h1>
              <p className="text-xs text-brand-700 font-medium hidden sm:block">Save Minutes, Save the Planet</p>
            </div>
          </div>
          
          {/* Right side Controls */}
          <div className="flex items-center gap-3" ref={menuRef}>
            
            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none border border-slate-200"
              title={languagePreference === 'local' ? "Switch to English" : "Switch to Local Language"}
            >
              <Globe className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold tracking-wide">{languagePreference === 'local' ? 'Local' : 'EN'}</span>
            </button>

            {/* Menu Toggle */}
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
                aria-label="Open Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="p-6 max-h-[80vh] overflow-y-auto min-h-[200px]">
                    {!activeSection ? (
                      <nav className="space-y-1">
                        {menuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left group transition-colors"
                          >
                            <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                          </button>
                        ))}
                      </nav>
                    ) : (
                      <div>
                        <button 
                          onClick={() => setActiveSection(null)}
                          className="flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 mb-4 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Back
                        </button>
                        {renderContent()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
