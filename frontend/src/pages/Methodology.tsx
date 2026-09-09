import React from 'react';
import { About } from '../components/About';
import { ModelInfoResponse } from '../types';

interface MethodologyPageProps {
  modelInfo: ModelInfoResponse | null;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ modelInfo }) => {
  return (
    <div className="py-6">
      <About modelInfo={modelInfo} />
    </div>
  );
};
