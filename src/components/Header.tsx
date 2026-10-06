import React from 'react';
import {
  MapPin,
  Navigation,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  Home,
} from 'lucide-react';
import { UserLocationState } from '../types';

interface HeaderProps {
  userLocation: UserLocationState;
  isLocating: boolean;
  onUseMyLocation: () => void;
  onUseSampleLocation: () => void;
  locationError: string | null;
  onOpenAiAssistant: () => void;
  onRefreshData: () => void;
  onGoToLanding?: () => void;
  dataAvailable?: boolean;
  sourceLabel?: string;
  commodityUpdatedDate?: string | null;
  apiUpdatedDate?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  userLocation,
  isLocating,
  onUseMyLocation,
  locationError,
  onOpenAiAssistant,
  onGoToLanding,
  dataAvailable = true,
  sourceLabel = 'Source: Farmer.in / Agmarknet',
  commodityUpdatedDate,
  apiUpdatedDate,
}) => {
  const hasCoordinates =
    userLocation.isCustomUserLocation &&
    typeof userLocation.lat === 'number' &&
    typeof userLocation.lng === 'number';

  return (
    <header className="bg-white border-b border-emerald-100 shadow-xs px-4 lg:px-8 py-4 transition-all">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Title & Tagline */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Crop Price Prediction & Best-Market Advisor
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ML Price Optimizer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Empowering farmers with predictive market prices, distance-based net profit optimization, and AI advisory.
          </p>
        </div>

        {/* Location & AI Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors cursor-pointer"
              title="Return to MandiSense AI Landing Page"
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span>Landing Page</span>
            </button>
          )}

          {/* Prominent "Use My Location" Button */}
          <button
            onClick={onUseMyLocation}
            disabled={isLocating}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              hasCoordinates
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/40 active:scale-95'
            } disabled:opacity-75`}
            title="Click to request browser location permission and calculate road distances to mandis"
          >
            {isLocating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>{isLocating ? 'Detecting Location...' : '📍 Use My Location'}</span>
          </button>

          {/* Location Status Pill - Strictly adheres to Requirement 5 */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
            <MapPin
              className={`w-4 h-4 flex-shrink-0 ${
                hasCoordinates ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <div className="flex flex-col text-left">
              {hasCoordinates ? (
                <>
                  <span className="font-bold text-emerald-800 leading-tight">
                    GPS Coordinates Detected
                  </span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {userLocation.lat!.toFixed(4)}° N, {userLocation.lng!.toFixed(4)}° E
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold text-slate-700 leading-tight">
                    {locationError ? 'Location unavailable' : 'Location unavailable in preview'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {locationError || 'Click "📍 Use My Location" to detect GPS'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ask MandiSense AI Trigger Button */}
          <button
            onClick={onOpenAiAssistant}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Ask MandiSense AI</span>
          </button>
        </div>
      </div>

      {/* Geolocation Feedback Alert if location is unavailable */}
      {locationError && (
        <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>{locationError}</strong> The dashboard remains fully functional for crop prices and ML predictions.
            </span>
          </div>
          <button
            onClick={onUseMyLocation}
            className="font-bold text-emerald-800 hover:underline text-xs flex-shrink-0 ml-3"
          >
            Retry Location
          </button>
        </div>
      )}

      {/* Official Source & Update Date Notice */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        {dataAvailable ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span className="font-semibold text-emerald-900">{sourceLabel}</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-700">
              Latest Mandi Price — Farmer.in / Agmarknet
            </span>
            {commodityUpdatedDate && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-mono">
                  Updated: {commodityUpdatedDate}
                  {apiUpdatedDate && apiUpdatedDate !== commodityUpdatedDate
                    ? ` (API Date: ${apiUpdatedDate})`
                    : ''}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
            <span>Mandi data temporarily unavailable</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
          <Info className="w-3 h-3 text-teal-600" />
          <span>Forecast: MandiSense ML Forecast</span>
        </div>
      </div>
    </header>
  );
};
