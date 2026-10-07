import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Award,
  BarChart3,
  CheckCircle2,
  Database,
  TrendingUp,
} from 'lucide-react';
import { MlEvaluationReport, SupervisedMlPredictionInfo } from '../types';

interface MlPerformanceSectionProps {
  mlEvaluation?: MlEvaluationReport;
  supervisedMlPrediction?: SupervisedMlPredictionInfo;
  cropName?: string;
}

export const MlPerformanceSection: React.FC<MlPerformanceSectionProps> = ({
  mlEvaluation: propMlEvaluation,
  supervisedMlPrediction,
  cropName,
}) => {
  const [selectedTestIdx, setSelectedTestIdx] = useState<number | null>(null);
  const [fetchedEvaluation, setFetchedEvaluation] = useState<MlEvaluationReport | undefined>(
    undefined
  );

  useEffect(() => {
    if (!propMlEvaluation) {
      fetch('/api/ml-evaluation')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.models)) {
            setFetchedEvaluation(data);
          }
        })
        .catch(() => {
          // Ignore fetch error; component safely returns null if unavailable
        });
    }
  }, [propMlEvaluation]);

  const mlEvaluation = propMlEvaluation || fetchedEvaluation;

  if (!mlEvaluation || !Array.isArray(mlEvaluation.models)) {
    return null;
  }

  // Include ONLY models that were successfully trained
  const trainedModels = mlEvaluation.models.filter((m) => m.status === 'trained');
  if (trainedModels.length === 0) {
    return null;
  }

  const bestModel = mlEvaluation.bestModel;
  const maxRmse = Math.max(...trainedModels.map((m) => m.rmse), 1);
  const testPredictions = Array.isArray(mlEvaluation.sampleTestPredictions)
    ? mlEvaluation.sampleTestPredictions
    : [];

  // Helper to get the best model's predicted price for a test observation
  const getBestModelPredForRecord = (rec: (typeof testPredictions)[number]): number => {
    if (bestModel.modelName.toLowerCase().includes('xgboost')) {
      return rec.xgboostPredicted;
    }
    if (bestModel.modelName.toLowerCase().includes('random forest')) {
      return rec.randomForestPredicted;
    }
    return rec.linearRegressionPredicted;
  };

  const maxTestPrice =
    testPredictions.length > 0
      ? Math.max(
          ...testPredictions.flatMap((t) => [
            t.actualModalPrice,
            getBestModelPredForRecord(t),
          ]),
          1
        )
      : 1;

  return (
    <section className="bg-white rounded-[20px] p-5 sm:p-6 border border-emerald-900/12 shadow-sm shadow-emerald-950/5">
      {/* Section Header & Selected Best Model Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Supervised ML Model Evaluation &amp; Benchmark Results
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" />
              {mlEvaluation.totalRecords} Real Records ({mlEvaluation.trainCount} Train /{' '}
              {mlEvaluation.testCount} Test)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluated on held-out test set ({mlEvaluation.splitRatio}) • Target:{' '}
            <code className="font-mono font-semibold text-slate-700">
              {mlEvaluation.targetVariable}
            </code>{' '}
            (₹/Quintal) • Selection Criterion: {mlEvaluation.selectionCriterion}
          </p>
        </div>

        {/* Highlighted Best Model Callout */}
        {bestModel && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border border-emerald-700/60 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">
                ★ Best Selected Regression Model
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{bestModel.modelName}</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700">
                  RMSE: ₹{bestModel.rmse.toLocaleString('en-IN')} · R²: {bestModel.r2.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Supervised ML Prediction Status Banner (when available) */}
      {supervisedMlPrediction && supervisedMlPrediction.available && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#F4F9F6] border border-emerald-900/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                Live Cross-Sectional Modal Price Estimate ({supervisedMlPrediction.bestModelName})
                {cropName ? ` — ${cropName}` : ''}
              </div>
              <div className="text-[11px] text-slate-600">
                Computed from live Farmer.in / Agmarknet features using the training preprocessor
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {supervisedMlPrediction.linearRegressionPrediction !== null && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                Linear: <strong>₹{supervisedMlPrediction.linearRegressionPrediction.toLocaleString('en-IN')}/Q</strong>
              </span>
            )}
            {supervisedMlPrediction.randomForestPrediction !== null && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                Random Forest: <strong>₹{supervisedMlPrediction.randomForestPrediction.toLocaleString('en-IN')}/Q</strong>
              </span>
            )}
            {supervisedMlPrediction.xgboostPrediction !== null && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900 text-white font-bold">
                ★ {supervisedMlPrediction.bestModelName}: ₹
                {supervisedMlPrediction.predictedModalPrice?.toLocaleString('en-IN')}/Q
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Model Comparison Table + RMSE Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Model Metrics Comparison Table (7 cols) */}
        <div className="lg:col-span-7 overflow-x-auto rounded-2xl border border-emerald-900/12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F7F4] border-b border-emerald-900/12 text-[11px] uppercase tracking-wider text-emerald-950 font-bold">
                <th className="py-3 px-4">Regression Model</th>
                <th className="py-3 px-3 text-right">MAE (₹/Q)</th>
                <th className="py-3 px-3 text-right">MSE</th>
                <th className="py-3 px-3 text-right">RMSE (₹/Q)</th>
                <th className="py-3 px-4 text-right">R² Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {trainedModels.map((model) => {
                const isBest = bestModel && model.modelName === bestModel.modelName;
                return (
                  <tr
                    key={model.modelName}
                    className={
                      isBest
                        ? 'bg-emerald-50/70 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{model.modelName}</span>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-800 text-amber-300">
                            <CheckCircle2 className="w-3 h-3" />
                            BEST
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {model.role}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                      ₹{model.mae.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {model.mse.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-900">
                      ₹{model.rmse.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold ${
                          isBest
                            ? 'bg-emerald-800 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {model.r2.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. RMSE Model Comparison Visualization (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-900/12 bg-[#F8FBF9] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Test RMSE Comparison (Lower is Better)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Unit: ₹ / Quintal</span>
            </div>

            <div className="space-y-3.5 mt-2">
              {trainedModels.map((model) => {
                const isBest = bestModel && model.modelName === bestModel.modelName;
                const widthPct = Math.max(12, Math.round((model.rmse / maxRmse) * 100));
                return (
                  <div key={model.modelName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {model.modelName}
                        {isBest && (
                          <span className="text-[10px] font-extrabold text-emerald-700">
                            ★ Lowest Error
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        RMSE: ₹{model.rmse.toLocaleString('en-IN')} · R²: {(model.r2 * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200/80 rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          isBest
                            ? 'bg-gradient-to-r from-emerald-700 to-teal-500'
                            : model.modelName.toLowerCase().includes('random forest')
                            ? 'bg-teal-600/75'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-900/10 flex items-center justify-between text-[11px] text-slate-600">
            <span>Features: {mlEvaluation.numericalFeatures.length} Numerical + {mlEvaluation.categoricalFeatures.length} Categorical</span>
            <span className="font-mono font-semibold text-emerald-900">
              {mlEvaluation.encodedFeatureCount} Encoded Columns
            </span>
          </div>
        </div>
      </div>

      {/* 3. Actual vs Predicted Visualization on Held-Out Test Set (Rendered ONLY if real test predictions exist) */}
      {testPredictions.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Held-Out Test Set: Actual vs. {bestModel.modelName} Predicted Modal Price
              </h4>
              <p className="text-[11px] text-slate-500">
                Comparing actual Agmarknet modal prices against {bestModel.modelName} test predictions across {testPredictions.length} held-out test records (click or hover a bar pair to inspect).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-slate-800 inline-block" />
                Actual Modal Price
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                Predicted ({bestModel.modelName})
              </span>
            </div>
          </div>

          {/* Interactive Grouped Bar Chart */}
          <div className="bg-[#F8FBF9] rounded-2xl p-4 border border-emerald-900/10">
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-[repeat(15,minmax(0,1fr))] gap-2 items-end h-40 pt-4">
              {testPredictions.map((item, idx) => {
                const predVal = getBestModelPredForRecord(item);
                const actualHeightPct = Math.max(
                  8,
                  Math.round((item.actualModalPrice / maxTestPrice) * 100)
                );
                const predHeightPct = Math.max(
                  8,
                  Math.round((predVal / maxTestPrice) * 100)
                );
                const isSelected = selectedTestIdx === idx;

                return (
                  <button
                    key={item.recordId}
                    type="button"
                    onClick={() => setSelectedTestIdx(isSelected ? null : idx)}
                    onMouseEnter={() => setSelectedTestIdx(idx)}
                    className={`group flex flex-col items-center h-full justify-end rounded-lg p-1 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-100/70' : 'hover:bg-emerald-50'
                    }`}
                    title={`${item.commodity} (${item.market}): Actual ₹${item.actualModalPrice}/Q vs Predicted ₹${predVal}/Q`}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-28">
                      <div
                        className="w-2.5 sm:w-3 bg-slate-800 rounded-t-xs transition-all"
                        style={{ height: `${actualHeightPct}%` }}
                      />
                      <div
                        className="w-2.5 sm:w-3 bg-emerald-500 rounded-t-xs transition-all"
                        style={{ height: `${predHeightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 truncate w-full text-center mt-1.5">
                      {item.commodity.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Test Observation Detail Strip */}
            {selectedTestIdx !== null && testPredictions[selectedTestIdx] && (
              <div className="mt-3 pt-3 border-t border-emerald-900/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="font-semibold text-slate-800">
                  <span className="font-mono text-emerald-800 mr-1.5">
                    [{testPredictions[selectedTestIdx].recordId}]
                  </span>
                  {testPredictions[selectedTestIdx].commodity} —{' '}
                  <span className="text-slate-600">
                    {testPredictions[selectedTestIdx].market}, {testPredictions[selectedTestIdx].state} ({testPredictions[selectedTestIdx].date})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-mono">
                  <span className="text-slate-800">
                    Actual: <strong>₹{testPredictions[selectedTestIdx].actualModalPrice.toLocaleString('en-IN')}/Q</strong>
                  </span>
                  <span className="text-emerald-800">
                    {bestModel.modelName}:{' '}
                    <strong>
                      ₹{getBestModelPredForRecord(testPredictions[selectedTestIdx]).toLocaleString('en-IN')}/Q
                    </strong>
                  </span>
                  <span className="text-slate-600">
                    RF: ₹{testPredictions[selectedTestIdx].randomForestPredicted.toLocaleString('en-IN')}/Q
                  </span>
                  <span className="text-slate-500">
                    LR: ₹{testPredictions[selectedTestIdx].linearRegressionPredicted.toLocaleString('en-IN')}/Q
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
