import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { 
  EnvironmentResponse, 
  TerrainResponse, 
  PredictResponse, 
  DemoControlsState, 
  LocationResult,
  RiskMapFeature,
  HistoricalEventItem
} from '../types';

interface HomeProps {
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

export const Home: React.FC<HomeProps> = (props) => {
  return (
    <div className="py-6">
      <Dashboard {...props} />
    </div>
  );
};
