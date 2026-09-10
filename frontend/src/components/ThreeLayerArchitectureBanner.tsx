import React from 'react';
import { History, Radio, TrendingUp, Cpu, Database, Waves, CloudRain, Clock, AlertTriangle } from 'lucide-react';

export const ThreeLayerArchitectureBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-indigo-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
              SIH 26192 • ARCHITECTURE (7C: CONTENT)
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
              INTEGRATED HYDRO-METEOROLOGICAL INTELLIGENCE PIPELINE
            </h2>
          </div>
          <p className="text-xs text-indigo-200/80 font-sans mt-0.5">
            Continuous temporal fusion: Past (Historical) + Present (Real-Time Live) + Future (3–6h Forecast)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ALL 3 TEMPORAL LAYERS ACTIVE
          </span>
        </div>
      </div>

      {/* 3 Columns for Past, Present, Future */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Layer 1: PAST */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <History className="w-4 h-4" />
                LAYER 1: PAST (1967–2023)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold bg-sky-950/60 border border-sky-800 px-1.5 py-0.2 rounded">
                TRAINED
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans mb-1">
              Historical Calibrated Baseline
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
              Ensemble Random Forest (120 Trees) trained on 6,876 verified disaster instances across India, learning non-linear orographic rainfall thresholds, drainage aspect, and geomorphology.
            </p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/10 pt-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Inventory Size:</span>
              <span className="font-bold text-sky-300">6,876 Events</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Feature Vector:</span>
              <span className="font-bold text-sky-300">17 Hydrological Parameters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Model ROC-AUC:</span>
              <span className="font-bold text-emerald-400">0.892 (High Recall)</span>
            </div>
          </div>
        </div>

        {/* Layer 2: PRESENT */}
        <div className="bg-indigo-900/30 hover:bg-indigo-900/40 transition-colors border border-indigo-500/30 rounded-2xl p-4.5 flex flex-col justify-between ring-1 ring-indigo-500/20">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Radio className="w-4 h-4" />
                LAYER 2: PRESENT (LIVE NOW)
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                STREAMING
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans mb-1">
              Live In-Situ Telemetry Ingestion
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
              Real-time ingestion of Open-Meteo & IMD radar rainfall, global NASA SMAP L3 soil saturation, and live river gauge stages across 12 CWC river basin networks.
            </p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300 border-t border-indigo-500/30 pt-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Rainfall Source:</span>
              <span className="font-bold text-indigo-300">Doppler + Open-Meteo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Soil Saturation:</span>
              <span className="font-bold text-indigo-300">NASA SMAP Radiometer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">River Telemetry:</span>
              <span className="font-bold text-indigo-300">CWC 48 Stations Synced</span>
            </div>
          </div>
        </div>

        {/* Layer 3: FUTURE */}
        <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                LAYER 3: FUTURE (NEXT 3–6H)
              </span>
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 border border-amber-800 px-1.5 py-0.2 rounded">
                ROUTING
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans mb-1">
              Short-Term Hydrological Forecast
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
              Simulates prospective stage evolution using catchment mass-balance routing (<span className="text-indigo-300 font-semibold">dL/dt = (Q_in - Q_out) / A</span>) to project flood probabilities 1–6 hours in advance.
            </p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/10 pt-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Forecast Horizon:</span>
              <span className="font-bold text-rose-300">+1h, +2h, +3h to +6h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stage Projections:</span>
              <span className="font-bold text-rose-300">Dynamic Hydrograph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evacuation Lead Time:</span>
              <span className="font-bold text-amber-400">1.5 – 6.0 Hours Notice</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
