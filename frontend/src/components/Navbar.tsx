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
  Check,
  Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EmergencyTicker } from './EmergencyTicker';

interface NavbarProps {
  activeTab: 'dashboard' | 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology';
  setActiveTab: (tab: 'dashboard' | 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology') => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onSelectDemoLocation: (loc: string) => void;
  onOpenSitrep?: () => void;
  onOpenCitizenReport?: () => void;
}

const REGIONAL_STATIONS = [
  { name: 'Wayanad', code: 'CWC-KL-02', risk: 'CRITICAL', badge: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-xs' },
  { name: 'Kullu', code: 'CWC-HP-01', risk: 'HIGH', badge: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 shadow-xs' },
  { name: 'Kedarnath', code: 'CWC-UK-05', risk: 'CRITICAL', badge: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-xs' },
  { name: 'Cherrapunji', code: 'CWC-ML-01', risk: 'HIGH', badge: 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 shadow-xs' },
  { name: 'Chungthang', code: 'CWC-SK-03', risk: 'HIGH', badge: 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 shadow-xs' },
  { name: 'Chiplun', code: 'CWC-MH-07', risk: 'CRITICAL', badge: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-xs' },
  { name: 'Dhemaji', code: 'CWC-AS-09', risk: 'HIGH', badge: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-xs' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onSelectDemoLocation,
  onOpenSitrep,
  onOpenCitizenReport,
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
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/80 backdrop-blur-xl shadow-sm">
      {/* Live Hydrometric Emergency Ticker Marquee */}
      <EmergencyTicker />

      {/* National Tricolor Accent Bar */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Top Operations Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-1.5 px-4 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('header.imd_active', 'IMD DOPPLER: SHIMLA ACTIVE')}
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-600">
              {t('header.cwc_gauges', 'CWC TELEMETRY: 48 GAUGES SYNCED')}
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden lg:inline text-slate-600">
              {t('header.cap_online', 'CAP BROADCAST PROTOCOL: ONLINE')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-700 notranslate font-semibold" translate="no">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>IST: <strong className="text-slate-900">{currentTime || 'LIVE'}</strong></span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 border border-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 relative">
              <ShieldAlert className="w-6 h-6 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 notranslate" translate="no">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 font-sans">
                  FLOODGUARD <span className="text-indigo-600">COMMAND</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded uppercase">
                  SIH 26192
                </span>
              </div>
              <span className="text-[10px] text-slate-500 hidden sm:block font-mono tracking-tight font-medium">
                National Multi-Source Flash Flood Early Warning System • NDRF Control Desk
              </span>
            </div>
          </div>

          {/* Navigation Links - 6 Core Command Modules (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 font-sans">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('nav.dashboard', 'Home')}</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t('nav.map', 'GIS Risk Map')}</span>
            </button>

            <button
              onClick={() => setActiveTab('prediction')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'prediction'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('nav.prediction', 'ML Predictor')}</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t('nav.alerts', 'Alerts & Evac')}</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{t('nav.analysis', 'Historical Trends')}</span>
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'methodology'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('nav.methodology', 'About & Dossier')}</span>
            </button>
          </nav>

          {/* Action Actions, Language Dropdown & SITREP Button */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-mono font-semibold transition-all shadow-xs"
                title="Select Interface Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="notranslate flex items-center gap-1" translate="no">
                  <span>{currentLanguageObj.flag}</span>
                  <span className="font-bold">{currentLanguageObj.code.toUpperCase()}</span>
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-500 border-b border-slate-100 flex items-center justify-between">
                    <span>INTERFACE LANGUAGE</span>
                    <span className="text-indigo-600 font-bold">7 REGIONAL</span>
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
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {onOpenCitizenReport && (
              <button
                onClick={onOpenCitizenReport}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold transition-all shadow-xs"
                title="Submit or view citizen and local observer ground reports"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>GROUND INTEL</span>
              </button>
            )}

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-mono font-semibold transition-all shadow-xs"
                title="Generate printable official Incident Situation Report"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('nav.sitrep', 'OFFICIAL SITREP')}</span>
              </button>
            )}

            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-xs ${
                isDemoMode
                  ? 'bg-indigo-600 border-indigo-700 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>{isDemoMode ? t('nav.sandbox', 'SANDBOX') : t('nav.live_api', 'LIVE API')}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-200/80 gap-1.5 scrollbar-none font-sans">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'prediction'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ML Predictor</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'alerts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'methodology'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>

        {/* Tactical River Basin Gauge Selector Sub-Bar */}
        <div className="py-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] uppercase tracking-wider text-slate-700 font-semibold">CWC Telemetry Monitoring Nodes:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 notranslate" translate="no">
            {REGIONAL_STATIONS.map((station) => (
              <button
                key={station.name}
                onClick={() => onSelectDemoLocation(station.name)}
                className={`px-2 py-1 rounded-md border ${station.badge} text-[11px] transition-all flex items-center gap-1.5 font-medium`}
              >
                <span className="font-semibold">{station.name}</span>
                <span className="text-[9px] opacity-75 font-mono">[{station.code}]</span>
                <span className="text-[9px] font-black">{station.risk}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Operational Ticker Bar */}
      <div className="bg-slate-100 border-t border-b border-slate-200 py-1.5 px-4 ticker-wrap text-[11px] font-mono text-slate-700">
        <div className="ticker-move flex items-center gap-8">
          <span className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            CWC FLASH WARNING (WAYANAD): Kabini & Chaliyar catchment run-off exceeds 320mm/24h — Evacuate Chooralmala sector
          </span>
          <span className="text-slate-400">■</span>
          <span className="text-amber-800 font-semibold">
            HIMACHAL VIGIL: Beas River discharge at Bhuntar (2.8m, Danger: 2.8m) — Suketi Catchment saturation 82%
          </span>
          <span className="text-slate-400">■</span>
          <span className="text-sky-800 font-semibold">
            NORTHEAST BULLETIN: Cherrapunji-Mawsynram 6h cumulative rain 164mm — Wah Umngot & Meghalaya gorge watch
          </span>
          <span className="text-slate-400">■</span>
          <span className="text-purple-800 font-semibold">
            SIKKIM TEESTA BASIN: Chungthang & Dikchu automated stage gauges reading high — GLOF monitoring active
          </span>
          <span className="text-slate-400">■</span>
          <span className="text-emerald-800 font-semibold">
            WESTERN GHATS: Vashishti River Chiplun tidal backwater advisory active — NDRF Battalion 5 & 14 deployed
          </span>
          <span className="text-slate-400">■</span>
          <span className="text-slate-800 font-semibold">
            DEFENSE & CIVIL PROTECTION: DEOC Hotline 1077 • National Disaster Emergency Helpline: 112
          </span>
        </div>
      </div>
    </header>
  );
};
