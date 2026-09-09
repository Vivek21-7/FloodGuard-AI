import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Cpu, 
  Layers,
  Activity,
  Binary
} from 'lucide-react';
import { PredictResponse, RiskLevel } from '../types';

interface PredictionCardProps {
  predictionData: PredictResponse | null;
  isLoading: boolean;
}

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-950/30',
        border: 'border-red-500/70',
        text: 'text-red-400',
        badge: 'bg-red-600 text-white',
        pulse: 'pulsing-glow-red',
        gaugeStroke: '#ef4444',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-950/30',
        border: 'border-orange-500/70',
        text: 'text-orange-400',
        badge: 'bg-orange-500 text-white',
        pulse: 'pulsing-glow-orange',
        gaugeStroke: '#f97316',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/60',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-black font-semibold',
        pulse: '',
        gaugeStroke: '#f59e0b',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-950/30',
        border: 'border-emerald-500/60',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-black font-semibold',
        pulse: '',
        gaugeStroke: '#10b981',
      };
  }
};

export const PredictionCard: React.FC<PredictionCardProps> = ({
  predictionData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/2 mb-4"></div>
        <div className="h-36 bg-slate-800/60 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-800/40 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800/40 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!predictionData) return null;

  const { prediction, contributing_factors, warning } = predictionData;
  const colors = getRiskColor(prediction.risk_level);

  // SVG circular gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (prediction.flood_probability_percent / 100) * circumference;

  return (
    <div className={`bg-slate-900/95 border ${colors.border} rounded-xl p-5 shadow-xl transition-all`}>
      {/* Tactical Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              QUANTITATIVE FLASH FLOOD RISK INFERENCE
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Model: Ensemble Random Forest (120 Trees) + Catchment Hydrological Constraints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
            CONFIDENCE: {Math.round(prediction.confidence_score * 100)}%
          </span>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${colors.badge} ${colors.pulse}`}>
            {prediction.risk_level} RISK
          </span>
        </div>
      </div>

      {/* Physics Formulation Badge */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 mb-4 text-[11px] font-mono flex items-center justify-between text-slate-300">
        <span className="text-slate-500">HYDROLOGICAL INDEX:</span>
        <span className="text-cyan-400 font-semibold">
          Q_peak = C · I_6h · (SoilMoist_sat) · sin(Slope)
        </span>
        <span className="text-slate-500 hidden sm:inline">[CWC-HYD-CAL]</span>
      </div>

      {/* Main Prediction & Gauge Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-5">
        {/* Radial Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={colors.gaugeStroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {prediction.flood_probability_percent}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                FLOOD PROB.
              </span>
            </div>
          </div>

          <div className="mt-2 text-center text-xs font-mono text-slate-400">
            Probability Index: <span className="font-bold text-white">{prediction.flood_probability.toFixed(2)} / 1.00</span>
          </div>
        </div>

        {/* Early Warning Window Info */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3 font-mono">
          <div className={`p-3.5 rounded-lg border ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                ESTIMATED EVACUATION LEAD TIME
              </span>
            </div>
            <div className="text-xl font-black text-white flex items-baseline gap-2">
              <span>{Math.round(warning.lead_time_minutes / 60 * 10) / 10} Hours</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                ({warning.lead_time_minutes} mins window)
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">
              {warning.message}
            </p>
          </div>

          {/* Scientific Threshold Legend */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="block text-emerald-400 font-bold">LOW</span>
              <span className="text-slate-500">&lt;30%</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="block text-amber-400 font-bold">MOD</span>
              <span className="text-slate-500">30-60%</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="block text-orange-400 font-bold">HIGH</span>
              <span className="text-slate-500">60-85%</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <span className="block text-red-400 font-bold">CRIT</span>
              <span className="text-slate-500">&ge;85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability / Contributing Factors */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3 font-mono">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase text-slate-200">
              FEATURE ATTRIBUTION (EXPLAINABLE AI - XAI)
            </h4>
          </div>
          <span className="text-[10px] text-slate-500">
            Relative Factor Weight
          </span>
        </div>

        <div className="space-y-2">
          {contributing_factors.map((factor, idx) => {
            const factorColor = getRiskColor(factor.impact);
            return (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 font-mono">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 font-sans text-xs">{factor.factor}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${factorColor.badge}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    <span className="text-white font-bold">{factor.current_value}</span> {factor.unit}
                    <span className="text-cyan-400 font-bold ml-2">({Math.round(factor.importance * 100)}% wt)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.round(factor.importance * 100 * 2.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
