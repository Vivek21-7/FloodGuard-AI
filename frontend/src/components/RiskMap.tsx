import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  useMapEvents,
  Polygon,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  AlertTriangle, 
  History, 
  Navigation, 
  Maximize2,
  Check,
  Compass
} from 'lucide-react';
import { RiskMapFeature, HistoricalEventItem, RiskLevel } from '../types';

interface RiskMapProps {
  features: RiskMapFeature[];
  historicalEvents?: HistoricalEventItem[];
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
}

// Map Click Listener Component
const MapClickListener: React.FC<{
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
}> = ({ onSelectLocation }) => {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng, `Location (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`);
    },
  });
  return null;
};

// Colors helper
const getRiskColorCode = (risk: RiskLevel | string): string => {
  switch (risk) {
    case 'CRITICAL':
      return '#ef4444'; // Red
    case 'HIGH':
      return '#f97316'; // Orange
    case 'MODERATE':
      return '#f59e0b'; // Amber
    case 'LOW':
    default:
      return '#10b981'; // Emerald
  }
};

// Catchment boundary polygons (Beas, Sutlej, Mandi basins)
const CATCHMENT_POLYGONS = [
  {
    name: "Upper Beas Catchment (Kullu - Manali)",
    river: "Beas River",
    color: "#f97316",
    positions: [
      [31.85, 77.05],
      [31.88, 77.25],
      [32.15, 77.30],
      [32.35, 77.22],
      [32.32, 77.08],
      [32.05, 76.98],
    ] as [number, number][],
  },
  {
    name: "Mid Beas & Suketi Gorge (Mandi)",
    river: "Beas & Suketi Confluence",
    color: "#ef4444",
    positions: [
      [31.55, 76.82],
      [31.58, 77.08],
      [31.80, 77.12],
      [32.30, 76.95],
      [32.22, 76.78],
      [31.75, 76.75],
    ] as [number, number][],
  },
  {
    name: "Sutlej Ridge Zone (Shimla)",
    river: "Sutlej Tributaries",
    color: "#f59e0b",
    positions: [
      [31.05, 77.05],
      [31.08, 77.30],
      [31.25, 77.35],
      [31.32, 77.18],
      [31.20, 77.02],
    ] as [number, number][],
  }
];

export const RiskMap: React.FC<RiskMapProps> = ({
  features,
  historicalEvents = [],
  selectedLocation,
  onSelectLocation,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showCatchments, setShowCatchments] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const center: [number, number] = [
    selectedLocation.latitude || 31.9579,
    selectedLocation.longitude || 77.1095,
  ];

  const filteredFeatures = features.filter((f) => {
    if (riskFilter === 'ALL') return true;
    return f.risk_level === riskFilter;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            Interactive Mountain GIS & Catchment Risk Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click anywhere in the hilly terrain to generate instant hyper-local risk prediction
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showHeatmap
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Heatmap Rings
          </button>

          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showHistorical
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Past Cloudbursts ({historicalEvents.length})
          </button>

          <button
            onClick={() => setShowCatchments(!showCatchments)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showCatchments
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            River Basins
          </button>

          {/* Risk Level Filter dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <MapContainer
          center={center}
          zoom={9}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* CartoDB Dark Matter Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> & OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapClickListener onSelectLocation={onSelectLocation} />

          {/* Catchment Watershed Polygons */}
          {showCatchments &&
            CATCHMENT_POLYGONS.map((basin, idx) => (
              <Polygon
                key={`basin-${idx}`}
                positions={basin.positions}
                pathOptions={{
                  color: basin.color,
                  fillColor: basin.color,
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '4, 6',
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <strong className="block text-slate-900">{basin.name}</strong>
                    <span className="text-slate-600">Basin: {basin.river}</span>
                  </div>
                </Tooltip>
              </Polygon>
            ))}

          {/* Village Risk Features */}
          {filteredFeatures.map((f, idx) => {
            const color = getRiskColorCode(f.risk_level);
            return (
              <React.Fragment key={`feature-${idx}`}>
                {/* Heatmap Ring */}
                {showHeatmap && (
                  <CircleMarker
                    center={f.coordinates}
                    radius={f.risk_level === 'CRITICAL' ? 32 : f.risk_level === 'HIGH' ? 24 : 16}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: f.risk_level === 'CRITICAL' ? 0.35 : 0.20,
                      weight: 1,
                    }}
                  />
                )}

                {/* Village Core Point */}
                <CircleMarker
                  center={f.coordinates}
                  radius={8}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: color,
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectLocation(f.coordinates[0], f.coordinates[1], f.name),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-100 text-sm">{f.name}</h4>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: color }}
                        >
                          {f.risk_level}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1 mb-3">
                        <div>
                          Probability: <span className="font-bold text-cyan-400">{Math.round(f.flood_probability * 100)}%</span>
                        </div>
                        <div>Population: {f.population?.toLocaleString()}</div>
                        {f.altitude_m && <div>Elevation: {f.altitude_m} m</div>}
                      </div>
                      <button
                        onClick={() => onSelectLocation(f.coordinates[0], f.coordinates[1], f.name)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                      >
                        Inspect Location
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* Historical Cloudburst & Flood Markers */}
          {showHistorical &&
            historicalEvents.map((ev, idx) => {
              if (!ev.latitude || !ev.longitude) return null;
              return (
                <CircleMarker
                  key={`hist-${idx}`}
                  center={[ev.latitude, ev.longitude]}
                  radius={6}
                  pathOptions={{
                    color: '#a855f7', // Purple
                    fillColor: '#9333ea',
                    fillOpacity: 0.85,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[220px]">
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                        Historical Event • {ev.type}
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm mt-0.5">
                        {ev.event_id} ({ev.date})
                      </h4>
                      <div className="text-xs text-slate-300 mt-1 mb-2">
                        {ev.affected_area || ev.location}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {ev.description}
                      </p>
                      {ev.rainfall_recorded_mm && (
                        <div className="mt-2 text-[11px] text-cyan-300">
                          Rainfall: <strong>{ev.rainfall_recorded_mm} mm</strong>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Selected Point Marker */}
          {selectedLocation && (
            <CircleMarker
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              radius={11}
              pathOptions={{
                color: '#38bdf8',
                fillColor: '#0284c7',
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="font-bold text-xs">{selectedLocation.name || 'Selected Target'}</span>
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Interactive Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <div className="font-bold text-slate-200 mb-2">Risk Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Low (&lt;30%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Moderate (30-60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" /> High (60-85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Critical (&ge;85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Past Events
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white" /> Selected Area
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
