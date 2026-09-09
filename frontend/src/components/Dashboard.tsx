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
  Layers,
  TrendingUp,
  AlertTriangle
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

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      setIsSearching(true);
      try {
        const results = await onSearchQuery(q);
        setSearchResults(results);
        setShowResultsDropdown(true);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResultsDropdown(false);
    }
  };

  const handleSelectSearchResult = (loc: LocationResult) => {
    onSelectLocation(loc.latitude, loc.longitude, loc.name);
    setSearchQuery(loc.name);
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Location Search Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catchment / station (e.g., Kullu, Mandi, Bhuntar, Manali, Shimla)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 1 && setShowResultsDropdown(true)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg pl-10 pr-10 py-2 text-xs font-mono outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Dropdown */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto font-mono text-xs">
                {searchResults.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(loc)}
                    className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-200">{loc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono font-medium transition-all"
              title="Acquire current GPS fix"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GPS Fix</span>
            </button>

            {onOpenSitrep && (
              <button
                onClick={onOpenSitrep}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">SITREP</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-slate-300 font-mono">
              <span className="text-slate-500 text-[10px]">STATION:</span>
              <span className="font-bold text-cyan-300 truncate max-w-[180px]">
                {selectedLocation.name || `${selectedLocation.latitude.toFixed(3)}°N, ${selectedLocation.longitude.toFixed(3)}°E`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 4 Real Operational Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        {/* 1. Precipitation Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> PRECIPITATION
            </span>
            <span className="text-[10px] text-slate-500">6H SUM</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{currentRain.toFixed(1)}</span>
            <span className="text-xs text-slate-400">mm</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-1">
            <span>1h: {(envData?.weather.rainfall_1h_mm ?? 0).toFixed(1)} mm</span>
            <span className="text-cyan-400">Next 3h: {(envData?.weather.forecast_rainfall_next_3h ?? 0).toFixed(1)} mm</span>
          </div>
        </div>

        {/* 2. Hydrometric River Stage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> RIVER GAUGE
            </span>
            <span className="text-[10px] text-slate-500">CWC STAGE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${currentWater >= 2.8 ? 'text-red-400' : currentWater >= 2.0 ? 'text-amber-400' : 'text-white'}`}>
              {currentWater.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">m</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-1">
            <span>Warning: 2.0m</span>
            <span className="text-red-400 font-bold">Danger: 2.8m</span>
          </div>
        </div>

        {/* 3. Topographic Slope Gradient */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-300">
              <Mountain className="w-3.5 h-3.5 text-amber-400" /> TERRAIN GRADIENT
            </span>
            <span className="text-[10px] text-slate-500">USGS 30M</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{terrainData?.slope_degrees ?? 28}°</span>
            <span className="text-xs text-slate-400 font-sans">({terrainData?.terrain_type ?? 'Steep'})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-1">
            <span>Elev: {terrainData?.elevation_m ?? 1250}m ASL</span>
            <span className="text-amber-400">Runoff: High</span>
          </div>
        </div>

        {/* 4. Quantitative Flash Flood Probability */}
        <div className={`border rounded-xl p-4 shadow-lg transition-all ${
          riskLevel === 'CRITICAL' ? 'bg-red-950/40 border-red-500/70 shadow-red-950/40' :
          riskLevel === 'HIGH' ? 'bg-orange-950/40 border-orange-500/70 shadow-orange-950/40' :
          riskLevel === 'MODERATE' ? 'bg-amber-950/40 border-amber-500/70 shadow-amber-950/40' :
          'bg-emerald-950/40 border-emerald-500/70 shadow-emerald-950/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-200">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> FLOOD RISK
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono ${
              riskLevel === 'CRITICAL' ? 'bg-red-500 text-white' :
              riskLevel === 'HIGH' ? 'bg-orange-500 text-white' :
              riskLevel === 'MODERATE' ? 'bg-amber-500 text-black' :
              'bg-emerald-500 text-black'
            }`}>
              {riskLevel} RISK
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{floodProb}%</span>
            <span className="text-xs text-slate-300 font-sans">Probability</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-300 flex justify-between border-t border-slate-800/80 pt-1 font-mono">
            <span>Lead Time:</span>
            <span className="text-cyan-300 font-bold">
              {predictionData?.warning.lead_time_minutes ? `${(predictionData.warning.lead_time_minutes / 60).toFixed(1)}h` : '3.5h'}
            </span>
          </div>
        </div>
      </div>

      {/* 🌊 Hydrometric River Stage Hydrograph Bar (CWC Calibration) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 font-sans">HYDROMETRIC RIVER STAGE LEVEL GAUGE</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Normal: &lt;1.8m</span>
            <span className="text-amber-400">Warning: 2.0m</span>
            <span className="text-red-400 font-bold">Danger Level (DL): 2.8m</span>
            <span className="text-purple-400">High Flood Level (HFL): 3.9m</span>
          </div>
        </div>

        {/* Visual Stage Scale */}
        <div className="relative h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center">
          {/* Normal Zone (0 - 2.0m => 50%) */}
          <div className="h-full bg-emerald-950/40 border-r border-emerald-500/30" style={{ width: '50%' }}></div>
          {/* Warning Zone (2.0 - 2.8m => 20%) */}
          <div className="h-full bg-amber-950/50 border-r border-amber-500/40" style={{ width: '20%' }}></div>
          {/* Danger Zone (2.8 - 4.0m => 30%) */}
          <div className="h-full bg-red-950/60" style={{ width: '30%' }}></div>

          {/* Current Water Level Marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10 transition-all duration-500"
            style={{ left: `${waterPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0.0m (Dry Channel)</span>
          <span>1.0m</span>
          <span className="text-amber-400">2.0m (Warning Mark)</span>
          <span className="text-red-400">2.8m (Danger Mark)</span>
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
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              CATCHMENT GIS RADAR (CLICK COORDINATES TO RUN INFERENCE)
            </h3>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono"
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
    </div>
  );
};
