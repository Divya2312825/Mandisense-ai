import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  CROPS,
  MANDIS,
  calculateMarketInsights,
} from './src/services/marketDataService.ts';
import {
  fetchFarmerInMandiData,
  FARMER_IN_SOURCE_LABEL,
  FARMER_IN_UNAVAILABLE_MESSAGE,
} from './src/services/farmerMandiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/crops', (req, res) => {
  res.json({ crops: CROPS });
});

// Reverse Geocoding endpoint: converts real detected (lat, lng) into place / locality, district, state
app.get('/api/reverse-geocode', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      available: false,
      placeName: null,
      district: null,
      state: null,
      country: null,
      message: 'Place name unavailable',
    });
  }

  // 1. Primary Reverse Geocoder: OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1&accept-language=en`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MandiSenseAI-AgriculturalProject/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data: any = await response.json();
      const addr = data?.address || {};

      const placeName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.neighbourhood ||
        addr.hamlet ||
        addr.county ||
        data?.name ||
        null;

      const rawDistrict =
        addr.state_district ||
        addr.county ||
        addr.city_district ||
        null;

      const district =
        rawDistrict && rawDistrict !== placeName ? rawDistrict : rawDistrict || null;
      const state = addr.state || null;
      const country = addr.country || null;

      if (placeName || district || state) {
        return res.json({
          available: true,
          placeName: placeName || district || state,
          district,
          state,
          country,
          displayName: data?.display_name || null,
        });
      }
    }
  } catch (err) {
    // Fall through to secondary reverse geocoding service
  }

  // 2. Fallback Reverse Geocoder: BigDataCloud Free Reverse Geocode API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lng)}&localityLanguage=en`;

    const response = await fetch(bdcUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data: any = await response.json();
      const placeName = data?.city || data?.locality || null;
      const adminLevels = Array.isArray(data?.localityInfo?.administrative)
        ? data.localityInfo.administrative
        : [];
      const districtEntry = adminLevels.find((a: any) => a?.adminLevel === 5 || a?.adminLevel === 6);
      const district = districtEntry?.name || null;
      const state = data?.principalSubdivision || null;
      const country = data?.countryName || null;

      if (placeName || district || state) {
        return res.json({
          available: true,
          placeName: placeName || district || state,
          district,
          state,
          country,
        });
      }
    }
  } catch (err) {
    // Both services failed
  }

  return res.json({
    available: false,
    placeName: null,
    district: null,
    state: null,
    country: null,
    message: 'Place name unavailable',
  });
});

app.get('/api/locations', (req, res) => {
  const states = Array.from(new Set(MANDIS.map((m) => m.state)));
  const districts = Array.from(new Set(MANDIS.map((m) => m.district)));
  res.json({
    states,
    districts,
    mandis: MANDIS.map((m) => ({
      id: m.id,
      name: m.name,
      district: m.district,
      state: m.state,
      lat: m.lat,
      lng: m.lng,
      grade: m.grade,
      eNamEnabled: m.eNamEnabled,
      primaryCrops: m.primaryCrops,
    })),
  });
});

// External Farmer.in / Agmarknet Mandi Data endpoint (GET & POST)
app.get('/api/mandi-prices', async (req, res) => {
  try {
    const cropId = typeof req.query.cropId === 'string' ? req.query.cropId : undefined;
    const commodity =
      typeof req.query.commodity === 'string'
        ? req.query.commodity
        : typeof req.query.crop === 'string'
        ? req.query.crop
        : undefined;
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;
    const district = typeof req.query.district === 'string' ? req.query.district : undefined;
    const market =
      typeof req.query.market === 'string'
        ? req.query.market
        : typeof req.query.mandi === 'string'
        ? req.query.mandi
        : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const result = await fetchFarmerInMandiData({
      cropId,
      commodity,
      state,
      district,
      market,
      limit,
      offset,
    });

    res.status(result.available ? 200 : 503).json(result);
  } catch (error: any) {
    console.error('Error in GET /api/mandi-prices:', error);
    res.status(503).json({
      available: false,
      source: FARMER_IN_SOURCE_LABEL,
      message: FARMER_IN_UNAVAILABLE_MESSAGE,
      errorReason: error.message,
      records: [],
    });
  }
});

app.post('/api/mandi-prices', async (req, res) => {
  try {
    const { cropId, crop, commodity, state, district, market, mandi, limit, offset } = req.body || {};
    const result = await fetchFarmerInMandiData({
      cropId,
      commodity: commodity || crop,
      state,
      district,
      market: market || mandi,
      limit,
      offset,
    });

    res.status(result.available ? 200 : 503).json(result);
  } catch (error: any) {
    console.error('Error in POST /api/mandi-prices:', error);
    res.status(503).json({
      available: false,
      source: FARMER_IN_SOURCE_LABEL,
      message: FARMER_IN_UNAVAILABLE_MESSAGE,
      errorReason: error.message,
      records: [],
    });
  }
});

app.post('/api/insights', async (req, res) => {
  try {
    const { cropId, commodity, state, district, mandiId, market, userLat, userLng } = req.body || {};

    const parsedLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : null;
    const parsedLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : null;

    const insights = await calculateMarketInsights({
      cropId: cropId || 'chilli',
      commodity,
      state,
      district,
      mandiId,
      market,
      userLat: parsedLat,
      userLng: parsedLng,
    });

    res.json(insights);
  } catch (error: any) {
    console.error('Error in /api/insights:', error);
    res.status(500).json({ error: 'Failed to generate market insights', details: error.message });
  }
});

// Gemini AI Assistant "Ask MandiSense AI" endpoint
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in environment secrets.',
      });
    }

    // Format 30-day historical price summary
    const historyList = Array.isArray(context?.historicalData)
      ? context.historicalData
      : [];
    const histPrices = historyList.map((h: any) => h.price).filter((p: any) => typeof p === 'number');
    const minHist = histPrices.length ? Math.min(...histPrices) : 'N/A';
    const maxHist = histPrices.length ? Math.max(...histPrices) : 'N/A';
    const avgHist = histPrices.length
      ? Math.round(histPrices.reduce((a: number, b: number) => a + b, 0) / histPrices.length)
      : 'N/A';
    const recentHistSlice = historyList
      .slice(-7)
      .map((h: any) => `${h.displayDate || h.date}: ₹${h.price}/Q (Volume: ${h.volume || 'N/A'} bags)`)
      .join('; ');

    // Format 7-day predicted prices day-by-day
    const forecastList = Array.isArray(context?.forecastData)
      ? context.forecastData
      : [];
    const dailyForecastsStr = forecastList.length
      ? forecastList
          .map((f: any) => `${f.dayName || ''} (${f.displayDate || f.date}): Predicted ₹${f.predictedPrice}/Q [Range: ₹${f.lowerBound}-₹${f.upperBound}/Q, Confidence: ${f.confidenceScore}%]`)
          .join('\n  • ')
      : 'No daily forecast breakdown available';

    // Format nearby mandi comparison
    const nearbyList = Array.isArray(context?.allNearbyMandis)
      ? context.allNearbyMandis
      : [];
    const nearbyMandisFormatted = nearbyList.length
      ? nearbyList
          .map((m: any) => {
            const distStr = m.distanceKm != null ? `${m.distanceKm} km` : 'Distance requires GPS';
            const netStr = m.netReturnPerQuintal != null ? `Net Return: ₹${m.netReturnPerQuintal}/Q` : 'Net Return: Requires GPS';
            const isRec = m.name === context?.recommendedMandiName ? ' ★ [BEST RECOMMENDED MARKET]' : '';
            return `• ${m.name} (${m.district || m.state}): Spot ₹${m.currentPrice}/Q, 7d Forecast ₹${m.predictedPrice7d}/Q, Distance: ${distStr}, ${netStr}, Trend: ${m.trend || 'Stable'}${isRec}`;
          })
          .join('\n')
      : 'No nearby mandis comparison available';

    const systemInstruction = `You are the MandiSense AI agricultural market assistant and crop economist for Indian farmers. Give concise, farmer-friendly answers.

ROLE & OBJECTIVES:
You are designed to help farmers understand live crop prices, 7-day ML predictions, and select the optimal nearby mandi based on true net profit after transport costs.
You should give concise, farmer-friendly answers in clear language. Use bold formatting for prices and numbers (e.g. **₹19,800/Q**).

STRICT MANDATORY RULES (ZERO-HALLUCINATION POLICY):
1. STRICT GROUNDING:
   - Gemini MUST NOT invent market prices, distances, mandi data, weather data, or government data.
   - You MUST ONLY use the exact market prices, historical records, forecasts, distances, and mandi statistics provided in the structured context below.
2. MISSING DATA RESPONSE:
   - If the requested information is not available in the supplied application data (e.g. unlisted crops like coffee or vanilla, unknown mandis outside the dataset, historical years not in data, or trader phone numbers), you MUST respond exactly:
     "I don't have that information in the current MandiSense data."
3. PRICE QUERIES ("What is the current price of my selected crop?"):
   - Cite the exact spot rate from the context: **₹${context?.currentPrice || 'N/A'}/Quintal** for **${context?.cropName || 'the selected crop'}** at **${context?.selectedMandiName || 'the selected mandi'}** (${context?.selectedMandiDistrict || ''}, ${context?.state || ''}).
   - Mention the 24-hour change (${context?.change24h != null ? context.change24h + '%' : 'N/A'}) and comparison with the Government MSP (**₹${context?.cropMsp || 'N/A'}/Q**).
4. FORECAST MOVEMENT QUERIES ("Why is the predicted price changing?"):
   - Base your explanation ONLY on the supplied data: cite the 30-day historical price momentum (range: ₹${minHist} to ₹${maxHist}), the 24h change (${context?.change24h != null ? context.change24h + '%' : '0'}%), the current ${context?.trend || 'Stable'} market trend, arrival volume dynamics, and seasonal behavior (${context?.cropSeasonality || 'Seasonal trade'}).
   - Note the predicted 7-day average of **₹${context?.predictedPrice || 'N/A'}/Q** and the peak day if applicable.
   - Do NOT invent external geopolitical, war, or weather disasters not present in the data.
5. MARKET RECOMMENDATION QUERIES ("Which nearby mandi should I consider and why?"):
   - Recommend **${context?.recommendedMandiName || 'the designated recommended mandi'}**.
   - Explain the Net Realization principle: Net Return = Mandi Gross Spot Price - Transport Tariff - Mandi Cess.
   - Explain that even if a local mandi like **${context?.nearestMandiName || 'the nearest market'}** is physically closer (${context?.nearestDistance != null ? context.nearestDistance + ' km' : 'local'}), **${context?.recommendedMandiName || 'the recommended market'}** delivers higher net take-home earnings (**₹${context?.recommendedNetReturn || context?.recommendedGrossPrice || 'N/A'}/Q**), delivering an extra profit advantage of **₹${context?.advantagePerQuintal || 0}/Q** (approx **+₹${context?.advantagePerTruckload || 0}** more per 25-quintal farm truckload).
6. MARKET COMPARISON QUERIES ("Compare the nearby mandis."):
   - Provide a clean, direct comparative summary of all nearby mandis listed in the data, listing their spot prices, distances, and net returns side-by-side.
7. ML PREDICTION EXPLANATION ("Explain the ML prediction in simple words."):
   - Explain simply:
     1. MandiSense AI uses Holt's Double Exponential Smoothing time-series algorithm on the 30-day historical trading prices.
     2. It tracks two dynamics: the baseline price level and the moving momentum trend.
     3. It projects the trend across the next 7 days, factoring in arrival volumes and price elasticity.
     4. It provides statistical confidence bounds (lower and upper price bands) with a confidence score so farmers can judge market risk before deciding when to harvest and transport.
8. GENERAL FARMING/MARKET QUESTIONS:
   - Answer practically using the supplied weather insights (${context?.weatherCondition || 'Partly Sunny'}, ${context?.weatherTemp || 30}°C, rain risk: ${context?.weatherRain || 'Low Risk'}) and post-harvest preservation advisory.
9. MULTILINGUAL SUPPORT:
   - If the user asks in Telugu or asks for a Telugu summary, provide a warm, respectful Telugu explanation alongside English (e.g. "రైతు సోదరులారా...").

STRUCTURED DASHBOARD CONTEXT SUPPLIED BY MANDISENSE:
• SELECTED CROP:
  - Commodity Name: ${context?.cropName || 'Not selected'}
  - Regional / Telugu Name: ${context?.cropTeluguName || 'N/A'}
  - Category: ${context?.cropCategory || 'N/A'}
  - Minimum Support Price (MSP): ₹${context?.cropMsp || 'N/A'}/Quintal
  - Seasonality: ${context?.cropSeasonality || 'N/A'}

• SELECTED LOCATION:
  - State: ${context?.state || 'Andhra Pradesh'}
  - District: ${context?.district || 'Guntur'}
  - Mandi Name: ${context?.selectedMandiName || 'Not specified'}
  - Mandi District: ${context?.selectedMandiDistrict || ''}
  - User Geolocation: ${context?.userArea || 'Location unavailable in preview'}
  - Geolocation Status: ${context?.hasUserLocation ? 'Browser GPS Verified' : 'Location unavailable in preview'}

• CURRENT MARKET SPOT PRICE & TREND:
  - Current Spot Price: ₹${context?.currentPrice || 'N/A'}/Quintal
  - 24-Hour Price Change: ${context?.change24h != null ? context.change24h + '%' : 'N/A'}
  - Market Trend: ${context?.trend || 'Neutral/Stable'}
  - Government MSP Comparison: ₹${context?.cropMsp || 'N/A'}/Quintal (Current rate is ${context?.currentPrice && context?.cropMsp ? (context.currentPrice >= context.cropMsp ? `₹${context.currentPrice - context.cropMsp}/Q above MSP` : `₹${context.cropMsp - context.currentPrice}/Q below MSP`) : 'N/A'})

• 30-DAY HISTORICAL MARKET RECORDS:
  - 30-Day Range: Lowest ₹${minHist}/Q, Highest ₹${maxHist}/Q, Average ₹${avgHist}/Q
  - Recent Trading History: ${recentHistSlice || 'N/A'}

• 7-DAY ML PREDICTED FORECAST:
  - 7-Day Average Predicted Price: ₹${context?.predictedPrice || 'N/A'}/Quintal
  - Peak Predicted Price: ₹${context?.peakPrice || 'N/A'}/Quintal (Expected on ${context?.peakDate || 'N/A'})
  - Day-by-Day Forecast:
  • ${dailyForecastsStr}

• RECOMMENDED BEST MARKET (OPTIMAL NET PROFIT):
  - Recommended Mandi: ${context?.recommendedMandiName || 'N/A'} (${context?.recommendedMandiDistrict || 'N/A'})
  - Distance: ${context?.recommendedDistance != null ? context.recommendedDistance + ' km' : 'Requires GPS'}
  - Gross Spot Price: ₹${context?.recommendedGrossPrice || context?.currentPrice || 'N/A'}/Quintal
  - Transport Cost Estimate: ${context?.recommendedTransportCost != null ? '₹' + context.recommendedTransportCost + '/Q' : 'Requires GPS'}
  - Expected Net Return: ${context?.recommendedNetReturn != null ? '₹' + context.recommendedNetReturn + '/Quintal' : 'Gross rate (Requires GPS for transport deduction)'}
  - Profit Advantage over Closest Mandi: ₹${context?.advantagePerQuintal || 0}/Q extra (+₹${context?.advantagePerTruckload || 0} on a 25-quintal truckload)
  - Recommendation Reason: ${context?.whyRecommended || 'Highest net realization'}
  - Net Profit Formula: ${context?.formula || 'Net Return = Mandi Price - [Distance × ₹2.40/km] - ₹18 Cess'}

• CLOSEST / NEAREST LOCAL MANDI:
  - Mandi Name: ${context?.nearestMandiName || 'N/A'} (${context?.nearestMandiDistrict || 'N/A'})
  - Distance: ${context?.nearestDistance != null ? context.nearestDistance + ' km' : 'Requires GPS'}
  - Spot Price: ₹${context?.nearestCurrentPrice || 'N/A'}/Quintal
  - Net Return: ${context?.nearestNetReturn != null ? '₹' + context.nearestNetReturn + '/Quintal' : 'N/A'}

• ALL NEARBY MANDIS COMPARISON:
${nearbyMandisFormatted}

• LOCAL WEATHER & ROAD HAULAGE CONDITIONS:
  - Weather: ${context?.weatherCondition || 'Partly Sunny'} (${context?.weatherTemp || 31}°C, Humidity: ${context?.weatherHumidity || 58}%)
  - Rain Probability: ${context?.weatherRain || 'Low Risk'}
  - Road / Transport Advisory: ${context?.weatherAdvisory || 'Safe for road transport'}

Answer the farmer's question directly and concisely based strictly on the above data.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h && h.text && (h.role === 'user' || h.role === 'model')) {
          contents.push({
            role: h.role,
            parts: [{ text: h.text }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Attempt generation with automatic retry on temporary high demand (503/429)
    let response: any = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            topP: 0.85,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        const isTransient =
          err?.status === 503 ||
          err?.message?.includes('503') ||
          err?.message?.includes('UNAVAILABLE') ||
          err?.message?.includes('high demand');
        if (isTransient && attempt < 2) {
          // Brief pause before single retry
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
        throw err;
      }
    }

    const answer = response?.text?.trim() || "I don't have that information in the current MandiSense data.";
    res.json({ reply: answer });
  } catch (error: any) {
    console.error('Gemini API chat error:', error);
    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');

    if (isRateLimit) {
      return res.status(429).json({
        error: 'The MandiSense AI advisory model is currently busy handling market queries. Please wait a few moments and click Retry.',
        details: 'Rate limit reached (429). Please retry shortly.',
      });
    }

    const isHighDemand =
      error?.status === 503 ||
      error?.message?.includes('503') ||
      error?.message?.includes('UNAVAILABLE') ||
      error?.message?.includes('high demand');

    if (isHighDemand) {
      return res.status(503).json({
        error: 'The advisory service is experiencing temporary peak demand. Please click Retry.',
        details: 'Model high demand (503). Please retry.',
      });
    }

    res.status(500).json({
      error: 'Unable to connect to MandiSense AI advisory model. Please check your network connection and click Retry.',
      details: error.message,
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 MandiSense AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
