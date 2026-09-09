import React from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  LifeBuoy, 
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Building,
  Users
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
    <div className={`rounded-xl p-5 shadow-xl backdrop-blur-md border transition-all ${
      isHighRisk 
        ? 'bg-red-950/20 border-red-500/60 shadow-red-950/20' 
        : 'bg-slate-900/95 border-slate-800'
    }`}>
      {/* Official Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono flex items-center gap-2">
              DISASTER EARLY WARNING & ACTION DIRECTIVES
              {isHighRisk && (
                <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono animate-pulse">
                  LEVEL-3 EMERGENCY
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Protocol: C-DAC CAP-CP v1.2 • NDRF Standard Operating Procedure (SOP) Directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">ZONE:</span>
          <span className="font-semibold text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {locationName}
          </span>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 border font-mono text-xs ${
        warning.alert_level === 'CRITICAL'
          ? 'bg-red-950/50 border-red-500/70 text-red-200'
          : warning.alert_level === 'HIGH'
          ? 'bg-orange-950/50 border-orange-500/70 text-orange-200'
          : warning.alert_level === 'MODERATE'
          ? 'bg-amber-950/50 border-amber-500/70 text-amber-200'
          : 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200'
      }`}>
        <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
        <div className="flex-1">
          <div className="font-bold text-xs tracking-wider flex items-center justify-between">
            <span>OFFICIAL OPERATIONAL DIRECTIVE — {warning.alert_level} STATUS</span>
            <span className="text-[10px] opacity-75">CERTAINTY: OBSERVED / HIGH</span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed font-sans text-slate-100">
            {warning.message}
          </p>
        </div>
      </div>

      {/* Recommended Actions List */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          MANDATORY FIELD SAFETY & EVACUATION CHECKLIST (NDMA GUIDELINES)
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:bg-slate-950 transition-colors"
            >
              <span className="flex-shrink-0 w-4 h-4 rounded bg-cyan-950 text-cyan-400 font-bold text-[10px] font-mono flex items-center justify-center mt-0.5 border border-cyan-800/50">
                {index + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Radio & Helpline Footer Bar */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>CIVIL DEFENSE VHF: <strong>156.800 MHz (CH 16)</strong></span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">STATE EOC: <strong className="text-emerald-400">1070</strong></span>
          <span className="text-slate-400">DISTRICT EOC: <strong className="text-amber-400">1077</strong></span>
          <span className="text-slate-400">POLICE / FIRE / AMBULANCE: <strong className="text-cyan-400">112</strong></span>
        </div>
      </div>
    </div>
  );
};
