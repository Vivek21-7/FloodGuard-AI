import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Clock, 
  Radio, 
  FileText, 
  Settings, 
  LogOut, 
  Building, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Activity,
  Layers
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
  onOpenSitrep: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
  onOpenSitrep,
}) => {
  const [dutyStatus, setDutyStatus] = useState<'ON_DUTY' | 'STANDBY' | 'EMERGENCY'>('ON_DUTY');
  const [commanderName, setCommanderName] = useState('Cmdr. Rajesh Verma');
  const [isEditingName, setIsEditingName] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: 'ON_DUTY' | 'STANDBY' | 'EMERGENCY') => {
    setDutyStatus(newStatus);
    const msg = 
      newStatus === 'ON_DUTY' ? 'Status updated to: ACTIVE ON DUTY (Normal Operations)' :
      newStatus === 'STANDBY' ? 'Status updated to: STANDBY VIGIL' :
      'Status escalated to: EMERGENCY INCIDENT COMMAND (CAP-CP Broadcast Primed)';
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden text-slate-900 font-sans my-8">
        {/* Top Control Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NDRF DISASTER COMMAND DESK • OPERATOR CREDENTIALS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            title="Close Profile Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity Card */}
        <div className="p-6 space-y-5">
          {/* Avatar and Primary Identity */}
          <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                RV
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                dutyStatus === 'ON_DUTY' ? 'bg-emerald-500' :
                dutyStatus === 'STANDBY' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
              }`}></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={commanderName}
                      onChange={(e) => setCommanderName(e.target.value)}
                      className="text-base font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-0.5 w-full outline-indigo-600 font-sans"
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-lg font-mono font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      {commanderName}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[10px] text-indigo-600 hover:underline font-mono"
                    >
                      [Edit]
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex-shrink-0">
                  LEVEL-4 CLEARANCE
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Senior Incident Commander & Hydrological Specialist
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  NDRF 14th Battalion (Ops Div)
                </span>
                <span>•</span>
                <span>ID: NDRF-HQ-2026-IND</span>
              </div>
            </div>
          </div>

          {/* Operational Duty Status Selector */}
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
              OPERATOR DUTY READINESS STATUS
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <button
                onClick={() => handleStatusChange('ON_DUTY')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  dutyStatus === 'ON_DUTY'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[11px]">ACTIVE ON DUTY</span>
              </button>

              <button
                onClick={() => handleStatusChange('STANDBY')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  dutyStatus === 'STANDBY'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-[11px]">STANDBY VIGIL</span>
              </button>

              <button
                onClick={() => handleStatusChange('EMERGENCY')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  dutyStatus === 'EMERGENCY'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-[11px]">EMERGENCY OPS</span>
              </button>
            </div>

            {statusMessage && (
              <div className="mt-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Connected Agency Feeds & Authority Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              AUTHORIZATIONS & REAL-TIME INTERFACES
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600">CWC Telemetry:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  CONNECTED
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600">CAP-CP Broadcast:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  AUTHORIZED
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600">IMD Radar Mesh:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  SYNCHRONIZED
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-600">NDMA Satellite Grid:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  SECURE ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenSitrep();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Incident SITREP</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToSettings();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>System Settings</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
