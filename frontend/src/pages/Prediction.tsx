import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  Cpu, 
  Sliders, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Droplets,
  Layers,
  Activity,
  Mountain
} from 'lucide-react';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  DemoControlsState, 
  LocationResult,
  RiskMapFeature
} from '../types';
import { PredictionCard } from '../components/PredictionCard';
import { EnvironmentCard } from '../components/EnvironmentCard';
import { DemoSliderControls } from '../components/DemoSliderControls';

interface PredictionPageProps {
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
  onRunPrediction: () => void;
}

export const PredictionPage: React.FC<PredictionPageProps> = ({
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
  onRunPrediction,
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

  return (
    <div className="py-6 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI-Driven Flash Flood Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hyper-Local Flood Risk Prediction
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Select any target coordinate across mountainous catchments using <strong>GPS</strong>, <strong>Name Search</strong>, or <strong>Map Coordinates</strong>. Multi-source environmental telemetry is ingested and passed to the ensemble Random Forest model to calculate flash flood probability, risk classification, and explainable contributing drivers.
          </p>
        </div>
      </div>

      {/* 📍 3-Way Location Selector Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Step 1: Choose Target Location (3 Methods Supported)
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Method 2: Search Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Method 2: Search village or town (e.g. Kullu, Manali, Mandi, Shimla)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 1 && setShowResultsDropdown(true)}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500 shadow-inner"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Dropdown search results */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-700/50">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-700/60 transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200 font-medium">{res.name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {res.latitude.toFixed(3)}, {res.longitude.toFixed(3)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Method 1: GPS Button */}
          <button
            onClick={onUseMyLocation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Request device GPS location"
          >
            <Compass className="w-4 h-4" />
            <span>Method 1: Use My GPS Location</span>
          </button>

          {/* Manual Coordinate Quick Ref */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Selected:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* 🤖 Environmental Inputs & ML Inference Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Environmental Telemetry Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Step 2: Environmental Telemetry Inputs
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                {isDemoMode ? 'Interactive Sandbox' : 'Live Open-Meteo & DEM'}
              </span>
            </div>

            {/* Ingested Features Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Rainfall (6h)
                </div>
                <div className="text-lg font-black text-white">
                  {isDemoMode ? demoControls.rainfall : (envData?.weather.rainfall_6h_mm ?? 0).toFixed(1)} <span className="text-xs text-slate-400 font-normal">mm</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Soil Saturation
                </div>
                <div className="text-lg font-black text-white">
                  {isDemoMode ? demoControls.soilMoisture : Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50)} <span className="text-xs text-slate-400 font-normal">%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" /> Terrain Slope
                </div>
                <div className="text-lg font-black text-white">
                  {terrainData?.slope_degrees ?? 28}° <span className="text-xs text-slate-400 font-normal">({terrainData?.terrain_type ?? 'Steep Slopes'})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> River Gauge
                </div>
                <div className="text-lg font-black text-white">
                  {isDemoMode ? demoControls.waterLevel : (envData?.water.water_level_m ?? 1.8).toFixed(1)} <span className="text-xs text-slate-400 font-normal">m</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Elevation DEM
                </div>
                <div className="text-lg font-black text-white">
                  {terrainData?.elevation_m ?? 1250} <span className="text-xs text-slate-400 font-normal">m ASL</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Historical Risk
                </div>
                <div className="text-lg font-black text-white capitalize">
                  {predictionData?.prediction.risk_level ?? 'Moderate'}
                </div>
              </div>
            </div>

            {/* Run Prediction Button */}
            <button
              onClick={onRunPrediction}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{isLoading ? 'Running ML Inference...' : 'Step 3: Run AI Flood Prediction'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Scenario Controls (Fine-Tuning / What-If Testing) */}
          {isDemoMode && (
            <DemoSliderControls
              controls={demoControls}
              onChange={onDemoControlsChange}
              onSendIoTPacket={onSendIoTPacket}
              iotStatus={iotStatus}
            />
          )}

          {/* Full Environment Card */}
          <EnvironmentCard
            envData={envData}
            terrainData={terrainData}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Prediction Results & Explainable Factors */}
        <div className="lg:col-span-6 space-y-6">
          <PredictionCard
            predictionData={predictionData}
            isLoading={isLoading}
          />

          {/* Scientific Decision Matrix Alert */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Scientific Risk Classification & Decision Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-emerald-300">
                <div className="font-bold">🟢 LOW (&lt;30%)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Normal baseline monitoring</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300">
                <div className="font-bold">🟡 MODERATE (30-59%)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Advisory & stream watch</div>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-600/30 text-orange-300">
                <div className="font-bold">🟠 HIGH (60-84%)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Pre-evacuation staged</div>
              </div>
              <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-600/30 text-red-300">
                <div className="font-bold">🔴 CRITICAL (≥85%)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Immediate evacuation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
