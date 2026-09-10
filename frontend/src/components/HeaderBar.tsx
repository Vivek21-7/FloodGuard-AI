import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  MapPin, 
  RefreshCw, 
  Clock, 
  Radio, 
  Search, 
  FileText, 
  ShieldCheck,
  Compass,
  PhoneCall,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface HeaderBarProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectPreset: (name: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenSitrep?: () => void;
  onUseMyLocation?: () => void;
  onOpenEmergencyDirectory?: () => void;
}

const PRESET_LOCATIONS = [
  'Pan-India',
  'Wayanad',
  'Assam',
  'Chiplun',
  'Patna',
  'Delhi',
  'Kullu',
  'Kedarnath',
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleSidebar,
  selectedLocation,
  onSelectPreset,
  onRefresh,
  isRefreshing,
  isDemoMode,
  onToggleDemoMode,
  onOpenSitrep,
  onUseMyLocation,
  onOpenEmergencyDirectory,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [cycleTimeRemaining, setCycleTimeRemaining] = useState<string>('02:00:00');

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

      // 2-Hour Rolling Model Cycle countdown
      const hours = now.getHours();
      const nextCycleHour = hours % 2 === 0 ? hours + 2 : hours + 1;
      const nextCycleTime = new Date(now);
      nextCycleTime.setHours(nextCycleHour, 0, 0, 0);
      const diffMs = nextCycleTime.getTime() - now.getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setCycleTimeRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-blue-100 px-4 flex items-center justify-between gap-3 text-slate-800 select-none z-20 shadow-xs">
      {/* Left: Sidebar Open/Close Toggle & Location Selector */}
      <div className="flex items-center gap-3">
        {/* Navigation Panel Toggle Button (Open / Close) */}
        <button
          onClick={() => {
            if (onToggleSidebar) {
              onToggleSidebar();
            } else {
              onToggleMobileSidebar();
            }
          }}
          className={`p-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer border active:scale-95 ${
            isSidebarCollapsed 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20' 
              : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 shadow-2xs'
          }`}
          title={isSidebarCollapsed ? "Open Navigation Panel" : "Close Navigation Panel"}
        >
          {isSidebarCollapsed ? (
            <>
              <PanelLeftOpen className="w-5 h-5 text-white" />
              <span className="hidden sm:inline text-xs font-bold font-sans">Open Panel</span>
            </>
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Active Catchment Location Pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 px-3 py-1.5 rounded-xl shadow-xs">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 animate-bounce" />
          <div className="flex flex-col">
            <span className="text-[9px] text-blue-600 font-mono font-bold leading-none">SCOPE / REGION:</span>
            <span className="text-xs font-bold text-blue-950 font-sans truncate max-w-[180px] sm:max-w-[240px]">
              {selectedLocation.name || `${selectedLocation.latitude.toFixed(3)}°N, ${selectedLocation.longitude.toFixed(3)}°E`}
            </span>
          </div>
        </div>

        {/* 3-Hour Predictive Warning & 2-Hour Rolling Refresh Badges */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-xs cursor-help"
            title="3-Hour Forecast Horizon: Flood risk is predicted 3 hours in advance before critical peak occurs."
          >
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>3H LEAD PREDICTION</span>
          </div>

          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-xs cursor-help"
            title="2-Hour Rolling Cycle: Predictions recalculate and update every 2 hours with new radar & satellite feeds."
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>CYCLE: 2H</span>
            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">{cycleTimeRemaining}</span>
          </div>
        </div>

        {/* Quick Regional Presets (Hidden on small screens) */}
        <div className="hidden 2xl:flex items-center gap-1.5 font-mono text-[11px]">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = selectedLocation.name?.toLowerCase().includes(preset.toLowerCase()) || 
              (preset === 'Pan-India' && selectedLocation.name?.toLowerCase().includes('pan-india'));
            return (
              <button
                key={preset}
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 font-bold shadow-xs'
                    : 'bg-blue-50/60 text-slate-700 border-blue-100/80 hover:bg-blue-100 hover:text-blue-900'
                }`}
              >
                {preset === 'Pan-India' ? '🇮🇳 Pan-India' : preset}
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold transition-all shadow-xs"
            title="Locate Device GPS"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">GPS</span>
          </button>
        )}

        {/* Emergency Helplines 112 Directory Button */}
        {onOpenEmergencyDirectory && (
          <button
            onClick={onOpenEmergencyDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Open 24/7 National & State Disaster Helplines Directory"
          >
            <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden sm:inline">🚨 Helplines</span>
          </button>
        )}

        {/* Official SITREP Modal Button */}
        {onOpenSitrep && (
          <button
            onClick={onOpenSitrep}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            title="Generate Official Incident Situation Report"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>SITREP</span>
          </button>
        )}

        {/* Live API / Sandbox Toggle */}
        <button
          onClick={onToggleDemoMode}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
            isDemoMode
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
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
          className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-blue-500/20"
          title="Refresh All Telemetry & Forecasts"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Date / Time Display */}
        <div className="hidden lg:flex flex-col text-right pl-3 border-l border-blue-200 text-[11px] leading-tight">
          <div className="flex items-center justify-end gap-1 text-slate-900 font-bold font-mono">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>{currentTime || '00:00:00'} IST</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">{currentDate}</span>
        </div>
      </div>
    </header>
  );
};
