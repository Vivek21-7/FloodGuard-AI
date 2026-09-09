import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Cpu, 
  TrendingUp 
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
        bg: 'bg-red-500/10',
        border: 'border-red-500/40',
        text: 'text-red-400',
        badge: 'bg-red-500 text-white',
        pulse: 'pulsing-glow-red',
        gradient: 'from-red-500 to-rose-600',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/40',
        text: 'text-orange-400',
        badge: 'bg-orange-500 text-white',
        pulse: 'pulsing-glow-orange',
        gradient: 'from-orange-500 to-amber-600',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-black font-semibold',
        pulse: '',
        gradient: 'from-amber-500 to-yellow-500',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-black font-semibold',
        pulse: '',
        gradient: 'from-emerald-500 to-teal-500',
      };
  }
};

export const PredictionCard: React.FC<PredictionCardProps> = ({
  predictionData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/2 mb-6"></div>
        <div className="h-44 bg-slate-800/60 rounded-xl mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800/40 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800/40 rounded w-2/3"></div>
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
    <div className={`bg-slate-900/90 border ${colors.border} rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300`}>
      {/* Background ambient lighting */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${colors.bg}`} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100 tracking-wide">
              ML Flash Flood Prediction Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Random Forest with Hydrological Physics Constraints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/70 border border-slate-700/50 px-2.5 py-1 rounded-md">
            Confidence: {Math.round(prediction.confidence_score * 100)}%
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-md ${colors.badge} ${colors.pulse}`}>
            {prediction.risk_level} RISK
          </span>
        </div>
      </div>

      {/* Main Prediction & Gauge Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
        {/* Radial Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/80">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className={colors.text}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-100 tracking-tight">
                {prediction.flood_probability_percent}%
              </span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
                Flood Prob.
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="text-xs text-slate-300 font-medium">
              Probability Score: <span className="font-mono text-cyan-400">{prediction.flood_probability.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Early Warning Window Info */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                Estimated Early Warning Lead Time
              </span>
            </div>
            <div className="text-2xl font-black text-slate-100 flex items-baseline gap-2">
              <span>{warning.lead_time_minutes} minutes</span>
              <span className="text-xs font-normal text-slate-400">
                (Peak expected: {new Date(warning.estimated_peak_time).toLocaleTimeString()})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {warning.message}
            </p>
          </div>

          {/* Quick Risk Level Legend */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
              <span className="block text-emerald-400 font-bold">LOW</span>
              <span className="text-slate-500">&lt; 30%</span>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
              <span className="block text-amber-400 font-bold">MOD</span>
              <span className="text-slate-500">30 - 60%</span>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
              <span className="block text-orange-400 font-bold">HIGH</span>
              <span className="text-slate-500">60 - 85%</span>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
              <span className="block text-red-400 font-bold">CRIT</span>
              <span className="text-slate-500">&ge; 85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability / Contributing Factors */}
      <div className="border-t border-slate-800/80 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">
              Explainability: Why is this risk level predicted?
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Shapley/Feature Relative Importance
          </span>
        </div>

        <div className="space-y-3">
          {contributing_factors.map((factor, idx) => {
            const factorColor = getRiskColor(factor.impact);
            return (
              <div key={idx} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{factor.factor}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${factorColor.badge}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-xs">
                    Value: <span className="text-slate-100 font-bold">{factor.current_value}</span> {factor.unit}
                    <span className="text-slate-500 ml-2">({Math.round(factor.importance * 100)}% wt)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${factorColor.gradient} transition-all duration-500`}
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
