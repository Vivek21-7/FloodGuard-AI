import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  Cpu, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Droplets, 
  Layers, 
  Activity, 
  Mountain,
  X
} from 'lucide-react';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  DemoControlsState, 
  LocationResult
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
  const isSelectionTriggered = useRef(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
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

  return (
    <div className="py-6 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI-Driven Flash Flood Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hyper-Local Flood Risk Prediction
          </h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed">
            Select any target coordinate across mountainous catchments using <strong>GPS</strong>, <strong>Name Search</strong>, or <strong>Map Coordinates</strong>. Multi-source environmental telemetry is ingested and passed to the ensemble Random Forest model to calculate flash flood probability, risk classification, and explainable contributing drivers.
          </p>
        </div>
      </div>

      {/* 📍 3-Way Location Selector Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Step 1: Choose Target Location (3 Methods Supported)
        </h2>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Method 2: Search Input */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Method 2: Search village or town (e.g. Kullu, Manali, Mandi, Shimla, Wayanad)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0 && !isSelectionTriggered.current) {
                    setShowResultsDropdown(true);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 shadow-xs font-medium"
              />
              {isSearching ? (
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
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

            {/* Dropdown search results */}
            {showResultsDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-800 font-semibold">{res.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Request device GPS location"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Method 1: Use My GPS Location</span>
          </button>

          {/* Manual Coordinate Quick Ref */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-500 font-medium">Selected:</span>
            <span className="font-mono text-indigo-600 font-bold">
              {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* 🤖 Environmental Inputs & ML Inference Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Environmental Telemetry Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Step 2: Environmental Telemetry Inputs
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                {isDemoMode ? 'Interactive Sandbox' : 'Live Open-Meteo & DEM'}
              </span>
            </div>

            {/* Ingested Features Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> Rainfall (6h)
                </div>
                <div className="text-lg font-black text-slate-900">
                  {isDemoMode ? demoControls.rainfall : (envData?.weather.rainfall_6h_mm ?? 0).toFixed(1)} <span className="text-xs text-slate-500 font-normal">mm</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> Soil Saturation
                </div>
                <div className="text-lg font-black text-slate-900">
                  {isDemoMode ? demoControls.soilMoisture : Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50)} <span className="text-xs text-slate-500 font-normal">%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <Mountain className="w-3.5 h-3.5 text-amber-500" /> Terrain Slope
                </div>
                <div className="text-lg font-black text-slate-900">
                  {terrainData?.slope_degrees ?? 28}° <span className="text-xs text-slate-500 font-normal">({terrainData?.terrain_type ?? 'Steep Slopes'})</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" /> River Gauge
                </div>
                <div className="text-lg font-black text-slate-900">
                  {isDemoMode ? demoControls.waterLevel : (envData?.water.water_level_m ?? 1.8).toFixed(1)} <span className="text-xs text-slate-500 font-normal">m</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-500" /> Elevation DEM
                </div>
                <div className="text-lg font-black text-slate-900">
                  {terrainData?.elevation_m ?? 1250} <span className="text-xs text-slate-500 font-normal">m ASL</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Historical Risk
                </div>
                <div className="text-lg font-black text-slate-900 capitalize">
                  {predictionData?.prediction.risk_level ?? 'Moderate'}
                </div>
              </div>
            </div>

            {/* Run Prediction Button */}
            <button
              onClick={onRunPrediction}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              Scientific Risk Classification & Decision Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <div className="font-bold">🟢 LOW (&lt;30%)</div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Normal baseline monitoring</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="font-bold">🟡 MODERATE (30-59%)</div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Advisory & stream watch</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
                <div className="font-bold">🟠 HIGH (60-84%)</div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Pre-evacuation staged</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <div className="font-bold">🔴 CRITICAL (≥85%)</div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Immediate evacuation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
