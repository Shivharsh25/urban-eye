import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import UserMenuDropdown from '../components/UserMenuDropdown';
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
    <div className="h-screen h-[100dvh] bg-[#090d16] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Mobile Header with tap avatar dropdown */}
      <header className="lg:hidden shrink-0 z-30 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between relative bg-[#090d16]/95 backdrop-blur-md">
         <div className="flex items-center space-x-2">
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors mr-1"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-white text-base tracking-tight">URBAN <span className="text-cyan-400">EYE</span></span>
         </div>
         <div className="flex items-center space-x-2">
           <button
             type="button"
             onClick={handleNextLang}
             title="Switch Language"
             className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1 active:scale-95"
           >
             <span className="text-xs">अ/A</span>
             <span className="text-[10px] text-cyan-400 font-bold uppercase">{lang}</span>
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
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative z-10 w-full max-w-full">
        {/* Top Header with Language, Theme, Notifications & User Dropdown */}
        <div className="hidden lg:block shrink-0">
          <TopHeader />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col min-h-0 w-full max-w-full">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
