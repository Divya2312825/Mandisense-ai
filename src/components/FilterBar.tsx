import React from 'react';
import {
  Wheat,
  Search,
  Filter,
  MapPin,
  Building2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CropInfo } from '../types';

interface FilterBarProps {
  crops: CropInfo[];
  states: string[];
  districts: string[];
  mandis: { id: string; name: string; district: string }[];
  selectedCropId: string;
  selectedState: string;
  selectedDistrict: string;
  selectedMandiId: string;
  onChangeCrop: (cropId: string) => void;
  onChangeState: (state: string) => void;
  onChangeDistrict: (district: string) => void;
  onChangeMandi: (mandiId: string) => void;
  onGetInsights: () => void;
  isLoading: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  crops,
  states,
  districts,
  mandis,
  selectedCropId,
  selectedState,
  selectedDistrict,
  selectedMandiId,
  onChangeCrop,
  onChangeState,
  onChangeDistrict,
  onChangeMandi,
  onGetInsights,
  isLoading,
}) => {
  // Filter mandis based on selected district if any
  const filteredMandis = selectedDistrict && selectedDistrict !== 'all'
    ? mandis.filter((m) => m.district.toLowerCase().includes(selectedDistrict.toLowerCase()))
    : mandis;

  const currentCrop = crops.find((c) => c.id === selectedCropId);

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-emerald-900/12 shadow-sm shadow-emerald-950/5 mb-6">
      <div className="flex items-center gap-2 mb-3.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
        <Filter className="w-3.5 h-3.5 text-emerald-700" />
        <span>Market &amp; Crop Parameters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Select Crop */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Select Crop</span>
            {currentCrop && (
              <span className="text-[11px] text-emerald-600 font-medium">
                {currentCrop.teluguName}
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={selectedCropId}
              onChange={(e) => onChangeCrop(e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 pr-8 font-medium transition-colors"
            >
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Select State */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select State
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => onChangeState(e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 pr-8 font-medium transition-colors"
            >
              <option value="Andhra Pradesh">Andhra Pradesh (Full Coverage)</option>
              {states
                .filter((s) => s !== 'Andhra Pradesh')
                .map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Select District */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select District
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => onChangeDistrict(e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 pr-8 font-medium transition-colors"
            >
              <option value="all">All Districts (Nearby Analysis)</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Select Mandi (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Select Mandi</span>
            <span className="text-[10px] text-slate-600 font-normal">Optional</span>
          </label>
          <div className="relative">
            <select
              value={selectedMandiId}
              onChange={(e) => onChangeMandi(e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 pr-8 font-medium transition-colors"
            >
              <option value="">Auto-Detect Best Mandi</option>
              {filteredMandis.map((mandi) => (
                <option key={mandi.id} value={mandi.id}>
                  {mandi.name} ({mandi.district})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Get Insights Action Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={onGetInsights}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Computing ML...' : 'Get Insights'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
