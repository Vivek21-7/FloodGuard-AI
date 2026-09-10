import React from 'react';
import { AlertTriangle, Radio, Waves, CloudRain } from 'lucide-react';

interface TickerItem {
  id: string;
  station: string;
  state: string;
  river: string;
  level: string;
  status: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NORMAL';
  message: string;
}

const LIVE_BULLETINS: TickerItem[] = [
  {
    id: 'B-101',
    station: 'Chooralmala',
    state: 'Kerala',
    river: 'Chaliyar Basin',
    level: '3.4m (+0.8m above danger)',
    status: 'CRITICAL',
    message: 'Flash flood alert in Wayanad catchment. Evacuation orders active for riverbed settlements.'
  },
  {
    id: 'B-102',
    station: 'Bhuntar / Mandi',
    state: 'Himachal Pradesh',
    river: 'Beas River',
    level: '2.8m (Warning: 2.0m)',
    status: 'HIGH',
    message: 'High discharge from Pandoh Dam. Heavy orographic rain upstream. Riverbed alerts issued.'
  },
  {
    id: 'B-103',
    station: 'Chiplun',
    state: 'Maharashtra',
    river: 'Vashishti River',
    level: '4.6m (approaching crest)',
    status: 'CRITICAL',
    message: 'High tide sync warning. Low-lying market areas alerted for potential inundation.'
  },
  {
    id: 'B-104',
    station: 'Cherrapunji (Sohra)',
    state: 'Meghalaya',
    river: 'Shella Catchment',
    level: '5.2m (Discharge: 410 cumecs)',
    status: 'HIGH',
    message: 'Continuous monsoonal downpour: 260mm recorded in 24h. Slope saturation critical.'
  },
  {
    id: 'B-105',
    station: 'Kedarnath Valley',
    state: 'Uttarakhand',
    river: 'Mandakini River',
    level: '4.5m (Glacial runoff active)',
    status: 'HIGH',
    message: 'Upper catchment cloudburst watch. SDRF squads positioned at Sonprayag.'
  },
  {
    id: 'B-106',
    station: 'Dhemaji',
    state: 'Assam',
    river: 'Brahmaputra Tributaries',
    level: '3.8m (Discharge: 620 cumecs)',
    status: 'HIGH',
    message: 'Jiabhaleri and Gai rivers swollen. Embankment patrol teams deployed.'
  }
];

export const EmergencyTicker: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-[11px] font-mono overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-3">
        {/* Urgent Live Badge */}
        <div className="flex items-center gap-1.5 bg-rose-600/90 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex-shrink-0 animate-pulse">
          <Radio className="w-3 h-3" />
          <span>CWC SITREP</span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-flex items-center gap-8 animate-marquee">
            {LIVE_BULLETINS.concat(LIVE_BULLETINS).map((item, idx) => {
              const statusColor = 
                item.status === 'CRITICAL' ? 'text-rose-400 bg-rose-950/60 border-rose-800' :
                item.status === 'HIGH' ? 'text-amber-400 bg-amber-950/60 border-amber-800' :
                'text-sky-400 bg-sky-950/60 border-sky-800';

              return (
                <div key={idx} className="inline-flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-black uppercase ${statusColor}`}>
                    {item.status}
                  </span>
                  <span className="font-bold text-white">
                    {item.station}, {item.state} ({item.river}):
                  </span>
                  <span className="text-slate-300">
                    {item.message}
                  </span>
                  <span className="text-indigo-400 font-semibold font-mono">
                    [{item.level}]
                  </span>
                  <span className="text-slate-600 mx-2">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operations Hotline Link */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 pl-3 border-l border-slate-800 text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>NDRF 24x7 Control:</span>
          <a href="tel:1078" className="text-amber-300 hover:text-white font-bold underline">
            1078
          </a>
        </div>
      </div>
    </div>
  );
};
