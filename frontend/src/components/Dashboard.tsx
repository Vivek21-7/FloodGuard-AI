import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Droplets,
  Mountain,
  Activity,
  ShieldAlert,
  Sliders,
  Map as MapIcon,
  ArrowRight,
  FileText,
  Clock,
  Radio,
  TrendingUp,
  AlertTriangle,
  X,
  BarChart2,
  BookOpen
} from 'lucide-react';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  DemoControlsState, 
  LocationResult,
  RiskMapFeature,
  HistoricalEventItem
} from '../types';
import { EnvironmentCard } from './EnvironmentCard';
import { PredictionCard } from './PredictionCard';
import { AlertPanel } from './AlertPanel';
import { DemoSliderControls } from './DemoSliderControls';
import { RiskMap } from './RiskMap';
import { PanIndiaLiveMonitoring } from './PanIndiaLiveMonitoring';
import { ThreeLayerArchitectureBanner } from './ThreeLayerArchitectureBanner';
import { DataPartnershipsBanner } from './DataPartnershipsBanner';

interface DashboardProps {
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
  onUseMyLocation: () => void;
  envData: EnvironmentResponse | null;
  terrainData: TerrainResponse | null;
  predictionData: PredictResponse | null;
  isLoading: boolean;
  isDemoMode: boolean;
  demoControls: DemoControlsState;
  onDemoControlsChange: (updated: Partial<DemoControlsState>) => void;
  onSendIoTPacket: () => void;
  iotStatus: string | null;
  onSearchQuery: (q: string) => Promise<LocationResult[]>;
  riskMapFeatures?: RiskMapFeature[];
  historicalEvents?: HistoricalEventItem[];
  onNavigateToTab?: (tab: 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology') => void;
  onOpenSitrep?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedLocation,
  onSelectLocation,
  onUseMyLocation,
  envData,
  terrainData,
  predictionData,
  isLoading,
  isDemoMode,
  demoControls,
  onDemoControlsChange,
  onSendIoTPacket,
  iotStatus,
  onSearchQuery,
  riskMapFeatures = [],
  historicalEvents = [],
  onNavigateToTab,
  onOpenSitrep,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const isSelectionTriggered = React.useRef(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isSelectionTriggered.current) {
      isSelectionTriggered.current = false;
      return;
    }

    if (searchQuery.trim().length <= 1) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await onSearchQuery(searchQuery.trim());
        setSearchResults(results);
        setShowResultsDropdown(results && results.length > 0);
      } catch (err) {
        console.warn('Search query skipped/failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isSelectionTriggered.current = false;
    setSearchQuery(e.target.value);
  };

  const handleSelectSearchResult = (loc: LocationResult) => {
    isSelectionTriggered.current = true;
    onSelectLocation(loc.latitude, loc.longitude, loc.name);
    setSearchQuery(loc.name);
    setSearchResults([]);
    setShowResultsDropdown(false);
  };

  const handleClearSearch = () => {
    isSelectionTriggered.current = true;
    setSearchQuery('');
    setSearchResults([]);
    setShowResultsDropdown(false);
  };

  const riskLevel = predictionData?.prediction.risk_level ?? 'LOW';
  const floodProb = predictionData?.prediction.flood_probability_percent ?? 15;
  const currentWater = isDemoMode ? demoControls.waterLevel : (envData?.water.water_level_m ?? 1.5);
  const currentRain = isDemoMode ? demoControls.rainfall : (envData?.weather.rainfall_6h_mm ?? 0);
  const soilSat = isDemoMode ? demoControls.soilMoisture : Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50);

  // Hydrograph calculations (Warning: 2.0m, Danger: 2.8m, HFL: 3.9m)
  const maxScale = 4.0;
  const waterPercent = Math.min((currentWater / maxScale) * 100, 100);

  return (
    <div className="space-y-6">
      {/* 📍 Top Bar: Command Station & Location Coordinates */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Location Search Input */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any Indian town/village (e.g., Wayanad, Kullu, Kedarnath, Cherrapunji, Chiplun)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0 && !isSelectionTriggered.current) {
                    setShowResultsDropdown(true);
                  }
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Dropdown */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto font-mono text-xs">
                {searchResults.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(loc)}
                    className="p-3 hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{loc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {loc.latitude.toFixed(3)}°N, {loc.longitude.toFixed(3)}°E
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUseMyLocation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-mono font-semibold transition-all shadow-xs"
              title="Acquire current GPS fix"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GPS Fix</span>
            </button>

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-mono font-semibold transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">SITREP</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-mono shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold">STATION:</span>
              <span className="font-bold text-indigo-700 truncate max-w-[180px]">
                {selectedLocation.name || `${selectedLocation.latitude.toFixed(3)}°N, ${selectedLocation.longitude.toFixed(3)}°E`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ 3-Layer Hydro-Meteorological Intelligence Pipeline Banner (7C: Content) */}
      <ThreeLayerArchitectureBanner />

      {/* 🌊 Pan-India Live Multi-City Real-Time Prediction Monitoring Matrix */}
      <PanIndiaLiveMonitoring onSelectCityLocation={onSelectLocation} />

      {/* 📊 4 Real Operational Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* 1. Precipitation Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-700">
              <span className="p-1 rounded-lg bg-sky-50 text-sky-600">
                <Droplets className="w-3.5 h-3.5" />
              </span>
              PRECIPITATION
            </span>
            <span className="text-[10px] text-slate-400 font-medium">6H SUM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{currentRain.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-medium">mm</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5 font-medium">
            <span>1h: {(envData?.weather.rainfall_1h_mm ?? 0).toFixed(1)} mm</span>
            <span className="text-indigo-600 font-semibold">Next 3h: {(envData?.weather.forecast_rainfall_next_3h ?? 0).toFixed(1)} mm</span>
          </div>
        </div>

        {/* 2. Hydrometric River Stage */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-700">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <Activity className="w-3.5 h-3.5" />
              </span>
              RIVER GAUGE
            </span>
            <span className="text-[10px] text-slate-400 font-medium">CWC STAGE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${currentWater >= 2.8 ? 'text-rose-600' : currentWater >= 2.0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {currentWater.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium">m</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5 font-medium">
            <span>Warning: 2.0m</span>
            <span className="text-rose-600 font-bold">Danger: 2.8m</span>
          </div>
        </div>

        {/* 3. Topographic Slope Gradient */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-700">
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
                <Mountain className="w-3.5 h-3.5" />
              </span>
              TERRAIN GRADIENT
            </span>
            <span className="text-[10px] text-slate-400 font-medium">USGS 30M</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{terrainData?.slope_degrees ?? 28}°</span>
            <span className="text-xs text-slate-500 font-sans font-medium">({terrainData?.terrain_type ?? 'Steep'})</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5 font-medium">
            <span>Elev: {terrainData?.elevation_m ?? 1250}m ASL</span>
            <span className="text-amber-700 font-semibold">Runoff: High</span>
          </div>
        </div>

        {/* 4. Quantitative Flash Flood Probability */}
        <div className={`border rounded-2xl p-4 shadow-sm transition-all ${
          riskLevel === 'CRITICAL' ? 'bg-rose-50 border-rose-300' :
          riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-300' :
          riskLevel === 'MODERATE' ? 'bg-amber-50 border-amber-300' :
          'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-800">
              <span className="p-1 rounded-lg bg-white/80 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              </span>
              FLOOD RISK
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono shadow-xs ${
              riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' :
              riskLevel === 'HIGH' ? 'bg-orange-600 text-white' :
              riskLevel === 'MODERATE' ? 'bg-amber-500 text-slate-900' :
              'bg-emerald-600 text-white'
            }`}>
              {riskLevel}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{floodProb}%</span>
            <span className="text-xs text-slate-600 font-sans font-medium">Probability</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-700 flex justify-between border-t border-slate-200/60 pt-1.5 font-mono font-semibold">
            <span>Lead Time:</span>
            <span className="text-indigo-700 font-bold">
              {predictionData?.warning.lead_time_minutes ? `${(predictionData.warning.lead_time_minutes / 60).toFixed(1)}h` : '3.5h'}
            </span>
          </div>
        </div>
      </div>

      {/* 🌊 Hydrometric River Stage Hydrograph Bar (CWC Calibration) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800 font-sans">HYDROMETRIC RIVER STAGE LEVEL GAUGE</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-3 font-semibold">
            <span className="text-emerald-700">Normal: &lt;1.8m</span>
            <span className="text-amber-700">Warning: 2.0m</span>
            <span className="text-rose-700 font-bold">Danger Level (DL): 2.8m</span>
            <span className="text-purple-700">High Flood Level (HFL): 3.9m</span>
          </div>
        </div>

        {/* Visual Stage Scale */}
        <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center">
          {/* Normal Zone (0 - 2.0m => 50%) */}
          <div className="h-full bg-emerald-100/80 border-r border-emerald-300" style={{ width: '50%' }}></div>
          {/* Warning Zone (2.0 - 2.8m => 20%) */}
          <div className="h-full bg-amber-100/90 border-r border-amber-300" style={{ width: '20%' }}></div>
          {/* Danger Zone (2.8 - 4.0m => 30%) */}
          <div className="h-full bg-rose-200/90" style={{ width: '30%' }}></div>

          {/* Current Water Level Marker */}
          <div 
            className="absolute top-0 bottom-0 w-1.5 bg-indigo-600 shadow-md z-10 transition-all duration-500 rounded-full"
            style={{ left: `${waterPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
          <span>0.0m (Dry Channel)</span>
          <span>1.0m</span>
          <span className="text-amber-700 font-semibold">2.0m (Warning Mark)</span>
          <span className="text-rose-700 font-bold">2.8m (Danger Mark)</span>
          <span>4.0m (Extreme Flood)</span>
        </div>
      </div>

      {/* Demo Controls Sandbox (when active) */}
      {isDemoMode && (
        <DemoSliderControls
          controls={demoControls}
          onChange={onDemoControlsChange}
          onSendIoTPacket={onSendIoTPacket}
          iotStatus={iotStatus}
        />
      )}

      {/* 🗺️ Interactive Catchment Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              CATCHMENT GIS RADAR (CLICK COORDINATES TO RUN INFERENCE)
            </h3>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 font-mono transition-colors"
            >
              <span>FULL GIS MONITOR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <RiskMap
          features={riskMapFeatures}
          historicalEvents={historicalEvents}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
        />
      </div>

      {/* 🚨 Latest Warning Directive */}
      {predictionData && (
        <AlertPanel
          warning={predictionData.warning}
          recommendations={predictionData.recommendations}
          locationName={selectedLocation.name || 'Himalayan Mountain Catchment'}
        />
      )}

      {/* Telemetry & Prediction Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <EnvironmentCard
            envData={envData}
            terrainData={terrainData}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <PredictionCard
            predictionData={predictionData}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 🧭 Dedicated Command Modules & Sub-Dashboards Hub */}
      {onNavigateToTab && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                FLOODGUARD AI — DEDICATED COMMAND SUB-DASHBOARDS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-medium">6 MODULAR SYSTEMS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. GIS Risk Map */}
            <button
              onClick={() => onNavigateToTab('map')}
              className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <MapIcon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block font-sans">Pan-India GIS Map</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">High-res catchment polygons & layer filters</span>
              </div>
            </button>

            {/* 2. ML Prediction Sandbox */}
            <button
              onClick={() => onNavigateToTab('prediction')}
              className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Sliders className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block font-sans">AI Risk Predictor</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">XAI feature attribution & scenario sliders</span>
              </div>
            </button>

            {/* 3. Alerts & Evacuation */}
            <button
              onClick={() => onNavigateToTab('alerts')}
              className="group p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 text-left transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Radio className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="font-bold text-xs text-rose-900 block font-sans">Alerts & Evac</span>
                <span className="text-[10px] text-rose-600/80 block mt-0.5">CAP protocol & village safe shelter routes</span>
              </div>
            </button>

            {/* 4. Hydrological Trends */}
            <button
              onClick={() => onNavigateToTab('analysis')}
              className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block font-sans">Historical Trends</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">NDMA flood regression & decadal catalog</span>
              </div>
            </button>

            {/* 5. About & Methodology */}
            <button
              onClick={() => onNavigateToTab('methodology')}
              className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-indigo-100/80 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block font-sans">About & Dossier</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">SIH 26192 specs & 12-API data matrix</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 📡 National & Global Data Providers (7C: Connection) */}
      <DataPartnershipsBanner />
    </div>
  );
};
