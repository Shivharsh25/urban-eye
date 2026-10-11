import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import UserMenuDropdown from '../components/UserMenuDropdown';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  return (
    <div className="h-screen h-[100dvh] bg-white app-shell-bg text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors duration-150">
      {/* Mobile Header with tap avatar dropdown */}
      <header className="lg:hidden shrink-0 z-30 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between relative bg-white shadow-sm">
         <div className="flex items-center space-x-2">
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-slate-600 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all mr-0.5"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">URBAN</span>
              <span className="font-bold text-xs px-1.5 py-0.5 rounded-md bg-blue-600 text-white tracking-wider">EYE</span>
            </div>
         </div>
         <div className="flex items-center space-x-2">
           {/* Side-by-Side Clean Language Pill */}
           <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shadow-inner">
             <button
               type="button"
               onClick={() => setLang('en')}
               className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                 lang === 'en'
                   ? 'bg-blue-600 text-white shadow-sm'
                   : 'text-slate-600 hover:text-slate-900'
               }`}
             >
               EN
             </button>
             <button
               type="button"
               onClick={() => setLang('hi')}
               className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                 lang === 'hi'
                   ? 'bg-blue-600 text-white shadow-sm'
                   : 'text-slate-600 hover:text-slate-900'
               }`}
             >
               HI
             </button>
           </div>
           <UserMenuDropdown />
         </div>
      </header>

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative z-10 w-full max-w-full">
        {/* Top Header with Language, Theme, Notifications & User Dropdown */}
        <div className="hidden lg:block shrink-0">
          <TopHeader />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col min-h-0 w-full max-w-full app-shell-bg transition-colors duration-150">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
