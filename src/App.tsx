import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { LoadingSequenceModal } from './components/LoadingSequenceModal';
import { MetricCards } from './components/MetricCards';
import { PriceCharts } from './components/PriceCharts';
import { NearbyMandisTable } from './components/NearbyMandisTable';
import { InteractiveMapArea } from './components/InteractiveMapArea';
import { MarketAdvisorCard } from './components/MarketAdvisorCard';
import { AskGeminiAI } from './components/AskGeminiAI';
import { AskMandiSenseInline } from './components/AskMandiSenseInline';
import { WeatherInsightsCard } from './components/WeatherInsightsCard';
import { AboutProjectView } from './components/AboutProjectView';
import { LandingPage } from './components/LandingPage';
import { MlPerformanceSection } from './components/MlPerformanceSection';
import { CropInfo, MandiEvaluation, InsightsResponse, UserLocationState } from './types';
import { Menu, X, Sparkles, Sprout } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Filter selections
  const [crops, setCrops] = useState<CropInfo[]>([]);
  const [states, setStates] = useState<string[]>(['Andhra Pradesh']);
  const [districts, setDistricts] = useState<string[]>([]);
  const [mandisList, setMandisList] = useState<{ id: string; name: string; district: string }[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string>('chilli');
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedMandiId, setSelectedMandiId] = useState<string>('');

  // Location state: Strictly null by default. No fake coordinates!
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    lat: null,
    lng: null,
    isCustomUserLocation: false,
    approximateArea: 'Location unavailable in preview',
    status: 'idle',
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Insights response
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState<boolean>(false);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const [cropsRes, locationsRes] = await Promise.all([
          fetch('/api/crops'),
          fetch('/api/locations'),
        ]);

        const cropsData = await cropsRes.json();
        const locationsData = await locationsRes.json();

        if (cropsData.crops) setCrops(cropsData.crops);
        if (locationsData.states) setStates(locationsData.states);
        if (locationsData.districts) setDistricts(locationsData.districts);
        if (locationsData.mandis) setMandisList(locationsData.mandis);

        // Initial fetch: pass null for coordinates. No hardcoded fake user coordinates!
        fetchInsights('chilli', 'Andhra Pradesh', 'all', '', null, null);
      } catch (err) {
        console.error('Failed to initialize applet data:', err);
      }
    }
    initData();
  }, []);

  const fetchInsights = async (
    cropId: string,
    state: string,
    district: string,
    mandiId: string,
    userLat?: number | null,
    userLng?: number | null
  ) => {
    setIsLoading(true);
    try {
      const latToSend = typeof userLat === 'number' ? userLat : userLocation.lat;
      const lngToSend = typeof userLng === 'number' ? userLng : userLocation.lng;

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: cropId || selectedCropId,
          state: state || selectedState,
          district: district === 'all' ? undefined : district,
          mandiId: mandiId || undefined,
          userLat: latToSend,
          userLng: lngToSend,
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter change handlers that immediately update state AND re-fetch insights!
  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    fetchInsights(cropId, selectedState, selectedDistrict, selectedMandiId, userLocation.lat, userLocation.lng);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    fetchInsights(selectedCropId, state, selectedDistrict, selectedMandiId, userLocation.lat, userLocation.lng);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedMandiId(''); // Reset selected mandi when district changes
    fetchInsights(selectedCropId, selectedState, district, '', userLocation.lat, userLocation.lng);
  };

  const handleMandiChange = (mandiId: string) => {
    setSelectedMandiId(mandiId);
    fetchInsights(selectedCropId, selectedState, selectedDistrict, mandiId, userLocation.lat, userLocation.lng);
  };

  const handleGetInsightsClick = () => {
    setIsSequenceModalOpen(true);
  };

  const handleSequenceModalComplete = () => {
    setIsSequenceModalOpen(false);
    fetchInsights(
      selectedCropId,
      selectedState,
      selectedDistrict,
      selectedMandiId,
      userLocation.lat,
      userLocation.lng
    );
  };

  // Prominent Geolocation Handler: Triggered ONLY on user click!
  const handleUseMyLocation = () => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      const msg = 'Location unavailable in preview';
      setLocationError(msg);
      setUserLocation((prev) => ({
        ...prev,
        lat: null,
        lng: null,
        isCustomUserLocation: false,
        status: 'unavailable',
        statusMessage: msg,
      }));
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords: UserLocationState = {
          lat,
          lng,
          isCustomUserLocation: true,
          approximateArea: `Verified GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          accuracyMeters: Math.round(position.coords.accuracy),
          status: 'granted',
        };
        setUserLocation(newCoords);
        setLocationError(null);
        // Recalculate all distances and market insights with verified GPS coordinates!
        fetchInsights(
          selectedCropId,
          selectedState,
          selectedDistrict,
          selectedMandiId,
          lat,
          lng
        );
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Location unavailable in preview';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable in preview environment.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        setLocationError(msg);
        setUserLocation((prev) => ({
          ...prev,
          lat: null,
          lng: null,
          isCustomUserLocation: false,
          status: 'unavailable',
          statusMessage: msg,
          approximateArea: 'Location unavailable in preview',
        }));
        // Keep the rest of the application completely functional!
        fetchInsights(
          selectedCropId,
          selectedState,
          selectedDistrict,
          selectedMandiId,
          null,
          null
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  };

  const handleUseSampleLocation = () => {
    // Reset to location unavailable (no fake user coordinates)
    setUserLocation({
      lat: null,
      lng: null,
      isCustomUserLocation: false,
      approximateArea: 'Location unavailable in preview',
      status: 'idle',
    });
    setLocationError(null);
    fetchInsights(
      selectedCropId,
      selectedState,
      selectedDistrict,
      selectedMandiId,
      null,
      null
    );
  };

  const handleMandiSelect = (mandiId: string) => {
    setSelectedMandiId(mandiId);
    fetchInsights(
      selectedCropId,
      selectedState,
      selectedDistrict,
      mandiId,
      userLocation.lat,
      userLocation.lng
    );
  };

  const handleExploreDashboard = (initialTab?: NavTab, openAiDrawer?: boolean) => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
    setViewMode('dashboard');
    if (openAiDrawer) {
      setIsAiDrawerOpen(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLanding = () => {
    setIsMobileSidebarOpen(false);
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onExploreDashboard={handleExploreDashboard}
        insights={insights}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Loading Sequence Modal */}
      <LoadingSequenceModal
        isOpen={isSequenceModalOpen}
        onComplete={handleSequenceModalComplete}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onGoToLanding={handleGoToLanding}
          cropName={insights?.crop.name}
          recommendedMandi={insights?.recommendedMandi.name.split('(')[0]}
          advantageAmount={insights?.advisorExplanation.advantagePerQuintal}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-emerald-950 z-10">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              onGoToLanding={handleGoToLanding}
              cropName={insights?.crop.name}
              recommendedMandi={insights?.recommendedMandi.name.split('(')[0]}
              advantageAmount={insights?.advisorExplanation.advantagePerQuintal}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-emerald-950 text-white border-b border-emerald-900">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={handleGoToLanding}
            className="flex items-center gap-1.5"
          >
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-base tracking-tight">
              Mandi<span className="text-emerald-400">Sense</span> AI
            </span>
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-emerald-800 text-amber-300"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Global Header */}
        <Header
          userLocation={userLocation}
          isLocating={isLocating}
          onUseMyLocation={handleUseMyLocation}
          onUseSampleLocation={handleUseSampleLocation}
          locationError={locationError}
          onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
          onGoToLanding={handleGoToLanding}
          onRefreshData={() =>
            fetchInsights(
              selectedCropId,
              selectedState,
              selectedDistrict,
              selectedMandiId,
              userLocation.lat,
              userLocation.lng
            )
          }
          dataAvailable={insights ? insights.dataAvailable !== false : true}
          sourceLabel={insights?.sourceLabel || 'Source: Farmer.in / Agmarknet'}
          commodityUpdatedDate={insights?.commodityUpdatedDate}
          apiUpdatedDate={insights?.apiUpdatedDate}
        />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#EFF6F2] via-[#F6F9F7] to-[#FAF8F4]">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <FilterBar
              crops={crops}
              states={states}
              districts={districts}
              mandis={mandisList}
              selectedCropId={selectedCropId}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedMandiId={selectedMandiId}
              onChangeCrop={handleCropChange}
              onChangeState={handleStateChange}
              onChangeDistrict={handleDistrictChange}
              onChangeMandi={handleMandiChange}
              onGetInsights={handleGetInsightsClick}
              isLoading={isLoading}
            />

            {insights && insights.dataAvailable === false && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm font-semibold flex items-center justify-between">
                <span>Mandi data temporarily unavailable</span>
                <button
                  onClick={() =>
                    fetchInsights(
                      selectedCropId,
                      selectedState,
                      selectedDistrict,
                      selectedMandiId,
                      userLocation.lat,
                      userLocation.lng
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
                >
                  Retry Fetch
                </button>
              </div>
            )}

            {/* TAB: DASHBOARD */}
            {currentTab === 'dashboard' && insights && (
              <>
                {/* 1. Four Key KPI Cards */}
                <MetricCards
                  crop={insights.crop}
                  selectedMandi={insights.selectedMandi}
                  recommendedMandi={insights.recommendedMandi}
                  extraAdvantagePerQuintal={insights.advisorExplanation.advantagePerQuintal}
                />

                {/* 2. Market Price Analytics */}
                <PriceCharts
                  crop={insights.crop}
                  history={insights.selectedMandi.history}
                  forecast={insights.selectedMandi.forecast}
                  nearbyMandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                />

                {/* 2b. Supervised ML Performance & Benchmark Evaluation */}
                <MlPerformanceSection
                  mlEvaluation={insights.mlEvaluation}
                  supervisedMlPrediction={insights.selectedMandi.supervisedMlPrediction}
                  cropName={insights.crop.name}
                />

                {/* 3. Best Market Advisor Recommendation & Logic */}
                <MarketAdvisorCard
                  explanation={insights.advisorExplanation}
                  recommendedMandi={insights.recommendedMandi}
                  nearestMandi={insights.nearestMandi}
                  cropName={insights.crop.name}
                />

                {/* 4. Location & Nearby Mandi Comparison (Table + Interactive Map) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NearbyMandisTable
                    mandis={insights.allNearbyMandis}
                    recommendedMandiId={insights.recommendedMandi.id}
                    selectedMandiId={insights.selectedMandi.id}
                    onSelectMandi={handleMandiSelect}
                  />

                  <InteractiveMapArea
                    userLocation={insights.userLocation}
                    nearbyMandis={insights.allNearbyMandis}
                    recommendedMandiId={insights.recommendedMandi.id}
                    selectedMandiId={insights.selectedMandi.id}
                    onSelectMandi={handleMandiSelect}
                  />
                </div>

                {/* 5. Ask MandiSense AI (Prominently visible directly on dashboard) */}
                <AskMandiSenseInline
                  insights={insights}
                  onOpenFullDrawer={() => setIsAiDrawerOpen(true)}
                />
              </>
            )}

            {/* TAB: CROP PRICES */}
            {currentTab === 'prices' && insights && (
              <div className="space-y-6">
                <MetricCards
                  crop={insights.crop}
                  selectedMandi={insights.selectedMandi}
                  recommendedMandi={insights.recommendedMandi}
                  extraAdvantagePerQuintal={insights.advisorExplanation.advantagePerQuintal}
                />
                <PriceCharts
                  crop={insights.crop}
                  history={insights.selectedMandi.history}
                  forecast={insights.selectedMandi.forecast}
                  nearbyMandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                />
                <NearbyMandisTable
                  mandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                  selectedMandiId={insights.selectedMandi.id}
                  onSelectMandi={handleMandiSelect}
                />
              </div>
            )}

            {/* TAB: PRICE PREDICTION */}
            {currentTab === 'prediction' && insights && (
              <div className="space-y-6">
                <MetricCards
                  crop={insights.crop}
                  selectedMandi={insights.selectedMandi}
                  recommendedMandi={insights.recommendedMandi}
                  extraAdvantagePerQuintal={insights.advisorExplanation.advantagePerQuintal}
                />
                <PriceCharts
                  crop={insights.crop}
                  history={insights.selectedMandi.history}
                  forecast={insights.selectedMandi.forecast}
                  nearbyMandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                />
                <MlPerformanceSection
                  mlEvaluation={insights.mlEvaluation}
                  supervisedMlPrediction={insights.selectedMandi.supervisedMlPrediction}
                  cropName={insights.crop.name}
                />
              </div>
            )}

            {/* TAB: BEST MARKET ADVISOR */}
            {currentTab === 'advisor' && insights && (
              <div className="space-y-6">
                <MarketAdvisorCard
                  explanation={insights.advisorExplanation}
                  recommendedMandi={insights.recommendedMandi}
                  nearestMandi={insights.nearestMandi}
                  cropName={insights.crop.name}
                />
                <InteractiveMapArea
                  userLocation={insights.userLocation}
                  nearbyMandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                  selectedMandiId={insights.selectedMandi.id}
                  onSelectMandi={handleMandiSelect}
                />
              </div>
            )}

            {/* TAB: MARKET COMPARISON */}
            {currentTab === 'comparison' && insights && (
              <div className="space-y-6">
                <NearbyMandisTable
                  mandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                  selectedMandiId={insights.selectedMandi.id}
                  onSelectMandi={handleMandiSelect}
                />
                <InteractiveMapArea
                  userLocation={insights.userLocation}
                  nearbyMandis={insights.allNearbyMandis}
                  recommendedMandiId={insights.recommendedMandi.id}
                  selectedMandiId={insights.selectedMandi.id}
                  onSelectMandi={handleMandiSelect}
                />
              </div>
            )}

            {/* TAB: WEATHER INSIGHTS */}
            {currentTab === 'weather' && insights && (
              <div className="space-y-6">
                <WeatherInsightsCard
                  weather={insights.weatherInsights}
                  cropName={insights.crop.name}
                />
              </div>
            )}

            {/* TAB: ABOUT */}
            {currentTab === 'about' && (
              <AboutProjectView />
            )}
          </div>
        </main>
      </div>

      {/* Floating Ask Gemini AI Assistant Drawer */}
      <AskGeminiAI
        insights={insights}
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
}
