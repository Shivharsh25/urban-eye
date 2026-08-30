import React, { useState } from 'react';
import MapView from '../components/MapView';
import { Layers, MapPin, Filter, AlertTriangle, Zap, Droplets, Leaf, Activity, ArrowRight, Crosshair } from 'lucide-react';

export default function CitizenMapPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(true);

  const filters = [
    { id: 'all', label: 'All Issues', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { id: 'pothole', label: 'Road Hazards', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 'lighting', label: 'Street Lights', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { id: 'water', label: 'Water Leaks', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'waste', label: 'Waste Management', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
  ];

  // Dummy live feed data
  const liveFeed = [
    { id: 1, type: 'Pothole', location: 'Downtown, 5th Ave', time: 'Just now', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 2, type: 'Water Leak', location: 'Westend, Park St', time: '2m ago', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 3, type: 'Streetlight', location: 'Northside, 9th Ave', time: '15m ago', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 4, type: 'Waste Spillage', location: 'Eastside, Main St', time: '1h ago', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="flex h-screen bg-[#05080f] overflow-hidden relative font-sans">
      
      {/* Floating Filter Panel */}
      <div className="absolute top-6 left-6 z-10 w-72 flex flex-col space-y-4">
        
        {/* Header Card */}
        <div className="glass-panel p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Live Map</h1>
              <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">Urban Network</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Monitor real-time infrastructure issues reported by the community across the city grid.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-2 px-2 pb-3 mb-1 border-b border-slate-800/50">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Map Filters</span>
          </div>
          <div className="flex flex-col space-y-1">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeFilter === filter.id
                    ? `${filter.bg} border ${filter.border}`
                    : 'border border-transparent hover:bg-slate-800/50'
                }`}
              >
                <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? filter.color : 'text-slate-500'}`} />
                <span className={`text-sm font-semibold ${activeFilter === filter.id ? 'text-white' : 'text-slate-400'}`}>
                  {filter.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full relative">
        <div className="absolute inset-0 bg-slate-900 pointer-events-none z-0">
          {/* Fallback pattern while map loads or if API fails */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900/0 to-transparent"></div>
        </div>
        
        {/* MapView overlay to handle the Quota Error gracefully by reducing opacity and applying a tech tint */}
        <div className="w-full h-full relative z-0 opacity-40 mix-blend-screen saturate-0 contrast-125 sepia-[.3] hue-rotate-[180deg]">
          <MapView 
            reports={[]}
            center={{ lat: 40.7128, lng: -74.0060 }}
            zoom={13}
            onReportClick={() => {}}
          />
        </div>

        {/* High-Tech Radar Overlay (Since map is dead) */}
        {showScanner && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
            <div className="absolute w-[800px] h-[800px] rounded-full border border-cyan-500/10 flex items-center justify-center">
              <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/20 flex items-center justify-center">
                <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 flex items-center justify-center">
                  <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.2)]"></div>
                </div>
              </div>
            </div>
            
            {/* Crosshair */}
            <Crosshair className="absolute w-12 h-12 text-cyan-400/50" strokeWidth={1} />
            
            {/* Rotating Scanner Line */}
            <div className="absolute w-[800px] h-[800px] rounded-full animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}>
               <div className="w-full h-full bg-gradient-to-tr from-cyan-400/0 to-cyan-400/20 rounded-full"></div>
            </div>

            {/* Random blips */}
            <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-rose-400 rounded-full animate-ping delay-75"></div>
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping delay-150"></div>
          </div>
        )}

        {/* Top Centered Status HUD */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 glass-panel px-6 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl flex items-center space-x-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
             <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Global Scan Active</span>
           </div>
           <div className="h-4 w-px bg-slate-700"></div>
           <button 
             onClick={() => setShowScanner(!showScanner)}
             className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
           >
             {showScanner ? 'Disable Radar' : 'Enable Radar'}
           </button>
        </div>
      </div>

      {/* Right Side: Live Feed Panel */}
      <div className="absolute right-6 top-6 bottom-6 w-80 z-20 flex flex-col">
        <div className="glass-panel h-full rounded-2xl bg-slate-900/85 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-black/20">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Feed</h2>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {liveFeed.map((feed) => (
              <div key={feed.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all cursor-pointer group">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg ${feed.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                    <feed.icon className={`w-4 h-4 ${feed.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{feed.type}</h4>
                      <span className="text-[10px] text-cyan-400/70 font-mono whitespace-nowrap ml-2">{feed.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate flex items-center">
                      <MapPin className="w-3 h-3 mr-1 inline opacity-50" />
                      {feed.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-black/20">
            <button className="w-full py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center justify-center space-x-2">
              <span>View All Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
