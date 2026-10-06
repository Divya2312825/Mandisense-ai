import React from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Truck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { WeatherInsights } from '../types';

interface WeatherInsightsCardProps {
  weather: WeatherInsights;
  cropName: string;
}

export const WeatherInsightsCard: React.FC<WeatherInsightsCardProps> = ({
  weather,
  cropName,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-emerald-100/90 shadow-sm shadow-emerald-950/5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-emerald-600" />
            <span>Agri-Weather & Transport Conditions ({weather.district})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time agro-meteorological indicators for safe crop hauling, open yard storage, and drying.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{weather.condition}</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <span>Temperature</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 font-mono">
            {weather.tempCurrent}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            High {weather.tempHigh}°C / Low {weather.tempLow}°C
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>Relative Humidity</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 font-mono">
            {weather.humidity}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Optimal for harvest storage
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CloudSun className="w-4 h-4 text-teal-500" />
            <span>3-Day Rain Risk</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 font-mono">
            {weather.rainProbabilityNext3Days.split(' ')[0]}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {weather.rainProbabilityNext3Days}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Road Access</span>
          </div>
          <div className="text-base font-extrabold text-emerald-700">
            Passable & Clear
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            State highway dry
          </div>
        </div>
      </div>

      {/* Advisory Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Crop Preservation & Hauling Advisory</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            {weather.cropPreservationAdvisory}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-1">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Recommended Selling Window</span>
          </div>
          <p className="text-teal-800 leading-relaxed">
            {weather.recommendedSellingWindow}
          </p>
        </div>
      </div>
    </div>
  );
};
