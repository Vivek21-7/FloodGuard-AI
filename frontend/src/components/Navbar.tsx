import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Map, 
  BarChart2, 
  BookOpen, 
  Sliders, 
  Radio, 
  Clock, 
  Activity, 
  FileText,
  AlertOctagon,
  Globe,
  ChevronDown,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology';
  setActiveTab: (tab: 'dashboard' | 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology') => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onSelectDemoLocation: (loc: string) => void;
  onOpenSitrep?: () => void;
}

const REGIONAL_STATIONS = [
  { name: 'Kullu', code: 'CWC-HP-01', risk: 'HIGH', badge: 'bg-orange-950/80 text-orange-400 border-orange-600/50' },
  { name: 'Mandi', code: 'CWC-HP-04', risk: 'CRITICAL', badge: 'bg-red-950/80 text-red-400 border-red-600/50' },
  { name: 'Shimla', code: 'CWC-HP-08', risk: 'MODERATE', badge: 'bg-amber-950/80 text-amber-400 border-amber-600/50' },
  { name: 'Solan', code: 'CWC-HP-12', risk: 'LOW', badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50' },
  { name: 'Bilaspur', code: 'CWC-HP-15', risk: 'LOW', badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onSelectDemoLocation,
  onOpenSitrep,
}) => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageObj } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#060911]/95 border-b border-slate-800 backdrop-blur-xl">
      {/* Subtle National Tricolor Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Top Operations Header Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-1.5 px-4 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('header.imd_active', 'IMD DOPPLER: SHIMLA ACTIVE')}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              {t('header.cwc_gauges', 'CWC TELEMETRY: 48 GAUGES SYNCED')}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden lg:inline text-slate-400">
              {t('header.cap_online', 'CAP BROADCAST PROTOCOL: ONLINE')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-300 notranslate" translate="no">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>IST: <strong className="text-white">{currentTime || 'LIVE'}</strong></span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">
              {t('header.mha_ndrf', 'DEFENSE & CIVIL SECURITY: MHA / NDRF')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/60 relative">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 notranslate" translate="no">
                <span className="font-black text-base sm:text-lg tracking-tight text-white font-sans">
                  FLOODGUARD <span className="text-cyan-400">COMMAND</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 px-1.5 py-0.5 rounded uppercase">
                  SIH 26192
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block font-mono tracking-tight">
                National Multi-Source Flash Flood Early Warning System • NDRF Control Desk
              </span>
            </div>
          </div>

          {/* Navigation Links - 6 Core Command Modules */}
          <nav className="hidden lg:flex items-center gap-1 font-sans">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('nav.dashboard', 'Operations Dashboard')}
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'map'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              {t('nav.map', 'GIS Risk Map')}
            </button>

            <button
              onClick={() => setActiveTab('prediction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'prediction'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {t('nav.prediction', 'ML Prediction')}
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'alerts'
                  ? 'bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              {t('nav.alerts', 'Alerts & Evacuation')}
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'analysis'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {t('nav.analysis', 'Hydrological Trends')}
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'methodology'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t('nav.methodology', 'About & Methodology')}
            </button>
          </nav>

          {/* Action Actions, Language Dropdown & SITREP Button */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono font-medium transition-all shadow-sm"
                title="Select Interface Language (Keeps your selection without reverting)"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="notranslate flex items-center gap-1" translate="no">
                  <span>{currentLanguageObj.flag}</span>
                  <span className="font-bold">{currentLanguageObj.code.toUpperCase()}</span>
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>INTERFACE LANGUAGE</span>
                    <span className="text-cyan-400 font-bold">7 REGIONAL</span>
                  </div>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors notranslate ${
                        language === lang.code
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                      translate="no"
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <div>
                          <span className="block text-xs leading-tight font-semibold">{lang.nativeName}</span>
                          <span className="block text-[10px] text-slate-400 leading-tight">{lang.name}</span>
                        </div>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-all shadow-sm"
                title="Generate printable official Incident Situation Report"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('nav.sitrep', 'OFFICIAL SITREP')}</span>
              </button>
            )}

            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-cyan-500/20 border-cyan-500/80 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>{isDemoMode ? t('nav.sandbox', 'SANDBOX') : t('nav.live_api', 'LIVE API')}</span>
            </button>
          </div>
        </div>

        {/* Tactical River Basin Gauge Selector Sub-Bar */}
        <div className="py-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] uppercase tracking-wider text-slate-300">CWC Telemetry Monitoring Nodes:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 notranslate" translate="no">
            {REGIONAL_STATIONS.map((station) => (
              <button
                key={station.name}
                onClick={() => onSelectDemoLocation(station.name)}
                className={`px-2 py-1 rounded border ${station.badge} hover:brightness-125 text-[11px] transition-all flex items-center gap-1.5`}
              >
                <span className="font-semibold text-slate-200">{station.name}</span>
                <span className="text-[9px] opacity-75 font-mono">[{station.code}]</span>
                <span className="text-[9px] font-black">{station.risk}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Operational Ticker Bar */}
      <div className="bg-slate-950 border-t border-b border-slate-900 py-1 px-4 ticker-wrap text-[11px] font-mono text-slate-400">
        <div className="ticker-move flex items-center gap-8">
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" />
            CWC FLASH WARNING: Beas River discharge at Bhuntar (2.8m, Danger Mark: 2.8m) — High surge imminent
          </span>
          <span className="text-slate-600">■</span>
          <span className="text-amber-300">
            SOIL INFILTRATION NOTICE: Suketi Catchment topsoil saturation 78% — Field capacity breached
          </span>
          <span className="text-slate-600">■</span>
          <span className="text-emerald-400">
            SUTLEJ VALLEY: Sunni & Tatapani gauges reading normal (1.9m) — Advisory watch maintained
          </span>
          <span className="text-slate-600">■</span>
          <span className="text-cyan-300">
            EMERGENCY DESK: NDRF 14th Bn QRT on standby • DEOC Hotline: 1077 • National Helpline: 112
          </span>
        </div>
      </div>
    </header>
  );
};
