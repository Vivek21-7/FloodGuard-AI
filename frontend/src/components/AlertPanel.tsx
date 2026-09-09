import React from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  LifeBuoy, 
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { WarningInfo, RiskLevel } from '../types';

interface AlertPanelProps {
  warning: WarningInfo | null;
  recommendations: string[];
  locationName: string;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  warning,
  recommendations,
  locationName,
}) => {
  if (!warning) return null;

  const isHighRisk = warning.alert_level === 'CRITICAL' || warning.alert_level === 'HIGH';

  return (
    <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-md border transition-all duration-300 ${
      isHighRisk 
        ? 'bg-red-950/20 border-red-500/50 shadow-red-950/30' 
        : 'bg-slate-900/85 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Actionable Early Warning & SOPs
              {isHighRisk && (
                <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Emergency Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              NDRF & State Disaster Management Authority (SDMA) Standard Operating Directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Area:</span>
          <span className="font-semibold text-cyan-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
            {locationName}
          </span>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className={`p-4 rounded-xl mb-5 flex items-start gap-3 border ${
        warning.alert_level === 'CRITICAL'
          ? 'bg-red-900/30 border-red-600/50 text-red-200'
          : warning.alert_level === 'HIGH'
          ? 'bg-orange-900/30 border-orange-600/50 text-orange-200'
          : warning.alert_level === 'MODERATE'
          ? 'bg-amber-900/30 border-amber-600/50 text-amber-200'
          : 'bg-emerald-900/30 border-emerald-600/50 text-emerald-200'
      }`}>
        <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-bold text-sm tracking-wide">
            {warning.alert_level} FLASH FLOOD DIRECTIVE
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {warning.message}
          </p>
        </div>
      </div>

      {/* Recommended Actions List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          Mandatory Safety & Evacuation Checklist
        </h4>
        <div className="space-y-2.5">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800/70 transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency NDRF Hotline Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            NDRF Control: <span className="font-bold text-rose-400 font-mono">1078 / 112</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            DDMA Himachal VHF: <span className="font-bold text-cyan-400 font-mono">1077</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer">
          <span>View Incident Command SOP Document</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
