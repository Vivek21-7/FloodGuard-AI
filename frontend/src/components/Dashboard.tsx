import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Droplets,
  Mountain,
  Activity,
  ShieldAlert,
  Sliders,
  Map as MapIcon,
  ArrowRight
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

  return (
    <div className="space-y-6">
      {/* 📍 Top Bar: 3-Way Location Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Location Search Input (Method 2) */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search village, town, or river basin (e.g. Kullu, Mandi, Manali, Shimla)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 1 && setShowResultsDropdown(true)}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500 shadow-inner"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto">
                {searchResults.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(loc)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-200">{loc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {loc.latitude.toFixed(3)}°N, {loc.longitude.toFixed(3)}°E
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons (Method 1: GPS) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onUseMyLocation}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all shadow-sm active:scale-95"
              title="Detect GPS coordinates via browser"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Use My Location</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/40 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[200px] font-medium text-slate-200">
                {selectedLocation.name || `${selectedLocation.latitude.toFixed(2)}°N, ${selectedLocation.longitude.toFixed(2)}°E`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Key Metric KPI Cards (Current Rainfall, Water Level, Terrain/Slope, Flood Risk %) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Current Rainfall */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" /> Current Rainfall
            </span>
            <span className="text-[10px] text-slate-500">6-Hour Sum</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {isDemoMode ? demoControls.rainfall : (envData?.weather.rainfall_6h_mm ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            1h: {(envData?.weather.rainfall_1h_mm ?? 0).toFixed(1)}mm • 3h: {(envData?.weather.rainfall_3h_mm ?? 0).toFixed(1)}mm
          </p>
        </div>

        {/* 2. Water Level */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> River Water Level
            </span>
            <span className="text-[10px] text-slate-500">CWC / WRIS</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {isDemoMode ? demoControls.waterLevel : (envData?.water.water_level_m ?? 1.5).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">m</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Danger Mark: 3.0m • Soil: {Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50)}% Sat.
          </p>
        </div>

        {/* 3. Terrain / Slope */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-400" /> Terrain & Slope
            </span>
            <span className="text-[10px] text-slate-500">USGS DEM</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {terrainData?.slope_degrees ?? 28}°
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({terrainData?.terrain_type ?? 'Steep Slopes'})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Elevation: {terrainData?.elevation_m ?? 1250}m ASL • High Runoff
          </p>
        </div>

        {/* 4. Flood Risk Percentage */}
        <div className={`border rounded-2xl p-4.5 shadow-xl transition-all ${
          riskLevel === 'CRITICAL' ? 'bg-red-950/30 border-red-500/60 shadow-red-950/30' :
          riskLevel === 'HIGH' ? 'bg-orange-950/30 border-orange-500/60 shadow-orange-950/30' :
          riskLevel === 'MODERATE' ? 'bg-amber-950/30 border-amber-500/60 shadow-amber-950/30' :
          'bg-emerald-950/30 border-emerald-500/60 shadow-emerald-950/30'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold flex items-center gap-1.5 text-slate-200">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Flood Risk Score
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              riskLevel === 'CRITICAL' ? 'bg-red-500 text-white' :
              riskLevel === 'HIGH' ? 'bg-orange-500 text-white' :
              riskLevel === 'MODERATE' ? 'bg-amber-500 text-black' :
              'bg-emerald-500 text-black'
            }`}>
              {riskLevel}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{floodProb}%</span>
            <span className="text-xs text-slate-300 font-medium">Probability</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 truncate">
            Lead Time: {predictionData?.warning.lead_time_minutes ? `${(predictionData.warning.lead_time_minutes / 60).toFixed(1)}h` : '3.5h'} • Calibrated RF
          </p>
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

      {/* 🗺️ Interactive Catchment Map Component (Embedded in Dashboard) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Catchment GIS Map (Method 3: Click Anywhere to Predict)
            </h3>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Open Full Risk Map</span>
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

      {/* 🚨 Latest Warning & Actionable Directives */}
      {predictionData && (
        <AlertPanel
          warning={predictionData.warning}
          recommendations={predictionData.recommendations}
          locationName={selectedLocation.name || 'Selected Mountain Catchment'}
        />
      )}

      {/* Detailed Telemetry & ML Prediction Breakdown */}
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
