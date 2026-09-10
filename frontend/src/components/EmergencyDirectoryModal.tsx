import React, { useState } from 'react';
import { 
  PhoneCall, 
  Phone, 
  ShieldAlert, 
  X, 
  Search, 
  MapPin, 
  ExternalLink, 
  Check, 
  Copy, 
  AlertTriangle,
  Building2,
  Radio,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { 
  NATIONAL_UNIVERSAL_HELPLINES, 
  STATE_EMERGENCY_DIRECTORIES,
  HelplineContact,
  StateEmergencyDirectory 
} from '../services/emergencyService';

interface EmergencyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocationName?: string;
}

export const EmergencyDirectoryModal: React.FC<EmergencyDirectoryModalProps> = ({
  isOpen,
  onClose,
  selectedLocationName = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9+]/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredStates = STATE_EMERGENCY_DIRECTORIES.filter((item) => {
    const matchesSearch = 
      item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.primaryNumbers.some(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.numbers.some(n => n.includes(searchQuery))) ||
      (item.localHotlines && item.localHotlines.some(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()) || l.numbers.some(n => n.includes(searchQuery))));

    if (selectedStateFilter === 'ALL') return matchesSearch;
    return item.state === selectedStateFilter && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-labelledby="emergency-directory-title"
        className="bg-white rounded-3xl shadow-2xl border border-rose-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans text-slate-900 animate-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-5 sm:p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <PhoneCall className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="emergency-directory-title" className="text-lg sm:text-xl font-black tracking-tight font-sans">
                  DISASTER & FLOOD CONTROL HELPLINES
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-bold border border-white/30">
                  24/7 TOLL-FREE
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                Government of India, NDMA, State SDMAs & District Emergency Control Rooms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Directory"
            className="p-2 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Quick Bar */}
        <div className="bg-rose-50 border-b border-rose-100 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>CRITICAL RESCUE HOTLINES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>DIAL 112 (All-in-One)</span>
            </a>

            <a
              href="tel:1078"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>NDMA 1078</span>
            </a>

            <a
              href="tel:1070"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-rose-600" />
              <span>State Control 1070</span>
            </a>

            <a
              href="tel:1077"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>District Desk 1077</span>
            </a>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by state, city, district (e.g., Maharashtra, Wayanad, Pune, Kullu, Assam, Patna)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedStateFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStateFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Regions
            </button>
            {['Maharashtra', 'Kerala', 'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Bihar', 'Delhi NCR', 'Tamil Nadu', 'Telangana', 'Karnataka', 'Gujarat'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStateFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStateFilter === st
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/40">
          {/* Section 1: National & Universal Shortcodes */}
          {selectedStateFilter === 'ALL' && !searchQuery && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>NATIONAL & UNIVERSAL SHORTCODES (PAN-INDIA)</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Applicable across all 28 States & 8 UTs</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NATIONAL_UNIVERSAL_HELPLINES.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs font-sans">{item.label}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.description}</div>
                        )}
                      </div>
                      {item.isTollFree && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono shrink-0">
                          Toll-Free
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className="flex items-center gap-1">
                          <a
                            href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-mono font-bold text-xs transition-all active:scale-95"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{num}</span>
                          </a>

                          <button
                            onClick={() => handleCopy(num)}
                            title="Copy number"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {copiedNumber === num ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Major State & City Control Rooms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-600" />
                <span>STATE & CITY DISASTER OPERATIONS DESKS</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredStates.length} Regions Listed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStates.map((stateItem, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-slate-900 text-sm font-sans flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {stateItem.state}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      24/7 ACTIVE
                    </span>
                  </div>

                  {/* Primary Numbers */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      State Disaster Control Room
                    </div>
                    {stateItem.primaryNumbers.map((prim, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-700 font-medium text-[11px]">{prim.label}</span>
                        <div className="flex items-center gap-1.5">
                          {prim.numbers.map((num, nIdx) => (
                            <a
                              key={nIdx}
                              href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-mono font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <Phone className="w-2.5 h-2.5 text-blue-500" />
                              <span>{num}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Local City & Municipal Hotlines if present */}
                  {stateItem.localHotlines && stateItem.localHotlines.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        City & High-Risk Basin Flood Cells
                      </div>
                      {stateItem.localHotlines.map((loc, lIdx) => (
                        <div key={lIdx} className="flex items-center justify-between text-xs bg-rose-50/40 p-2 rounded-xl border border-rose-100/80">
                          <span className="text-slate-800 font-medium text-[11px]">{loc.label}</span>
                          <div className="flex items-center gap-1.5">
                            {loc.numbers.map((num, nIdx) => (
                              <a
                                key={nIdx}
                                href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                                className="px-2 py-0.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-600 hover:text-white text-rose-700 font-mono font-bold text-[11px] flex items-center gap-1 transition-all"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{num}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredStates.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">No specific state match found for "{searchQuery}"</div>
                  <p className="text-xs text-slate-500">
                    You can always call the universal all-in-one emergency number <strong className="text-rose-600">112</strong> or National Relief Commissioner <strong className="text-rose-600">1070</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            <span>All emergency numbers are operational 24 hours a day, 365 days a year.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
