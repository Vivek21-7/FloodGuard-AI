import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  BarChart2, 
  BookOpen, 
  Sliders, 
  Radio, 
  MapPin, 
  Info 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'map' | 'analysis' | 'methodology';
  setActiveTab: (tab: 'dashboard' | 'map' | 'analysis' | 'methodology') => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onSelectDemoLocation: (loc: string) => void;
}

const DEMO_BUTTONS = [
  { name: 'Kullu', risk: 'HIGH', color: 'border-orange-500/60 text-orange-400' },
  { name: 'Shimla', risk: 'MODERATE', color: 'border-amber-500/60 text-amber-400' },
  { name: 'Mandi', risk: 'CRITICAL', color: 'border-red-500/60 text-red-400' },
  { name: 'Solan', risk: 'LOW', color: 'border-emerald-500/60 text-emerald-400' },
  { name: 'Bilaspur', risk: 'LOW', color: 'border-emerald-500/60 text-emerald-400' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onSelectDemoLocation,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">
                  FloodGuard<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SIH 26192
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                Ministry of Home Affairs / NDRF • Hilly Region Flash Flood Warning
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'map'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Map className="w-4 h-4" />
              Risk Map
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'analysis'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Historical Analysis
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'methodology'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Methodology
            </button>
          </nav>

          {/* Mode Switcher & Quick Demo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-cyan-500/20 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {isDemoMode ? 'DEMO MODE (Active)' : 'LIVE MODE (APIs)'}
            </button>
          </div>
        </div>

        {/* Quick Demo Location Buttons Sub-Bar */}
        <div className="py-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Quick Himachal Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {DEMO_BUTTONS.map((btn) => (
              <button
                key={btn.name}
                onClick={() => onSelectDemoLocation(btn.name)}
                className={`px-2.5 py-1 rounded-lg bg-slate-900/80 border ${btn.color} hover:bg-slate-800 text-[11px] font-semibold transition-all flex items-center gap-1`}
              >
                <span>{btn.name}</span>
                <span className="text-[9px] opacity-75">({btn.risk})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
