import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import UserMenuDropdown from '../components/UserMenuDropdown';
import WatermarkBackground from '../components/WatermarkBackground';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang, supportedLanguages } = useLanguage();

  const handleNextLang = () => {
    const currentIndex = supportedLanguages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    setLang(supportedLanguages[nextIndex].code);
  };

  return (
    <div className="h-screen h-[100dvh] text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-[#99775C] selection:text-white relative overflow-hidden">
      {/* Clean Ambient Background with Narvik (#EAE7DD) and Sorrell Brown (#99775C) */}
      <WatermarkBackground />

      {/* Mobile Header with tap avatar dropdown */}
      <header className="lg:hidden shrink-0 z-30 border-b border-[#EAE7DD] px-3.5 py-2.5 flex items-center justify-between relative bg-white/90 backdrop-blur-md w-full max-w-full box-border">
         <div className="flex items-center space-x-2 min-w-0">
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors mr-1 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-slate-900 text-base tracking-tight truncate">URBAN <span className="text-sky-600">EYE</span></span>
         </div>
         <div className="flex items-center space-x-2 shrink-0">
           <button
             type="button"
             onClick={handleNextLang}
             title="Switch Language"
             className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-sky-700 text-xs font-mono font-bold flex items-center space-x-1 active:scale-95"
           >
             <span className="text-xs">अ/A</span>
             <span className="text-[10px] text-sky-600 font-bold uppercase">{lang}</span>
           </button>
           <UserMenuDropdown />
         </div>
      </header>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative z-10 w-full max-w-full box-border">
        {/* Top Header with Language, Theme, Notifications & User Dropdown */}
        <div className="hidden lg:block shrink-0">
          <TopHeader />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col min-h-0 w-full max-w-full box-border">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full min-w-0 box-border">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
