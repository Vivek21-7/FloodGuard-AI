import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SitrepModal } from './components/SitrepModal';
import { CitizenReportModal } from './components/CitizenReportModal';
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
  Wayanad: { lat: 11.5510, lon: 76.1260, name: 'Wayanad (Chooralmala), Kerala' },
  Kullu: { lat: 31.9579, lon: 77.1095, name: 'Kullu, Himachal Pradesh' },
  Kedarnath: { lat: 30.7346, lon: 79.0669, name: 'Kedarnath, Uttarakhand' },
  Cherrapunji: { lat: 25.2702, lon: 91.7323, name: 'Cherrapunji (Sohra), Meghalaya' },
  Chungthang: { lat: 27.6039, lon: 88.6464, name: 'Chungthang, Sikkim' },
  Chiplun: { lat: 17.5323, lon: 73.5186, name: 'Chiplun, Maharashtra' },
  Dhemaji: { lat: 27.4833, lon: 94.5833, name: 'Dhemaji, Assam' },
  Mandi: { lat: 31.7087, lon: 76.9320, name: 'Mandi, Himachal Pradesh' },
  Shimla: { lat: 31.1048, lon: 77.1734, name: 'Shimla, Himachal Pradesh' },
  Srinagar: { lat: 34.0837, lon: 74.7973, name: 'Srinagar, Jammu & Kashmir' },
  Munnar: { lat: 10.0889, lon: 77.0595, name: 'Munnar, Kerala' },
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
  const [isSitrepOpen, setIsSitrepOpen] = useState<boolean>(false);
  const [isCitizenReportOpen, setIsCitizenReportOpen] = useState<boolean>(false);

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
      if (presetName === 'Wayanad') {
        setDemoControls({ rainfall: 220, soilMoisture: 94, waterLevel: 4.8, temperature: 22 });
      } else if (presetName === 'Kullu') {
        setDemoControls({ rainfall: 125, soilMoisture: 72, waterLevel: 2.8, temperature: 24 });
      } else if (presetName === 'Kedarnath') {
        setDemoControls({ rainfall: 195, soilMoisture: 91, waterLevel: 4.5, temperature: 14 });
      } else if (presetName === 'Cherrapunji') {
        setDemoControls({ rainfall: 260, soilMoisture: 96, waterLevel: 5.2, temperature: 21 });
      } else if (presetName === 'Chungthang') {
        setDemoControls({ rainfall: 140, soilMoisture: 88, waterLevel: 3.9, temperature: 16 });
      } else if (presetName === 'Chiplun') {
        setDemoControls({ rainfall: 210, soilMoisture: 92, waterLevel: 4.6, temperature: 27 });
      } else if (presetName === 'Dhemaji') {
        setDemoControls({ rainfall: 175, soilMoisture: 89, waterLevel: 3.8, temperature: 28 });
      } else if (presetName === 'Mandi') {
        setDemoControls({ rainfall: 182, soilMoisture: 89, waterLevel: 4.1, temperature: 26 });
      } else if (presetName === 'Shimla') {
        setDemoControls({ rainfall: 54, soilMoisture: 58, waterLevel: 1.4, temperature: 19 });
      } else if (presetName === 'Srinagar') {
        setDemoControls({ rainfall: 65, soilMoisture: 62, waterLevel: 1.8, temperature: 17 });
      } else if (presetName === 'Munnar') {
        setDemoControls({ rainfall: 155, soilMoisture: 85, waterLevel: 3.2, temperature: 20 });
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onSelectDemoLocation={handleSelectDemoLocation}
        onOpenSitrep={() => setIsSitrepOpen(true)}
        onOpenCitizenReport={() => setIsCitizenReportOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {networkError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
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
            onOpenSitrep={() => setIsSitrepOpen(true)}
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
      <footer className="border-t border-slate-200/80 bg-white/90 py-6 text-xs text-slate-500 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FloodGuard AI</span>
            <span>•</span>
            <span>SIH 26192 (Ministry of Home Affairs / NDRF)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Data Providers: Open-Meteo • IMD • India-WRIS • USGS DEM</span>
            <span>•</span>
            <span className="text-indigo-600 font-mono font-medium">v1.0.0-hackathon</span>
          </div>
        </div>
      </footer>
      {/* Official NDRF SITREP Modal */}
      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        predictionData={predictionData}
        envData={envData}
        terrainData={terrainData}
        selectedLocation={selectedLocation}
      />

      {/* Citizen & Observer Ground Intel Modal (7C: Community) */}
      <CitizenReportModal
        isOpen={isCitizenReportOpen}
        onClose={() => setIsCitizenReportOpen(false)}
        defaultLocation={selectedLocation.name}
        defaultCoordinates={selectedLocation}
      />
    </div>
  );
};

export default App;
