import React, { useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Polygon, 
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import { 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  Waves, 
  Building, 
  Navigation, 
  Layers, 
  Clock, 
  Compass, 
  ChevronRight,
  ChevronLeft,
  Radio,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { PredictResponse, RiskLevel, LocationResult } from '../types';

interface LiveMapTabProps {
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
  predictionData: PredictResponse | null;
  isLoading: boolean;
  onSearchQuery?: (q: string) => Promise<LocationResult[]>;
  onOpenAlertDispatcher?: () => void;
}

// Controller to smoothly pan to selected location
const MapViewController: React.FC<{ 
  targetLocation: { latitude: number; longitude: number; name?: string } 
}> = ({ targetLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (targetLocation && targetLocation.latitude && targetLocation.longitude) {
      map.flyTo([targetLocation.latitude, targetLocation.longitude], 9, { duration: 1.2 });
    }
  }, [targetLocation.latitude, targetLocation.longitude, map]);
  return null;
};

// Map click listener
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

// Real-Time Flood Risk Zones (Red = Critical, Orange = Warning, Yellow = Alert)
const REALTIME_FLOOD_ZONES = [
  {
    id: 'ZONE-CRIT-01',
    name: 'Mandi Town & Suketi Gorge',
    severity: 'CRITICAL',
    color: '#FF6B6B',
    fillColor: '#FF6B6B',
    fillOpacity: 0.35,
    polygon: [
      [31.62, 76.85],
      [31.65, 77.05],
      [31.82, 77.08],
      [31.78, 76.88],
    ] as [number, number][],
    waterLevel: '3.4m (+1.2m above danger)',
    populationAtRisk: '42,000'
  },
  {
    id: 'ZONE-CRIT-02',
    name: 'Wayanad Chooralmala Catchment',
    severity: 'CRITICAL',
    color: '#FF6B6B',
    fillColor: '#FF6B6B',
    fillOpacity: 0.35,
    polygon: [
      [11.50, 76.08],
      [11.52, 76.18],
      [11.60, 76.17],
      [11.58, 76.06],
    ] as [number, number][],
    waterLevel: '3.2m (Stream bank breach)',
    populationAtRisk: '28,500'
  },
  {
    id: 'ZONE-WARN-01',
    name: 'Upper Beas Basin (Kullu - Bhuntar)',
    severity: 'WARNING',
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.28,
    polygon: [
      [31.88, 77.10],
      [31.92, 77.22],
      [32.12, 77.25],
      [32.08, 77.12],
    ] as [number, number][],
    waterLevel: '2.8m (approaching danger)',
    populationAtRisk: '65,000'
  },
  {
    id: 'ZONE-WARN-02',
    name: 'Mandakini Valley (Kedarnath - Sonprayag)',
    severity: 'WARNING',
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.28,
    polygon: [
      [30.60, 78.98],
      [30.65, 79.12],
      [30.78, 79.10],
      [30.74, 78.96],
    ] as [number, number][],
    waterLevel: '4.5m (Torrential runoff)',
    populationAtRisk: '19,000'
  },
  {
    id: 'ZONE-ALERT-01',
    name: 'Sutlej Valley Outskirts (Shimla - Sunni)',
    severity: 'ALERT',
    color: '#FFE66D',
    fillColor: '#FFE66D',
    fillOpacity: 0.22,
    polygon: [
      [31.05, 77.10],
      [31.12, 77.25],
      [31.25, 77.22],
      [31.20, 77.08],
    ] as [number, number][],
    waterLevel: '1.9m (Stable monitoring)',
    populationAtRisk: '35,000'
  },
  {
    id: 'ZONE-ALERT-02',
    name: 'Dhemaji Sub-basin (Brahmaputra Floodplain)',
    severity: 'ALERT',
    color: '#FFE66D',
    fillColor: '#FFE66D',
    fillOpacity: 0.22,
    polygon: [
      [27.40, 94.48],
      [27.45, 94.68],
      [27.58, 94.65],
      [27.52, 94.45],
    ] as [number, number][],
    waterLevel: '3.8m (Embankment watch)',
    populationAtRisk: '84,000'
  }
];

// Water Stations (CWC River Gauge Telemetry)
const WATER_STATIONS = [
  { id: 'ST-01', name: 'Mandi Beas Gauge', lat: 31.7087, lon: 76.9320, level: 3.4, discharge: 380, status: 'DANGER' },
  { id: 'ST-02', name: 'Bhuntar CWC Station', lat: 31.8790, lon: 77.1520, level: 2.8, discharge: 290, status: 'WARNING' },
  { id: 'ST-03', name: 'Chooralmala River Gauge', lat: 11.5510, lon: 76.1260, level: 3.2, discharge: 240, status: 'DANGER' },
  { id: 'ST-04', name: 'Sonprayag Hydrometric Post', lat: 30.6300, lon: 79.0050, level: 4.5, discharge: 410, status: 'WARNING' },
  { id: 'ST-05', name: 'Chiplun Vashishti Gauge', lat: 17.5323, lon: 73.5186, level: 4.6, discharge: 320, status: 'DANGER' },
  { id: 'ST-06', name: 'Dhemaji Jiadhal Gauge', lat: 27.4833, lon: 94.5833, level: 3.8, discharge: 620, status: 'ALERT' },
];

// Evacuation Centers (Designated Safe Relief Shelters)
const EVACUATION_CENTERS = [
  { id: 'EV-01', name: 'Govt Degree College Mandi', lat: 31.7180, lon: 76.9450, capacity: 1200, elevation: '+120m High Ground' },
  { id: 'EV-02', name: 'Bhuntar Ridge Senior Secondary School', lat: 31.8880, lon: 77.1650, capacity: 850, elevation: '+95m Safe Ridge' },
  { id: 'EV-03', name: 'Meppadi High School Shelter', lat: 11.5450, lon: 76.1380, capacity: 1500, elevation: '+80m Safe Hill' },
  { id: 'EV-04', name: 'Sonprayag GMVN Complex', lat: 30.6380, lon: 79.0150, capacity: 600, elevation: '+150m High Terrace' },
  { id: 'EV-05', name: 'Chiplun Higher Secondary Ridge', lat: 17.5450, lon: 73.5280, capacity: 2000, elevation: '+65m Plateaux' },
];

// Active Incident Markers (Field Reports)
const ACTIVE_INCIDENTS = [
  { id: 'INC-01', title: 'Stream Overflow & Culvert Breach', lat: 11.5580, lon: 76.1220, severity: 'CRITICAL', time: '18m ago' },
  { id: 'INC-02', title: 'Road Washout near Purani Mandi', lat: 31.7120, lon: 76.9380, severity: 'CRITICAL', time: '25m ago' },
  { id: 'INC-03', title: 'River Embankment Waterlogging', lat: 17.5380, lon: 73.5120, severity: 'HIGH', time: '34m ago' },
];

export const LiveMapTab: React.FC<LiveMapTabProps> = ({
  selectedLocation,
  onSelectLocation,
  predictionData,
  isLoading,
  onOpenAlertDispatcher
}) => {
  const [showZones, setShowZones] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [isSideCardExpanded, setIsSideCardExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const riskLevel = predictionData?.prediction.risk_level || 'HIGH';
  const probPercent = predictionData?.prediction.flood_probability_percent || 78;
  const leadTimeMins = predictionData?.warning.lead_time_minutes || 150;
  const leadTimeHours = (leadTimeMins / 60).toFixed(1);

  const riskColor = 
    riskLevel === 'CRITICAL' ? '#FF6B6B' :
    riskLevel === 'HIGH' ? '#f97316' :
    riskLevel === 'MODERATE' ? '#FFE66D' :
    '#4ECDC4';

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#0f1419]">
      {/* 🗺️ Leaflet Full Screen Map View */}
      <MapContainer
        center={[selectedLocation.latitude, selectedLocation.longitude]}
        zoom={8}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Dark Carto Tile Layer for Tactical Emergency Look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapViewController targetLocation={selectedLocation} />
        <MapClickListener onSelectLocation={onSelectLocation} />

        {/* Real-time Flood Risk Zone Overlays */}
        {showZones && REALTIME_FLOOD_ZONES.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              fillColor: zone.fillColor,
              fillOpacity: zone.fillOpacity,
              weight: 2,
              dashArray: zone.severity === 'CRITICAL' ? '4, 4' : undefined,
            }}
          >
            <Tooltip permanent={false} direction="center" className="font-mono text-xs">
              <div className="font-bold text-slate-900">{zone.name}</div>
              <div className="text-[10px] text-rose-600 font-bold uppercase">{zone.severity} RISK ZONE</div>
              <div className="text-[10px] text-slate-600">Stage: {zone.waterLevel}</div>
              <div className="text-[10px] text-slate-600">Population: {zone.populationAtRisk}</div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Water Stations (CWC Gauges) */}
        {showStations && WATER_STATIONS.map((st) => (
          <CircleMarker
            key={st.id}
            center={[st.lat, st.lon]}
            radius={8}
            pathOptions={{
              color: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#4ECDC4'),
              fillColor: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#4ECDC4'),
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 font-mono text-xs text-slate-900">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Waves className="w-3.5 h-3.5 text-blue-600" />
                  <span>{st.name}</span>
                </div>
                <div className="text-[11px] space-y-0.5 text-slate-700">
                  <div>Gauge Level: <strong className="text-blue-700">{st.level} m</strong></div>
                  <div>Discharge: <strong>{st.discharge} cumecs</strong></div>
                  <div>Status: <span className="font-black text-rose-600">{st.status}</span></div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Evacuation Centers */}
        {showShelters && EVACUATION_CENTERS.map((ev) => (
          <CircleMarker
            key={ev.id}
            center={[ev.lat, ev.lon]}
            radius={7}
            pathOptions={{
              color: '#4ECDC4',
              fillColor: '#4ECDC4',
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 font-mono text-xs text-slate-900">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ev.name}</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-0.5">
                  <div>Elevation: <strong className="text-emerald-700">{ev.elevation}</strong></div>
                  <div>Safe Capacity: <strong>{ev.capacity} persons</strong></div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">✓ Relief Supplies Stocked</div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Active Incidents */}
        {showIncidents && ACTIVE_INCIDENTS.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.lat, inc.lon]}
            radius={9}
            pathOptions={{
              color: '#FF6B6B',
              fillColor: '#FF6B6B',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" className="font-mono text-[10px] font-bold">
              ⚠️ {inc.title}
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Active Selected Location Target Marker */}
        <CircleMarker
          center={[selectedLocation.latitude, selectedLocation.longitude]}
          radius={12}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#FF6B6B',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Tooltip permanent direction="bottom" className="font-mono text-xs font-bold">
            📍 {selectedLocation.name || 'Target Location'}
          </Tooltip>
        </CircleMarker>
      </MapContainer>

      {/* 🔍 Floating Map Search & Layer Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm w-full select-none">
        {/* Search Bar */}
        <div className="bg-[#151b23]/95 backdrop-blur-md border border-[#263342] rounded-2xl p-2 flex items-center gap-2 shadow-xl">
          <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search town, station or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-mono text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        {/* Layer Toggles Pill Strip */}
        <div className="bg-[#151b23]/95 backdrop-blur-md border border-[#263342] rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono shadow-xl text-slate-300">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showZones ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] font-bold border border-[#FF6B6B]/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Flood Zones</span>
          </button>
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showStations ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌊 Gauges</span>
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showShelters ? 'bg-[#4ECDC4]/20 text-[#4ECDC4] font-bold border border-[#4ECDC4]/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏥 Shelters</span>
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showIncidents ? 'bg-[#FFE66D]/20 text-[#FFE66D] font-bold border border-[#FFE66D]/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚠️ Incidents</span>
          </button>
        </div>
      </div>

      {/* 📊 Floating Tactical Side Card (Top Right) */}
      <div className={`absolute top-4 right-4 z-10 transition-all duration-300 select-none ${
        isSideCardExpanded ? 'w-[320px] sm:w-[350px]' : 'w-auto'
      }`}>
        {isSideCardExpanded ? (
          <div className="bg-[#151b23]/95 backdrop-blur-xl border border-[#263342] rounded-3xl p-5 shadow-2xl text-slate-200 font-mono space-y-4">
            {/* Card Header with Collapse Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#263342]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-pulse"></div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  TACTICAL FLOOD RISK ASSESSOR
                </h3>
              </div>
              <button
                onClick={() => setIsSideCardExpanded(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                title="Collapse Side Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Badge & Nearest Threat Distance */}
            <div className="p-3 bg-[#1c2430] border border-[#2a384c] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">CURRENT THREAT LEVEL</span>
                <span className="text-base font-black tracking-tight uppercase" style={{ color: riskColor }}>
                  {riskLevel} RISK
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">NEAREST RIVER THREAT</span>
                <span className="text-sm font-bold text-white">
                  1.2 km (Beas Confluence)
                </span>
              </div>
            </div>

            {/* Probability Gauge & Evacuation Lead Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1c2430] border border-[#2a384c] rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">PROBABILITY</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {probPercent}%
                </div>
                <span className="text-[9px] text-[#FF6B6B] font-semibold block mt-0.5">
                  Crosses Warning Level
                </span>
              </div>

              <div className="p-3 bg-[#1c2430] border border-[#2a384c] rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">LEAD TIME</span>
                <div className="text-2xl font-black text-[#FFE66D] mt-0.5">
                  {leadTimeHours}h
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Window to safe ground
                </span>
              </div>
            </div>

            {/* Recommended Emergency Actions */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                RECOMMENDED OPERATIONAL DIRECTIVES
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {(predictionData?.recommendations || [
                  'Evacuate lower riverbed floodplains within 1.5 hours.',
                  'Direct displaced residents to Govt Degree College Shelter (+120m).',
                  'Activate SDRF Quick Reaction Inflatable Boats at Sonprayag.'
                ]).slice(0, 3).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#10161f] p-2 rounded-xl border border-[#1e2736]">
                    <span className="text-[#FF6B6B] font-bold">•</span>
                    <span className="leading-snug text-[11px]">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trigger Evacuation Alert Button */}
            {onOpenAlertDispatcher && (
              <button
                onClick={onOpenAlertDispatcher}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B6B]/20 transition-all active:scale-95"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>TRIGGER EVACUATION ALERTS (SMS/CAP)</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSideCardExpanded(true)}
            className="p-3 bg-[#151b23]/95 backdrop-blur-md border border-[#263342] rounded-2xl shadow-xl flex items-center gap-2 text-white font-mono text-xs font-bold hover:bg-[#1f2835] transition-all"
            title="Expand Risk Assessment Card"
          >
            <ChevronLeft className="w-4 h-4 text-[#FF6B6B]" />
            <span>RISK INTEL</span>
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse"></span>
          </button>
        )}
      </div>
    </div>
  );
};
