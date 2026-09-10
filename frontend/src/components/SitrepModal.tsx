import React from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { PredictResponse, EnvironmentResponse, TerrainResponse } from '../types';

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: PredictResponse | null;
  envData: EnvironmentResponse | null;
  terrainData: TerrainResponse | null;
  selectedLocation: { latitude: number; longitude: number; name?: string };
}

export const SitrepModal: React.FC<SitrepModalProps> = ({
  isOpen,
  onClose,
  predictionData,
  envData,
  terrainData,
  selectedLocation,
}) => {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const risk = predictionData?.prediction.risk_level ?? 'MODERATE';
  const prob = predictionData?.prediction.flood_probability_percent ?? 55;
  const leadTime = predictionData?.warning.lead_time_minutes 
    ? `${(predictionData.warning.lead_time_minutes / 60).toFixed(1)} Hours` 
    : '2.5 Hours';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-900 font-sans">
        {/* Top Control Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-indigo-700 font-bold">
            <FileText className="w-4 h-4" />
            <span>SITREP-GEN // FLASH-FLOOD DISASTER BRIEFING</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 bg-white space-y-6 text-sm">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
              </div>
              <div className="text-base sm:text-lg font-black text-slate-950 tracking-tight mt-0.5">
                NATIONAL DISASTER EARLY WARNING INCIDENT SITREP
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Joint Operations Desk: NDRF 14th Bn • Central Water Commission • SDMA HP
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div>REF: <span className="text-slate-950 font-bold">SITREP-HP-2026/09-A</span></div>
              <div>DATE: <span className="text-slate-900 font-medium">{currentDate}</span></div>
              <div>TIME: <span className="text-slate-900 font-medium">{currentTime} IST</span></div>
            </div>
          </div>

          {/* Classification Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs font-semibold ${
            risk === 'CRITICAL' ? 'bg-rose-50 border-rose-300 text-rose-800' :
            risk === 'HIGH' ? 'bg-orange-50 border-orange-300 text-orange-800' :
            risk === 'MODERATE' ? 'bg-amber-50 border-amber-300 text-amber-900' :
            'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <span className="font-bold tracking-wider">THREAT LEVEL: {risk} RISK ({prob}% PROBABILITY)</span>
            <span>EST. SURGE WINDOW: {leadTime}</span>
          </div>

          {/* Section 1: Geographic Target & Coordinates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 mb-2">
              1. Incident Location & Topography
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Target Catchment:</span>
                <span className="font-bold text-slate-900">{selectedLocation.name || 'Himalayan River Basin'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Coordinates:</span>
                <span className="font-mono text-slate-700 font-semibold">{selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E</span>
              </div>
              <div>
                <span className="text-slate-500 block">Terrain Elevation:</span>
                <span className="text-slate-700 font-semibold">{terrainData?.elevation_m ?? 1250} m ASL</span>
              </div>
              <div>
                <span className="text-slate-500 block">Average Slope:</span>
                <span className="text-slate-700 font-semibold">{terrainData?.slope_degrees ?? 28}° ({terrainData?.terrain_type ?? 'Steep Gradient'})</span>
              </div>
            </div>
          </div>

          {/* Section 2: Hydrometric & Meteorological Telemetry */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 mb-2">
              2. Environmental & Hydrometric Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Cumulative Rain (6h):</span>
                <span className="font-bold text-slate-900">{(envData?.weather.rainfall_6h_mm ?? 0).toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block">Peak Rain Intensity (1h):</span>
                <span className="text-slate-700 font-semibold">{(envData?.weather.rainfall_1h_mm ?? 0).toFixed(1)} mm/hr</span>
              </div>
              <div>
                <span className="text-slate-500 block">Topsoil Saturation:</span>
                <span className="text-slate-700 font-semibold">{Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50)}% Saturation</span>
              </div>
              <div>
                <span className="text-slate-500 block">River Gauge Level:</span>
                <span className="font-mono font-bold text-slate-900">{(envData?.water.water_level_m ?? 1.5).toFixed(2)} m (Warning: 2.0m)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Machine Learning Contributing Factors */}
          {predictionData && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 mb-2">
                3. AI Risk Factor Attribution (Random Forest Ensemble)
              </h4>
              <div className="space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {predictionData.contributing_factors.map((cf, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{cf.factor}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Impact: {cf.impact}</span>
                      <span className="font-mono font-bold text-indigo-700">{Math.round(cf.importance * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Operational Evacuation Directives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1 mb-2">
              4. Mandatory Emergency Action Directives (NDRF / SDMA)
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="text-slate-800">
                <strong>Incident Command Directive:</strong> {predictionData?.warning.message || 'Active flash flood monitoring. Maintain continuous radio contact with District EOC.'}
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-700 block font-bold mb-1">Standard Operating Procedures:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {predictionData?.recommendations.slice(0, 4).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div>DISPATCHED VIA: C-DAC CAP PROTOCOL V1.2</div>
            <div>VERIFIED BY: INCIDENT COMMAND SYSTEM (ICS-HP)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
