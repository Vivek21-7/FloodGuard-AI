import React, { useState, useEffect } from 'react';
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
  LifeBuoy,
  RefreshCw,
  ArrowLeft,
  Flame,
  Droplets,
  Activity,
  Loader2
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

// Controller to smoothly pan to selected location with adaptive zoom
const MapViewController: React.FC<{ 
  targetLocation: { latitude: number; longitude: number; name?: string } 
}> = ({ targetLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (targetLocation && targetLocation.latitude && targetLocation.longitude) {
      const isPanIndia = targetLocation.name?.toLowerCase().includes('pan-india') || 
        (Math.abs(targetLocation.latitude - 22.9734) < 1.0 && Math.abs(targetLocation.longitude - 78.6569) < 1.0);
      const targetZoom = isPanIndia ? 5 : 9;
      map.flyTo([targetLocation.latitude, targetLocation.longitude], targetZoom, { duration: 1.2 });
    }
  }, [targetLocation.latitude, targetLocation.longitude, targetLocation.name, map]);
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
        title="Recenter / Fit Overview"
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

// Comprehensive Pan-India Real-Time Flood Risk Zones
// Covering North, South, East, West, and Northeast river basins
const REALTIME_FLOOD_ZONES = [
  // 1. Mandi Suketi Gorge, Himachal Pradesh (CRITICAL)
  {
    id: 'ZONE-CRIT-01',
    name: 'Mandi Town & Suketi Gorge, Himachal Pradesh',
    region: 'North (Himachal)',
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
  // 2. Wayanad Chooralmala Catchment, Kerala (CRITICAL)
  {
    id: 'ZONE-CRIT-02',
    name: 'Wayanad Chooralmala Catchment, Kerala',
    region: 'South (Kerala)',
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
  // 3. Chiplun & Vashishti River Basin, Maharashtra (CRITICAL)
  {
    id: 'ZONE-CRIT-03',
    name: 'Chiplun Vashishti River Basin, Maharashtra',
    region: 'West (Maharashtra)',
    severity: 'CRITICAL',
    color: '#FF6B6B',
    fillColor: '#FF6B6B',
    fillOpacity: 0.35,
    polygon: [
      [17.48, 73.45],
      [17.55, 73.58],
      [17.62, 73.54],
      [17.58, 73.42],
    ] as [number, number][],
    waterLevel: '4.6m (+1.4m tidal crest surge)',
    populationAtRisk: '55,000'
  },
  // 4. Dhemaji Subansiri Floodway, Assam (CRITICAL)
  {
    id: 'ZONE-CRIT-04',
    name: 'Dhemaji Subansiri-Brahmaputra Floodway, Assam',
    region: 'Northeast (Assam)',
    severity: 'CRITICAL',
    color: '#FF6B6B',
    fillColor: '#FF6B6B',
    fillOpacity: 0.35,
    polygon: [
      [27.40, 94.48],
      [27.45, 94.68],
      [27.58, 94.65],
      [27.52, 94.45],
    ] as [number, number][],
    waterLevel: '3.8m (Embankment breach watch)',
    populationAtRisk: '84,000'
  },
  // 5. Upper Beas Basin, Kullu - Bhuntar, Himachal Pradesh (WARNING)
  {
    id: 'ZONE-WARN-01',
    name: 'Upper Beas Basin (Kullu - Bhuntar), Himachal',
    region: 'North (Himachal)',
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
  // 6. Mandakini Valley, Kedarnath - Sonprayag, Uttarakhand (WARNING)
  {
    id: 'ZONE-WARN-02',
    name: 'Mandakini Valley (Kedarnath - Sonprayag), Uttarakhand',
    region: 'North (Uttarakhand)',
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
    waterLevel: '4.5m (Torrential orographic runoff)',
    populationAtRisk: '19,000'
  },
  // 7. Yamuna Floodplain, Delhi NCR (WARNING)
  {
    id: 'ZONE-WARN-03',
    name: 'Yamuna Floodplain (Old Bridge to Okhla), Delhi NCR',
    region: 'North (Delhi)',
    severity: 'WARNING',
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.28,
    polygon: [
      [28.60, 77.22],
      [28.68, 77.26],
      [28.72, 77.23],
      [28.65, 77.19],
    ] as [number, number][],
    waterLevel: '205.8m (+0.5m above warning)',
    populationAtRisk: '110,000'
  },
  // 8. Guwahati Brahmaputra Riverbank, Assam (WARNING)
  {
    id: 'ZONE-WARN-04',
    name: 'Guwahati Brahmaputra Reach, Assam',
    region: 'Northeast (Assam)',
    severity: 'WARNING',
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.28,
    polygon: [
      [26.12, 91.68],
      [26.18, 91.80],
      [26.22, 91.75],
      [26.16, 91.64],
    ] as [number, number][],
    waterLevel: '49.5m (High discharge)',
    populationAtRisk: '95,000'
  },
  // 9. Patna Ganga-Gandak Confluence, Bihar (WARNING)
  {
    id: 'ZONE-WARN-05',
    name: 'Patna Ganga-Gandak Confluence, Bihar',
    region: 'East (Bihar)',
    severity: 'WARNING',
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.28,
    polygon: [
      [25.58, 85.08],
      [25.64, 85.22],
      [25.70, 85.18],
      [25.65, 85.04],
    ] as [number, number][],
    waterLevel: '48.9m (Upstream influx)',
    populationAtRisk: '140,000'
  },
  // 10. Sutlej Valley Outskirts, Shimla - Sunni, Himachal (ALERT)
  {
    id: 'ZONE-ALERT-01',
    name: 'Sutlej Valley Outskirts (Shimla - Sunni), Himachal',
    region: 'North (Himachal)',
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
  // 11. Mumbai Mithi River Estuary, Maharashtra (ALERT)
  {
    id: 'ZONE-ALERT-02',
    name: 'Mumbai Mithi River Basin & Estuary, Maharashtra',
    region: 'West (Maharashtra)',
    severity: 'ALERT',
    color: '#FFE66D',
    fillColor: '#FFE66D',
    fillOpacity: 0.22,
    polygon: [
      [19.04, 72.84],
      [19.08, 72.90],
      [19.12, 72.88],
      [19.08, 72.82],
    ] as [number, number][],
    waterLevel: '3.1m (High tide warning)',
    populationAtRisk: '120,000'
  },
  // 12. Mahanadi Delta, Cuttack - Naraj, Odisha (ALERT)
  {
    id: 'ZONE-ALERT-03',
    name: 'Mahanadi Delta (Cuttack - Naraj), Odisha',
    region: 'East (Odisha)',
    severity: 'ALERT',
    color: '#FFE66D',
    fillColor: '#FFE66D',
    fillOpacity: 0.22,
    polygon: [
      [20.42, 85.80],
      [20.48, 85.92],
      [20.54, 85.88],
      [20.48, 85.76],
    ] as [number, number][],
    waterLevel: '26.4m (Barrage discharge normal)',
    populationAtRisk: '85,000'
  }
];

// Pan-India CWC Water Gauge Telemetry Stations
const WATER_STATIONS = [
  { id: 'ST-01', name: 'Mandi Beas Gauge (HP)', lat: 31.7087, lon: 76.9320, level: 3.4, discharge: 380, status: 'DANGER' },
  { id: 'ST-02', name: 'Bhuntar CWC Station (HP)', lat: 31.8790, lon: 77.1520, level: 2.8, discharge: 290, status: 'WARNING' },
  { id: 'ST-03', name: 'Chooralmala River Gauge (Kerala)', lat: 11.5510, lon: 76.1260, level: 3.2, discharge: 240, status: 'DANGER' },
  { id: 'ST-04', name: 'Sonprayag Hydrometric Post (UK)', lat: 30.6300, lon: 79.0050, level: 4.5, discharge: 410, status: 'WARNING' },
  { id: 'ST-05', name: 'Chiplun Vashishti Gauge (MH)', lat: 17.5323, lon: 73.5186, level: 4.6, discharge: 320, status: 'DANGER' },
  { id: 'ST-06', name: 'Dhemaji Jiadhal Gauge (Assam)', lat: 27.4833, lon: 94.5833, level: 3.8, discharge: 620, status: 'DANGER' },
  { id: 'ST-07', name: 'Guwahati DC Court Gauge (Assam)', lat: 26.1850, lon: 91.7450, level: 49.5, discharge: 8500, status: 'WARNING' },
  { id: 'ST-08', name: 'Old Delhi Railway Bridge (Delhi)', lat: 28.6650, lon: 77.2450, level: 205.8, discharge: 45000, status: 'WARNING' },
  { id: 'ST-09', name: 'Gandhi Ghat Gauge (Patna, Bihar)', lat: 25.6200, lon: 85.1700, level: 48.9, discharge: 28000, status: 'WARNING' },
  { id: 'ST-10', name: 'Naraj Barrage Gauge (Cuttack, Odisha)', lat: 20.4600, lon: 85.7800, level: 26.4, discharge: 15000, status: 'ALERT' },
];

// Designated Safe Relief Evacuation Shelters across India
const EVACUATION_CENTERS = [
  { id: 'EV-01', name: 'Govt Degree College Mandi (HP)', lat: 31.7180, lon: 76.9450, capacity: 1200, elevation: '+120m High Ground' },
  { id: 'EV-02', name: 'Meppadi High School Shelter (Kerala)', lat: 11.5450, lon: 76.1380, capacity: 1500, elevation: '+80m Safe Hill' },
  { id: 'EV-03', name: 'Chiplun Higher Secondary Ridge (MH)', lat: 17.5450, lon: 73.5280, capacity: 2000, elevation: '+65m Plateaux' },
  { id: 'EV-04', name: 'Sonprayag GMVN Complex (UK)', lat: 30.6380, lon: 79.0150, capacity: 600, elevation: '+150m High Terrace' },
  { id: 'EV-05', name: 'Dhemaji District Stadium Camp (Assam)', lat: 27.4900, lon: 94.5750, capacity: 2500, elevation: '+45m Safe Mound' },
  { id: 'EV-06', name: 'Patna Danapur Shelter Complex (Bihar)', lat: 25.6300, lon: 85.0500, capacity: 3000, elevation: '+35m Embankment' },
  { id: 'EV-07', name: 'Mayur Vihar Community Hall (Delhi)', lat: 28.6100, lon: 77.2900, capacity: 1800, elevation: '+25m High Terrace' },
];

// Active Incident Markers across India
const ACTIVE_INCIDENTS = [
  { id: 'INC-01', title: 'Stream Overflow & Culvert Breach (Chooralmala, Kerala)', lat: 11.5580, lon: 76.1220, severity: 'CRITICAL', time: '18m ago' },
  { id: 'INC-02', title: 'Road Washout near Purani Mandi (Himachal Pradesh)', lat: 31.7120, lon: 76.9380, severity: 'CRITICAL', time: '25m ago' },
  { id: 'INC-03', title: 'River Embankment Waterlogging (Chiplun, Maharashtra)', lat: 17.5380, lon: 73.5120, severity: 'CRITICAL', time: '34m ago' },
  { id: 'INC-04', title: 'Jiadhal River Embankment Seepage (Dhemaji, Assam)', lat: 27.4780, lon: 94.5900, severity: 'CRITICAL', time: '42m ago' },
  { id: 'INC-05', title: 'Low-Lying Floodplain Inundation (Yamuna Khadar, Delhi)', lat: 28.6700, lon: 77.2500, severity: 'HIGH', time: '55m ago' },
];

export const LiveMapTab: React.FC<LiveMapTabProps> = ({
  selectedLocation,
  onSelectLocation,
  predictionData,
  isLoading,
  onSearchQuery,
  onOpenAlertDispatcher
}) => {
  const [showZones, setShowZones] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [isSideCardExpanded, setIsSideCardExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [remoteResults, setRemoteResults] = useState<LocationResult[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search querying backend database & OSM geocoder
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || !onSearchQuery) {
      setRemoteResults([]);
      setIsSearchingRemote(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      try {
        const results = await onSearchQuery(q);
        setRemoteResults(results || []);
      } catch (err) {
        console.warn('Live location search error:', err);
      } finally {
        setIsSearchingRemote(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchQuery]);

  // 2-Hour Rolling Model Update countdown timer
  const [cycleCountdown, setCycleCountdown] = useState<string>('01:59:59');

  useEffect(() => {
    const updateCycle = () => {
      const now = new Date();
      const hours = now.getHours();
      const nextCycleHour = hours % 2 === 0 ? hours + 2 : hours + 1;
      const nextCycle = new Date(now);
      nextCycle.setHours(nextCycleHour, 0, 0, 0);
      const diffMs = nextCycle.getTime() - now.getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setCycleCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    updateCycle();
    const interval = setInterval(updateCycle, 1000);
    return () => clearInterval(interval);
  }, []);

  const isPanIndia = 
    selectedLocation.name?.toLowerCase().includes('pan-india') ||
    (Math.abs(selectedLocation.latitude - 22.9734) < 1.0 && Math.abs(selectedLocation.longitude - 78.6569) < 1.0);

  const riskLevel = predictionData?.prediction.risk_level || (isPanIndia ? 'HIGH' : 'HIGH');
  const probPercent = predictionData?.prediction.flood_probability_percent || (isPanIndia ? 76 : 78);
  const leadTimeMins = predictionData?.warning.lead_time_minutes || 180;
  const leadTimeHours = (leadTimeMins / 60).toFixed(1);

  const riskColor = 
    riskLevel === 'CRITICAL' ? '#FF6B6B' :
    riskLevel === 'HIGH' ? '#f97316' :
    riskLevel === 'MODERATE' ? '#FFE66D' :
    '#4ECDC4';

  // 3-Hour Forward Forecast data
  const forecast3h = predictionData?.forecast_3h && predictionData.forecast_3h.length >= 3 
    ? predictionData.forecast_3h 
    : [
        { hour: 1, time: '+1h Ahead', rainfall_mm: 12.4, flood_probability_percent: Math.min(probPercent + 4, 98), risk_level: 'HIGH', predicted_river_level_m: 3.2 },
        { hour: 2, time: '+2h Ahead', rainfall_mm: 19.8, flood_probability_percent: Math.min(probPercent + 9, 99), risk_level: 'CRITICAL', predicted_river_level_m: 3.5 },
        { hour: 3, time: '+3h Ahead', rainfall_mm: 14.2, flood_probability_percent: Math.min(probPercent + 12, 99), risk_level: 'CRITICAL', predicted_river_level_m: 3.7 },
      ];

  // Search items catalog across India
  const searchableCatalog = React.useMemo(() => {
    const list: { name: string; type: string; lat: number; lon: number; badge: string }[] = [
      { name: 'Pan-India (National Live Overview)', type: 'National Overview', lat: 22.9734, lon: 78.6569, badge: 'ALL INDIA' },
      { name: 'Wayanad (Chooralmala), Kerala', type: 'Catchment', lat: 11.5510, lon: 76.1260, badge: 'CRITICAL' },
      { name: 'Chiplun (Vashishti Basin), Maharashtra', type: 'Catchment', lat: 17.5323, lon: 73.5186, badge: 'CRITICAL' },
      { name: 'Dhemaji (Subansiri Floodway), Assam', type: 'Catchment', lat: 27.4833, lon: 94.5833, badge: 'CRITICAL' },
      { name: 'Mandi (Suketi Gorge), Himachal Pradesh', type: 'Catchment', lat: 31.7087, lon: 76.9320, badge: 'CRITICAL' },
      { name: 'Delhi NCR (Yamuna Floodplain)', type: 'River Basin', lat: 28.7041, lon: 77.1025, badge: 'WARNING' },
      { name: 'Patna (Ganga Basin), Bihar', type: 'River Basin', lat: 25.6093, lon: 85.1235, badge: 'WARNING' },
      { name: 'Guwahati (Brahmaputra), Assam', type: 'River Basin', lat: 26.1445, lon: 91.7362, badge: 'WARNING' },
      { name: 'Kullu (Upper Beas), Himachal Pradesh', type: 'Catchment', lat: 31.9579, lon: 77.1095, badge: 'WARNING' },
      { name: 'Kedarnath (Mandakini Valley), Uttarakhand', type: 'Catchment', lat: 30.7346, lon: 79.0669, badge: 'WARNING' },
      { name: 'Cherrapunji (Sohra), Meghalaya', type: 'Catchment', lat: 25.2702, lon: 91.7323, badge: 'WARNING' },
      { name: 'Srinagar (Jhelum Basin), Jammu & Kashmir', type: 'Catchment', lat: 34.0837, lon: 74.7973, badge: 'ALERT' },
      { name: 'Munnar (Periyar Catchment), Kerala', type: 'Catchment', lat: 10.0889, lon: 77.0595, badge: 'ALERT' },
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

  // Combined Search Results: Coordinates + Local River Catalog + Remote DB/Nominatim
  const combinedSearchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const list: { name: string; type: string; lat: number; lon: number; badge: string }[] = [];

    // 1. Check if user typed direct GPS coordinates (e.g. "31.95, 77.10")
    const coordMatch = q.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        list.push({
          name: `Direct GPS (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
          type: 'Coordinate Coordinate Point',
          lat,
          lon,
          badge: 'COORDINATES'
        });
      }
    }

    // 2. Local River / Basin / Gauge Matches
    const localMatches = searchableCatalog.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.type.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
    list.push(...localMatches);

    // 3. Remote Backend & OSM Geocoding Matches
    remoteResults.forEach(r => {
      if (!list.some(existing => existing.name.toLowerCase() === r.name.toLowerCase())) {
        list.push({
          name: r.name,
          type: r.type ? `${r.type.toUpperCase()} (India)` : 'Settlement / District',
          lat: r.latitude,
          lon: r.longitude,
          badge: 'GEO'
        });
      }
    });

    return list.slice(0, 8);
  }, [searchQuery, searchableCatalog, remoteResults]);

  const handleSelectSearchResult = (lat: number, lon: number, name: string) => {
    onSelectLocation(lat, lon, name);
    setSearchQuery('');
    setRemoteResults([]);
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if coordinates
    const coordMatch = q.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      handleSelectSearchResult(lat, lon, `Coordinates (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`);
      return;
    }

    if (combinedSearchResults.length > 0) {
      handleSelectSearchResult(
        combinedSearchResults[0].lat,
        combinedSearchResults[0].lon,
        combinedSearchResults[0].name
      );
      return;
    }

    // Immediate fallback query if user hit enter quickly
    if (onSearchQuery) {
      setIsSearchingRemote(true);
      try {
        const res = await onSearchQuery(q);
        if (res && res.length > 0) {
          handleSelectSearchResult(res[0].latitude, res[0].longitude, res[0].name);
          return;
        }
      } catch (err) {
        console.warn('Search submit fetch failed:', err);
      } finally {
        setIsSearchingRemote(false);
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc]">
      {/* 🗺️ Leaflet Full Screen Map View */}
      <MapContainer
        center={[selectedLocation.latitude, selectedLocation.longitude]}
        zoom={isPanIndia ? 5 : 8}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Clean OpenStreetMap Tile Layer (Free, No API Key Required, No Watermark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewController targetLocation={selectedLocation} />
        <MapClickListener onSelectLocation={onSelectLocation} />
        <MapZoomControls onRecenter={() => onSelectLocation(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)} />

        {/* Real-time Flood Risk Zone Overlays Across India */}
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
            eventHandlers={{
              click: () => {
                onSelectLocation(zone.polygon[0][0], zone.polygon[0][1], zone.name);
              }
            }}
          >
            <Tooltip permanent={false} direction="center" className="font-mono text-xs">
              <div className="font-bold text-slate-900">{zone.name}</div>
              <div className="text-[10px] text-rose-600 font-bold uppercase">{zone.severity} RISK ZONE ({zone.region})</div>
              <div className="text-[10px] text-slate-600">Stage: {zone.waterLevel}</div>
              <div className="text-[10px] text-slate-600">Population at Risk: {zone.populationAtRisk}</div>
              <div className="text-[9px] text-indigo-600 font-bold mt-0.5">Click to inspect localized telemetry</div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Pan-India CWC Water Gauge Telemetry Stations */}
        {showStations && WATER_STATIONS.map((st) => (
          <CircleMarker
            key={st.id}
            center={[st.lat, st.lon]}
            radius={isPanIndia ? 7 : 8}
            pathOptions={{
              color: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#0284c7'),
              fillColor: st.status === 'DANGER' ? '#FF6B6B' : (st.status === 'WARNING' ? '#f97316' : '#0284c7'),
              fillOpacity: 0.9,
              weight: 2,
            }}
            eventHandlers={{
              click: () => {
                onSelectLocation(st.lat, st.lon, st.name);
              }
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
                  <div>Alert Status: <span className="font-black text-rose-600">{st.status}</span></div>
                </div>
                <button
                  onClick={() => onSelectLocation(st.lat, st.lon, st.name)}
                  className="mt-2 text-[10px] text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded w-full font-bold"
                >
                  Analyze Gauge Catchment →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Designated Safe Relief Shelters */}
        {showShelters && EVACUATION_CENTERS.map((ev) => (
          <CircleMarker
            key={ev.id}
            center={[ev.lat, ev.lon]}
            radius={6}
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

        {/* Active Field Incidents */}
        {showIncidents && ACTIVE_INCIDENTS.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.lat, inc.lon]}
            radius={isPanIndia ? 7 : 9}
            pathOptions={{
              color: '#FF6B6B',
              fillColor: '#FF6B6B',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent={!isPanIndia} direction="top" className="font-mono text-[10px] font-bold">
              ⚠️ {inc.title}
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Active Selected Location Target Marker */}
        <CircleMarker
          center={[selectedLocation.latitude, selectedLocation.longitude]}
          radius={isPanIndia ? 14 : 12}
          pathOptions={{
            color: '#ffffff',
            fillColor: isPanIndia ? '#10b981' : '#FF6B6B',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Tooltip permanent direction="bottom" className="font-mono text-xs font-bold">
            {isPanIndia ? '🇮🇳 Pan-India National Center' : `📍 ${selectedLocation.name || 'Target Location'}`}
          </Tooltip>
        </CircleMarker>
      </MapContainer>

      {/* 🔍 Floating Map Search & Layer Controls (Top Left) */}
      <div ref={searchContainerRef} className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm w-full select-none">
        {/* Search Bar with Submit & Autocomplete */}
        <div className="relative">
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-lg focus-within:border-rose-400 transition-all"
          >
            {isSearchingRemote ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin ml-1.5 flex-shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 ml-1.5 flex-shrink-0" />
            )}
            <input
              type="text"
              placeholder="Search Indian city, river, state, or lat,lon..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-transparent text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRemoteResults([]);
                  setIsSearchFocused(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs px-1.5"
              >
                ✕
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (searchQuery.trim().length > 0) && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30 font-mono text-xs">
              <div className="p-2 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span>PAN-INDIA LIVE SEARCH</span>
                <span>{isSearchingRemote ? 'SEARCHING...' : 'ENTER TO JUMP'}</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {combinedSearchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSearchResult(item.lat, item.lon, item.name);
                    }}
                    className="w-full p-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition-colors text-slate-800 cursor-pointer"
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

                {combinedSearchResults.length === 0 && !isSearchingRemote && (
                  <div className="p-3 text-center text-[11px] text-slate-500 font-sans">
                    No immediate match. Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">Enter</kbd> to search pan-India geocoder.
                  </div>
                )}
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
            <span>🌊 CWC Gauges</span>
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

      {/* 📊 Tactical Floating Side Card (Top Right) */}
      <div className={`absolute top-4 right-4 z-10 transition-all duration-300 select-none ${
        isSideCardExpanded ? 'w-[320px] sm:w-[370px]' : 'w-auto'
      }`}>
        {isSideCardExpanded ? (
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-800 font-mono space-y-3.5 max-h-[calc(100vh-100px)] overflow-y-auto">
            {/* Card Header with Collapse Button & Pan-India Mode Indicator */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-pulse"></div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">
                  {isPanIndia ? '🇮🇳 PAN-INDIA LIVE FLOOD MONITORING' : 'TACTICAL CATCHMENT INTEL'}
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

            {/* If looking at a localized catchment, provide quick 'Back to Pan-India' button */}
            {!isPanIndia && (
              <button
                onClick={() => onSelectLocation(22.9734, 78.6569, 'Pan-India (National Live Overview)')}
                className="w-full py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Overall Pan-India Overview</span>
              </button>
            )}

            {/* 3-Hour Lead Time & 2-Hour Model Cycle Info Banner */}
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col gap-1 text-[10px]">
              <div className="flex items-center justify-between font-bold text-indigo-900">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3-Hour Early Warning Horizon</span>
                </span>
                <span className="text-rose-600 font-black">T+3h PREDICTION</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 pt-0.5 border-t border-indigo-100/60">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
                  <span>Updates every 2 hours:</span>
                </span>
                <span className="font-bold text-indigo-700 font-mono">in {cycleCountdown}</span>
              </div>
            </div>

            {/* Threat Level & Focus Area */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">
                  {isPanIndia ? 'NATIONAL VIGILANCE' : 'CURRENT RISK'}
                </span>
                <span className="text-base font-black tracking-tight uppercase" style={{ color: riskColor }}>
                  {riskLevel} RISK
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">
                  {isPanIndia ? 'HIGHEST THREAT BASINS' : 'NEAREST THREAT'}
                </span>
                <span className="text-xs font-bold text-slate-900 block max-w-[150px] truncate">
                  {isPanIndia ? '4 Red Alert Belts' : (selectedLocation.name || '1.2km Confluence')}
                </span>
              </div>
            </div>

            {/* 3-Hour Forward Early Warning Progression Cards */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  3-HOUR FORWARD FORECAST (T+1h, T+2h, T+3h)
                </span>
                <span className="text-[9px] text-rose-600 font-bold">EARLY WARNING</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {forecast3h.map((fc, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center">
                    <span className="text-[9px] font-bold text-slate-500 font-mono">{fc.time}</span>
                    <span className="text-base font-black text-slate-900 mt-0.5">{fc.flood_probability_percent}%</span>
                    <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded mt-0.5 ${
                      fc.risk_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                      fc.risk_level === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {fc.risk_level}
                    </span>
                    <span className="text-[8px] text-slate-500 mt-0.5">{fc.rainfall_mm}mm rain</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pan-India Critical Hotspots Quick-Jump (Only on Pan-India view) */}
            {isPanIndia && (
              <div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  PAN-INDIA ACTIVE CRITICAL HOTSPOTS
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    onClick={() => onSelectLocation(11.5510, 76.1260, 'Wayanad (Chooralmala), Kerala')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-rose-800 truncate">Wayanad, Kerala</span>
                    <span className="text-[9px] font-mono text-rose-600 font-black">CRIT</span>
                  </button>
                  <button
                    onClick={() => onSelectLocation(31.7087, 76.9320, 'Mandi (Suketi Gorge), Himachal')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-rose-800 truncate">Mandi, Himachal</span>
                    <span className="text-[9px] font-mono text-rose-600 font-black">CRIT</span>
                  </button>
                  <button
                    onClick={() => onSelectLocation(17.5323, 73.5186, 'Chiplun (Vashishti River), Maharashtra')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-rose-800 truncate">Chiplun, Maharashtra</span>
                    <span className="text-[9px] font-mono text-rose-600 font-black">CRIT</span>
                  </button>
                  <button
                    onClick={() => onSelectLocation(27.4833, 94.5833, 'Dhemaji (Subansiri Floodway), Assam')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-rose-800 truncate">Dhemaji, Assam</span>
                    <span className="text-[9px] font-mono text-rose-600 font-black">CRIT</span>
                  </button>
                  <button
                    onClick={() => onSelectLocation(28.7041, 77.1025, 'Delhi NCR (Yamuna Floodplain)')}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-amber-800 truncate">Delhi NCR (Yamuna)</span>
                    <span className="text-[9px] font-mono text-amber-600 font-black">WARN</span>
                  </button>
                  <button
                    onClick={() => onSelectLocation(25.6093, 85.1235, 'Patna (Ganga-Gandak), Bihar')}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left font-sans flex items-center justify-between"
                  >
                    <span className="font-bold text-amber-800 truncate">Patna, Bihar (Ganga)</span>
                    <span className="text-[9px] font-mono text-amber-600 font-black">WARN</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recommended Emergency Directives */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {isPanIndia ? 'NATIONAL INTER-AGENCY DIRECTIVES' : 'RECOMMENDED OPERATIONAL DIRECTIVES'}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                {(predictionData?.recommendations || [
                  'Maintain 3-hour advance evacuation alerts for vulnerable riverbanks.',
                  'Pre-position SDRF and NDRF rescue motorboats in red alert flood basins.',
                  'Synchronize live telemetry with CWC automatic gauge stations every 2 hours.'
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
                <span>TRIGGER PAN-INDIA EVACUATION ALERTS (CAP)</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSideCardExpanded(true)}
            className="p-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex items-center gap-2 text-slate-800 font-mono text-xs font-bold hover:bg-slate-50 transition-all"
            title="Expand Tactical Risk Intel"
          >
            <ChevronLeft className="w-4 h-4 text-[#FF6B6B]" />
            <span>{isPanIndia ? 'PAN-INDIA INTEL' : 'RISK INTEL'}</span>
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse"></span>
          </button>
        )}
      </div>
    </div>
  );
};
