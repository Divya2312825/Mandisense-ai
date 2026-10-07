import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  X,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Wheat,
} from 'lucide-react';
import { InsightsResponse } from '../types';

interface AskGeminiAIProps {
  insights: InsightsResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  isError?: boolean;
  canRetry?: boolean;
  originalPrompt?: string;
}

export const AskGeminiAI: React.FC<AskGeminiAIProps> = ({
  insights,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previousCropIdRef = useRef<string | null>(null);
  const previousMandiIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, errorMessage]);

  // Initial welcome greeting when session first opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && insights) {
      previousCropIdRef.current = insights.crop.id;
      previousMandiIdRef.current = insights.selectedMandi.id;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `Namaskaram! I am **MandiSense AI**, your agricultural market and price advisor.

I am loaded with the current dashboard data for **${insights.crop.name}** (${insights.crop.teluguName}):
• Current Spot Price: **₹${insights.selectedMandi.currentPrice.toLocaleString('en-IN')}/Q** at **${insights.selectedMandi.name}**
• 7-Day ML Forecast: **₹${insights.selectedMandi.predictedPrice7d.toLocaleString('en-IN')}/Q** (${insights.selectedMandi.trend} trend)
• Recommended Best Market: **${insights.recommendedMandi.name}** (Net take-home: **₹${(insights.recommendedMandi.netReturnPerQuintal ?? insights.recommendedMandi.currentPrice).toLocaleString('en-IN')}/Q**)

Ask me about crop prices, 7-day forecast reasons, mandi comparisons, or why a market is recommended!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, insights]);

  // Detect when user changes crop or mandi in the dashboard and notify session
  useEffect(() => {
    if (insights && messages.length > 0) {
      const currentCropId = insights.crop.id;
      const currentMandiId = insights.selectedMandi.id;

      if (
        (previousCropIdRef.current && previousCropIdRef.current !== currentCropId) ||
        (previousMandiIdRef.current && previousMandiIdRef.current !== currentMandiId)
      ) {
        previousCropIdRef.current = currentCropId;
        previousMandiIdRef.current = currentMandiId;

        setMessages((prev) => [
          ...prev,
          {
            id: `ctx-${Date.now()}`,
            sender: 'system',
            text: `🌾 Dashboard context updated to **${insights.crop.name}** (${insights.crop.teluguName}) at **${insights.selectedMandi.name}** (Spot: ₹${insights.selectedMandi.currentPrice.toLocaleString('en-IN')}/Q). The assistant will ground answers on this crop.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [insights]);

  // Stop speech if drawer closes
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    setLastFailedPrompt(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) {
      setInputText('');
    }
    setIsLoading(true);

    try {
      // Build comprehensive structured context from current session data
      const context = insights
        ? {
            // Selected Crop Details
            cropName: insights.crop.name,
            cropTeluguName: insights.crop.teluguName,
            cropCategory: insights.crop.category,
            cropMsp: insights.crop.baseMsp,
            cropSeasonality: insights.crop.seasonality,

            // Geographic & Selected Mandi
            state: insights.selectedMandi.state,
            district: insights.selectedMandi.district,
            selectedMandiName: insights.selectedMandi.name,
            selectedMandiDistrict: insights.selectedMandi.district,

            // User Geolocation
            hasUserLocation: Boolean(insights.userLocation.isCustomUserLocation),
            userArea: insights.userLocation.approximateArea,
            userLat: insights.userLocation.lat,
            userLng: insights.userLocation.lng,

            // Current Spot Price & Trend
            currentPrice: insights.selectedMandi.currentPrice,
            change24h: insights.selectedMandi.change24h,
            trend: insights.selectedMandi.trend,

            // 30-Day Historical Price Data
            historicalData: insights.selectedMandi.history || [],

            // 7-Day Predicted Prices & Breakdown
            forecastData: insights.selectedMandi.forecast || [],
            predictedPrice: insights.selectedMandi.predictedPrice7d,
            peakPrice: insights.selectedMandi.forecastPeak?.predictedPrice,
            peakDate: `${insights.selectedMandi.forecastPeak?.dayName || ''} (${insights.selectedMandi.forecastPeak?.displayDate || ''})`,

            // Recommended Market & Economic Advantage
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

            // Closest / Nearest Mandi
            nearestMandiName: insights.nearestMandi.name,
            nearestMandiDistrict: insights.nearestMandi.district,
            nearestDistance: insights.nearestMandi.distanceKm,
            nearestCurrentPrice: insights.nearestMandi.currentPrice,
            nearestNetReturn: insights.nearestMandi.netReturnPerQuintal,

            // All Nearby Mandis Comparison
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

            // Weather & Road Haulage
            weatherCondition: insights.weatherInsights.condition,
            weatherTemp: insights.weatherInsights.tempCurrent,
            weatherHumidity: insights.weatherInsights.humidity,
            weatherRain: insights.weatherInsights.rainProbabilityNext3Days,
            weatherAdvisory: insights.weatherInsights.cropPreservationAdvisory,
          }
        : null;

      // Include recent multi-turn session history for context preservation
      const historyPayload = messages
        .filter((m) => (m.sender === 'user' || m.sender === 'ai') && !m.isError)
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          context,
          history: historyPayload,
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
        throw new Error(data?.error || `Failed to fetch AI advice (HTTP ${res.status})`);
      }

      if (!data?.reply || typeof data.reply !== 'string') {
        throw new Error('AI advisory service returned an empty reply. Please click Retry.');
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const friendlyError =
        err.message || 'Unable to connect to MandiSense AI. Please check your network and retry.';
      setErrorMessage(friendlyError);
      setLastFailedPrompt(textToSend);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ **Advisory Connection Notice**: ${friendlyError}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          canRetry: true,
          originalPrompt: textToSend,
        },
      ]);
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Example prompts required by testing guidelines
  const quickPills = [
    'What is the current price of my selected crop?',
    'Why is the predicted price changing?',
    'Which nearby mandi should I consider and why?',
    'Compare the nearby mandis.',
    'Explain the ML prediction in simple words.',
    'తెలుగులో వివరించండి (Telugu summary)',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-emerald-200 flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-300 text-emerald-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight">Ask MandiSense AI</span>
              <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 font-medium">
              Grounded Market Advisor & Crop Economist
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-xl transition-colors"
          title="Close AI Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grounding Notice Badge */}
      <div className="bg-emerald-50/90 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Strictly grounded on active mandi records. Zero price hallucination.</span>
        </div>
        {insights?.crop && (
          <span className="font-semibold text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded text-[10px]">
            {insights.crop.name}
          </span>
        )}
      </div>

      {/* Global Error Banner with Retry */}
      {errorMessage && lastFailedPrompt && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="truncate">Question failed: {errorMessage}</span>
          </div>
          <button
            onClick={() => handleSendMessage(lastFailedPrompt)}
            disabled={isLoading}
            className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-md text-xs transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="flex items-center justify-center my-2"
              >
                <div className="bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Wheat className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.isError ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {msg.isError ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.isError
                    ? 'bg-amber-50 border border-amber-200 text-amber-950'
                    : isAi
                    ? 'bg-white border border-emerald-100 text-slate-800'
                    : 'bg-emerald-700 text-white rounded-tr-none'
                }`}
              >
                {/* Formatted Message Content */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Inline Retry Button for Failed Messages */}
                {msg.canRetry && msg.originalPrompt && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200 flex justify-end">
                    <button
                      onClick={() => handleSendMessage(msg.originalPrompt)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md transition-colors shadow-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry This Question
                    </button>
                  </div>
                )}

                {/* Footer with Timestamp and Action Buttons for AI */}
                {!msg.isError && (
                  <div
                    className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] ${
                      isAi
                        ? 'border-slate-100 text-slate-500'
                        : 'border-emerald-600 text-emerald-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {isAi && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          className="hover:text-emerald-700 transition-colors p-0.5"
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-emerald-700 transition-colors p-0.5"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Analyzing market data & running crop forecast...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Pills (Matching Requirements) */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-2">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Inquiries (Click to Ask):</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pill)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-left transition-colors truncate max-w-full active:scale-95"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white border-t border-emerald-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask about ${insights?.crop.name || 'crop'} rates, ML forecast, or best mandi...`}
            disabled={isLoading}
            className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30 transition-all flex-shrink-0 active:scale-95"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
