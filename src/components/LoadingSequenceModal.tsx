import React, { useEffect, useState } from 'react';
import {
  Wheat,
  Database,
  LineChart,
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface LoadingSequenceModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STAGES = [
  { text: 'Analyzing crop...', icon: Wheat, duration: 450 },
  { text: 'Fetching market data...', icon: Database, duration: 550 },
  { text: 'Running price prediction...', icon: LineChart, duration: 600 },
  { text: 'AI analyzing markets...', icon: Brain, duration: 600 },
  { text: 'Insights ready ✓', icon: CheckCircle2, duration: 400 },
];

export const LoadingSequenceModal: React.FC<LoadingSequenceModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const runStage = (index: number) => {
      if (index >= STAGES.length) {
        timeoutId = setTimeout(() => {
          onComplete();
        }, 300);
        return;
      }
      setCurrentStageIndex(index);
      timeoutId = setTimeout(() => {
        runStage(index + 1);
      }, STAGES[index].duration);
    };

    runStage(0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const currentStage = STAGES[Math.min(currentStageIndex, STAGES.length - 1)];
  const CurrentIcon = currentStage.icon;
  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 relative overflow-hidden text-center">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400"></div>

        {/* Animated Icon Container */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-inner mb-5 relative">
          <CurrentIcon className="w-10 h-10 transition-transform duration-300 transform scale-110" />
          {currentStageIndex < STAGES.length - 1 && (
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          )}
          {currentStageIndex === STAGES.length - 1 && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Current Stage Text */}
        <h3 className="text-xl font-bold text-slate-800 transition-all min-h-[32px]">
          {currentStage.text}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          MandiSense AI pipeline: Time-series forecasting & market evaluation
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-6 p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Sequence Steps List */}
        <div className="space-y-2 text-left bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stage.text}
                className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-emerald-100/70 text-emerald-900 font-semibold'
                    : isCompleted
                    ? 'text-slate-600 line-through opacity-70'
                    : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <stage.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{stage.text}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 text-emerald-600 animate-spin flex-shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
