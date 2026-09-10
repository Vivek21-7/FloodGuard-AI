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
  Save
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans text-slate-200">
      <div className="bg-[#151b23] border border-[#263342] rounded-3xl p-6 shadow-sm font-mono space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#263342]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#FFE66D]" />
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                EMERGENCY SYSTEM CONFIGURATION & TELEMETRY PROTOCOLS
              </h1>
              <span className="text-xs text-slate-400 font-sans">
                Operational threshold parameters, notification gateways, and data stream health
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30 font-bold">
            CONF: v2.4-TACTICAL
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Risk & Alarm Thresholds */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>1. Flash Flood Alert Threshold Sensitivity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1b2330] rounded-2xl border border-[#283648] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-sans">Critical Alarm Level</span>
                  <span className="text-[#FF6B6B] font-bold">{criticalThreshold}% Probability</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full accent-[#FF6B6B] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Triggers automated evacuation alerts and audio sirens across sirens network.
                </span>
              </div>

              <div className="p-4 bg-[#1b2330] rounded-2xl border border-[#283648] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-sans">Warning Alert Level</span>
                  <span className="text-[#f97316] font-bold">{warningThreshold}% Probability</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="75"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full accent-[#f97316] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Issues standby notice to local Aapda Mitra disaster volunteers.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Real-time Data Sync Intervals */}
          <div className="space-y-4 pt-4 border-t border-[#263342]">
            <h2 className="text-xs font-bold text-[#4ECDC4] uppercase tracking-wider flex items-center gap-2">
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
                      ? 'bg-[#4ECDC4]/20 border-[#4ECDC4] text-[#4ECDC4] font-bold'
                      : 'bg-[#1b2330] border-[#283648] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-black block">{sec} Seconds</span>
                  <span className="text-[10px] text-slate-500">Auto-refresh interval</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Audio & Gateway Toggles */}
          <div className="space-y-4 pt-4 border-t border-[#263342]">
            <h2 className="text-xs font-bold text-[#FFE66D] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>3. Dispatcher Gateway & Notification Channels</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#1b2330] rounded-xl border border-[#283648] cursor-pointer">
                <div>
                  <span className="text-white font-sans font-semibold block">Browser Audio Siren Alert</span>
                  <span className="text-[10px] text-slate-400">Audible warning sound on Critical flash flood breach</span>
                </div>
                <input
                  type="checkbox"
                  checked={audioSirenEnabled}
                  onChange={(e) => setAudioSirenEnabled(e.target.checked)}
                  className="accent-[#FF6B6B] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#1b2330] rounded-xl border border-[#283648] cursor-pointer">
                <div>
                  <span className="text-white font-sans font-semibold block">Common Alerting Protocol (CAP XML) Integration</span>
                  <span className="text-[10px] text-slate-400">Directly sync warnings to NDMA Integrated Alert Gateway</span>
                </div>
                <input
                  type="checkbox"
                  checked={capBroadcastEnabled}
                  onChange={(e) => setCapBroadcastEnabled(e.target.checked)}
                  className="accent-[#4ECDC4] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Telemetry Diagnostics Status */}
          <div className="p-4 bg-[#111720] rounded-2xl border border-[#212c3b] space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">DATA STREAM DIAGNOSTICS</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CWC River Gauges: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IMD Doppler: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NASA SMAP Soil: OK</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ML Model (120 Trees): OK</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#4ECDC4] hover:bg-[#3db8af] text-[#0f1419] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#0f1419]" />
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
