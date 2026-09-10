import React, { useState } from 'react';
import { 
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
  Waves
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
  { name: 'Critical', value: 35, color: '#e11d48' },
  { name: 'High', value: 40, color: '#ea580c' },
  { name: 'Moderate', value: 18, color: '#d97706' },
  { name: 'Low', value: 7, color: '#059669' },
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600" />
              Historical Catchment Disaster Analytics & Trends
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Multi-decadal records of cloudbursts, debris flows, and flash flood occurrences in Himalayan and Pan-India catchments
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-600" />
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> Event Type:
            </span>
            {['ALL', 'flash_flood', 'landslide'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                  selectedType === t
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-100'
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
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Waves className="w-4 h-4 text-indigo-600" />
            Annual Monsoon Rainfall vs Flash Flood Frequency (2019-2025)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Correlation between extreme monsoon cloudburst episodes and disaster frequencies
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RAINFALL_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#64748b" textAnchor="middle" fontSize={11} />
                <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} unit=" mm" />
                <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={11} unit=" ev" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="monsoonRainfall"
                  name="Monsoon Rainfall (mm)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="floodCount"
                  name="Flash Flood Incidents"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Event Severity Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">
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
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {SEVERITY_PIE_DATA.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-700 font-semibold">{s.name}: {s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Events Data List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Catalog of Documented Historical Disasters ({filteredEvents.length})
          </h3>
          <span className="text-xs font-medium text-slate-500">Database Source: Geological Survey & NDMA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((item) => (
            <div
              key={item.event_id}
              className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 hover:border-indigo-300 hover:bg-white transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-600">{item.event_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    item.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    item.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {item.date}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {item.affected_area || item.location}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
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
