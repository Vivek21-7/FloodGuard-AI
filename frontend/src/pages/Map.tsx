import React from 'react';
import { RiskMap } from '../components/RiskMap';
import { RiskMapFeature, HistoricalEventItem, PredictResponse } from '../types';
import { PredictionCard } from '../components/PredictionCard';
import { AlertPanel } from '../components/AlertPanel';

interface MapPageProps {
  features: RiskMapFeature[];
  historicalEvents: HistoricalEventItem[];
  selectedLocation: { latitude: number; longitude: number; name?: string };
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
  predictionData: PredictResponse | null;
  isLoading: boolean;
}

export const MapPage: React.FC<MapPageProps> = ({
  features,
  historicalEvents,
  selectedLocation,
  onSelectLocation,
  predictionData,
  isLoading,
}) => {
  return (
    <div className="py-6 space-y-6">
      {/* Interactive Map Component */}
      <RiskMap
        features={features}
        historicalEvents={historicalEvents}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
      />

      {/* Instant Prediction details for clicked point */}
      {predictionData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <PredictionCard
              predictionData={predictionData}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-6">
            <AlertPanel
              warning={predictionData.warning}
              recommendations={predictionData.recommendations}
              locationName={selectedLocation.name || 'Selected Map Coordinate'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
