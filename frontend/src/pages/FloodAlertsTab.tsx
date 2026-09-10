import React, { useState } from 'react';
import { 
  AlertTriangle, 
  BellRing, 
  Radio, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Building, 
  Navigation, 
  Volume2, 
  Send,
  Users,
  Waves
} from 'lucide-react';
import { PredictResponse, RiskLevel } from '../types';

interface FloodAlertsTabProps {
  predictionData: PredictResponse | null;
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onNavigateToMap?: () => void;
  onOpenDispatcher?: () => void;
}

interface IncidentAlert {
  id: string;
  region: string;
  district: string;
  basin: string;
  level: 'CRITICAL' | 'WARNING' | 'ALERT';
  probability: number;
  leadTime: string;
  waterLevel: string;
  rainfall6h: string;
  populationAtRisk: string;
  safeShelter: string;
  directive: string;
  timestamp: string;
}

const LIVE_ALERTS_DATA: IncidentAlert[] = [
  {
    id: 'ALT-IN-01',
    region: 'Mandi Sadar & Suketi Gorge',
    district: 'Mandi, Himachal Pradesh',
    basin: 'Beas & Suketi River Confluence',
    level: 'CRITICAL',
    probability: 92,
    leadTime: '1.5 Hours Notice',
    waterLevel: '3.4m (+1.2m above danger)',
    rainfall6h: '115 mm',
    populationAtRisk: '42,000',
    safeShelter: 'Govt Degree College Mandi (+120m High Ground)',
    directive: 'Immediate mandatory evacuation of lower riverbed settlements. Barricade Purani Mandi bridges.',
    timestamp: '10 mins ago'
  },
  {
    id: 'ALT-IN-02',
    region: 'Chooralmala & Meppadi',
    district: 'Wayanad, Kerala',
    basin: 'Chaliyar Upper Tributaries',
    level: 'CRITICAL',
    probability: 88,
    leadTime: '1.8 Hours Notice',
    waterLevel: '3.2m (Stream bank breach)',
    rainfall6h: '165 mm',
    populationAtRisk: '28,500',
    safeShelter: 'Meppadi High School Ridge (+80m Safe Hill)',
    directive: 'Flash flood alert in effect. SDRF rapid deployment team stationed at Chooralmala bridge.',
    timestamp: '18 mins ago'
  },
  {
    id: 'ALT-IN-03',
    region: 'Chiplun Market & Lowlands',
    district: 'Ratnagiri, Maharashtra',
    basin: 'Vashishti River Basin',
    level: 'CRITICAL',
    probability: 85,
    leadTime: '2.0 Hours Notice',
    waterLevel: '4.6m (High tide lock)',
    rainfall6h: '190 mm',
    populationAtRisk: '36,000',
    safeShelter: 'Chiplun Higher Secondary Ridge (+65m Safe)',
    directive: 'Relocate commercial ground inventories and livestock to upper bypass immediately.',
    timestamp: '25 mins ago'
  },
  {
    id: 'ALT-IN-04',
    region: 'Upper Beas Basin (Bhuntar)',
    district: 'Kullu, Himachal Pradesh',
    basin: 'Beas & Parvati Confluence',
    level: 'WARNING',
    probability: 74,
    leadTime: '2.5 Hours Notice',
    waterLevel: '2.8m (approaching crest)',
    rainfall6h: '88 mm',
    populationAtRisk: '65,000',
    safeShelter: 'Bhuntar Ridge Secondary School (+95m)',
    directive: 'Pre-evacuation warning for riverbed campsites and roadside kiosks.',
    timestamp: '32 mins ago'
  },
  {
    id: 'ALT-IN-05',
    region: 'Mandakini Valley (Sonprayag)',
    district: 'Rudraprayag, Uttarakhand',
    basin: 'Mandakini Catchment',
    level: 'WARNING',
    probability: 68,
    leadTime: '3.2 Hours Notice',
    waterLevel: '4.5m (Glacial debris flow)',
    rainfall6h: '95 mm',
    populationAtRisk: '19,000',
    safeShelter: 'Sonprayag GMVN Safe Terrace (+150m)',
    directive: 'Halt pilgrimage transit caravans. Inspect culverts along Kedarnath highway.',
    timestamp: '44 mins ago'
  },
  {
    id: 'ALT-IN-06',
    region: 'Dhemaji Floodplain',
    district: 'Dhemaji, Assam',
    basin: 'Jiadhal / Brahmaputra',
    level: 'ALERT',
    probability: 52,
    leadTime: '4.5 Hours Notice',
    waterLevel: '3.8m (Embankment patrol)',
    rainfall6h: '75 mm',
    populationAtRisk: '84,000',
    safeShelter: 'Dhemaji College Flood Refuge Complex',
    directive: 'Patrol 14 earthen embankments. Alert volunteer village Aapda Mitras.',
    timestamp: '58 mins ago'
  }
];

export const FloodAlertsTab: React.FC<FloodAlertsTabProps> = ({
  predictionData,
  selectedLocation,
  onNavigateToMap,
  onOpenDispatcher
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ALERT'>('ALL');
  
  // Notification settings form
  const [smsNumber, setSmsNumber] = useState('+91 98765 43210');
  const [emailDigest, setEmailDigest] = useState('district.magistrate@nic.in');
  const [enableSoundSiren, setEnableSoundSiren] = useState(true);
  const [enableInstantCap, setEnableInstantCap] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredAlerts = LIVE_ALERTS_DATA.filter(alert => {
    if (filter === 'ALL') return true;
    return alert.level === filter;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* 📊 Active Alert Statistics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">CRITICAL THREATS</span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">3 ACTIVE</span>
            <span className="text-[10px] text-rose-700 font-medium">Evacuation orders active</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">POPULATION WARNED</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">274,500</span>
            <span className="text-[10px] text-teal-700 font-medium">Across 6 river basins</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">AVG LEAD TIME</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">2.1 HOURS</span>
            <span className="text-[10px] text-amber-700 font-medium">Before peak crest</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">CAP BROADCAST</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">SYNCED</span>
            <span className="text-[10px] text-slate-500">NDMA XML v1.2 Gateway</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 🚨 Left/Main: Alert Feed Sorted by Severity (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Feed Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                OFFICIAL EMERGENCY ALERT FEED (SORTED BY SEVERITY)
              </h2>
            </div>

            {/* Severity Filter Buttons */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {(['ALL', 'CRITICAL', 'WARNING', 'ALERT'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    filter === lvl
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="space-y-3 font-mono">
            {filteredAlerts.map((alert) => {
              const badgeStyle = 
                alert.level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                alert.level === 'WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-yellow-50 text-yellow-800 border border-yellow-200';

              return (
                <div 
                  key={alert.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4.5 space-y-3 transition-all shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}>
                        {alert.level}
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-sans">
                        {alert.region}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        ({alert.district})
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">STAGE HEIGHT</span>
                      <span className="font-bold text-sky-700">{alert.waterLevel}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">6H RAINFALL</span>
                      <span className="font-bold text-slate-900">{alert.rainfall6h}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">FLOOD PROB.</span>
                      <span className="font-black text-rose-600">{alert.probability}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase">LEAD TIME</span>
                      <span className="font-bold text-amber-700">{alert.leadTime}</span>
                    </div>
                  </div>

                  {/* Directives & Designated Shelter */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="text-slate-700 font-sans leading-relaxed">
                      <strong className="text-rose-600">Operational Directive:</strong> {alert.directive}
                    </div>
                    <div className="text-teal-700 font-sans flex items-center gap-1.5 text-[11px]">
                      <Building className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Shelter: <strong>{alert.safeShelter}</strong></span>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-500">
                      Pop. at risk: <strong className="text-slate-900">{alert.populationAtRisk}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {onOpenDispatcher && (
                        <button
                          onClick={onOpenDispatcher}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1"
                        >
                          <Radio className="w-3 h-3" />
                          <span>Dispatch SMS</span>
                        </button>
                      )}
                      {onNavigateToMap && (
                        <button
                          onClick={onNavigateToMap}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 font-bold text-[11px] transition-all"
                        >
                          View Map
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⚙️ Right: SMS / Email Notification Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                EMERGENCY ALERT NOTIFICATION SETTINGS
              </h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Emergency SMS Recipient */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Primary Responder Mobile (SMS)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-teal-500 focus:bg-white outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Receives flash flood warnings with &lt; 2h lead time.
                </span>
              </div>

              {/* Emergency Email Digest */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  EOC Official Email (Digest)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-teal-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-sans">Audio Siren Alert on Critical</span>
                  <input
                    type="checkbox"
                    checked={enableSoundSiren}
                    onChange={(e) => setEnableSoundSiren(e.target.checked)}
                    className="accent-rose-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 font-sans">Instant CAP Gateway Forwarding</span>
                  <input
                    type="checkbox"
                    checked={enableInstantCap}
                    onChange={(e) => setEnableInstantCap(e.target.checked)}
                    className="accent-teal-600 w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                {settingsSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Notification Settings Saved!</span>
                  </>
                ) : (
                  <span>Update Notification Preferences</span>
                )}
              </button>
            </form>

            {/* Quick Test Alert Button */}
            {onOpenDispatcher && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onOpenDispatcher}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-amber-800 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Immediate Test Alert</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
