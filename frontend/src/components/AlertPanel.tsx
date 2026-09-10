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
    <div className={`rounded-2xl p-5 shadow-sm border transition-all ${
      isHighRisk 
        ? 'bg-rose-50/80 border-rose-300 shadow-rose-100' 
        : 'bg-white border-slate-200/80'
    }`}>
      {/* Official Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-mono flex items-center gap-2">
              DISASTER EARLY WARNING & ACTION DIRECTIVES
              {isHighRisk && (
                <span className="text-[9px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono animate-pulse shadow-xs">
                  LEVEL-3 EMERGENCY
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 font-medium">
              Protocol: C-DAC CAP-CP v1.2 • NDRF Standard Operating Procedure (SOP) Directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-bold">ZONE:</span>
          <span className="font-bold text-indigo-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
            {locationName}
          </span>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 border font-mono text-xs ${
        warning.alert_level === 'CRITICAL'
          ? 'bg-rose-100 border-rose-300 text-rose-950 shadow-xs'
          : warning.alert_level === 'HIGH'
          ? 'bg-orange-100 border-orange-300 text-orange-950 shadow-xs'
          : warning.alert_level === 'MODERATE'
          ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
          : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
      }`}>
        <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
        <div className="flex-1">
          <div className="font-bold text-xs tracking-wider flex items-center justify-between">
            <span>OFFICIAL OPERATIONAL DIRECTIVE — {warning.alert_level} STATUS</span>
            <span className="text-[10px] opacity-75 font-semibold">CERTAINTY: OBSERVED / HIGH</span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed font-sans text-slate-900 font-medium">
            {warning.message}
          </p>
        </div>
      </div>

      {/* Recommended Actions List */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          MANDATORY FIELD SAFETY & EVACUATION CHECKLIST (NDMA GUIDELINES)
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 hover:bg-indigo-50/30 transition-colors shadow-xs"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] font-mono flex items-center justify-center mt-0.5 border border-indigo-200 shadow-xs">
                {index + 1}
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Radio & Helpline Footer Bar */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium">
          <Radio className="w-3.5 h-3.5 text-indigo-600" />
          <span>CIVIL DEFENSE VHF: <strong className="text-slate-900">156.800 MHz (CH 16)</strong></span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span className="text-slate-600">STATE EOC: <strong className="text-emerald-700">1070</strong></span>
          <span className="text-slate-600">DISTRICT EOC: <strong className="text-amber-700">1077</strong></span>
          <span className="text-slate-600">POLICE / FIRE / AMBULANCE: <strong className="text-indigo-700">112</strong></span>
        </div>
      </div>
    </div>
  );
};
