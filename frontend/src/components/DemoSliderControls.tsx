import React from 'react';
import { 
  Sliders, 
  CloudRain, 
  Droplets, 
  Activity, 
  Thermometer, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  CheckCircle 
} from 'lucide-react';
import { DemoControlsState } from '../types';

interface DemoSliderControlsProps {
  controls: DemoControlsState;
  onChange: (updated: Partial<DemoControlsState>) => void;
  onSendIoTPacket: () => void;
  iotStatus: string | null;
}

export const DemoSliderControls: React.FC<DemoSliderControlsProps> = ({
  controls,
  onChange,
  onSendIoTPacket,
  iotStatus,
}) => {
  // Preset scenario handlers
  const setPreset = (scenario: 'normal' | 'monsoon' | 'cloudburst' | 'catastrophic') => {
    switch (scenario) {
      case 'normal':
        onChange({ rainfall: 10, soilMoisture: 35, waterLevel: 0.9, temperature: 22 });
        break;
      case 'monsoon':
        onChange({ rainfall: 55, soilMoisture: 60, waterLevel: 1.8, temperature: 20 });
        break;
      case 'cloudburst':
        onChange({ rainfall: 130, soilMoisture: 80, waterLevel: 3.2, temperature: 24 });
        break;
      case 'catastrophic':
        onChange({ rainfall: 195, soilMoisture: 95, waterLevel: 4.8, temperature: 25 });
        break;
    }
  };

  return (
    <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Interactive IoT Simulator & Demo Sandbox
              </h3>
              <span className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Demo Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate sensor inputs and watch risk probability recalculate dynamically in real-time
            </p>
          </div>
        </div>

        {/* Preset Scenarios Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 hidden sm:inline">Presets:</span>
          <button
            onClick={() => setPreset('normal')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Normal Day
          </button>
          <button
            onClick={() => setPreset('monsoon')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/50 text-amber-300 transition-colors"
          >
            Monsoon Runoff
          </button>
          <button
            onClick={() => setPreset('cloudburst')}
            className="px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-800/50 hover:bg-orange-900/50 text-orange-300 transition-colors"
          >
            Cloudburst
          </button>
          <button
            onClick={() => setPreset('catastrophic')}
            className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/50 hover:bg-red-900/50 text-red-300 font-bold transition-colors"
          >
            Catastrophic Surge
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Rainfall Slider */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Precipitation (6h)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{controls.rainfall} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="1"
            value={controls.rainfall}
            onChange={(e) => onChange({ rainfall: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 mm</span>
            <span>100 mm</span>
            <span>200 mm</span>
          </div>
        </div>

        {/* Soil Moisture Slider */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Droplets className="w-4 h-4 text-blue-400" />
              Soil Saturation
            </span>
            <span className="font-mono text-blue-400 font-bold">{controls.soilMoisture} %</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={controls.soilMoisture}
            onChange={(e) => onChange({ soilMoisture: parseFloat(e.target.value) })}
            className="w-full accent-blue-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0% (Dry)</span>
            <span>50%</span>
            <span>100% (Saturated)</span>
          </div>
        </div>

        {/* Water Level Slider */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Activity className="w-4 h-4 text-emerald-400" />
              River Stage Level
            </span>
            <span className="font-mono text-emerald-400 font-bold">{controls.waterLevel.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={controls.waterLevel}
            onChange={(e) => onChange({ waterLevel: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0.0 m</span>
            <span>5.0 m</span>
            <span>10.0 m (Spill)</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Thermometer className="w-4 h-4 text-rose-400" />
              Air Temperature
            </span>
            <span className="font-mono text-rose-400 font-bold">{controls.temperature} °C</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={controls.temperature}
            onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })}
            className="w-full accent-rose-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 °C</span>
            <span>20 °C</span>
            <span>40 °C</span>
          </div>
        </div>
      </div>

      {/* IoT Stream Ingestion Trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onSendIoTPacket}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            Dispatch Live IoT Ingestion Packet (POST /api/sensor-data)
          </button>
          {iotStatus && (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              {iotStatus}
            </span>
          )}
        </div>
        <span className="text-slate-500 text-[11px]">
          Simulated multi-sensor telemetry broadcast for hackathon jury evaluation
        </span>
      </div>
    </div>
  );
};
