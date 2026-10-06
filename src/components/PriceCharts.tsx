import React, { useState } from 'react';
import {
  TrendingUp,
  LineChart as LineChartIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Award,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { HistoryPoint, ForecastPoint, MandiEvaluation, CropInfo } from '../types';

interface PriceChartsProps {
  crop: CropInfo;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  nearbyMandis: MandiEvaluation[];
  recommendedMandiId: string;
}

export const PriceCharts: React.FC<PriceChartsProps> = ({
  crop,
  history,
  forecast,
  nearbyMandis,
  recommendedMandiId,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'historical' | 'forecast' | 'comparison'>('historical');
  const [hoveredHistoricalIndex, setHoveredHistoricalIndex] = useState<number | null>(null);
  const [hoveredForecastIndex, setHoveredForecastIndex] = useState<number | null>(null);

  // Historical Chart Calculations
  const histPrices = history.map((h) => h.price);
  const minHistPrice = Math.min(...histPrices, crop.baseMsp);
  const maxHistPrice = Math.max(...histPrices);
  const paddingPrice = (maxHistPrice - minHistPrice) * 0.15 || 500;
  const yMinHist = Math.max(0, Math.floor((minHistPrice - paddingPrice) / 100) * 100);
  const yMaxHist = Math.ceil((maxHistPrice + paddingPrice) / 100) * 100;
  const yRangeHist = yMaxHist - yMinHist || 1;

  const svgWidth = 800;
  const svgHeight = 280;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // Convert historical points to SVG coordinates
  const histPoints = history.map((pt, i) => {
    const x = margin.left + (i / (history.length - 1)) * innerWidth;
    const y = margin.top + innerHeight - ((pt.price - yMinHist) / yRangeHist) * innerHeight;
    return { ...pt, x, y };
  });

  const histPathD = histPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const histAreaD = `${histPathD} L ${histPoints[histPoints.length - 1].x} ${margin.top + innerHeight} L ${histPoints[0].x} ${margin.top + innerHeight} Z`;

  // MSP Line Y coordinate
  const mspY = margin.top + innerHeight - ((crop.baseMsp - yMinHist) / yRangeHist) * innerHeight;

  // Forecast Chart Calculations
  const forecastPrices = forecast.map((f) => f.predictedPrice);
  const allForecastValues = forecast.flatMap((f) => [f.lowerBound, f.upperBound, f.predictedPrice]);
  const minForecast = Math.min(...allForecastValues);
  const maxForecast = Math.max(...allForecastValues);
  const padF = (maxForecast - minForecast) * 0.2 || 400;
  const yMinF = Math.max(0, Math.floor((minForecast - padF) / 100) * 100);
  const yMaxF = Math.ceil((maxForecast + padF) / 100) * 100;
  const yRangeF = yMaxF - yMinF || 1;

  const forecastPoints = forecast.map((pt, i) => {
    const x = margin.left + (i / (forecast.length - 1)) * innerWidth;
    const y = margin.top + innerHeight - ((pt.predictedPrice - yMinF) / yRangeF) * innerHeight;
    const yLower = margin.top + innerHeight - ((pt.lowerBound - yMinF) / yRangeF) * innerHeight;
    const yUpper = margin.top + innerHeight - ((pt.upperBound - yMinF) / yRangeF) * innerHeight;
    return { ...pt, x, y, yLower, yUpper };
  });

  const forecastPathD = forecastPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Confidence band polygon (upper boundary then lower boundary reversed)
  const upperPath = forecastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yUpper}`).join(' ');
  const lowerPath = [...forecastPoints].reverse().map((p) => `L ${p.x} ${p.yLower}`).join(' ');
  const confidenceBandD = `${upperPath} ${lowerPath} Z`;

  // Comparison Bar Chart (Top 6 mandis)
  const mandisToCompare = nearbyMandis.slice(0, 6);
  const maxNetPrice = Math.max(...mandisToCompare.map((m) => m.currentPrice));

  return (
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-emerald-900/12 shadow-sm shadow-emerald-950/5 mb-6">
      {/* Chart Header & Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <LineChartIcon className="w-4 h-4" />
            </span>
            <span>Market Price Analytics &amp; ML Forecasting</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Latest Mandi Price — Farmer.in / Agmarknet, MandiSense ML Forecast (7-day projection), and regional mandi net price benchmark.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F2F7F4] p-1 rounded-xl border border-emerald-900/10 self-start lg:self-auto">
          <button
            onClick={() => setActiveChartTab('historical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'historical'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            30-Day Trend (Farmer.in / Agmarknet)
          </button>
          <button
            onClick={() => setActiveChartTab('forecast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === 'forecast'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-teal-900'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeChartTab === 'forecast' ? 'text-amber-300' : 'text-teal-600'}`} />
            <span>MandiSense ML Forecast</span>
          </button>
          <button
            onClick={() => setActiveChartTab('comparison')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === 'comparison'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeChartTab === 'comparison' ? 'text-emerald-200' : 'text-emerald-600'}`} />
            <span>Mandi Comparison</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 30-Day Historical Trend */}
      {activeChartTab === 'historical' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-3 px-1">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-emerald-600 rounded-full"></span>
                <strong className="text-slate-800">Latest Mandi Price — Farmer.in / Agmarknet (₹/Q)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500"></span>
                <span className="font-medium text-slate-600">Govt MSP (₹{crop.baseMsp.toLocaleString('en-IN')})</span>
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
              Hover along graph points for daily spot rates
            </div>
          </div>

          {/* SVG Historical Chart */}
          <div className="relative w-full overflow-x-auto bg-[#F9FCFA] rounded-2xl p-3 border border-emerald-900/10">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[600px] select-none"
            >
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="90%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yVal = Math.round(yMinHist + pct * yRangeHist);
                const yPos = margin.top + innerHeight - pct * innerHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={margin.left}
                      y1={yPos}
                      x2={margin.left + innerWidth}
                      y2={yPos}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={margin.left - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      ₹{yVal.toLocaleString('en-IN')}
                    </text>
                  </g>
                );
              })}

              {/* MSP Line if within range */}
              {mspY >= margin.top && mspY <= margin.top + innerHeight && (
                <g>
                  <line
                    x1={margin.left}
                    y1={mspY}
                    x2={margin.left + innerWidth}
                    y2={mspY}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={margin.left + innerWidth - 5}
                    y={mspY - 5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#d97706"
                    fontWeight="bold"
                  >
                    MSP ₹{crop.baseMsp.toLocaleString('en-IN')}
                  </text>
                </g>
              )}

              {/* Area fill */}
              <path d={histAreaD} fill="url(#histGrad)" />

              {/* Smooth Line */}
              <path
                d={histPathD}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points and Tooltip Triggers */}
              {histPoints.map((pt, i) => {
                const isHovered = hoveredHistoricalIndex === i;
                const isLast = i === histPoints.length - 1;
                return (
                  <g
                    key={pt.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredHistoricalIndex(i)}
                    onMouseLeave={() => setHoveredHistoricalIndex(null)}
                  >
                    {/* Invisible larger hover hit area */}
                    <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />

                    {(isHovered || isLast) && (
                      <>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? '6' : '4.5'}
                          fill={isLast ? '#047857' : '#10b981'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={margin.top}
                            x2={pt.x}
                            y2={margin.top + innerHeight}
                            stroke="#059669"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}
                      </>
                    )}
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {histPoints
                .filter((_, idx) => idx % 5 === 0 || idx === histPoints.length - 1)
                .map((pt) => (
                  <text
                    key={pt.date}
                    x={pt.x}
                    y={margin.top + innerHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                    fontFamily="sans-serif"
                  >
                    {pt.displayDate}
                  </text>
                ))}
            </svg>
          </div>

          {/* Active Hover Detail Card */}
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            {hoveredHistoricalIndex !== null ? (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    {histPoints[hoveredHistoricalIndex].displayDate}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Spot Price:{' '}
                    <strong className="text-emerald-700 font-extrabold text-sm">
                      ₹{histPoints[hoveredHistoricalIndex].price.toLocaleString('en-IN')}/Q
                    </strong>
                  </span>
                  <span>
                    Arrival Volume:{' '}
                    <strong className="text-slate-700">
                      {histPoints[hoveredHistoricalIndex].volume.toLocaleString('en-IN')} Bags
                    </strong>
                  </span>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic">
                Tip: Hover across the line above to inspect individual daily trading prices & arrival volumes.
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 7-Day ML Forecast */}
      {activeChartTab === 'forecast' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-teal-600 rounded"></span>
                <strong className="text-slate-700">MandiSense ML Forecast (₹/Q)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-teal-100 rounded border border-teal-300"></span>
                <span>ML Confidence Band (Upper/Lower)</span>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              MandiSense ML Forecast (Holt-Winters Model — Not Govt Data)
            </span>
          </div>

          {/* SVG Forecast Chart */}
          <div className="relative w-full overflow-x-auto bg-[#F8FCFB] rounded-2xl p-3 border border-teal-900/10">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[600px] select-none"
            >
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const yVal = Math.round(yMinF + pct * yRangeF);
                const yPos = margin.top + innerHeight - pct * innerHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={margin.left}
                      y1={yPos}
                      x2={margin.left + innerWidth}
                      y2={yPos}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={margin.left - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      ₹{yVal.toLocaleString('en-IN')}
                    </text>
                  </g>
                );
              })}

              {/* Confidence Band Polygon */}
              <path d={confidenceBandD} fill="url(#forecastGrad)" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3 3" />

              {/* Predicted Price Path */}
              <path
                d={forecastPathD}
                fill="none"
                stroke="#0f766e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {forecastPoints.map((pt, i) => {
                const isHovered = hoveredForecastIndex === i;
                return (
                  <g
                    key={pt.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredForecastIndex(i)}
                    onMouseLeave={() => setHoveredForecastIndex(null)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '6' : '4.5'}
                      fill="#0f766e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Value label on top of point */}
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#115e59"
                    >
                      ₹{pt.predictedPrice.toLocaleString('en-IN')}
                    </text>

                    {/* X Axis Day Label */}
                    <text
                      x={pt.x}
                      y={margin.top + innerHeight + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="#334155"
                    >
                      {pt.dayName}
                    </text>
                    <text
                      x={pt.x}
                      y={margin.top + innerHeight + 30}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                    >
                      {pt.displayDate.split(',')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 7-Day Forecast Insights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {forecast.slice(0, 4).map((f) => (
              <div
                key={f.date}
                className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-700">{f.dayName}</span>
                  <span className="text-[10px] bg-teal-200/70 text-teal-800 px-1.5 py-0.5 rounded font-mono">
                    {f.confidenceScore}% conf
                  </span>
                </div>
                <div className="text-base font-extrabold text-teal-900">
                  ₹{f.predictedPrice.toLocaleString('en-IN')}/Q
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Range: ₹{f.lowerBound.toLocaleString('en-IN')} - ₹{f.upperBound.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Nearby Mandi Price Comparison */}
      {activeChartTab === 'comparison' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Comparing Gross Mandi Rate vs Net Realization (After transport & handling)</span>
            <span className="font-semibold text-emerald-800">
              Transport Model: ₹2.40/km per Quintal
            </span>
          </div>

          {mandisToCompare.map((mandi) => {
            const isRecommended = mandi.id === recommendedMandiId;
            const netVal = mandi.netReturnPerQuintal ?? mandi.currentPrice;
            const grossPct = Math.round((mandi.currentPrice / maxNetPrice) * 100);
            const netPct = Math.round((netVal / maxNetPrice) * 100);

            return (
              <div
                key={mandi.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isRecommended
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{mandi.name}</span>
                    <span className="text-xs text-slate-500">({mandi.district})</span>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-xs">
                        <Award className="w-3 h-3" />
                        Best Market Pick
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mandi.distanceKm != null ? `${mandi.distanceKm} km` : 'Requires GPS'}</span>
                    </span>
                    <span className="text-slate-600 font-mono">
                      Gross: ₹{mandi.currentPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="font-extrabold text-emerald-700 font-mono text-sm">
                      {mandi.netReturnPerQuintal != null
                        ? `Net: ₹${mandi.netReturnPerQuintal.toLocaleString('en-IN')}/Q`
                        : `Spot: ₹${mandi.currentPrice.toLocaleString('en-IN')}/Q`}
                    </span>
                  </div>
                </div>

                {/* Comparative Horizontal Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isRecommended
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${netPct}%` }}
                    title={`Net Realization: ₹${netVal}`}
                  ></div>
                  <div
                    className="h-full bg-rose-400/80"
                    style={{ width: `${Math.max(1, grossPct - netPct)}%` }}
                    title={`Transport & Mandi Fee: ₹${(mandi.transportCostEstimate ?? 0) + mandi.mandiCess}`}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>
                    {mandi.transportCostEstimate != null
                      ? `Transport & handling cost: -₹${(mandi.transportCostEstimate + mandi.mandiCess).toLocaleString('en-IN')}/Q`
                      : 'Transport cost calculated when GPS is detected'}
                  </span>
                  <span>7-Day Forecast: ₹{mandi.predictedPrice7d.toLocaleString('en-IN')}/Q</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
