import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  LifeBuoy, 
  AlertOctagon,
  ArrowRight,
  MapPin,
  Clock,
  Send,
  Users,
  Building,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { WarningInfo, PredictResponse, RiskLevel } from '../types';

interface AlertsPageProps {
  predictionData: PredictResponse | null;
  selectedLocation: { latitude: number; longitude: number; name?: string };
}

interface RegionalAlert {
  id: string;
  region: string;
  district: string;
  riverBasin: string;
  level: RiskLevel;
  probability: number;
  leadTime: string;
  waterLevel: string;
  rainfall6h: string;
  affectedVillages: string[];
  safeShelter: string;
  timestamp: string;
}

const REGIONAL_ALERTS: RegionalAlert[] = [
  {
    id: 'ALT-2026-001',
    region: 'Mandi Town & Suketi Gorge',
    district: 'Mandi, Himachal Pradesh',
    riverBasin: 'Beas & Suketi Confluence',
    level: 'CRITICAL',
    probability: 91,
    leadTime: '1.5 Hours Lead Time',
    waterLevel: '3.4 m (+1.2m above danger)',
    rainfall6h: '115 mm',
    affectedVillages: ['Mandi Sadar', 'Purani Mandi', 'Bhiuli', 'Sauli Khad'],
    safeShelter: 'Government Degree College Mandi (Elevation +120m)',
    timestamp: 'Updated 10 mins ago'
  },
  {
    id: 'ALT-2026-002',
    region: 'Kullu & Bhuntar Riverbeds',
    district: 'Kullu, Himachal Pradesh',
    riverBasin: 'Upper Beas Catchment',
    level: 'HIGH',
    probability: 76,
    leadTime: '2.5 Hours Lead Time',
    waterLevel: '2.8 m (approaching red line)',
    rainfall6h: '88 mm',
    affectedVillages: ['Bhuntar Confluence', 'Bajaura', 'Shamsi', 'Mohal'],
    safeShelter: 'Higher Secondary School Bhuntar Upper Ridge',
    timestamp: 'Updated 18 mins ago'
  },
  {
    id: 'ALT-2026-003',
    region: 'Shimla Ridge & Sunni Catchment',
    district: 'Shimla, Himachal Pradesh',
    riverBasin: 'Sutlej Tributaries',
    level: 'MODERATE',
    probability: 48,
    leadTime: '4 - 6 Hours Watch',
    waterLevel: '1.9 m (stable)',
    rainfall6h: '42 mm',
    affectedVillages: ['Sunni', 'Dhami Valley', 'Tatapani Outskirts'],
    safeShelter: 'Community Center Sunni Hills',
    timestamp: 'Updated 32 mins ago'
  }
];

export const AlertsPage: React.FC<AlertsPageProps> = ({
  predictionData,
  selectedLocation
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'HIGH_CRITICAL' | 'MODERATE'>('ALL');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filteredAlerts = REGIONAL_ALERTS.filter(alert => {
    if (activeTabFilter === 'HIGH_CRITICAL') {
      return alert.level === 'CRITICAL' || alert.level === 'HIGH';
    }
    if (activeTabFilter === 'MODERATE') {
      return alert.level === 'MODERATE';
    }
    return true;
  });

  const handleSimulateBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold mb-3">
            <BellRing className="w-3.5 h-3.5 animate-bounce text-red-400" />
            <span>Disaster Management Early Warning Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Alerts, Warnings & Evacuation Directives
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Multi-tier early warnings synchronized with the <strong>National Disaster Response Force (NDRF)</strong> and <strong>State Disaster Management Authority (SDMA)</strong>. Delivers actionable lead time and evacuation recommendations rather than passive weather bulletins.
          </p>
        </div>
      </div>

      {/* Current Active Location Direct Alert (if active) */}
      {predictionData && (
        <div className={`p-6 rounded-2xl border shadow-xl backdrop-blur-md ${
          predictionData.prediction.risk_level === 'CRITICAL' || predictionData.prediction.risk_level === 'HIGH'
            ? 'bg-red-950/20 border-red-500/50 shadow-red-950/20'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Area Alert:</span>
                  <span className="font-bold text-white text-base">{selectedLocation.name || 'Selected Coordinate'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    predictionData.prediction.risk_level === 'CRITICAL' ? 'bg-red-500 text-white' :
                    predictionData.prediction.risk_level === 'HIGH' ? 'bg-orange-500 text-white' :
                    predictionData.prediction.risk_level === 'MODERATE' ? 'bg-amber-500 text-black' :
                    'bg-emerald-500 text-black'
                  }`}>
                    {predictionData.prediction.risk_level} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flood Probability: <span className="text-cyan-400 font-bold">{predictionData.prediction.flood_probability_percent}%</span> • Lead Time: <span className="text-amber-400 font-semibold">{(predictionData.warning.lead_time_minutes / 60).toFixed(1)} Hours</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateBroadcast}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>{broadcastSent ? 'Emergency SMS & Siren Dispatched!' : 'Simulate CAP Alert Broadcast'}</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Operational Directive Message
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {predictionData.warning.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Immediate Action Recommendations
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {predictionData.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs for Regional Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          Monitored River Basins & Regional Warning Feed
        </h2>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTabFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({REGIONAL_ALERTS.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('HIGH_CRITICAL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTabFilter === 'HIGH_CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            High & Critical (2)
          </button>
          <button
            onClick={() => setActiveTabFilter('MODERATE')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTabFilter === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Moderate (1)
          </button>
        </div>
      </div>

      {/* Regional Warning Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map((alert) => {
          const isCrit = alert.level === 'CRITICAL';
          const isHigh = alert.level === 'HIGH';
          const badgeClass = isCrit
            ? 'bg-red-500 text-white'
            : isHigh
            ? 'bg-orange-500 text-white'
            : 'bg-amber-500 text-black';
          const borderClass = isCrit
            ? 'border-red-500/50 hover:border-red-500'
            : isHigh
            ? 'border-orange-500/50 hover:border-orange-500'
            : 'border-amber-500/50 hover:border-amber-500';

          return (
            <div
              key={alert.id}
              className={`bg-slate-900/90 border ${borderClass} rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                    {alert.level} RISK • {alert.probability}%
                  </span>
                  <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{alert.region}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{alert.district}</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">River Basin:</span>
                    <span className="text-slate-200 font-medium">{alert.riverBasin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Lead Time:</span>
                    <span className="text-amber-400 font-bold">{alert.leadTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Gauge:</span>
                    <span className="text-slate-200 font-mono">{alert.waterLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">6h Rainfall:</span>
                    <span className="text-cyan-400 font-mono">{alert.rainfall6h}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affected Villages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.affectedVillages.map((v, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Designated Shelter:</strong> {alert.safeShelter}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency SOP & Helplines Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-cyan-400" />
          Emergency Response Contacts & Disaster Hotlines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-slate-400">National Emergency Number</div>
            <div className="text-lg font-black text-cyan-400 mt-1">112</div>
            <div className="text-[10px] text-slate-500 mt-0.5">24/7 Police, Fire, Ambulance</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-slate-400">State Disaster Management (SDMA)</div>
            <div className="text-lg font-black text-emerald-400 mt-1">1070</div>
            <div className="text-[10px] text-slate-500 mt-0.5">State Control Room Shimla</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-slate-400">District Emergency Operations (DEOC)</div>
            <div className="text-lg font-black text-amber-400 mt-1">1077</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mandi / Kullu / Kangra DEOC</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-slate-400">NDRF Battalion 14</div>
            <div className="text-lg font-black text-rose-400 mt-1">01905-223456</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Quick Reaction Mountain Team</div>
          </div>
        </div>
      </div>
    </div>
  );
};
