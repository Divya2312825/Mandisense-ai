import React from 'react';
import {
  Layers,
  Cpu,
  Database,
  MapPin,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  GitBranch,
  BookOpen,
  Award,
  Terminal,
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  const pipelineSteps = [
    {
      title: '1. React Dashboard (Client UI)',
      desc: 'Interactive UI with Tailwind CSS, animated cards, SVG charts, and permission-based Geolocation API.',
      tech: 'React 19 + TypeScript + Tailwind CSS',
      icon: Code2,
      badge: 'Frontend',
    },
    {
      title: '2. Express Backend API Gateway',
      desc: 'Orchestrates endpoints (/api/crops, /api/locations, /api/insights, /api/ai-chat).',
      tech: 'Node.js Express + TSX Server',
      icon: Terminal,
      badge: 'Middleware',
    },
    {
      title: '3. Farmer.in / Agmarknet Feed & Haversine Engine',
      desc: 'Fetches daily mandi prices via https://farmer.in/api/open/prices.json + Great-Circle Haversine distance matrix calculator.',
      tech: 'Farmer.in / Agmarknet + Haversine (±0.1 km)',
      icon: MapPin,
      badge: 'Data & Spatial Core',
    },
    {
      title: '4. ML Time-Series Forecasting',
      desc: 'Holt-Winters double exponential smoothing with trend, seasonality, and arrival-elasticity.',
      tech: 'Time-Series Forecast (7-Day Horizon)',
      icon: Cpu,
      badge: 'Machine Learning',
    },
    {
      title: '5. Economic Net Realization Optimizer',
      desc: 'Calculates Net Profit = Mandi Price - (Distance × Rate) - Handling Fees to choose optimal yard.',
      tech: 'Mathematical Profit Optimization',
      icon: Award,
      badge: 'Economic Logic',
    },
    {
      title: '6. Gemini 3.8 Flash AI Assistant',
      desc: 'Grounded natural language Q&A providing actionable advisory in English and Telugu.',
      tech: '@google/genai SDK (gemini-3.8-flash)',
      icon: Sparkles,
      badge: 'Generative AI',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-bold border border-emerald-600/50 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span>B.Tech CSE Capstone Project Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            MandiSense AI: Technical System Architecture
          </h2>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            A full-stack agricultural decision support system designed to solve the price discovery and market selection dilemma faced by Indian smallholder farmers.
          </p>

          <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap gap-4 text-xs font-mono text-emerald-300">
            <span>Flow: React UI → Backend API → ML + Spatial + Gemini AI → Actionable Results</span>
          </div>
        </div>
      </div>

      {/* End-to-End Pipeline Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-600" />
          <span>Full-Stack Pipeline & Data Flow</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          How raw farmer inputs travel through the mathematical, spatial, and generative AI layers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {step.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] font-mono text-emerald-700 font-semibold">
                  {step.tech}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mathematical & Algorithmic Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-emerald-100/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>1. Haversine Distance Formula</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Computes the great-circle distance between the farmer&apos;s GPS coordinates <code className="text-slate-800 font-mono">(lat₁, lon₁)</code> and candidate APMC mandis <code className="text-slate-800 font-mono">(lat₂, lon₂)</code>:
          </p>
          <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
            d = 2R × arcsin(√[sin²(Δlat/2) + cos(lat₁)cos(lat₂)sin²(Δlon/2)])
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Accounts for the Earth&apos;s curvature with R = 6,371 km for high-precision regional transport calculations.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-100/90 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>2. Net Profit Optimization Formula</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Prevents farmers from travelling excessive distances for deceptive high nominal prices:
          </p>
          <div className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
            Net Return (₹/Q) = P_mandi - (Distance_km × T_rate) - C_handling
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Where <code className="font-mono text-slate-700">T_rate</code> is the transport tariff per quintal per km and <code className="font-mono text-slate-700">C_handling</code> is mandi weighing and cess charges.
          </p>
        </div>
      </div>
    </div>
  );
};
