import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  DemoControlsState, 
  LocationResult 
} from '../types';
import { EnvironmentCard } from './EnvironmentCard';
import { PredictionCard } from './PredictionCard';
import { AlertPanel } from './AlertPanel';
import { DemoSliderControls } from './DemoSliderControls';

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
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Location Search Input */}
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
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onUseMyLocation}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all shadow-sm"
              title="Detect GPS coordinates via browser"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Use My Location</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/40 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[200px]">
                {selectedLocation.name || `${selectedLocation.latitude.toFixed(2)}°N, ${selectedLocation.longitude.toFixed(2)}°E`}
              </span>
            </div>
          </div>
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

      {/* Main Grid: Telemetry & Prediction Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Environmental Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          <EnvironmentCard
            envData={envData}
            terrainData={terrainData}
            isLoading={isLoading}
          />

          {/* Actionable Early Warning Alert Panel */}
          {predictionData && (
            <AlertPanel
              warning={predictionData.warning}
              recommendations={predictionData.recommendations}
              locationName={selectedLocation.name || 'Selected Mountain Catchment'}
            />
          )}
        </div>

        {/* Right Column: ML Prediction & Risk Gauge */}
        <div className="lg:col-span-5 space-y-6">
          <PredictionCard
            predictionData={predictionData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
