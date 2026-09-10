import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  AlertOctagon,
  Building,
  FileText
} from 'lucide-react';
import { PredictResponse, RiskLevel } from '../types';

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
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold mb-3">
            <BellRing className="w-3.5 h-3.5 animate-bounce text-rose-300" />
            <span>Disaster Management Early Warning Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Alerts, Warnings & Evacuation Directives
          </h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed">
            Multi-tier early warnings synchronized with the <strong>National Disaster Response Force (NDRF)</strong> and <strong>State Disaster Management Authority (SDMA)</strong>. Delivers actionable lead time and evacuation recommendations rather than passive weather bulletins.
          </p>
        </div>
      </div>

      {/* Current Active Location Direct Alert (if active) */}
      {predictionData && (
        <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Area Alert:</span>
                  <span className="font-bold text-slate-900 text-base">{selectedLocation.name || 'Selected Coordinate'}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    predictionData.prediction.risk_level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    predictionData.prediction.risk_level === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    predictionData.prediction.risk_level === 'MODERATE' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {predictionData.prediction.risk_level} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Flood Probability: <span className="text-indigo-600 font-bold">{predictionData.prediction.flood_probability_percent}%</span> • Lead Time: <span className="text-amber-700 font-bold">{(predictionData.warning.lead_time_minutes / 60).toFixed(1)} Hours</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateBroadcast}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>{broadcastSent ? 'Emergency SMS & Siren Dispatched!' : 'Simulate CAP Alert Broadcast'}</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Operational Directive Message
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {predictionData.warning.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Immediate Action Recommendations
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {predictionData.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span className="font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs for Regional Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Monitored River Basins & Regional Warning Feed
        </h2>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTabFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({REGIONAL_ALERTS.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('HIGH_CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTabFilter === 'HIGH_CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High & Critical (2)
          </button>
          <button
            onClick={() => setActiveTabFilter('MODERATE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTabFilter === 'MODERATE' ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : isHigh
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200';
          const borderClass = isCrit
            ? 'border-rose-200 hover:border-rose-400'
            : isHigh
            ? 'border-orange-200 hover:border-orange-400'
            : 'border-amber-200 hover:border-amber-400';

          return (
            <div
              key={alert.id}
              className={`bg-white border ${borderClass} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                    {alert.level} RISK • {alert.probability}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{alert.timestamp}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">{alert.region}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{alert.district}</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">River Basin:</span>
                    <span className="text-slate-800 font-semibold">{alert.riverBasin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Est. Lead Time:</span>
                    <span className="text-amber-700 font-bold">{alert.leadTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Water Gauge:</span>
                    <span className="text-slate-800 font-mono font-bold">{alert.waterLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">6h Rainfall:</span>
                    <span className="text-indigo-600 font-mono font-bold">{alert.rainfall6h}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Affected Villages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.affectedVillages.map((v, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-600 flex items-start gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Designated Shelter:</strong> {alert.safeShelter}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency SOP & Helplines Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-indigo-600" />
          Emergency Response Contacts & Disaster Hotlines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 font-medium">National Emergency Number</div>
            <div className="text-xl font-black text-indigo-600 mt-1">112</div>
            <div className="text-[10px] text-slate-500 mt-0.5">24/7 Police, Fire, Ambulance</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 font-medium">State Disaster Management (SDMA)</div>
            <div className="text-xl font-black text-emerald-600 mt-1">1070</div>
            <div className="text-[10px] text-slate-500 mt-0.5">State Control Room Shimla</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 font-medium">District Emergency Operations (DEOC)</div>
            <div className="text-xl font-black text-amber-600 mt-1">1077</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mandi / Kullu / Kangra DEOC</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-slate-500 font-medium">NDRF Battalion 14</div>
            <div className="text-xl font-black text-rose-600 mt-1">01905-223456</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Quick Reaction Mountain Team</div>
          </div>
        </div>
      </div>
    </div>
  );
};
