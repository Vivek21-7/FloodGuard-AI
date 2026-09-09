import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Waves,
  Mountain
} from 'lucide-react';
import { HistoricalEventItem } from '../types';

interface HistoricalAnalysisProps {
  events: HistoricalEventItem[];
}

const RAINFALL_TREND_DATA = [
  { year: '2019', monsoonRainfall: 1150, floodCount: 2, avgIntensity: 45 },
  { year: '2020', monsoonRainfall: 1240, floodCount: 3, avgIntensity: 52 },
  { year: '2021', monsoonRainfall: 1380, floodCount: 4, avgIntensity: 68 },
  { year: '2022', monsoonRainfall: 1420, floodCount: 5, avgIntensity: 74 },
  { year: '2023', monsoonRainfall: 1890, floodCount: 8, avgIntensity: 98 },
  { year: '2024', monsoonRainfall: 1650, floodCount: 6, avgIntensity: 85 },
  { year: '2025', monsoonRainfall: 1540, floodCount: 5, avgIntensity: 80 },
];

const SEVERITY_PIE_DATA = [
  { name: 'Critical', value: 35, color: '#ef4444' },
  { name: 'High', value: 40, color: '#f97316' },
  { name: 'Moderate', value: 18, color: '#f59e0b' },
  { name: 'Low', value: 7, color: '#10b981' },
];

export const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({ events }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter((ev) => {
    const matchesType = selectedType === 'ALL' || ev.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch = 
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.affected_area && ev.affected_area.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ev.event_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FloodGuard_Historical_Disaster_Data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <History className="w-6 h-6 text-cyan-400" />
              Historical Catchment Disaster Analytics & Trends
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-decadal records of cloudbursts, debris flows, and flash flood occurrences in Himachal Pradesh
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Records (JSON)
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search valley, basin, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Event Type:
            </span>
            {['ALL', 'flash_flood', 'landslide'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                  selectedType === t
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rainfall Trends vs Floods */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            Annual Monsoon Rainfall vs Flash Flood Frequency (2019-2025)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Correlation between extreme monsoon cloudburst episodes and disaster frequencies
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RAINFALL_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" textAnchor="middle" fontSize={11} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} unit=" mm" />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} unit=" ev" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="monsoonRainfall"
                  name="Monsoon Rainfall (mm)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="floodCount"
                  name="Flash Flood Incidents"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Event Severity Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical distribution by peak severity level
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEVERITY_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {SEVERITY_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
            {SEVERITY_PIE_DATA.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300 font-medium">{s.name}: {s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Events Data List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center justify-between">
          <span>Catalog of Documented Historical Disasters ({filteredEvents.length})</span>
          <span className="text-xs font-normal text-slate-400">Database Source: Geological Survey & NDMA</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((item) => (
            <div
              key={item.event_id}
              className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-400">{item.event_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    item.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {item.date}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-200 mb-1">
                {item.affected_area || item.location}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rainfall: {item.rainfall_recorded_mm ? `${item.rainfall_recorded_mm} mm` : 'N/A'}</span>
                <span>Casualties: {item.casualties ?? 0}</span>
                {item.distance_km && <span>Distance: {item.distance_km} km</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
