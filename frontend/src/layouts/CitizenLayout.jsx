import React from 'react';
import Sidebar from '../components/Sidebar';

export default function CitizenLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative z-10 h-screen custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
