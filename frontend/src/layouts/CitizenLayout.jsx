import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function CitizenLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Mobile Header */}
      <div className="lg:hidden z-40 glass-panel border-b border-slate-800/80 px-4 py-3 flex items-center justify-between relative bg-[#090d16]/90 backdrop-blur-md">
         <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-lg tracking-tight">URBAN <span className="text-cyan-400">EYE</span></span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-2 rounded-lg hover:bg-slate-800 transition-colors">
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10 h-full">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar h-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
