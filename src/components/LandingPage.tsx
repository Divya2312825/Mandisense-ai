import React, { useState } from 'react';
import {
  Sprout,
  ArrowRight,
  ArrowDown,
  MapPin,
  Database,
  LineChart,
  Scale,
  Award,
  Sparkles,
  Navigation,
  Code2,
  Server,
  Cpu,
  BookOpen,
  IndianRupee,
  ChevronRight,
  Layers,
  AlertCircle,
  Lightbulb,
  Compass,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { InsightsResponse } from '../types';
import { NavTab } from './Sidebar';

interface LandingPageProps {
  onExploreDashboard: (initialTab?: NavTab, openAiDrawer?: boolean) => void;
  insights: InsightsResponse | null;
}

const WHY_CARDS = [
  {
    stage: '01 · Problem',
    title: 'Farmers need understandable market information.',
    description:
      'Daily commodity prices vary widely across district APMC yards, making it difficult for farmers to compare regional rates before dispatching their harvest.',
    icon: AlertCircle,
    bgClass: 'bg-[#FAF7F0] border-amber-900/10 hover:border-amber-700/30',
    iconClass: 'bg-amber-100/90 text-amber-900',
  },
  {
    stage: '02 · Insight',
    title: 'MandiSense combines market data and ML.',
    description:
      'Fetches daily commodity prices from Farmer.in / Agmarknet through the backend and applies 7-day Holt-Winters time-series forecasting to reveal price momentum.',
    icon: Lightbulb,
    bgClass: 'bg-[#F0F8F3] border-emerald-900/10 hover:border-emerald-700/35',
    iconClass: 'bg-emerald-100 text-emerald-900',
  },
  {
    stage: '03 · Decision',
    title: 'Compare price and distance.',
    description:
      'Evaluates whether a higher price at a distant mandi actually pays off after subtracting road freight costs per kilometer and market handling charges.',
    icon: Compass,
    bgClass: 'bg-[#EEF6F4] border-teal-900/10 hover:border-teal-700/35',
    iconClass: 'bg-teal-100 text-teal-900',
  },
  {
    stage: '04 · Action',
    title: 'Choose a better market.',
    description:
      'Recommends the market with the highest estimated net realization per quintal, paired with clear explanations in English and Telugu.',
    icon: CheckCircle2,
    bgClass: 'bg-[#EAF5EE] border-emerald-900/15 hover:border-emerald-700/40',
    iconClass: 'bg-emerald-800 text-emerald-100',
  },
];

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Your Location',
    subtitle: 'Browser GPS & Haversine Distance',
    description:
      'Requests browser geolocation permission on user click to compute real road distance from the farmer to regional Andhra Pradesh APMC yards.',
    icon: MapPin,
    targetTab: 'dashboard' as NavTab,
  },
  {
    step: '02',
    title: 'Latest Mandi Data',
    subtitle: 'Source: Farmer.in / Agmarknet',
    description:
      'Fetches latest available daily commodity prices via the Node.js backend, parsing modal, minimum, and maximum prices with official reporting dates.',
    icon: Database,
    targetTab: 'prices' as NavTab,
  },
  {
    step: '03',
    title: 'ML Price Forecast',
    subtitle: '7-Day Time-Series Projection',
    description:
      'Runs Holt-Winters double exponential smoothing anchored to fetched market observations to project 7-day prices and confidence bands.',
    icon: LineChart,
    targetTab: 'prediction' as NavTab,
  },
  {
    step: '04',
    title: 'Nearby Market Analysis',
    subtitle: 'Gross Price vs. Transport Cost',
    description:
      'Evaluates regional mandis side-by-side by deducting estimated road freight (₹/km/Quintal) and mandi handling fees from gross modal prices.',
    icon: Scale,
    targetTab: 'comparison' as NavTab,
  },
  {
    step: '05',
    title: 'Best Market',
    subtitle: 'Net Realization Recommendation',
    description:
      'Highlights the APMC market that maximizes net take-home value per quintal rather than merely selecting the highest headline rate.',
    icon: Award,
    targetTab: 'advisor' as NavTab,
  },
  {
    step: '06',
    title: 'Gemini AI Advice',
    subtitle: 'English & Telugu Advisory',
    description:
      'Passes structured market records and ML forecast metrics to Gemini AI to generate grounded selling guidance without inventing prices.',
    icon: Sparkles,
    targetTab: 'dashboard' as NavTab,
    openAi: true,
  },
];

const FEATURE_CARDS = [
  {
    title: 'Live Mandi Prices',
    kicker: 'Source: Farmer.in / Agmarknet',
    description:
      'Displays latest available daily modal, minimum, and maximum prices across Andhra Pradesh mandis with verified reporting dates.',
    icon: IndianRupee,
    bgClass: 'bg-gradient-to-br from-[#F1F8F4] to-[#E8F3EC] border-emerald-900/12',
    iconBg: 'bg-emerald-800 text-white',
    targetTab: 'prices' as NavTab,
    cta: 'Inspect Mandi Prices',
  },
  {
    title: '7-Day ML Forecast',
    kicker: 'MandiSense ML Forecast',
    description:
      'Projects 7-day crop price trajectories with confidence intervals and peak day detection using Holt-Winters exponential smoothing.',
    icon: LineChart,
    bgClass: 'bg-gradient-to-br from-[#EEF7F6] to-[#E4F2F0] border-teal-900/12',
    iconBg: 'bg-teal-800 text-white',
    targetTab: 'prediction' as NavTab,
    cta: 'View 7-Day Forecast',
  },
  {
    title: 'Best Market Advisor',
    kicker: 'Net Take-Home Optimizer',
    description:
      'Calculates net realization per quintal after road transport and mandi handling charges to recommend the most profitable selling yard.',
    icon: Award,
    bgClass: 'bg-gradient-to-br from-[#FAF6EC] to-[#F5EFE0] border-amber-900/12',
    iconBg: 'bg-amber-600 text-white',
    targetTab: 'advisor' as NavTab,
    cta: 'Open Market Advisor',
  },
  {
    title: 'Nearby Market Comparison',
    kicker: 'Multi-Mandi Evaluation',
    description:
      'Compares candidate APMCs across districts in an interactive table and bar chart contrasting gross modal price against net value.',
    icon: Scale,
    bgClass: 'bg-gradient-to-br from-[#F3F8F2] to-[#EAF3E8] border-emerald-900/12',
    iconBg: 'bg-emerald-700 text-white',
    targetTab: 'comparison' as NavTab,
    cta: 'Compare Mandis',
  },
  {
    title: 'Location Intelligence',
    kicker: 'Browser GPS + Haversine',
    description:
      'Uses permission-based browser geolocation to compute accurate distances to regional yards without substituting fake coordinates.',
    icon: Navigation,
    bgClass: 'bg-gradient-to-br from-[#F8F7F2] to-[#EFECE4] border-slate-900/10',
    iconBg: 'bg-emerald-900 text-emerald-100',
    targetTab: 'dashboard' as NavTab,
    cta: 'Try Location Analysis',
  },
  {
    title: 'Gemini AI Assistant',
    kicker: 'Bilingual Market Advisory',
    description:
      'Explains market comparisons, price trends, and transport trade-offs in English and Telugu using structured backend context.',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-br from-[#EDF7F2] to-[#E2F1EA] border-emerald-900/15',
    iconBg: 'bg-emerald-950 text-emerald-300',
    targetTab: 'dashboard' as NavTab,
    openAi: true,
    cta: 'Ask Gemini AI',
  },
];

const TECH_STACK = [
  {
    name: 'React',
    category: 'Frontend UI',
    detail: 'Interactive dashboard, custom SVG analytics charts, and responsive Tailwind CSS interface.',
    icon: Code2,
  },
  {
    name: 'Node.js',
    category: 'Backend Service',
    detail: 'Express API server managing external mandi data requests, normalization, and routing.',
    icon: Server,
  },
  {
    name: 'Machine Learning',
    category: '7-Day Forecasting',
    detail: 'Holt-Winters time-series smoothing model generating 7-day price projections and bounds.',
    icon: Cpu,
  },
  {
    name: 'Farmer.in / Agmarknet',
    category: 'Market Data API',
    detail: 'Public machine-readable JSON feed providing daily Agmarknet commodity prices.',
    icon: Database,
  },
  {
    name: 'Gemini AI',
    category: 'Advisory Engine',
    detail: 'Context-grounded natural language explanation in English and Telugu via @google/genai.',
    icon: Sparkles,
  },
  {
    name: 'Geolocation',
    category: 'Spatial Engine',
    detail: 'Browser HTML5 Geolocation API paired with Haversine distance and freight calculation.',
    icon: MapPin,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreDashboard,
  insights,
}) => {
  const [heroImageError, setHeroImageError] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeNav, setActiveNav] = useState<string>('why-mandisense');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeStep = FLOW_STEPS[activeStepIndex];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-slate-900 font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Bar Contract: 3 Zones (Brand Wordmark — 5 Clean Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={() => setActiveNav('top')}
            className="text-xl font-bold tracking-tight text-emerald-950 font-display whitespace-nowrap"
          >
            MandiSense AI
          </a>

          {/* Zone 2: 5 clean text navigation links with active indicator */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 h-full">
            {[
              { id: 'why-mandisense', label: 'Why MandiSense' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'key-features', label: 'Key Features' },
              { id: 'technology', label: 'Technology' },
              { id: 'about', label: 'About' },
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative h-full inline-flex items-center transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${
                      isActive ? 'bg-emerald-700 opacity-100' : 'bg-transparent opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onExploreDashboard('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-950/15 hover:shadow-md whitespace-nowrap cursor-pointer active:scale-[0.99]"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-emerald-950 hover:bg-emerald-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-emerald-900/10 px-4 pt-2 pb-4 space-y-1 animate-fade-in">
            {[
              { id: 'why-mandisense', label: 'Why MandiSense' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'key-features', label: 'Key Features' },
              { id: 'technology', label: 'Technology' },
              { id: 'about', label: 'About' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* HERO SECTION — Rich Agricultural Gradient + Tall 420–480px Right Visual Card */}
      <section
        id="top"
        className="relative overflow-hidden pt-7 pb-12 sm:pt-10 sm:pb-16 border-b border-emerald-900/10 bg-gradient-to-br from-[#E7F4EC] via-[#F3F8F4] to-[#FAF8F2] bg-agri-grid"
      >
        {/* Subtle decorative ambient agricultural glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (5 cols): Brand Proposition & Actions */}
            <div className="lg:col-span-5 space-y-5 animate-fade-in">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>AI Agriculture Decision Platform</span>
                <span aria-hidden="true">·</span>
                <span>Andhra Pradesh Mandis</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-emerald-950 tracking-tight leading-[1.12] font-display"
                style={{ textWrap: 'balance' }}
              >
                Smarter Markets. Better Decisions for Farmers.
              </h1>

              <p className="text-base sm:text-[17px] text-slate-700 leading-relaxed">
                AI-powered mandi prices, market forecasting and location-aware market recommendations for smarter selling decisions.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onExploreDashboard('dashboard')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white shadow-md shadow-emerald-950/15 hover:shadow-lg transition-all active:scale-[0.99] whitespace-nowrap cursor-pointer"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-white/90 hover:bg-white text-emerald-950 border border-emerald-900/15 shadow-xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>How It Works</span>
                  <ArrowDown className="w-4 h-4 text-emerald-700" />
                </button>
              </div>

              {/* Structured Quick Highlights */}
              <div className="pt-4 border-t border-emerald-900/10 grid grid-cols-3 gap-3 text-left">
                <div>
                  <div className="text-xs font-bold text-emerald-950">Daily Feed</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Farmer.in / Agmarknet
                  </div>
                </div>
                <div className="border-l border-emerald-900/10 pl-3">
                  <div className="text-xs font-bold text-emerald-950">7-Day Horizon</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Holt-Winters ML Model
                  </div>
                </div>
                <div className="border-l border-emerald-900/10 pl-3">
                  <div className="text-xs font-bold text-emerald-950">Net Profit</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Price − Freight &amp; Fees
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Tall 420–480px Rounded-[24px] Agricultural Visual Card */}
            <div className="lg:col-span-7 animate-fade-in">
              <div className="group relative h-[380px] sm:h-[430px] lg:h-[465px] w-full rounded-[24px] overflow-hidden border border-emerald-900/15 bg-emerald-950 shadow-xl shadow-emerald-950/15 transition-all duration-300 hover:shadow-2xl hover:border-emerald-800/30">
                {!heroImageError ? (
                  <img
                    src="/src/assets/images/mandisense_hero_agriculture_1791301480213.jpg"
                    alt="Lush Andhra Pradesh agricultural fields with harvested red chillies, golden paddy, and cotton ready for APMC mandi trading"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageError(true)}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-8 text-center">
                    <Sprout className="w-12 h-12 text-emerald-400 mb-3" />
                    <span className="text-lg font-display font-semibold text-white">
                      MandiSense AI Agricultural Intelligence
                    </span>
                    <span className="text-xs text-emerald-200/80 mt-1">
                      Andhra Pradesh APMC Market Analysis &amp; Forecasting
                    </span>
                  </div>
                )}

                {/* Subtle dark gradient over bottom of image so text remains readable without obscuring scenery */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/45 to-transparent pointer-events-none" />

                {/* Top-Left Live Source Bar on Hero Image */}
                <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-white/15 text-xs text-emerald-100 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-white">
                      {insights?.sourceLabel || 'Source: Farmer.in / Agmarknet'}
                    </span>
                    {insights?.commodityUpdatedDate && (
                      <>
                        <span className="text-emerald-300/60">·</span>
                        <span className="font-mono text-[11px] text-emerald-200">
                          Updated: {insights.commodityUpdatedDate}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => onExploreDashboard('dashboard')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-emerald-950 font-semibold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    Live Dashboard →
                  </button>
                </div>

                {/* Bottom Polished Live-Data Overlay Panel */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-white/15 p-4 sm:p-5 text-white shadow-lg">
                  {insights && insights.dataAvailable !== false ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                      {/* Crop & Mandi */}
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[11px] text-emerald-300/90 font-medium">
                          Crop &amp; Active Mandi
                        </div>
                        <div className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                          {insights.crop.name}
                        </div>
                        <div className="text-xs text-emerald-200/90 truncate">
                          {insights.selectedMandi.name.split('(')[0]} ({insights.selectedMandi.district})
                        </div>
                      </div>

                      {/* Modal Price */}
                      <div className="sm:border-l sm:border-white/10 sm:pl-4">
                        <div className="text-[11px] text-emerald-300/90 font-medium">
                          Modal Price
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-white font-mono tabular-nums mt-0.5">
                          ₹{insights.selectedMandi.currentPrice.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-emerald-200/80">/Q</span>
                        </div>
                        <div className="text-[11px] text-emerald-300">
                          Latest Mandi Price
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="sm:border-l sm:border-white/10 sm:pl-4">
                        <div className="text-[11px] text-emerald-300/90 font-medium">
                          Daily Price Range
                        </div>
                        <div className="text-sm font-bold text-white font-mono tabular-nums mt-1">
                          {insights.selectedMandi.minPrice != null &&
                          insights.selectedMandi.maxPrice != null
                            ? `₹${insights.selectedMandi.minPrice.toLocaleString('en-IN')} – ₹${insights.selectedMandi.maxPrice.toLocaleString('en-IN')}`
                            : `₹${insights.selectedMandi.currentPrice.toLocaleString('en-IN')}`}
                        </div>
                        <div className="text-[11px] text-emerald-200/80 mt-0.5">
                          Min – Max (₹/Quintal)
                        </div>
                      </div>

                      {/* ML Forecast */}
                      <div className="sm:border-l sm:border-white/10 sm:pl-4">
                        <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>7-Day ML Forecast</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono tabular-nums mt-0.5">
                          ₹{insights.selectedMandi.predictedPrice7d.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-amber-200/80">/Q</span>
                        </div>
                        <div className="text-[11px] text-emerald-200/90">
                          MandiSense ML Forecast
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-emerald-300">
                          Source: Farmer.in / Agmarknet · Andhra Pradesh APMC Network
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          Connects daily commodity modal, min, and max prices with 7-day ML forecasting
                        </div>
                      </div>
                      <button
                        onClick={() => onExploreDashboard('dashboard')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                      >
                        Open Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WHY MANDISENSE AI? — 4 Visual Progression Cards + Formula Banner */}
      <section
        id="why-mandisense"
        className="py-16 sm:py-20 border-b border-emerald-900/10 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-emerald-800 tracking-wide">
              01. The Agricultural Market Challenge
            </div>
            <h2
              className="mt-1.5 text-2xl sm:text-3xl font-bold text-emerald-950 font-display tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Why MandiSense AI?
            </h2>
            <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
              Farmers often struggle to compare daily regional mandi prices and evaluate whether travelling further for a higher price actually yields a higher net return.
            </p>
          </div>

          {/* 4 Progression Cards: Problem → Insight → Decision → Action */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.stage}
                  className={`rounded-[20px] p-5 sm:p-6 border card-hover-lift shadow-xs flex flex-col justify-between ${card.bgClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${card.iconClass}`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-semibold text-slate-600 font-mono">
                        {card.stage}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-emerald-950 leading-snug">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-emerald-900/10 flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span>Stage 0{idx + 1}</span>
                    {idx < WHY_CARDS.length - 1 ? (
                      <span className="text-emerald-700 font-mono">Next →</span>
                    ) : (
                      <span className="text-emerald-700 font-mono">Optimal Outcome ✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparent Economic Formula Strip */}
          <div className="mt-8 rounded-[20px] bg-gradient-to-r from-[#EEF7F1] via-[#F4FAF6] to-[#FAF7EE] border border-emerald-900/15 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <div className="text-xs font-semibold text-emerald-800">
                Transparent Net Realization Formula
              </div>
              <h3 className="text-base sm:text-lg font-bold text-emerald-950 mt-0.5">
                Never Choose by Headline Modal Price Alone
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                MandiSense AI evaluates every candidate market by subtracting estimated road freight and handling fees from the fetched daily modal price.
              </p>
            </div>

            <div className="bg-emerald-950 text-white px-4 py-3.5 rounded-xl font-mono text-xs sm:text-sm border border-emerald-800 shadow-sm shrink-0">
              <span className="text-emerald-300 font-semibold">Net Value (₹/Q)</span> = Modal Price − (Distance km × Freight) − Handling Cess
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS — Modern Connected SaaS Workflow */}
      <section
        id="how-it-works"
        className="py-16 sm:py-22 border-b border-emerald-900/10 bg-gradient-to-b from-[#EDF6F0] via-[#F4F9F5] to-[#FAF8F3] bg-agri-pattern"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold text-emerald-800 tracking-wide">
                02. End-to-End Decision Pipeline
              </div>
              <h2
                className="mt-1.5 text-2xl sm:text-3xl font-bold text-emerald-950 font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                How It Works
              </h2>
              <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
                A connected 6-step intelligence pipeline transforming raw daily mandi records and user location into actionable market recommendations.
              </p>
            </div>
            <div className="text-xs font-medium text-emerald-900">
              Click any stage below to inspect its role in the pipeline
            </div>
          </div>

          {/* Horizontal Connected SaaS Workflow (Desktop) & Vertical Connected Flow (Mobile/Tablet) */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {FLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeStepIndex;
              return (
                <div key={item.step} className="relative flex flex-col items-stretch">
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`h-full text-left rounded-[20px] p-4 sm:p-5 border transition-all card-hover-lift cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950 text-white border-emerald-800 shadow-lg shadow-emerald-950/15 ring-2 ring-emerald-500/40'
                        : 'bg-white hover:bg-emerald-50/70 text-slate-900 border-emerald-900/12 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isSelected ? 'text-emerald-300' : 'text-emerald-800'
                          }`}
                        >
                          {item.step}
                        </span>
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-800 text-emerald-200'
                              : 'bg-emerald-100/80 text-emerald-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold leading-snug ${
                          isSelected ? 'text-white' : 'text-emerald-950'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isSelected ? 'text-emerald-200/90' : 'text-slate-500'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    <div
                      className={`mt-4 pt-2.5 border-t text-[11px] font-semibold flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-800 text-amber-300'
                          : 'border-slate-100 text-emerald-800'
                      }`}
                    >
                      <span>{isSelected ? 'Selected Stage' : 'Inspect'}</span>
                      <span>→</span>
                    </div>
                  </button>

                  {/* Connector Arrows: ↓ on mobile, → on desktop */}
                  {idx < FLOW_STEPS.length - 1 && (
                    <>
                      <div
                        className="flex sm:hidden justify-center py-1.5 text-emerald-700 font-mono text-sm font-bold"
                        aria-hidden="true"
                      >
                        ↓
                      </div>
                      <div
                        className="hidden lg:flex items-center justify-center absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold shadow-xs pointer-events-none"
                        aria-hidden="true"
                      >
                        →
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Stage Interactive Detail Panel */}
          <div className="mt-7 bg-white rounded-[20px] p-6 sm:p-7 border border-emerald-900/15 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800">
                <span>STAGE {activeStep.step} OF 06</span>
                <span aria-hidden="true">·</span>
                <span>{activeStep.subtitle}</span>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 font-display">
                {activeStep.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {activeStepIndex < FLOW_STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStepIndex((prev) => prev + 1)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-950 bg-[#F2F8F4] hover:bg-emerald-100/80 border border-emerald-900/15 transition-colors cursor-pointer"
                >
                  Next Step ({FLOW_STEPS[activeStepIndex + 1].step}) →
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  onExploreDashboard(activeStep.targetTab, activeStep.openAi)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-all cursor-pointer"
              >
                <span>Test {activeStep.title} in Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: KEY FEATURES — Curated Light Green / Cream Cards */}
      <section
        id="key-features"
        className="py-16 sm:py-22 border-b border-emerald-900/10 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold text-emerald-800 tracking-wide">
                03. Core Capabilities
              </div>
              <h2
                className="mt-1.5 text-2xl sm:text-3xl font-bold text-emerald-950 font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Key Features
              </h2>
              <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
                Every module is built to connect real daily mandi data with predictive analytics and location-aware profit optimization.
              </p>
            </div>
            <button
              onClick={() => onExploreDashboard('dashboard')}
              className="self-start md:self-end inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Explore All Features in Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`rounded-[20px] p-6 border card-hover-lift shadow-xs flex flex-col justify-between ${card.bgClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${card.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        {card.kicker}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-emerald-950">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-emerald-900/10 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Interactive Module</span>
                    <button
                      onClick={() => onExploreDashboard(card.targetTab, card.openAi)}
                      className="font-semibold text-emerald-900 hover:text-emerald-700 inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <span>{card.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: TECHNOLOGY — Compact Architectural Stack Cards */}
      <section
        id="technology"
        className="py-16 sm:py-20 border-b border-emerald-900/10 bg-gradient-to-b from-[#FAF8F2] to-[#EEF6F0] bg-agri-grid"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-emerald-800 tracking-wide">
              04. System Stack &amp; Integrations
            </div>
            <h2
              className="mt-1.5 text-2xl sm:text-3xl font-bold text-emerald-950 font-display tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Technology
            </h2>
            <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
              Engineered with a clean full-stack architecture uniting real-world daily agricultural market data, statistical time-series forecasting, and generative AI.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="bg-white/95 rounded-2xl p-5 border border-emerald-900/12 shadow-xs card-hover-lift flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-emerald-950 truncate">
                        {tech.name}
                      </h3>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-medium text-emerald-800 whitespace-nowrap">
                        {tech.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tech.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: ABOUT SECTION */}
      <section
        id="about"
        className="py-16 sm:py-20 border-b border-emerald-900/10 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-semibold text-emerald-800 tracking-wide">
                05. Academic Project Overview
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-emerald-950 font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                About MandiSense AI
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                MandiSense AI is a college AI/ML project designed to help farmers make data-driven market decisions. Instead of relying on static or hardcoded tables, the system fetches daily commodity records from Farmer.in / Agmarknet through a Node.js backend, runs 7-day time-series forecasting, and calculates distance-aware net returns across Andhra Pradesh APMC markets.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every stage of the platform prioritizes transparency: fetched mandi prices are clearly attributed to <strong className="text-slate-800">Farmer.in / Agmarknet</strong> with their reporting dates, predictions are explicitly labeled as <strong className="text-slate-800">MandiSense ML Forecast</strong>, and browser GPS location is used strictly on user request without substituting fabricated coordinates.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onExploreDashboard('about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View System Architecture in Dashboard →</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-[#EEF7F1] to-[#FAF7EE] rounded-[20px] p-6 sm:p-7 border border-emerald-900/15 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-base">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>Data &amp; Modeling Integrity</span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="pb-3 border-b border-emerald-900/10">
                  <div className="font-semibold text-emerald-950">
                    Real Fetched Market Data
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Connected to <code className="font-mono text-emerald-900">https://farmer.in/api/open/prices.json</code> via backend service with graceful fallback messaging if unavailable.
                  </div>
                </div>
                <div className="pb-3 border-b border-emerald-900/10">
                  <div className="font-semibold text-emerald-950">
                    Distinct ML Forecast Labeling
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Clearly separates reported daily Agmarknet prices from the 7-day Holt-Winters forecast across all cards and charts.
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-950">
                    Grounded Gemini AI Advisory
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Explains market trade-offs in English and Telugu using structured backend context without inventing prices.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2
            className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            Make Better Market Decisions with MandiSense AI
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl mx-auto leading-relaxed">
            Explore latest available daily mandi prices, compare regional APMC markets with distance-adjusted net returns, and inspect 7-day ML price forecasts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onExploreDashboard('dashboard')}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.99] whitespace-nowrap cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-emerald-100/80 border-t border-emerald-900/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-emerald-900/60">
            <div>
              <div className="text-xl font-bold text-white font-display tracking-tight">
                MandiSense AI
              </div>
              <p className="mt-1 text-sm text-emerald-200/80">
                Smarter Markets. Better Decisions for Farmers.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-emerald-200/80">
              <button
                onClick={() => scrollToSection('why-mandisense')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Why MandiSense
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('key-features')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Key Features
              </button>
              <button
                onClick={() => scrollToSection('technology')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Technology
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => onExploreDashboard('dashboard')}
                className="text-emerald-300 font-semibold hover:text-white transition-colors cursor-pointer"
              >
                Open Dashboard →
              </button>
            </nav>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-300/70">
            <div className="flex flex-wrap items-center gap-2">
              <span>Source: Farmer.in / Agmarknet</span>
              <span aria-hidden="true">·</span>
              <span>Latest Available Daily Mandi Data</span>
              <span aria-hidden="true">·</span>
              <span>Forecast: MandiSense ML Forecast</span>
            </div>
            <div>
              College AI/ML Project — Agricultural Market Decision Support System
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
