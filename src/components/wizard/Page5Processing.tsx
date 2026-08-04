import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, ShieldCheck, X, Check } from 'lucide-react';
import { SubProduct } from '../../types';

interface Page5ProcessingProps {
  subProduct: SubProduct;
  targetDate: string;
  targetCycle: string;
  onProcessingComplete: (viewReport?: boolean) => void;
}

const RECON_STAGES = [
  { id: 'fetching', label: 'Fetching Reports' },
  { id: 'uploading', label: 'Uploading Files' },
  { id: 'processing', label: 'Processing' },
  { id: 'matching', label: 'Matching' },
  { id: 'completed', label: 'Completed' }
];

const STEPS = [
  'Normalizing schemas and transaction IDs...',
  'Matching 2-Way / 3-Way transaction logs...',
  'Computing financial discrepancies and commission variances...',
  'Generating consolidated output datasets...'
];

export const Page5Processing: React.FC<Page5ProcessingProps> = ({
  subProduct,
  targetDate,
  targetCycle,
  onProcessingComplete
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Step completion timeline
    const timers: NodeJS.Timeout[] = [];

    // Progress bar ticker
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 220);

    // Step 0 done at 500ms
    timers.push(
      setTimeout(() => {
        setCompletedSteps([0]);
      }, 500)
    );

    // Step 1 done at 1100ms
    timers.push(
      setTimeout(() => {
        setCompletedSteps([0, 1]);
      }, 1100)
    );

    // Step 2 done at 1800ms
    timers.push(
      setTimeout(() => {
        setCompletedSteps([0, 1, 2]);
      }, 1800)
    );

    // Step 3 done at 2400ms - all complete, show initiation modal
    timers.push(
      setTimeout(() => {
        setCompletedSteps([0, 1, 2, 3]);
        setShowCompletionModal(true);
      }, 2400)
    );

    return () => {
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
    };
  }, []);

  // 5-second countdown timer once modal opens
  useEffect(() => {
    if (!showCompletionModal) return;

    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onProcessingComplete(false); // auto-close modal and navigate to first page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showCompletionModal, onProcessingComplete]);

  // Determine active stage
  let activeStageIdx = 2; // Processing
  if (progressPercent >= 40 && progressPercent < 80) activeStageIdx = 3; // Matching
  if (progressPercent >= 100) activeStageIdx = 4; // Completed

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 relative">
      {/* Reconciliation Completion Popup Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#e2e8f0] relative space-y-5 text-center">
            {/* Close button (✕) returns to first page */}
            <button
              onClick={() => onProcessingComplete(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0f4f8] hover:bg-[#e2e8f0] text-[#475569] hover:text-[#1b2a3e] flex items-center justify-center transition cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] px-3 py-1 rounded-full border border-[#10b981]/30">
                Reconciliation Initiated
              </span>
              <h3 className="text-xl font-bold text-[#1b2a3e] mt-2">
                Reconciliation Initiated Successfully!
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Reconciliation process for <span className="font-semibold text-[#1b2a3e]">{subProduct.name}</span> ({targetDate} — {targetCycle}) has been initiated. This popup will automatically close and return to the first page in <span className="font-bold text-[#10b981] text-sm">{countdown}s</span>. Completed results are available in the <span className="font-semibold text-[#119db0]">Report</span> section.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onProcessingComplete(false)}
                className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#0d9668] text-white font-bold text-xs shadow-lg shadow-[#10b981]/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to First Page ({countdown}s)</span>
              </button>
              <button
                onClick={() => onProcessingComplete(true)}
                className="w-full py-3 rounded-xl bg-[#1b2a3e] hover:bg-[#253650] text-white font-bold text-xs shadow-lg shadow-[#1b2a3e]/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View in Report Section</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 9: Progress Visibility & Stage Stepper */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {RECON_STAGES.map((stg, idx) => {
            const isCompleted = idx < activeStageIdx;
            const isCurrent = idx === activeStageIdx;

            return (
              <div key={stg.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                      : isCurrent
                      ? 'bg-[#1b2a3e] text-white shadow-md'
                      : 'bg-[#f0f4f8] text-[#475569]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-[#10b981] text-white'
                        : isCurrent
                        ? 'bg-[#119db0] text-white'
                        : 'bg-[#e2e8f0] text-[#475569]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <span>{stg.label}</span>
                </div>
                {idx < RECON_STAGES.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 rounded-full ${isCompleted ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Processing Card */}
      <div className="glass-card p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#119db0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1b2a3e] to-[#119db0] text-white flex items-center justify-center shadow-xl shadow-[#119db0]/20">
            <Cpu className="w-10 h-10 animate-pulse" />
          </div>
          <Loader2 className="w-24 h-24 text-[#119db0] animate-spin absolute -inset-2 stroke-[1.5]" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1b2a3e] tracking-tight">
            Processing Reconciliation
          </h2>
          <p className="text-xs font-semibold text-[#119db0] mt-1 uppercase tracking-wider">
            {subProduct.name} — {targetDate} ({targetCycle})
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="w-full bg-[#e2e8f0] h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#119db0] via-[#23c5da] to-[#10b981] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-[#475569]">
            <span>Executing Multi-Way Matching Rules</span>
            <span className="text-[#119db0]">{progressPercent}%</span>
          </div>
        </div>

        {/* Sequential Step Status Indicators */}
        <div className="space-y-3 text-left max-w-md mx-auto bg-[#f0f4f8] p-5 rounded-2xl border border-[#e2e8f0]">
          {STEPS.map((stepText, idx) => {
            const isDone = completedSteps.includes(idx);
            return (
              <div
                key={idx}
                className="flex items-center gap-3 text-xs font-medium transition-all duration-300"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#e2e8f0] text-[#475569]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={
                    isDone ? 'text-[#1b2a3e] font-semibold' : 'text-[#475569]'
                  }
                >
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-[#475569] flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-4 h-4 text-[#10b981]" />
          <span>Running background rule evaluation & discrepancy calculations</span>
        </div>
      </div>
    </div>
  );
};
