import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  LifeBuoy, 
  Users, 
  Droplets, 
  Truck, 
  HeartHandshake, 
  Navigation,
  CheckCircle2,
  Clock,
  Waves
} from 'lucide-react';

interface AffectedAreasTabProps {
  onSelectAreaLocation?: (lat: number, lon: number, name: string) => void;
}

interface ImpactedArea {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  severity: 'CRITICAL' | 'WARNING' | 'ALERT';
  stageLevel: string;
  rainfall6h: string;
  population: string;
  evacuatedPercent: number;
  shelterName: string;
  ndrfUnit: string;
  boatsDeployed: number;
  medicalUnits: number;
}

const IMPACTED_AREAS_DATA: ImpactedArea[] = [
  {
    id: 'AREA-01',
    name: 'Mandi Sadar & Suketi Gorge',
    district: 'Mandi',
    state: 'Himachal Pradesh',
    lat: 31.7087,
    lon: 76.9320,
    severity: 'CRITICAL',
    stageLevel: '3.4m (+1.2m above danger)',
    rainfall6h: '115 mm',
    population: '42,000',
    evacuatedPercent: 78,
    shelterName: 'Govt Degree College Mandi (+120m)',
    ndrfUnit: '14th Bn QRT Mandi',
    boatsDeployed: 12,
    medicalUnits: 4
  },
  {
    id: 'AREA-02',
    name: 'Chooralmala & Meppadi Valley',
    district: 'Wayanad',
    state: 'Kerala',
    lat: 11.5510,
    lon: 76.1260,
    severity: 'CRITICAL',
    stageLevel: '3.2m (Stream bank breach)',
    rainfall6h: '165 mm',
    population: '28,500',
    evacuatedPercent: 86,
    shelterName: 'Meppadi Secondary School (+80m)',
    ndrfUnit: '04th Bn NDRF Arakkonam',
    boatsDeployed: 14,
    medicalUnits: 6
  },
  {
    id: 'AREA-03',
    name: 'Chiplun Market & Lowlands',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    lat: 17.5323,
    lon: 73.5186,
    severity: 'CRITICAL',
    stageLevel: '4.6m (High tide crest)',
    rainfall6h: '190 mm',
    population: '36,000',
    evacuatedPercent: 65,
    shelterName: 'Chiplun Higher Secondary Ridge',
    ndrfUnit: '05th Bn NDRF Pune',
    boatsDeployed: 10,
    medicalUnits: 3
  },
  {
    id: 'AREA-04',
    name: 'Bhuntar Beas-Parvati Confluence',
    district: 'Kullu',
    state: 'Himachal Pradesh',
    lat: 31.8790,
    lon: 77.1520,
    severity: 'WARNING',
    stageLevel: '2.8m (approaching danger)',
    rainfall6h: '88 mm',
    population: '65,000',
    evacuatedPercent: 54,
    shelterName: 'Bhuntar Ridge Safe Complex',
    ndrfUnit: '14th Bn Sub-team Kullu',
    boatsDeployed: 6,
    medicalUnits: 2
  },
  {
    id: 'AREA-05',
    name: 'Sonprayag Mandakini Terraces',
    district: 'Rudraprayag',
    state: 'Uttarakhand',
    lat: 30.6300,
    lon: 79.0050,
    severity: 'WARNING',
    stageLevel: '4.5m (Glacial runoff active)',
    rainfall6h: '95 mm',
    population: '19,000',
    evacuatedPercent: 70,
    shelterName: 'GMVN Complex Safe Terrace',
    ndrfUnit: 'SDRF 3rd Bn Agastyamuni',
    boatsDeployed: 4,
    medicalUnits: 3
  },
  {
    id: 'AREA-06',
    name: 'Dhemaji Floodplain',
    district: 'Dhemaji',
    state: 'Assam',
    lat: 27.4833,
    lon: 94.5833,
    severity: 'ALERT',
    stageLevel: '3.8m (Embankment watch)',
    rainfall6h: '75 mm',
    population: '84,000',
    evacuatedPercent: 42,
    shelterName: 'Dhemaji College Flood Refuge',
    ndrfUnit: '01st Bn NDRF Guwahati',
    boatsDeployed: 8,
    medicalUnits: 4
  }
];

export const AffectedAreasTab: React.FC<AffectedAreasTabProps> = ({
  onSelectAreaLocation
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ALERT'>('ALL');

  const filteredAreas = IMPACTED_AREAS_DATA.filter(a => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity === selectedSeverity;
  });

  const totalBoats = IMPACTED_AREAS_DATA.reduce((acc, curr) => acc + curr.boatsDeployed, 0);
  const totalMedics = IMPACTED_AREAS_DATA.reduce((acc, curr) => acc + curr.medicalUnits, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* 📦 Relief Resource Allocation Tracker Header */}
      <div className="bg-[#151b23] border border-[#263342] rounded-3xl p-6 shadow-sm font-mono space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#263342]">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#4ECDC4]" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              NATIONAL RELIEF RESOURCE ALLOCATION TRACKER
            </h1>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30 font-bold">
            MHA / NDRF REAL-TIME ASSET LOG
          </span>
        </div>

        {/* Resource KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-[#1b2330] rounded-2xl border border-[#283648]">
            <span className="text-[10px] text-slate-400 uppercase block">RESCUE BOATS (IRB)</span>
            <span className="text-2xl font-black text-[#4ECDC4] mt-1 block">{totalBoats} ACTIVE</span>
            <span className="text-[9px] text-slate-400">Motorized Zodiacs deployed</span>
          </div>

          <div className="p-3.5 bg-[#1b2330] rounded-2xl border border-[#283648]">
            <span className="text-[10px] text-slate-400 uppercase block">MEDICAL TRAUMA UNITS</span>
            <span className="text-2xl font-black text-[#FFE66D] mt-1 block">{totalMedics} SQUADS</span>
            <span className="text-[9px] text-slate-400">Mobile emergency dispensaries</span>
          </div>

          <div className="p-3.5 bg-[#1b2330] rounded-2xl border border-[#283648]">
            <span className="text-[10px] text-slate-400 uppercase block">RELIEF CAMPS OPEN</span>
            <span className="text-2xl font-black text-white mt-1 block">18 SHELTERS</span>
            <span className="text-[9px] text-emerald-400">Food & clean water supplied</span>
          </div>

          <div className="p-3.5 bg-[#1b2330] rounded-2xl border border-[#283648]">
            <span className="text-[10px] text-slate-400 uppercase block">TOTAL EVACUATED</span>
            <span className="text-2xl font-black text-[#FF6B6B] mt-1 block">184,200</span>
            <span className="text-[9px] text-slate-400">Moved to designated ridges</span>
          </div>
        </div>
      </div>

      {/* 🏘️ List of Impacted Locations */}
      <div className="bg-[#151b23] border border-[#263342] rounded-3xl p-6 shadow-sm font-mono space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#263342]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF6B6B]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              IMPACTED LOCATIONS & LOCAL METRICS MATRIX ({filteredAreas.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'CRITICAL', 'WARNING', 'ALERT'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-xl border transition-all ${
                  selectedSeverity === sev
                    ? 'bg-white/20 text-white border-white/40 font-bold'
                    : 'bg-[#1b2330] text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAreas.map(area => {
            const badgeColor = 
              area.severity === 'CRITICAL' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/40' :
              area.severity === 'WARNING' ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40' :
              'bg-[#FFE66D]/20 text-[#FFE66D] border border-[#FFE66D]/40';

            return (
              <div 
                key={area.id}
                className="p-4 bg-[#1b2330] border border-[#283648] hover:border-[#3d4f66] rounded-2xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm font-sans">{area.name}</h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${badgeColor}`}>
                        {area.severity}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {area.district}, {area.state}
                    </span>
                  </div>

                  {onSelectAreaLocation && (
                    <button
                      onClick={() => onSelectAreaLocation(area.lat, area.lon, `${area.name}, ${area.state}`)}
                      className="px-2.5 py-1 rounded-lg bg-[#4ECDC4]/15 hover:bg-[#4ECDC4] text-[#4ECDC4] hover:text-[#0f1419] border border-[#4ECDC4]/30 text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Map</span>
                    </button>
                  )}
                </div>

                {/* Real-time Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-[#111720] rounded-xl border border-[#212b38]">
                    <span className="text-[9px] text-slate-400 block uppercase">STAGE HEIGHT</span>
                    <span className="font-bold text-sky-400 text-xs">{area.stageLevel}</span>
                  </div>
                  <div className="p-2 bg-[#111720] rounded-xl border border-[#212b38]">
                    <span className="text-[9px] text-slate-400 block uppercase">6H RAINFALL</span>
                    <span className="font-bold text-white text-xs">{area.rainfall6h}</span>
                  </div>
                  <div className="p-2 bg-[#111720] rounded-xl border border-[#212b38]">
                    <span className="text-[9px] text-slate-400 block uppercase">POPULATION</span>
                    <span className="font-bold text-white text-xs">{area.population}</span>
                  </div>
                </div>

                {/* Evacuation Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Evacuation Progress</span>
                    <span className="font-bold text-[#4ECDC4]">{area.evacuatedPercent}% Completed</span>
                  </div>
                  <div className="w-full bg-[#111720] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-[#4ECDC4] rounded-full transition-all duration-700"
                      style={{ width: `${area.evacuatedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Relief Battalion & Rescue Boats */}
                <div className="pt-2 border-t border-[#263342] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">Unit: <strong className="text-white">{area.ndrfUnit}</strong></span>
                  <span className="flex-shrink-0">🚤 {area.boatsDeployed} Boats • 🏥 {area.medicalUnits} Units</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
