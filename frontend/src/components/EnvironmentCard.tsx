import React from 'react';
import { 
  CloudRain, 
  Droplets, 
  Activity, 
  Thermometer, 
  Wind, 
  Mountain, 
  TrendingUp, 
  Compass, 
  Clock, 
  Database 
} from 'lucide-react';
import { EnvironmentResponse, TerrainResponse } from '../types';

interface EnvironmentCardProps {
  envData: EnvironmentResponse | null;
  terrainData: TerrainResponse | null;
  isLoading: boolean;
}

export const EnvironmentCard: React.FC<EnvironmentCardProps> = ({
  envData,
  terrainData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!envData) return null;

  const { weather, soil, water } = envData;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-wide">
              Multi-Source Environmental Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Aggregated from meteorological radars, ECMWF soil models, terrain DEM & hydrological gauges
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Live Sync: {weather?.updated_at ? new Date(weather.updated_at).toLocaleTimeString() : 'Recent'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Rainfall 6h */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-sky-50/50 hover:border-sky-200">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Rainfall (6h Acc.)</span>
            <CloudRain className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {weather?.rainfall_6h_mm ?? 0} <span className="text-xs font-medium text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-medium">
            <span>1h: {weather?.rainfall_1h_mm ?? 0} mm</span>
            <span className="text-indigo-600 font-bold">Fcst: +{weather?.forecast_rainfall_next_3h ?? 0} mm</span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-blue-50/50 hover:border-blue-200">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Soil Moisture</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {soil?.soil_moisture_0_10cm_percent ?? 50} <span className="text-xs font-medium text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-medium">
            <span>0-10cm: {soil?.soil_moisture_0_10cm_percent ?? 0}%</span>
            <span>10-35cm: {soil?.soil_moisture_10_35cm_percent ?? 0}%</span>
          </div>
        </div>

        {/* River Stage / Water Level */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-emerald-50/50 hover:border-emerald-200">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>River Water Level</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {water?.water_level_m ?? 1.5} <span className="text-xs font-medium text-slate-500">m</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-medium">
            <span>Discharge: {water?.discharge_m3_s ?? 200} m³/s</span>
            <span className="text-emerald-700 font-bold">CWC/WRIS</span>
          </div>
        </div>

        {/* Slope & Elevation */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-amber-50/50 hover:border-amber-200">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Slope & Altitude</span>
            <Mountain className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {terrainData?.slope_degrees ?? 25}° <span className="text-xs font-medium text-slate-500">slope</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-medium">
            <span>Alt: {terrainData?.elevation_m ?? 1200} m</span>
            <span className="text-amber-700 font-bold capitalize">{terrainData?.drainage_pattern || 'Convergent'}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Temperature</span>
            <Thermometer className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {weather?.temperature_c ?? 22}°C
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Ambient air temp</div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {weather?.humidity_percent ?? 70}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Saturation vapor pressure</div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {weather?.wind_speed_kmh ?? 12} <span className="text-xs font-medium text-slate-500">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Valley air movement</div>
        </div>

        {/* Terrain Topology Type */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1 font-semibold">
            <span>Terrain Classification</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {terrainData?.terrain_type ? terrainData.terrain_type.replace(/_/g, ' ') : 'Steep Hillside'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Morphological DEM</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 font-medium">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          Providers: {weather?.source || 'Open-Meteo'} • {soil?.source || 'ECMWF'} • {water?.source || 'India-WRIS'}
        </span>
        <span className="text-slate-400">
          Indian Catchment Monitoring Grid (0.01° Resolution)
        </span>
      </div>
    </div>
  );
};
