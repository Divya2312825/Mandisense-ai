import React, { useState } from 'react';
import {
  Award,
  Calculator,
  Truck,
  CheckCircle2,
  Sliders,
  Navigation,
} from 'lucide-react';
import { AdvisorExplanation, MandiEvaluation } from '../types';

interface MarketAdvisorCardProps {
  explanation: AdvisorExplanation;
  recommendedMandi: MandiEvaluation;
  nearestMandi: MandiEvaluation;
  cropName: string;
}

export const MarketAdvisorCard: React.FC<MarketAdvisorCardProps> = ({
  explanation,
  recommendedMandi,
  nearestMandi,
  cropName,
}) => {
  const [loadQuintals, setLoadQuintals] = useState<number>(25); // 25 Quintals default (~2.5 tons)
  const [transportRatePerKmPerQ, setTransportRatePerKmPerQ] = useState<number>(2.4);

  const hasDistance = typeof recommendedMandi.distanceKm === 'number' && recommendedMandi.distanceKm > 0;

  const recommendedTransportTotal = hasDistance
    ? Math.round(recommendedMandi.distanceKm! * transportRatePerKmPerQ * loadQuintals)
    : 0;
  const nearestTransportTotal =
    typeof nearestMandi.distanceKm === 'number' && nearestMandi.distanceKm > 0
      ? Math.round(nearestMandi.distanceKm * transportRatePerKmPerQ * loadQuintals)
      : 0;

  const recommendedGrossRevenue = recommendedMandi.currentPrice * loadQuintals;
  const nearestGrossRevenue = nearestMandi.currentPrice * loadQuintals;

  const recommendedHandlingTotal = recommendedMandi.mandiCess * loadQuintals;
  const nearestHandlingTotal = nearestMandi.mandiCess * loadQuintals;

  const recommendedNetTotal = hasDistance
    ? recommendedGrossRevenue - recommendedTransportTotal - recommendedHandlingTotal
    : recommendedGrossRevenue;
  const nearestNetTotal = hasDistance
    ? nearestGrossRevenue - nearestTransportTotal - nearestHandlingTotal
    : nearestGrossRevenue;

  const netAdvantageTotal = hasDistance
    ? recommendedNetTotal - nearestNetTotal
    : recommendedGrossRevenue - nearestGrossRevenue;

  return (
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-emerald-900/12 shadow-sm shadow-emerald-950/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Best Market Advisor Rationale
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recommends the best nearby market by balancing daily modal prices against road travel distance.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>★ Net Realization Optimizer</span>
        </div>
      </div>

      {/* Main Decision Banner */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-5 shadow-sm border border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              Recommended Market Choice
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Sell {cropName} at <span className="text-amber-400">{recommendedMandi.name}</span>
            </h4>
            <p className="text-emerald-100/90 text-xs mt-1.5 leading-relaxed">
              {explanation.whyRecommended}
            </p>
          </div>

          <div className="bg-emerald-800/60 border border-emerald-600/40 rounded-xl p-3.5 text-center min-w-[180px] flex-shrink-0">
            <div className="text-[10px] text-emerald-300 font-medium uppercase">
              {hasDistance ? `Net Advantage on ${loadQuintals} Q` : `Gross Value Advantage`}
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">
              +₹{Math.max(0, netAdvantageTotal).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              (+₹{explanation.advantagePerQuintal.toLocaleString('en-IN')}/Q gain)
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-200">
          <Calculator className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <code className="bg-emerald-950/70 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 border border-emerald-800">
            {explanation.formula}
          </code>
        </div>
      </div>

      {/* Interactive Farm Dispatch Volume Simulator */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm Dispatch Volume Simulator</span>
          </div>
          <span className="text-slate-500 font-medium">
            Test custom load batch sizes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>Harvest Load:</span>
              <strong className="text-emerald-700 font-mono">{loadQuintals} Quintals</strong>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={loadQuintals}
              onChange={(e) => setLoadQuintals(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>5 Q</span>
              <span>25 Q (Pickup)</span>
              <span>100 Q</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium text-slate-700 mb-1">
              <span>Transport Tariff:</span>
              <strong className="text-emerald-700 font-mono">₹{transportRatePerKmPerQ.toFixed(2)}/km/Q</strong>
            </div>
            <input
              type="range"
              min="1.5"
              max="3.5"
              step="0.1"
              value={transportRatePerKmPerQ}
              onChange={(e) => setTransportRatePerKmPerQ(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹1.50</span>
              <span>₹2.40 (Standard)</span>
              <span>₹3.50</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Gross Value ({recommendedMandi.name.split(' ')[0]}):</span>
              <strong className="font-mono text-slate-800">₹{recommendedGrossRevenue.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px] mt-1">
              <span>{hasDistance ? 'Estimated Transport:' : 'Location Status:'}</span>
              <span className="font-mono text-slate-700">
                {hasDistance ? `-₹${recommendedTransportTotal.toLocaleString('en-IN')}` : 'Requires GPS location'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1.5 mt-1 border-t border-slate-100 text-emerald-800">
              <span>{hasDistance ? 'Net Realization Advantage:' : 'Gross Price Advantage:'}</span>
              <span className="font-mono font-extrabold text-amber-600">
                +₹{Math.max(0, netAdvantageTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
