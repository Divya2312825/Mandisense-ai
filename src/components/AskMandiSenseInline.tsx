import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Volume2,
  VolumeX,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { InsightsResponse } from '../types';

interface AskMandiSenseInlineProps {
  insights: InsightsResponse | null;
  onOpenFullDrawer?: () => void;
}

export const AskMandiSenseInline: React.FC<AskMandiSenseInlineProps> = ({
  insights,
}) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!insights) return null;

  // The 5 core test prompts + Telugu summary
  const quickPills = [
    'What is the current price of my selected crop?',
    'Why is the predicted price changing?',
    'Which nearby mandi should I consider and why?',
    'Compare the nearby mandis.',
    'Explain the ML prediction in simple words.',
    'తెలుగులో వివరించండి (Telugu summary)',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLastFailedQuery(null);

    try {
      // Build comprehensive structured context from live dashboard data
      const context = {
        cropName: insights.crop.name,
        cropTeluguName: insights.crop.teluguName,
        cropCategory: insights.crop.category,
        cropMsp: insights.crop.baseMsp,
        cropSeasonality: insights.crop.seasonality,
        state: insights.selectedMandi.state,
        district: insights.selectedMandi.district,
        selectedMandiName: insights.selectedMandi.name,
        selectedMandiDistrict: insights.selectedMandi.district,
        hasUserLocation: Boolean(insights.userLocation.isCustomUserLocation),
        userArea: insights.userLocation.approximateArea,
        userLat: insights.userLocation.lat,
        userLng: insights.userLocation.lng,
        currentPrice: insights.selectedMandi.currentPrice,
        change24h: insights.selectedMandi.change24h,
        trend: insights.selectedMandi.trend,
        historicalData: insights.selectedMandi.history || [],
        forecastData: insights.selectedMandi.forecast || [],
        predictedPrice: insights.selectedMandi.predictedPrice7d,
        peakPrice: insights.selectedMandi.forecastPeak?.predictedPrice,
        peakDate: `${insights.selectedMandi.forecastPeak?.dayName || ''} (${insights.selectedMandi.forecastPeak?.displayDate || ''})`,
        recommendedMandiName: insights.recommendedMandi.name,
        recommendedMandiDistrict: insights.recommendedMandi.district,
        recommendedGrossPrice: insights.recommendedMandi.currentPrice,
        recommendedDistance: insights.recommendedMandi.distanceKm,
        recommendedTransportCost: insights.recommendedMandi.transportCostEstimate,
        recommendedNetReturn: insights.recommendedMandi.netReturnPerQuintal,
        whyRecommended: insights.advisorExplanation.whyRecommended,
        advantagePerQuintal: insights.advisorExplanation.advantagePerQuintal,
        advantagePerTruckload: insights.advisorExplanation.advantagePerTruckload,
        formula: insights.advisorExplanation.formula,
        nearestMandiName: insights.nearestMandi.name,
        nearestMandiDistrict: insights.nearestMandi.district,
        nearestDistance: insights.nearestMandi.distanceKm,
        nearestCurrentPrice: insights.nearestMandi.currentPrice,
        nearestNetReturn: insights.nearestMandi.netReturnPerQuintal,
        allNearbyMandis: insights.allNearbyMandis.map((m) => ({
          name: m.name,
          district: m.district,
          state: m.state,
          currentPrice: m.currentPrice,
          predictedPrice7d: m.predictedPrice7d,
          distanceKm: m.distanceKm,
          transportCostEstimate: m.transportCostEstimate,
          netReturnPerQuintal: m.netReturnPerQuintal,
          trend: m.trend,
        })),
        weatherCondition: insights.weatherInsights.condition,
        weatherTemp: insights.weatherInsights.tempCurrent,
        weatherHumidity: insights.weatherInsights.humidity,
        weatherRain: insights.weatherInsights.rainProbabilityNext3Days,
        weatherAdvisory: insights.weatherInsights.cropPreservationAdvisory,
      };

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: q,
          context,
        }),
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        throw new Error(
          'AI advisory service returned a non-JSON response. Please wait a moment and click Retry.'
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to get advisory response (HTTP ${res.status})`);
      }

      if (!data?.reply || typeof data.reply !== 'string') {
        throw new Error('AI advisory service returned an empty reply. Please click Retry.');
      }

      setResponse(data.reply);
      if (!textToAsk) {
        setQuery('');
      }
    } catch (err: any) {
      console.error('AskMandiSenseInline error:', err);
      const friendlyErr =
        err.message || 'Unable to reach MandiSense AI advisory model. Please check network connection.';
      setErrorMessage(friendlyErr);
      setLastFailedQuery(q);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100/90 shadow-sm shadow-emerald-950/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Ask MandiSense AI
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Grounded Market Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Get intelligent answers about crop rates, ML price forecasts, and recommended mandis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-medium text-slate-600">
            Grounded on active mandi rates (Zero Hallucination)
          </span>
        </div>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Inquiries (Click to Ask):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleAsk(pill)}
              disabled={isLoading}
              className="text-xs font-medium bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl transition-all active:scale-95 text-left disabled:opacity-50"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert Bar with Retry */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {lastFailedQuery && (
            <button
              onClick={() => handleAsk(lastFailedQuery)}
              disabled={isLoading}
              className="flex items-center gap-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2.5 mb-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask MandiSense AI about ${insights.crop.name} price trends or market recommendations...`}
          disabled={isLoading}
          className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 active:scale-95"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isLoading ? 'Analyzing...' : 'Ask AI'}</span>
        </button>
      </form>

      {/* AI Response Display Card */}
      {response && !errorMessage && (
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 animate-fade-in text-xs sm:text-sm text-slate-800">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/60">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>MandiSense AI Analysis:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeak(response)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 p-1 rounded"
                title={isSpeaking ? 'Stop playback' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            </div>
          </div>

          <div className="whitespace-pre-line leading-relaxed space-y-2">
            {response.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
