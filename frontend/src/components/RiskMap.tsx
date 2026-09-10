import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  useMapEvents,
  useMap,
  Polygon,
  Tooltip
} from 'react-leaflet';
import { 
  Compass, 
  MapPin, 
  Globe2, 
  Mountain, 
  Waves, 
  CloudRain 
} from 'lucide-react';
import { RiskMapFeature, HistoricalEventItem, RiskLevel } from '../types';

interface RiskMapProps {
  features: RiskMapFeature[];
  historicalEvents?: HistoricalEventItem[];
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
}

// Dynamic Map Viewport Controller to pan/fly anywhere in India
const MapViewController: React.FC<{ 
  targetLocation: { latitude: number; longitude: number; name?: string } 
}> = ({ targetLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (targetLocation && targetLocation.latitude && targetLocation.longitude) {
      const isAllIndia = targetLocation.name?.toLowerCase().includes('all-india');
      const targetZoom = isAllIndia ? 5 : Math.max(map.getZoom(), 8);
      map.flyTo([targetLocation.latitude, targetLocation.longitude], targetZoom, {
        duration: 1.2,
      });
    }
  }, [targetLocation.latitude, targetLocation.longitude, targetLocation.name, map]);
  return null;
};

// Map Click Listener
const MapClickListener: React.FC<{
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
}> = ({ onSelectLocation }) => {
  useMapEvents({
    click(e) {
      onSelectLocation(
        e.latlng.lat, 
        e.latlng.lng, 
        `Coordinates (${e.latlng.lat.toFixed(3)}°N, ${e.latlng.lng.toFixed(3)}°E)`
      );
    },
  });
  return null;
};

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

// Pan-India Major Vulnerable River Basins
const PAN_INDIA_CATCHMENT_POLYGONS = [
  {
    name: "Upper Beas Catchment (Kullu - Manali)",
    river: "Beas River",
    region: "Himachal Pradesh",
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
    region: "Himachal Pradesh",
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
    name: "Alaknanda & Mandakini River Basins (Kedarnath - Joshimath)",
    river: "Alaknanda & Mandakini",
    region: "Uttarakhand",
    color: "#ef4444",
    positions: [
      [30.25, 78.85],
      [30.30, 79.35],
      [30.65, 79.80],
      [30.95, 79.60],
      [30.85, 79.05],
    ] as [number, number][],
  },
  {
    name: "Teesta High-Altitude Glacial Basin (Chungthang)",
    river: "Teesta River",
    region: "Sikkim",
    color: "#ef4444",
    positions: [
      [27.20, 88.40],
      [27.25, 88.75],
      [27.80, 88.85],
      [27.95, 88.50],
      [27.50, 88.25],
    ] as [number, number][],
  },
  {
    name: "Kabini & Chaliyar Escarpment (Wayanad)",
    river: "Chaliyar & Kabini Basin",
    region: "Kerala (Western Ghats)",
    color: "#ef4444",
    positions: [
      [11.45, 75.90],
      [11.50, 76.35],
      [11.90, 76.40],
      [11.95, 76.05],
      [11.65, 75.85],
    ] as [number, number][],
  },
  {
    name: "Vashishti River Flash Corridor (Chiplun - Mahabaleshwar)",
    river: "Vashishti River",
    region: "Maharashtra (Western Ghats)",
    color: "#ef4444",
    positions: [
      [17.40, 73.35],
      [17.45, 73.75],
      [17.95, 73.85],
      [18.05, 73.50],
      [17.65, 73.30],
    ] as [number, number][],
  },
  {
    name: "Upper Brahmaputra Valley (Dhemaji)",
    river: "Brahmaputra & Jiadhall",
    region: "Assam",
    color: "#f97316",
    positions: [
      [27.20, 94.20],
      [27.30, 94.90],
      [27.85, 95.10],
      [27.95, 94.45],
      [27.50, 94.15],
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
    selectedLocation.latitude || 22.5,
    selectedLocation.longitude || 80.0,
  ];

  const filteredFeatures = features.filter((f) => {
    if (riskFilter === 'ALL') return true;
    return f.risk_level === riskFilter;
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Pan-India Flash Flood & Catchment Risk GIS Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time multi-source monitoring across Western Himalayas, Western Ghats, and Northeast India
          </p>
        </div>

        {/* Pan-India Regional Quick Jumps */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 text-[11px] font-bold hidden md:inline">JUMP TO HOTSPOT:</span>
          <button
            onClick={() => onSelectLocation(22.8, 80.0, "All-India Overview")}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 transition-all font-bold shadow-xs"
            title="Zoom out to view all regions across India"
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
            All India View
          </button>
          <button
            onClick={() => onSelectLocation(11.5510, 76.1260, "Wayanad (Chooralmala), Kerala")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <Waves className="w-3.5 h-3.5 text-blue-600" />
            Wayanad (Kerala)
          </button>
          <button
            onClick={() => onSelectLocation(31.9579, 77.1095, "Kullu, Himachal Pradesh")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <Mountain className="w-3.5 h-3.5 text-amber-600" />
            Kullu (Himachal)
          </button>
          <button
            onClick={() => onSelectLocation(30.5564, 79.5658, "Joshimath, Uttarakhand")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <Mountain className="w-3.5 h-3.5 text-rose-600" />
            Joshimath (UK)
          </button>
          <button
            onClick={() => onSelectLocation(27.6039, 88.6464, "Chungthang (Teesta), Sikkim")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <Mountain className="w-3.5 h-3.5 text-purple-600" />
            Sikkim (Teesta)
          </button>
          <button
            onClick={() => onSelectLocation(25.2702, 91.7323, "Cherrapunji (Sohra), Meghalaya")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            Cherrapunji (Northeast)
          </button>
          <button
            onClick={() => onSelectLocation(17.5323, 73.5186, "Chiplun, Maharashtra")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all font-semibold shadow-xs"
          >
            <Waves className="w-3.5 h-3.5 text-emerald-600" />
            Chiplun (Western Ghats)
          </button>
        </div>
      </div>

      {/* Layer Toggles and Risk Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg border transition-all font-semibold shadow-xs ${
              showHeatmap
                ? 'bg-indigo-600 border-indigo-700 text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Heatmap Rings
          </button>

          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className={`px-3 py-1.5 rounded-lg border transition-all font-semibold shadow-xs ${
              showHistorical
                ? 'bg-purple-600 border-purple-700 text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Past Indian Disasters ({historicalEvents.length})
          </button>

          <button
            onClick={() => setShowCatchments(!showCatchments)}
            className={`px-3 py-1.5 rounded-lg border transition-all font-semibold shadow-xs ${
              showCatchments
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            River Basins ({PAN_INDIA_CATCHMENT_POLYGONS.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs font-semibold">Filter Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="ALL">All Risk Levels ({features.length})</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[540px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <MapContainer
          center={center}
          zoom={selectedLocation.latitude ? 7 : 5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* OpenStreetMap Basemap (Free, No API Key Required, No Watermark) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Dynamic pan/fly controller */}
          <MapViewController targetLocation={selectedLocation} />
          <MapClickListener onSelectLocation={onSelectLocation} />

          {/* Catchment Watershed Polygons across India */}
          {showCatchments &&
            PAN_INDIA_CATCHMENT_POLYGONS.map((basin, idx) => (
              <Polygon
                key={`basin-${idx}`}
                positions={basin.positions}
                pathOptions={{
                  color: basin.color,
                  fillColor: basin.color,
                  fillOpacity: 0.16,
                  weight: 2,
                  dashArray: '5, 5',
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <strong className="block text-slate-900 font-bold">{basin.name}</strong>
                    <span className="text-slate-600">River: {basin.river} • {basin.region}</span>
                  </div>
                </Tooltip>
              </Polygon>
            ))}

          {/* Pan-India Settlements / Villages Risk Features */}
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
                      fillOpacity: 0.18,
                      weight: 1,
                      stroke: false,
                    }}
                  />
                )}

                {/* Primary Settlement Marker */}
                <CircleMarker
                  center={f.coordinates}
                  radius={f.risk_level === 'CRITICAL' ? 10 : 7}
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
                    <div className="p-2 min-w-[210px] font-sans">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                          style={{ backgroundColor: color }}
                        >
                          {f.risk_level}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        {f.district && <div>District: <strong className="text-slate-800">{f.district}</strong></div>}
                        <div>Flood Probability: <strong className="text-slate-900">{(f.flood_probability * 100).toFixed(0)}%</strong></div>
                        {f.population && <div>Population: <strong className="text-slate-800">{f.population.toLocaleString()}</strong></div>}
                        {f.altitude_m && <div>Altitude: <strong className="text-slate-800">{f.altitude_m}m ASL</strong></div>}
                      </div>
                      <button
                        onClick={() => onSelectLocation(f.coordinates[0], f.coordinates[1], f.name)}
                        className="mt-2.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-xs"
                      >
                        Analyze Telemetry & Run ML
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          {/* Historical Disaster Events */}
          {showHistorical &&
            historicalEvents.map((ev, idx) => {
              if (!ev.latitude || !ev.longitude) return null;
              return (
                <CircleMarker
                  key={`hist-${idx}`}
                  center={[ev.latitude, ev.longitude]}
                  radius={8}
                  pathOptions={{
                    color: '#7e22ce',
                    fillColor: '#a855f7',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[240px] font-sans">
                      <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                        Documented Disaster • {ev.type.replace(/_/g, ' ')}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                        {ev.event_id} ({ev.date})
                      </h4>
                      <div className="text-xs text-indigo-600 font-semibold mt-0.5 mb-1.5">
                        {ev.affected_area || ev.location}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {ev.description}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-medium">
                        {ev.rainfall_recorded_mm && <span>Rainfall: <strong className="text-slate-800">{ev.rainfall_recorded_mm} mm</strong></span>}
                        {ev.casualties !== undefined && <span>Casualties: <strong className="text-slate-800">{ev.casualties}</strong></span>}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* Selected Point Marker */}
          {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
            <CircleMarker
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              radius={12}
              pathOptions={{
                color: '#4f46e5',
                fillColor: '#6366f1',
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]}>
                <span className="font-bold text-xs text-slate-900">{selectedLocation.name || 'Target Point'}</span>
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 border border-slate-200/90 p-3.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-sans">
          <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
            Pan-India Risk Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-700">
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
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Past Disasters
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 border border-white" /> Selected Area
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
