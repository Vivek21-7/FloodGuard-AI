import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { SitrepModal } from './components/SitrepModal';
import { AlertDispatcherModal } from './components/AlertDispatcherModal';
import { CitizenReportModal } from './components/CitizenReportModal';
import { UserProfileModal } from './components/UserProfileModal';
import { VoiceAssistant } from './components/VoiceAssistant';

// Tabs
import { LiveMapTab } from './pages/LiveMapTab';
import { FloodAlertsTab } from './pages/FloodAlertsTab';
import { AnalyticsTab } from './pages/AnalyticsTab';
import { SettingsTab } from './pages/SettingsTab';

import { api } from './services/api';
import { getCurrentPosition } from './services/geolocation';
import { storage } from './services/storage';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  RiskMapFeature, 
  HistoricalEventItem, 
  ModelInfoResponse, 
  DemoControlsState,
  LocationResult
} from './types';
import { AlertTriangle } from 'lucide-react';

const DEMO_PRESET_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  'Pan-India': { lat: 22.9734, lon: 78.6569, name: 'Pan-India (National Live Overview)' },
  Wayanad: { lat: 11.5510, lon: 76.1260, name: 'Wayanad (Chooralmala), Kerala' },
  Assam: { lat: 26.1445, lon: 91.7362, name: 'Guwahati (Brahmaputra Basin), Assam' },
  Chiplun: { lat: 17.5323, lon: 73.5186, name: 'Chiplun (Vashishti Basin), Maharashtra' },
  Patna: { lat: 25.6093, lon: 85.1235, name: 'Patna (Ganga Basin), Bihar' },
  Delhi: { lat: 28.7041, lon: 77.1025, name: 'Delhi NCR (Yamuna Floodplain)' },
  Kullu: { lat: 31.9579, lon: 77.1095, name: 'Kullu (Upper Beas), Himachal Pradesh' },
  Mandi: { lat: 31.7087, lon: 76.9320, name: 'Mandi (Suketi Gorge), Himachal Pradesh' },
  Kedarnath: { lat: 30.7346, lon: 79.0669, name: 'Kedarnath (Mandakini Valley), Uttarakhand' },
  Dhemaji: { lat: 27.4833, lon: 94.5833, name: 'Dhemaji (Subansiri Floodway), Assam' },
  Cherrapunji: { lat: 25.2702, lon: 91.7323, name: 'Cherrapunji (Sohra), Meghalaya' },
  Srinagar: { lat: 34.0837, lon: 74.7973, name: 'Srinagar (Jhelum Basin), J&K' },
  Munnar: { lat: 10.0889, lon: 77.0595, name: 'Munnar (Periyar Catchment), Kerala' },
};

export const App: React.FC = () => {
  // Navigation: Default tab is 'map' as specified in requirements
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => storage.getSettings().isDemoMode);
  const [demoControls, setDemoControls] = useState<DemoControlsState>(() => storage.getDemoControls());

  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name?: string }>({
    latitude: 22.9734,
    longitude: 78.6569,
    name: 'Pan-India (National Live Overview)',
  });

  const [envData, setEnvData] = useState<EnvironmentResponse | null>(null);
  const [terrainData, setTerrainData] = useState<TerrainResponse | null>(null);
  const [predictionData, setPredictionData] = useState<PredictResponse | null>(null);
  const [riskMapFeatures, setRiskMapFeatures] = useState<RiskMapFeature[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEventItem[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  // Modals
  const [isSitrepOpen, setIsSitrepOpen] = useState<boolean>(false);
  const [isDispatcherOpen, setIsDispatcherOpen] = useState<boolean>(false);
  const [isCitizenReportOpen, setIsCitizenReportOpen] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);

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
      setNetworkError('Backend API syncing... displaying live physical baseline.');
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
      if (presetName === 'Wayanad') {
        setDemoControls({ rainfall: 220, soilMoisture: 94, waterLevel: 4.8, temperature: 22 });
      } else if (presetName === 'Kullu') {
        setDemoControls({ rainfall: 125, soilMoisture: 72, waterLevel: 2.8, temperature: 24 });
      } else if (presetName === 'Kedarnath') {
        setDemoControls({ rainfall: 195, soilMoisture: 91, waterLevel: 4.5, temperature: 14 });
      } else if (presetName === 'Cherrapunji') {
        setDemoControls({ rainfall: 260, soilMoisture: 96, waterLevel: 5.2, temperature: 21 });
      } else if (presetName === 'Chiplun') {
        setDemoControls({ rainfall: 210, soilMoisture: 92, waterLevel: 4.6, temperature: 27 });
      } else if (presetName === 'Dhemaji') {
        setDemoControls({ rainfall: 175, soilMoisture: 89, waterLevel: 3.8, temperature: 28 });
      } else if (presetName === 'Mandi') {
        setDemoControls({ rainfall: 182, soilMoisture: 89, waterLevel: 4.1, temperature: 26 });
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/50 to-blue-50/70 text-slate-900 font-sans selection:bg-[#2563eb] selection:text-white">
      {/* 1. Left Sidebar Panel (250px fixed width, collapsible on tablet/mobile) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeAlertCount={3}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenProfile={() => setIsUserProfileOpen(true)}
      />

      {/* 2. Main Content Area (Remaining space) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        {/* Header Bar: Location selector, Refresh button, Date/Time */}
        <HeaderBar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          selectedLocation={selectedLocation}
          onSelectPreset={handleSelectDemoLocation}
          onRefresh={() => loadLocationData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)}
          isRefreshing={isLoading}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
          onOpenSitrep={() => setIsSitrepOpen(true)}
          onUseMyLocation={handleUseMyLocation}
        />

        {/* Dynamic Content Container (switches based on sidebar selection with 300ms transition) */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f4f7fb] via-[#eef3f9] to-[#f7f9fc] tab-content-active transition-all duration-300">
          {networkError && (
            <div className="m-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{networkError}</span>
            </div>
          )}

          {/* TAB 1: Live Map (Default / Full-screen interactive Leaflet map) */}
          {activeTab === 'map' && (
            <LiveMapTab
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              predictionData={predictionData}
              isLoading={isLoading}
              onSearchQuery={handleSearchQuery}
              onOpenAlertDispatcher={() => setIsDispatcherOpen(true)}
            />
          )}

          {/* TAB 2: Flood Alerts */}
          {activeTab === 'alerts' && (
            <FloodAlertsTab
              predictionData={predictionData}
              selectedLocation={selectedLocation}
              onNavigateToMap={() => setActiveTab('map')}
              onOpenDispatcher={() => setIsDispatcherOpen(true)}
              onSelectCityLocation={(lat, lon, name) => {
                handleSelectLocation(lat, lon, name);
                setActiveTab('map');
              }}
            />
          )}

          {/* TAB 3: Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              predictionData={predictionData}
              modelInfo={modelInfo}
              historicalEvents={historicalEvents}
            />
          )}

          {/* TAB 4: Settings */}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </main>
      </div>

      {/* 3. Operational Modals */}
      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        predictionData={predictionData}
        envData={envData}
        terrainData={terrainData}
        selectedLocation={selectedLocation}
      />

      <AlertDispatcherModal
        isOpen={isDispatcherOpen}
        onClose={() => setIsDispatcherOpen(false)}
        predictionData={predictionData}
        selectedLocation={selectedLocation}
      />

      <CitizenReportModal
        isOpen={isCitizenReportOpen}
        onClose={() => setIsCitizenReportOpen(false)}
        defaultLocation={selectedLocation.name}
        defaultCoordinates={selectedLocation}
      />

      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        onNavigateToSettings={() => {
          setIsUserProfileOpen(false);
          setActiveTab('settings');
        }}
        onOpenSitrep={() => {
          setIsUserProfileOpen(false);
          setIsSitrepOpen(true);
        }}
      />

      {/* FloodGuard AI Voice Assistant Floating Button & Chat Panel */}
      <VoiceAssistant
        onSelectLocation={handleSelectLocation}
        predictionData={predictionData}
        isLoading={isLoading}
        selectedLocationName={selectedLocation.name}
      />
    </div>
  );
};

export default App;
