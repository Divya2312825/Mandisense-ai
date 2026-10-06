import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Award,
  Scale,
  CloudSun,
  Info,
  Sprout,
  ShieldCheck,
  Home,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'prices'
  | 'prediction'
  | 'advisor'
  | 'comparison'
  | 'weather'
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onGoToLanding?: () => void;
  cropName?: string;
  recommendedMandi?: string;
  advantageAmount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onGoToLanding,
  cropName,
  recommendedMandi,
  advantageAmount,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prices', label: 'Crop Prices', icon: TrendingUp },
    { id: 'prediction', label: 'Price Prediction', icon: LineChart, badge: 'ML 7-Day' },
    { id: 'advisor', label: 'Best Market Advisor', icon: Award, badge: 'Optimizer' },
    { id: 'comparison', label: 'Market Comparison', icon: Scale },
    { id: 'weather', label: 'Weather Insights', icon: CloudSun },
    { id: 'about', label: 'About', icon: Info, badge: 'B.Tech' },
  ];

  return (
    <aside className="w-64 md:w-72 bg-emerald-950 text-emerald-100 flex flex-col border-r border-emerald-900/60 shadow-xl select-none flex-shrink-0">
      {/* Brand Header */}
      <div
        onClick={onGoToLanding}
        className={`p-5 border-b border-emerald-800/50 flex items-center gap-3 bg-emerald-950/80 ${
          onGoToLanding ? 'cursor-pointer hover:bg-emerald-900/50 transition-colors' : ''
        }`}
        title="Return to MandiSense AI Landing Page"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white flex-shrink-0 ring-2 ring-emerald-400/30">
          <Sprout className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Mandi<span className="text-emerald-400">Sense</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AI
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium tracking-wide">
            Crop Price &amp; Market Advisor
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="w-full flex items-center justify-between px-3.5 py-2 mb-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-900/40 hover:bg-emerald-900/80 hover:text-white border border-emerald-800/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Landing Page Overview</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/70">
          Main Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/30'
                  : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-200'
                        : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-emerald-200' : 'text-emerald-500'
                  }`}
                />
              </div>
            </button>
          );
        })}

        {/* Live Recommendation Highlight Pill */}
        {recommendedMandi && (
          <div className="mt-6 mx-1 p-3.5 rounded-xl bg-gradient-to-br from-emerald-900/90 to-emerald-950 border border-emerald-700/60 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Optimal Market Pick</span>
            </div>
            <div className="text-sm font-bold text-white truncate">{recommendedMandi}</div>
            {cropName && (
              <div className="text-xs text-emerald-300/80 mt-0.5">Crop: {cropName}</div>
            )}
            {typeof advantageAmount === 'number' && advantageAmount > 0 && (
              <div className="mt-2 text-[11px] font-semibold bg-emerald-800/80 text-emerald-200 px-2 py-1 rounded-md border border-emerald-600/40">
                +₹{advantageAmount.toLocaleString('en-IN')}/Q extra net profit
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Verification */}
      <div className="p-4 border-t border-emerald-900/70 bg-emerald-950/90">
        <div className="flex items-center gap-2 text-xs text-emerald-300/90 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Source: Farmer.in / Agmarknet</span>
        </div>
        <p className="text-[11px] text-emerald-400/80 mt-1">
          Latest Available Daily Mandi Data
        </p>
      </div>
    </aside>
  );
};
