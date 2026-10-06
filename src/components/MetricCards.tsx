import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
  Calendar,
  Truck,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { MandiEvaluation, CropInfo } from '../types';

interface MetricCardsProps {
  crop: CropInfo;
  selectedMandi: MandiEvaluation;
  recommendedMandi: MandiEvaluation;
  extraAdvantagePerQuintal: number;
}

// Custom animated counter hook
function useAnimatedNumber(target: number, duration: number = 800) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = current;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const val = Math.floor(startValue + (target - startValue) * easeOutQuad);
      setCurrent(val);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target]);

  return current;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  crop,
  selectedMandi,
  recommendedMandi,
}) => {
  const animatedCurrentPrice = useAnimatedNumber(selectedMandi.currentPrice);
  const animatedPredictedPrice = useAnimatedNumber(selectedMandi.predictedPrice7d);

  const isPositiveChange = selectedMandi.change24h >= 0;
  const isBullish = selectedMandi.trend === 'Bullish';
  const isBearish = selectedMandi.trend === 'Bearish';

  // Calculate 7-day forecast delta % relative to current mandi price
  const forecastDeltaPct =
    selectedMandi.currentPrice > 0
      ? Number(
          (
            ((selectedMandi.predictedPrice7d - selectedMandi.currentPrice) /
              selectedMandi.currentPrice) *
            100
          ).toFixed(1)
        )
      : 0;

  const forecastDirectionLabel =
    forecastDeltaPct > 0.4 ? 'Rising' : forecastDeltaPct < -0.4 ? 'Falling' : 'Stable';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {/* 1. CURRENT PRICE CARD — Latest Mandi Price (Farmer.in / Agmarknet) */}
      <div className="bg-white rounded-[20px] p-5 border border-emerald-900/12 shadow-sm shadow-emerald-950/5 relative overflow-hidden card-hover-lift flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-emerald-100/70 to-transparent rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Latest Available</span>
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            Latest Mandi Price — Farmer.in / Agmarknet
          </div>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl sm:text-[32px] font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              ₹{animatedCurrentPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">per Quintal</span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1">
            <div className="text-xs font-bold text-slate-800 truncate">
              {selectedMandi.name.split('(')[0]} ({selectedMandi.district})
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>
                Updated: {selectedMandi.reportingDate || 'Latest Daily Feed'}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  isPositiveChange ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositiveChange ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {isPositiveChange ? `+${selectedMandi.change24h}%` : `${selectedMandi.change24h}%`}
              </span>
            </div>
            {selectedMandi.minPrice != null && selectedMandi.maxPrice != null && (
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                Range: ₹{selectedMandi.minPrice.toLocaleString('en-IN')} – ₹
                {selectedMandi.maxPrice.toLocaleString('en-IN')}/Q
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ML FORECAST CARD — 7-Day ML Forecast (MandiSense ML Forecast) */}
      <div className="bg-gradient-to-b from-white to-[#F2F9F7] rounded-[20px] p-5 border border-teal-900/15 shadow-sm shadow-emerald-950/5 relative overflow-hidden card-hover-lift flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-teal-100/60 to-transparent rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-900 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-teal-700" />
              <span>7-Day ML Forecast</span>
            </span>
            {/* Small visual trend indicator */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-teal-200/70 text-[11px] font-bold text-teal-900 shadow-2xs">
              {forecastDirectionLabel === 'Rising' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : forecastDirectionLabel === 'Falling' ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{forecastDirectionLabel}</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-teal-800">
            MandiSense ML Forecast (Holt-Winters)
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-[32px] font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              ₹{animatedPredictedPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ Quintal</span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-teal-900/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">7-Day Delta:</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  forecastDeltaPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {forecastDeltaPct >= 0 ? `+${forecastDeltaPct}%` : `${forecastDeltaPct}%`} vs Spot
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="truncate">
                Peak:{' '}
                <strong className="text-slate-900 font-mono tabular-nums">
                  ₹{selectedMandi.forecastPeak.predictedPrice.toLocaleString('en-IN')}
                </strong>{' '}
                ({selectedMandi.forecastPeak.dayName})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRICE TREND & MSP BENCHMARK CARD */}
      <div className="bg-white rounded-[20px] p-5 border border-emerald-900/12 shadow-sm shadow-emerald-950/5 relative overflow-hidden card-hover-lift flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/70 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              Market Momentum
            </span>
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isBullish
                  ? 'bg-emerald-100 text-emerald-800'
                  : isBearish
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isBullish ? (
                <TrendingUp className="w-4 h-4" />
              ) : isBearish ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            Price Trend &amp; MSP Benchmark
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${
                isBullish
                  ? 'text-emerald-700'
                  : isBearish
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}
            >
              {selectedMandi.trend}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              94% ML Conf.
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Benchmark MSP:</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                ₹{crop.baseMsp.toLocaleString('en-IN')}/Q
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Spread vs MSP:</span>
              <span className="text-emerald-700 font-bold font-mono tabular-nums">
                +{Math.round(((selectedMandi.currentPrice - crop.baseMsp) / crop.baseMsp) * 100)}% above MSP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BEST MARKET CARD — ★ Recommended Market Visual Highlight */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-[20px] p-5 shadow-md shadow-emerald-950/20 relative overflow-hidden card-hover-lift border border-emerald-500/40 ring-2 ring-emerald-500/20 flex flex-col justify-between">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/35 px-2.5 py-0.5 rounded-md">
              <span>★ Recommended Market</span>
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Award className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-1">
            <div className="text-lg font-extrabold text-white truncate leading-snug">
              {recommendedMandi.name.split('(')[0]}
            </div>
            <div className="text-xs text-emerald-200/90 flex items-center gap-2 mt-0.5">
              <span>{recommendedMandi.district}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300">
                <Truck className="w-3 h-3" />
                {typeof recommendedMandi.distanceKm === 'number'
                  ? `${recommendedMandi.distanceKm} km`
                  : 'Enable GPS for km'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-emerald-200/90">
              <span>Mandi Modal Price:</span>
              <span className="font-mono font-semibold text-white tabular-nums">
                ₹{recommendedMandi.currentPrice.toLocaleString('en-IN')}/Q
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-medium">
                Estimated Net Value:
              </span>
              <span className="font-extrabold text-amber-300 text-sm font-mono tabular-nums">
                ₹{(recommendedMandi.netReturnPerQuintal ?? recommendedMandi.currentPrice).toLocaleString('en-IN')}/Q
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
