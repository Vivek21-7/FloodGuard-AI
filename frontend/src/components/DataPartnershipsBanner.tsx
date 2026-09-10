import React from 'react';
import { ExternalLink, Database, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface PartnerSource {
  name: string;
  agency: string;
  dataType: string;
  refreshRate: string;
  status: 'ONLINE' | 'ACTIVE' | 'STREAMING';
  url: string;
}

const SOURCES: PartnerSource[] = [
  {
    name: 'Central Water Commission (CWC)',
    agency: 'Ministry of Jal Shakti, GoI',
    dataType: 'Real-time River Gauge Stage (m) & Discharge (cumecs)',
    refreshRate: 'Every 15-30 mins',
    status: 'ONLINE',
    url: 'https://cwc.gov.in/'
  },
  {
    name: 'India Meteorological Dept (IMD)',
    agency: 'Ministry of Earth Sciences, GoI',
    dataType: 'Doppler Radar & Automatic Weather Stations (AWS)',
    refreshRate: 'Every 15-30 mins',
    status: 'STREAMING',
    url: 'https://mausam.imd.gov.in/'
  },
  {
    name: 'NASA Earthdata SMAP',
    agency: 'NASA / JPL',
    dataType: 'L3 Radiometer Global Soil Moisture (cm³/cm³)',
    refreshRate: 'Satellite Pass (~6h lag)',
    status: 'ACTIVE',
    url: 'https://nsidc.org/data/smap'
  },
  {
    name: 'Open-Meteo Weather API',
    agency: 'Global Meteorological Services',
    dataType: 'Hourly Rain, Precipitation Probability, Wind, Humidity',
    refreshRate: 'Hourly Live',
    status: 'ONLINE',
    url: 'https://open-meteo.com/'
  },
  {
    name: 'India-WRIS Basin Geoportal',
    agency: 'National Water Informatics Centre (NWIC)',
    dataType: 'Catchment Boundaries, Reservoir Stages & Historical Floods',
    refreshRate: 'Daily / Sub-daily',
    status: 'ONLINE',
    url: 'https://indiawris.gov.in/'
  },
  {
    name: 'Copernicus GLO-90 DEM',
    agency: 'European Space Agency (ESA)',
    dataType: 'High-Resolution Terrain Elevation, Slope & Aspect',
    refreshRate: 'Static 30m Grid',
    status: 'ACTIVE',
    url: 'https://spacedata.copernicus.eu/'
  }
];

export const DataPartnershipsBanner: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            OFFICIAL HYDRO-INFORMATICS DATA PIPELINE (7C: CONNECTION)
          </h3>
        </div>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          6 NATIONAL & GLOBAL PROVIDERS OPERATIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SOURCES.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 rounded-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-800 font-sans group-hover:text-indigo-700 transition-colors">
                  {src.name}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="text-[10px] text-slate-500 mb-2">{src.agency}</div>
              <p className="text-[11px] text-slate-700 font-sans line-clamp-2">
                {src.dataType}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">{src.refreshRate}</span>
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {src.status}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
