import React from 'react';
import { HistoricalAnalysis } from '../components/HistoricalAnalysis';
import { HistoricalEventItem } from '../types';

interface AnalysisPageProps {
  events: HistoricalEventItem[];
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ events }) => {
  return (
    <div className="py-6">
      <HistoricalAnalysis events={events} />
    </div>
  );
};
