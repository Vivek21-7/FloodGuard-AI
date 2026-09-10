import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  Radio, 
  Volume2, 
  Database, 
  CheckCircle2, 
  Bell, 
  RefreshCw,
  Cpu,
  Save,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SettingsTab: React.FC = () => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [warningThreshold, setWarningThreshold] = useState(60);
  const [syncIntervalSec, setSyncIntervalSec] = useState(15);
  const [audioSirenEnabled, setAudioSirenEnabled] = useState(true);
  const [capBroadcastEnabled, setCapBroadcastEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs font-mono space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-600" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                EMERGENCY SYSTEM CONFIGURATION & TELEMETRY PROTOCOLS
              </h1>
              <span className="text-xs text-slate-500 font-sans">
                Operational threshold parameters, language localization, and notification gateways
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-bold">
            CONF: v2.4-TACTICAL
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 0: Language & Localization */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>1. Application & Voice Assistant Language (7 Regional Languages)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {supportedLanguages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-sans active:scale-95 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl block mb-1">{lang.flag}</span>
                    <span className="text-xs font-bold block truncate">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Risk & Alarm Thresholds */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>2. Flash Flood Alert Threshold Sensitivity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-sans font-medium">Critical Alarm Level</span>
                  <span className="text-rose-600 font-bold">{criticalThreshold}% Probability</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Triggers automated evacuation alerts and audio sirens across sirens network.
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-sans font-medium">Warning Alert Level</span>
                  <span className="text-amber-700 font-bold">{warningThreshold}% Probability</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="75"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Issues standby notice to local Aapda Mitra disaster volunteers.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Real-time Data Sync Intervals */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>2. Telemetry Refresh & Background Polling</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSyncIntervalSec(sec)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    syncIntervalSec === sec
                      ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm font-black block">{sec} Seconds</span>
                  <span className="text-[10px] text-slate-500">Auto-refresh interval</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Audio & Gateway Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>3. Dispatcher Gateway & Notification Channels</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="text-slate-900 font-sans font-semibold block">Browser Audio Siren Alert</span>
                  <span className="text-[10px] text-slate-500">Audible warning sound on Critical flash flood breach</span>
                </div>
                <input
                  type="checkbox"
                  checked={audioSirenEnabled}
                  onChange={(e) => setAudioSirenEnabled(e.target.checked)}
                  className="accent-rose-600 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="text-slate-900 font-sans font-semibold block">Common Alerting Protocol (CAP XML) Integration</span>
                  <span className="text-[10px] text-slate-500">Directly sync warnings to NDMA Integrated Alert Gateway</span>
                </div>
                <input
                  type="checkbox"
                  checked={capBroadcastEnabled}
                  onChange={(e) => setCapBroadcastEnabled(e.target.checked)}
                  className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Telemetry Diagnostics Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-600 block uppercase">DATA STREAM DIAGNOSTICS</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CWC River Gauges: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IMD Doppler: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NASA SMAP Soil: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ML Model (120 Trees): OK</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Configuration Persisted to Operational Cache!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Operational Settings</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
