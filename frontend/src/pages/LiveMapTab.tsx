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

// Tactical Zoom and Recenter Controls
const MapZoomControls: React.FC<{ 
  onRecenter: () => void;
}> = ({ onRecenter }) => {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-left !bottom-6 !left-4 z-[400] flex flex-col gap-1.5 select-none pointer-events-auto">
      <div className="flex flex-col bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => map.zoomIn()}
          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border-b border-slate-200 font-mono font-bold text-lg active:bg-slate-200"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors font-mono font-bold text-lg active:bg-slate-200"
          title="Zoom Out"
        >
          −
        </button>
      </div>
      <button
        onClick={onRecenter}
        className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg text-slate-700 hover:text-rose-600 hover:bg-slate-100 transition-colors"
        title="Center on Target Basin"
      >
        <Compass className="w-4 h-4" />
      </button>
    </div>
  );
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const riskLevel = predictionData?.prediction.risk_level || 'HIGH';
  const probPercent = predictionData?.prediction.flood_probability_percent || 78;
  const leadTimeMins = predictionData?.warning.lead_time_minutes || 150;
  const leadTimeHours = (leadTimeMins / 60).toFixed(1);

  const riskColor = 
    riskLevel === 'CRITICAL' ? '#FF6B6B' :
    riskLevel === 'HIGH' ? '#f97316' :
    riskLevel === 'MODERATE' ? '#FFE66D' :
    '#4ECDC4';

  // Search items catalog
  const searchableCatalog = React.useMemo(() => {
    const list: { name: string; type: string; lat: number; lon: number; badge: string }[] = [
      { name: 'Wayanad (Chooralmala), Kerala', type: 'Catchment', lat: 11.5510, lon: 76.1260, badge: 'BASIN' },
      { name: 'Kullu, Himachal Pradesh', type: 'Catchment', lat: 31.9579, lon: 77.1095, badge: 'BASIN' },
      { name: 'Kedarnath, Uttarakhand', type: 'Catchment', lat: 30.7346, lon: 79.0669, badge: 'BASIN' },
      { name: 'Cherrapunji, Meghalaya', type: 'Catchment', lat: 25.2702, lon: 91.7323, badge: 'BASIN' },
      { name: 'Chiplun, Maharashtra', type: 'Catchment', lat: 17.5323, lon: 73.5186, badge: 'BASIN' },
      { name: 'Dhemaji, Assam', type: 'Catchment', lat: 27.4833, lon: 94.5833, badge: 'BASIN' },
      { name: 'Mandi, Himachal Pradesh', type: 'Catchment', lat: 31.7087, lon: 76.9320, badge: 'BASIN' },
      { name: 'Shimla, Himachal Pradesh', type: 'Catchment', lat: 31.1048, lon: 77.1734, badge: 'BASIN' },
      { name: 'Srinagar, Jammu & Kashmir', type: 'Catchment', lat: 34.0837, lon: 74.7973, badge: 'BASIN' },
    ];

    WATER_STATIONS.forEach(st => {
      list.push({ name: st.name, type: 'CWC Gauge Station', lat: st.lat, lon: st.lon, badge: st.status });
    });

    EVACUATION_CENTERS.forEach(ev => {
      list.push({ name: ev.name, type: 'Evacuation Shelter', lat: ev.lat, lon: ev.lon, badge: 'SHELTER' });
    });

    REALTIME_FLOOD_ZONES.forEach(z => {
      list.push({ name: z.name, type: 'Flood Risk Zone', lat: z.polygon[0][0], lon: z.polygon[0][1], badge: z.severity });
    });

    return list;
  }, []);

  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableCatalog.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.type.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, searchableCatalog]);

  const handleSelectSearchResult = (lat: number, lon: number, name: string) => {
    onSelectLocation(lat, lon, name);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if coordinates format: e.g. "31.708, 76.932"
    const coordMatch = q.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      onSelectLocation(lat, lon, `Coordinates (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`);
      setSearchQuery('');
      setIsSearchFocused(false);
      return;
    }

    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0].lat, searchResults[0].lon, searchResults[0].name);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc]">
      {/* 🗺️ Leaflet Full Screen Map View */}
      <MapContainer
        center={[selectedLocation.latitude, selectedLocation.longitude]}
        zoom={8}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Clean Voyager Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapViewController targetLocation={selectedLocation} />
        <MapClickListener onSelectLocation={onSelectLocation} />
        <MapZoomControls onRecenter={() => onSelectLocation(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)} />

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
              color: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#0284c7'),
              fillColor: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#0284c7'),
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
              color: '#059669',
              fillColor: '#10b981',
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
        {/* Search Bar with Submit & Autocomplete */}
        <div className="relative">
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-lg focus-within:border-rose-400 transition-all"
          >
            <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search town, station, or lat,lon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-transparent text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 text-xs px-1.5"
              >
                ✕
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30 font-mono text-xs">
              <div className="p-2 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span>SUGGESTIONS</span>
                <span>PRESS ENTER TO JUMP</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item.lat, item.lon, item.name)}
                    className="w-full p-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition-colors text-slate-800"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.type}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold flex-shrink-0 border border-slate-200">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Layer Toggles Pill Strip */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono shadow-lg text-slate-700">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showZones ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Flood Zones</span>
          </button>
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showStations ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🌊 Gauges</span>
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showShelters ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🏥 Shelters</span>
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showIncidents ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-800 font-mono space-y-4">
            {/* Card Header with Collapse Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-pulse"></div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                  TACTICAL FLOOD RISK ASSESSOR
                </h3>
              </div>
              <button
                onClick={() => setIsSideCardExpanded(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                title="Collapse Side Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Badge & Nearest Threat Distance */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">CURRENT THREAT LEVEL</span>
                <span className="text-base font-black tracking-tight uppercase" style={{ color: riskColor }}>
                  {riskLevel} RISK
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">NEAREST RIVER THREAT</span>
                <span className="text-sm font-bold text-slate-900">
                  1.2 km (Beas Confluence)
                </span>
              </div>
            </div>

            {/* Probability Gauge & Evacuation Lead Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 block uppercase">PROBABILITY</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {probPercent}%
                </div>
                <span className="text-[9px] text-rose-600 font-semibold block mt-0.5">
                  Crosses Warning Level
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 block uppercase">LEAD TIME</span>
                <div className="text-2xl font-black text-amber-600 mt-0.5">
                  {leadTimeHours}h
                </div>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  Window to safe ground
                </span>
              </div>
            </div>

            {/* Recommended Emergency Actions */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                RECOMMENDED OPERATIONAL DIRECTIVES
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                {(predictionData?.recommendations || [
                  'Evacuate lower riverbed floodplains within 1.5 hours.',
                  'Direct displaced residents to Govt Degree College Shelter (+120m).',
                  'Activate SDRF Quick Reaction Inflatable Boats at Sonprayag.'
                ]).slice(0, 3).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
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
                className="w-full py-2.5 px-3 rounded-xl bg-[#FF6B6B] hover:bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all active:scale-95"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>TRIGGER EVACUATION ALERTS (SMS/CAP)</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSideCardExpanded(true)}
            className="p-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex items-center gap-2 text-slate-800 font-mono text-xs font-bold hover:bg-slate-50 transition-all"
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
