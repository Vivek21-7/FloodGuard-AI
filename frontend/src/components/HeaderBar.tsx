import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  MapPin, 
  RefreshCw, 
  Clock, 
  Radio, 
  Search, 
  FileText, 
  ChevronDown,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface HeaderBarProps {
  onToggleMobileSidebar: () => void;
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectPreset: (name: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenSitrep?: () => void;
  onUseMyLocation?: () => void;
}

const PRESET_LOCATIONS = [
  'Wayanad',
  'Kullu',
  'Kedarnath',
  'Cherrapunji',
  'Chiplun',
  'Dhemaji',
  'Mandi',
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleMobileSidebar,
  selectedLocation,
  onSelectPreset,
  onRefresh,
  isRefreshing,
  isDemoMode,
  onToggleDemoMode,
  onOpenSitrep,
  onUseMyLocation,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#151b23] border-b border-[#212c3b] px-4 flex items-center justify-between gap-3 text-slate-200 select-none z-20">
      {/* Left: Mobile Toggle & Location Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden md:hidden p-2 rounded-xl bg-[#1e2634] hover:bg-[#283346] text-slate-300 hover:text-white transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Catchment Location Pill */}
        <div className="flex items-center gap-2 bg-[#1b2330] border border-[#2d3a4e] px-3 py-1.5 rounded-xl shadow-inner">
          <MapPin className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 animate-bounce" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-mono leading-none">TARGET BASIN:</span>
            <span className="text-xs font-bold text-white font-sans truncate max-w-[180px] sm:max-w-[240px]">
              {selectedLocation.name || `${selectedLocation.latitude.toFixed(3)}°N, ${selectedLocation.longitude.toFixed(3)}°E`}
            </span>
          </div>
        </div>

        {/* Quick Regional Presets (Hidden on small mobile) */}
        <div className="hidden xl:flex items-center gap-1.5 font-mono text-[11px]">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = selectedLocation.name?.toLowerCase().includes(preset.toLowerCase());
            return (
              <button
                key={preset}
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/40 font-bold'
                    : 'bg-[#1b2330] text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: GPS, SITREP, Mode, Refresh & Clock */}
      <div className="flex items-center gap-2.5 font-mono">
        {/* GPS Locate Button */}
        {onUseMyLocation && (
          <button
            onClick={onUseMyLocation}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1b2330] hover:bg-[#253142] border border-[#2d3a4e] text-slate-300 text-xs font-semibold transition-all shadow-xs"
            title="Locate Device GPS"
          >
            <Compass className="w-3.5 h-3.5 text-[#4ECDC4]" />
            <span className="hidden md:inline">GPS</span>
          </button>
        )}

        {/* Official SITREP Modal Button */}
        {onOpenSitrep && (
          <button
            onClick={onOpenSitrep}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b2330] hover:bg-[#253142] border border-[#2d3a4e] text-slate-200 text-xs font-bold transition-all shadow-xs"
            title="Generate Official Incident Situation Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#FFE66D]" />
            <span>SITREP</span>
          </button>
        )}

        {/* Live API / Sandbox Toggle */}
        <button
          onClick={onToggleDemoMode}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
            isDemoMode
              ? 'bg-[#FFE66D]/20 text-[#FFE66D] border-[#FFE66D]/40'
              : 'bg-[#4ECDC4]/20 text-[#4ECDC4] border-[#4ECDC4]/40'
          }`}
          title="Toggle between Live Telemetry API and Interactive Sandbox"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">{isDemoMode ? 'SANDBOX' : 'LIVE API'}</span>
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-[#1b2330] hover:bg-[#253142] border border-[#2d3a4e] text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          title="Refresh All Telemetry & Forecasts"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4ECDC4]' : ''}`} />
        </button>

        {/* Date / Time Display */}
        <div className="hidden lg:flex flex-col text-right pl-3 border-l border-[#263342] text-[11px] leading-tight">
          <div className="flex items-center justify-end gap-1 text-white font-bold font-mono">
            <Clock className="w-3 h-3 text-[#4ECDC4]" />
            <span>{currentTime || '00:00:00'} IST</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">{currentDate}</span>
        </div>
      </div>
    </header>
  );
};
