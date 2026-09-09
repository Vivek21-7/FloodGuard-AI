import React from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8 text-slate-200 font-sans">
        {/* Top Control Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>SITREP-GEN // FLASH-FLOOD DISASTER BRIEFING</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 bg-slate-900 space-y-6 text-sm">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-700 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
              </div>
              <div className="text-base font-black text-white tracking-tight mt-0.5">
                NATIONAL DISASTER EARLY WARNING INCIDENT SITREP
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Joint Operations Desk: NDRF 14th Bn • Central Water Commission • SDMA HP
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>REF: <span className="text-white font-bold">SITREP-HP-2026/09-A</span></div>
              <div>DATE: <span className="text-white">{currentDate}</span></div>
              <div>TIME: <span className="text-white">{currentTime} IST</span></div>
            </div>
          </div>

          {/* Classification Banner */}
          <div className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
            risk === 'CRITICAL' ? 'bg-red-950/40 border-red-500/60 text-red-300' :
            risk === 'HIGH' ? 'bg-orange-950/40 border-orange-500/60 text-orange-300' :
            risk === 'MODERATE' ? 'bg-amber-950/40 border-amber-500/60 text-amber-300' :
            'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
          }`}>
            <span className="font-bold tracking-wider">THREAT LEVEL: {risk} RISK ({prob}% PROBABILITY)</span>
            <span>EST. SURGE WINDOW: {leadTime}</span>
          </div>

          {/* Section 1: Geographic Target & Coordinates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1 mb-2">
              1. Incident Location & Topography
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Target Catchment:</span>
                <span className="font-semibold text-white">{selectedLocation.name || 'Himalayan River Basin'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Coordinates:</span>
                <span className="font-mono text-slate-300">{selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E</span>
              </div>
              <div>
                <span className="text-slate-500 block">Terrain Elevation:</span>
                <span className="text-slate-300">{terrainData?.elevation_m ?? 1250} m ASL</span>
              </div>
              <div>
                <span className="text-slate-500 block">Average Slope:</span>
                <span className="text-slate-300">{terrainData?.slope_degrees ?? 28}° ({terrainData?.terrain_type ?? 'Steep Gradient'})</span>
              </div>
            </div>
          </div>

          {/* Section 2: Hydrometric & Meteorological Telemetry */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1 mb-2">
              2. Environmental & Hydrometric Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Cumulative Rain (6h):</span>
                <span className="font-bold text-white">{(envData?.weather.rainfall_6h_mm ?? 0).toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block">Peak Rain Intensity (1h):</span>
                <span className="text-slate-300">{(envData?.weather.rainfall_1h_mm ?? 0).toFixed(1)} mm/hr</span>
              </div>
              <div>
                <span className="text-slate-500 block">Topsoil Saturation:</span>
                <span className="text-slate-300">{Math.round(envData?.soil.soil_moisture_0_10cm_percent ?? 50)}% Saturation</span>
              </div>
              <div>
                <span className="text-slate-500 block">River Gauge Level:</span>
                <span className="font-mono text-white">{(envData?.water.water_level_m ?? 1.5).toFixed(2)} m (Warning: 2.0m)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Machine Learning Contributing Factors */}
          {predictionData && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1 mb-2">
                3. AI Risk Factor Attribution (Random Forest Ensemble)
              </h4>
              <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {predictionData.contributing_factors.map((cf, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cf.factor}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Impact: {cf.impact}</span>
                      <span className="font-mono font-bold text-cyan-300">{Math.round(cf.importance * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Operational Evacuation Directives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1 mb-2">
              4. Mandatory Emergency Action Directives (NDRF / SDMA)
            </h4>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300">
                <strong>Incident Command Directive:</strong> {predictionData?.warning.message || 'Active flash flood monitoring. Maintain continuous radio contact with District EOC.'}
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-semibold mb-1">Standard Operating Procedures:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {predictionData?.recommendations.slice(0, 4).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div>DISPATCHED VIA: C-DAC CAP PROTOCOL V1.2</div>
            <div>VERIFIED BY: INCIDENT COMMAND SYSTEM (ICS-HP)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
