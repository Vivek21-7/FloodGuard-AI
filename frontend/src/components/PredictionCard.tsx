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
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        text: 'text-rose-700',
        badge: 'bg-rose-600 text-white shadow-xs',
        pulse: 'pulsing-glow-red',
        gaugeStroke: '#e11d48',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-700',
        badge: 'bg-orange-600 text-white shadow-xs',
        pulse: 'pulsing-glow-orange',
        gaugeStroke: '#ea580c',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-800',
        badge: 'bg-amber-500 text-slate-900 shadow-xs font-bold',
        pulse: '',
        gaugeStroke: '#d97706',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        text: 'text-emerald-800',
        badge: 'bg-emerald-600 text-white shadow-xs',
        pulse: '',
        gaugeStroke: '#059669',
      };
  }
};

export const PredictionCard: React.FC<PredictionCardProps> = ({
  predictionData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-36 bg-slate-100 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
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
    <div className={`bg-white border ${colors.border} rounded-2xl p-5 shadow-sm transition-all`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              QUANTITATIVE FLASH FLOOD RISK INFERENCE
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            Model: Ensemble Random Forest (120 Trees) + Catchment Hydrological Constraints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-xs">
            CONFIDENCE: {Math.round(prediction.confidence_score * 100)}%
          </span>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${colors.badge} ${colors.pulse}`}>
            {prediction.risk_level} RISK
          </span>
        </div>
      </div>

      {/* Physics Formulation Badge */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 text-[11px] font-mono flex items-center justify-between text-slate-700">
        <span className="text-slate-400 font-bold">HYDROLOGICAL INDEX:</span>
        <span className="text-indigo-700 font-bold">
          Q_peak = C · I_6h · (SoilMoist_sat) · sin(Slope)
        </span>
        <span className="text-slate-400 hidden sm:inline font-semibold">[CWC-HYD-CAL]</span>
      </div>

      {/* Main Prediction & Gauge Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-5">
        {/* Radial Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-200"
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
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {prediction.flood_probability_percent}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                FLOOD PROB.
              </span>
            </div>
          </div>

          <div className="mt-2 text-center text-xs font-mono text-slate-600 font-medium">
            Probability Index: <span className="font-bold text-slate-900">{prediction.flood_probability.toFixed(2)} / 1.00</span>
          </div>
        </div>

        {/* Early Warning Window Info */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3 font-mono">
          <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                ESTIMATED EVACUATION LEAD TIME
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 flex items-baseline gap-2">
              <span>{Math.round(warning.lead_time_minutes / 60 * 10) / 10} Hours</span>
              <span className="text-xs font-semibold text-slate-500 font-sans">
                ({warning.lead_time_minutes} mins window)
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-sans font-medium">
              {warning.message}
            </p>
          </div>

          {/* Scientific Threshold Legend */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
            <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
              <span className="block text-emerald-800 font-bold">LOW</span>
              <span className="text-emerald-600">&lt;30%</span>
            </div>
            <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-200">
              <span className="block text-amber-800 font-bold">MOD</span>
              <span className="text-amber-600">30-60%</span>
            </div>
            <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-200">
              <span className="block text-orange-800 font-bold">HIGH</span>
              <span className="text-orange-600">60-85%</span>
            </div>
            <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              <span className="block text-rose-800 font-bold">CRIT</span>
              <span className="text-rose-600">&ge;85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability / Contributing Factors */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-3 font-mono">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase text-slate-800">
              FEATURE ATTRIBUTION (EXPLAINABLE AI - XAI)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            Relative Factor Weight
          </span>
        </div>

        <div className="space-y-2">
          {contributing_factors.map((factor, idx) => {
            const factorColor = getRiskColor(factor.impact);
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 font-mono">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 font-sans text-xs">{factor.factor}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${factorColor.badge}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs font-medium">
                    <span className="text-slate-900 font-bold">{factor.current_value}</span> {factor.unit}
                    <span className="text-indigo-600 font-bold ml-2">({Math.round(factor.importance * 100)}% wt)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
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
