import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MapPage } from './pages/Map';
import { PredictionPage } from './pages/Prediction';
import { AlertsPage } from './pages/Alerts';
import { AnalysisPage } from './pages/Analysis';
import { MethodologyPage } from './pages/Methodology';
import { api } from './services/api';
import { getCurrentPosition } from './services/geolocation';
import { storage } from './services/storage';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  RiskMapFeature, 
  HistoricalEventItem, 
  AlertItem, 
  ModelInfoResponse, 
  DemoControlsState,
  LocationResult
} from './types';
import { ShieldCheck, LifeBuoy, AlertTriangle } from 'lucide-react';

const DEMO_PRESET_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  Kullu: { lat: 31.9579, lon: 77.1095, name: 'Kullu, Himachal Pradesh' },
  Shimla: { lat: 31.7724, lon: 77.1706, name: 'Shimla, Himachal Pradesh' },
  Mandi: { lat: 32.2396, lon: 76.9227, name: 'Mandi, Himachal Pradesh' },
  Solan: { lat: 30.9100, lon: 77.1633, name: 'Solan, Himachal Pradesh' },
  Bilaspur: { lat: 31.3175, lon: 76.7581, name: 'Bilaspur, Himachal Pradesh' },
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'prediction' | 'alerts' | 'analysis' | 'methodology'>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => storage.getSettings().isDemoMode);
  const [demoControls, setDemoControls] = useState<DemoControlsState>(() => storage.getDemoControls());
  const [iotStatus, setIotStatus] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name?: string }>({
    latitude: 31.9579,
    longitude: 77.1095,
    name: 'Kullu, Himachal Pradesh',
  });

  const [envData, setEnvData] = useState<EnvironmentResponse | null>(null);
  const [terrainData, setTerrainData] = useState<TerrainResponse | null>(null);
  const [predictionData, setPredictionData] = useState<PredictResponse | null>(null);
  const [riskMapFeatures, setRiskMapFeatures] = useState<RiskMapFeature[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEventItem[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Load telemetry & run prediction for the active coordinate
  const loadLocationData = useCallback(async (
    lat: number,
    lon: number,
    locName?: string,
    overrides?: Partial<DemoControlsState>
  ) => {
    setIsLoading(true);
    setNetworkError(null);
    try {
      const controlsToUse = { ...demoControls, ...overrides };

      // Parallel API calls
      const [envRes, terrainRes, predictRes] = await Promise.all([
        api.getEnvironment(lat, lon, locName),
        api.getTerrain(lat, lon),
        api.predict({
          latitude: lat,
          longitude: lon,
          location_name: locName || 'Mountain Catchment',
          ...(isDemoMode ? {
            rainfall_6h_mm: controlsToUse.rainfall,
            rainfall_3h_mm: controlsToUse.rainfall * 0.6,
            rainfall_1h_mm: controlsToUse.rainfall * 0.3,
            soil_moisture_percent: controlsToUse.soilMoisture,
            water_level_m: controlsToUse.waterLevel,
            temperature_c: controlsToUse.temperature,
          } : {})
        })
      ]);

      setEnvData(envRes);
      setTerrainData(terrainRes);
      setPredictionData(predictRes);
    } catch (err: any) {
      console.error('Failed to load telemetry or prediction:', err);
      setNetworkError('Backend API communication error. Showing calibrated demo parameters.');
    } finally {
      setIsLoading(false);
    }
  }, [demoControls, isDemoMode]);

  // Load global datasets once
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const [mapRes, histRes, modelRes] = await Promise.all([
          api.getRiskMap(),
          api.getHistoricalEvents(),
          api.getModelInfo(),
        ]);
        setRiskMapFeatures(mapRes.features);
        setHistoricalEvents(histRes.events);
        setModelInfo(modelRes);
      } catch (err) {
        console.error('Failed to load global data:', err);
      }
    };

    loadGlobalData();
  }, []);

  // Trigger location update on coordinate change
  useEffect(() => {
    loadLocationData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name);
  }, [selectedLocation.latitude, selectedLocation.longitude, isDemoMode]);

  // Handle location selection
  const handleSelectLocation = (lat: number, lon: number, name?: string) => {
    setSelectedLocation({ latitude: lat, longitude: lon, name });
  };

  // Preset location handler
  const handleSelectDemoLocation = (presetName: string) => {
    const target = DEMO_PRESET_COORDINATES[presetName];
    if (target) {
      // Adjust preset sliders to reflect that region's typical scenario
      if (presetName === 'Kullu') {
        setDemoControls({ rainfall: 125, soilMoisture: 72, waterLevel: 2.8, temperature: 24 });
      } else if (presetName === 'Mandi') {
        setDemoControls({ rainfall: 182, soilMoisture: 89, waterLevel: 4.1, temperature: 26 });
      } else if (presetName === 'Shimla') {
        setDemoControls({ rainfall: 54, soilMoisture: 58, waterLevel: 1.4, temperature: 19 });
      } else if (presetName === 'Solan') {
        setDemoControls({ rainfall: 12, soilMoisture: 38, waterLevel: 0.8, temperature: 23 });
      } else if (presetName === 'Bilaspur') {
        setDemoControls({ rainfall: 8, soilMoisture: 34, waterLevel: 1.1, temperature: 28 });
      }
      setSelectedLocation({ latitude: target.lat, longitude: target.lon, name: target.name });
    }
  };

  // Browser GPS detection
  const handleUseMyLocation = async () => {
    try {
      setIsLoading(true);
      const pos = await getCurrentPosition();
      const rev = await api.reverseGeocode(pos.latitude, pos.longitude);
      setSelectedLocation({
        latitude: pos.latitude,
        longitude: pos.longitude,
        name: rev.name,
      });
    } catch (err) {
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearchQuery = async (query: string): Promise<LocationResult[]> => {
    const res = await api.searchLocations(query);
    return res.results;
  };

  // Demo controls slider change (debounced/real-time update)
  const handleDemoControlsChange = (updated: Partial<DemoControlsState>) => {
    const newControls = { ...demoControls, ...updated };
    setDemoControls(newControls);
    storage.saveDemoControls(newControls);
    loadLocationData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name, newControls);
  };

  // IoT Packet Transmission simulation
  const handleSendIoTPacket = async () => {
    try {
      setIotStatus('Transmitting packet...');
      const res = await api.sendSensorData({
        sensor_id: `SENSOR-${selectedLocation.name?.substring(0, 4).toUpperCase() || 'HP'}-01`,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        rainfall_mm: demoControls.rainfall,
        soil_moisture_percent: demoControls.soilMoisture,
        water_level_m: demoControls.waterLevel,
        timestamp: new Date().toISOString(),
      });

      if (res.processed) {
        setIotStatus(`Ingested! Calculated Risk: ${res.calculated_risk || 'UPDATED'}`);
        setTimeout(() => setIotStatus(null), 4000);
      }
    } catch (err) {
      console.error('IoT packet dispatch failed:', err);
      setIotStatus('Packet failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onSelectDemoLocation={handleSelectDemoLocation}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {networkError && (
          <div className="mb-4 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{networkError}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Home
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onUseMyLocation={handleUseMyLocation}
            envData={envData}
            terrainData={terrainData}
            predictionData={predictionData}
            isLoading={isLoading}
            isDemoMode={isDemoMode}
            demoControls={demoControls}
            onDemoControlsChange={handleDemoControlsChange}
            onSendIoTPacket={handleSendIoTPacket}
            iotStatus={iotStatus}
            onSearchQuery={handleSearchQuery}
            riskMapFeatures={riskMapFeatures}
            historicalEvents={historicalEvents}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'map' && (
          <MapPage
            features={riskMapFeatures}
            historicalEvents={historicalEvents}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            predictionData={predictionData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'prediction' && (
          <PredictionPage
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onUseMyLocation={handleUseMyLocation}
            envData={envData}
            terrainData={terrainData}
            predictionData={predictionData}
            isLoading={isLoading}
            isDemoMode={isDemoMode}
            demoControls={demoControls}
            onDemoControlsChange={handleDemoControlsChange}
            onSendIoTPacket={handleSendIoTPacket}
            iotStatus={iotStatus}
            onSearchQuery={handleSearchQuery}
            onRunPrediction={() => loadLocationData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPage
            predictionData={predictionData}
            selectedLocation={selectedLocation}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisPage events={historicalEvents} />
        )}

        {activeTab === 'methodology' && (
          <MethodologyPage modelInfo={modelInfo} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-500 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FloodGuard AI</span>
            <span>•</span>
            <span>SIH 26192 (Ministry of Home Affairs / NDRF)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Data Providers: Open-Meteo • IMD • India-WRIS • USGS DEM</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">v1.0.0-hackathon</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
