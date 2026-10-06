import React, { useState } from 'react';
import {
  Building2,
  Award,
  Truck,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';
import { MandiEvaluation } from '../types';

interface NearbyMandisTableProps {
  mandis: MandiEvaluation[];
  recommendedMandiId: string;
  selectedMandiId: string;
  onSelectMandi: (mandiId: string) => void;
}

export const NearbyMandisTable: React.FC<NearbyMandisTableProps> = ({
  mandis,
  recommendedMandiId,
  selectedMandiId,
  onSelectMandi,
}) => {
  const [sortBy, setSortBy] = useState<'net' | 'distance' | 'price'>('price');
  const [expandedMandiId, setExpandedMandiId] = useState<string | null>(null);

  const sortedMandis = [...mandis].sort((a, b) => {
    if (sortBy === 'net') {
      const netA = a.netReturnPerQuintal ?? a.currentPrice;
      const netB = b.netReturnPerQuintal ?? b.currentPrice;
      return netB - netA;
    }
    if (sortBy === 'distance') {
      const distA = a.distanceKm ?? 9999;
      const distB = b.distanceKm ?? 9999;
      return distA - distB;
    }
    if (sortBy === 'price') return b.currentPrice - a.currentPrice;
    return 0;
  });

  const toggleExpand = (id: string) => {
    setExpandedMandiId(expandedMandiId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-emerald-900/12 shadow-sm shadow-emerald-950/5 mb-6">
      {/* Section Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Nearby Mandi Comparison &amp; Pricing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluation considering daily modal price, road distance, and estimated transport logistics.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </span>
          <div className="flex items-center bg-[#F2F7F4] p-1 rounded-xl border border-emerald-900/10">
            <button
              onClick={() => setSortBy('price')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === 'price'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Mandi Price
            </button>
            <button
              onClick={() => setSortBy('net')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === 'net'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Net Profit
            </button>
            <button
              onClick={() => setSortBy('distance')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === 'distance'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Distance
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-emerald-900/10 text-emerald-950 font-bold bg-[#F3F8F5]">
              <th className="py-3.5 px-4">Mandi Name</th>
              <th className="py-3.5 px-3">District</th>
              <th className="py-3.5 px-3 text-right">Distance</th>
              <th className="py-3.5 px-3 text-right">Current Price</th>
              <th className="py-3.5 px-3 text-right">7-Day Forecast</th>
              <th className="py-3.5 px-3 text-right">Net Realization</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMandis.map((mandi, idx) => {
              const isRecommended = mandi.id === recommendedMandiId;
              const isSelected = mandi.id === selectedMandiId;
              const isExpanded = expandedMandiId === mandi.id;
              const isEven = idx % 2 === 1;

              return (
                <React.Fragment key={mandi.id}>
                  <tr
                    className={`transition-colors ${
                      isRecommended
                        ? 'bg-emerald-50/75 hover:bg-emerald-100/60 font-medium'
                        : isSelected
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                        : isEven
                        ? 'bg-slate-50/50 hover:bg-emerald-50/30'
                        : 'bg-white hover:bg-emerald-50/30'
                    }`}
                  >
                    {/* Mandi Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isRecommended ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-slate-400'
                          }`}
                        />
                        <span>{mandi.name}</span>
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-3 text-slate-600">{mandi.district}</td>

                    {/* Distance (Right Aligned) */}
                    <td className="py-3.5 px-3 text-right text-slate-700 font-mono tabular-nums">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {mandi.distanceKm != null ? `${mandi.distanceKm} km` : 'Enable GPS'}
                        </span>
                      </div>
                    </td>

                    {/* Current Price (Right Aligned, Emphasized) */}
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono tabular-nums text-[13px]">
                      ₹{mandi.currentPrice.toLocaleString('en-IN')}/Q
                    </td>

                    {/* Predicted Price (Right Aligned) */}
                    <td className="py-3.5 px-3 text-right text-teal-800 font-bold font-mono tabular-nums">
                      ₹{mandi.predictedPrice7d.toLocaleString('en-IN')}/Q
                    </td>

                    {/* Net Realization (Right Aligned, Strong Highlight) */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                      {mandi.netReturnPerQuintal != null ? (
                        <div>
                          <div className="font-extrabold text-emerald-800 text-sm">
                            ₹{mandi.netReturnPerQuintal.toLocaleString('en-IN')}/Q
                          </div>
                          <div className="text-[10px] text-slate-500">
                            after freight &amp; fees
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">
                          Requires GPS
                        </div>
                      )}
                    </td>

                    {/* Status / Recommendation Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {isRecommended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-800 text-white shadow-xs whitespace-nowrap">
                          <Award className="w-3 h-3 text-amber-300" />
                          <span>★ Recommended</span>
                        </span>
                      ) : mandi.distanceKm != null && mandi.distanceKm <= 25 ? (
                        <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">
                          Local Hub
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-800 whitespace-nowrap">
                          Regional Yard
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleExpand(mandi.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 transition-colors cursor-pointer"
                          title="View economic cost breakdown"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onSelectMandi(mandi.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-800 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-950'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Analyze'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Breakdown Accordion */}
                  {isExpanded && (
                    <tr className="bg-[#F4F9F6] border-b border-emerald-900/10">
                      <td colSpan={8} className="py-3.5 px-6 text-xs text-slate-700">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3 bg-white rounded-xl border border-emerald-900/10 shadow-2xs">
                          <div>
                            <span className="text-[11px] text-slate-500 block">Mandi Gross Price</span>
                            <strong className="text-sm text-slate-900 font-mono tabular-nums">
                              ₹{mandi.currentPrice.toLocaleString('en-IN')}/Q
                            </strong>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Est. Road Transport</span>
                            <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                              {mandi.transportCostEstimate != null
                                ? `-₹${mandi.transportCostEstimate.toLocaleString('en-IN')}/Q (${mandi.distanceKm} km × ₹2.40)`
                                : 'Requires GPS location'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Mandi Handling &amp; Cess</span>
                            <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                              -₹{mandi.mandiCess}/Q
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Estimated Net Value</span>
                            <strong className="text-sm text-emerald-800 font-mono font-extrabold tabular-nums">
                              {mandi.netReturnPerQuintal != null
                                ? `₹${mandi.netReturnPerQuintal.toLocaleString('en-IN')}/Q`
                                : `₹${mandi.currentPrice.toLocaleString('en-IN')}/Q (Gross)`}
                            </strong>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-600">
                          <span>
                            Grade: <strong className="text-slate-800">{mandi.grade}</strong>
                          </span>
                          <span>
                            e-NAM Trading:{' '}
                            <strong className="text-emerald-800">
                              {mandi.eNamEnabled ? 'Enabled ✓' : 'Manual'}
                            </strong>
                          </span>
                          <span>
                            Cold Storage:{' '}
                            <strong className="text-slate-800">
                              {mandi.coldStorageAvailable ? 'Available' : 'No'}
                            </strong>
                          </span>
                          <span>
                            Crop Specialization:{' '}
                            <strong className="text-slate-800">
                              {mandi.specializesInCrop ? 'High Volume Yard' : 'General'}
                            </strong>
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
