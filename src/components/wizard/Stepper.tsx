import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number; // 1 to 6
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, label: 'Category' },
  { step: 2, label: 'Sub-Product' },
  { step: 3, label: 'Date & Cycle' },
  { step: 4, label: 'Collect Files' }
];

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full bg-white border border-[#e2e8f0] rounded-[20px] p-4 mb-6 shadow-xs">
      <div className="flex items-center justify-between max-w-5xl mx-auto relative">
        {STEPS.map((s, index) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;
          const isClickable = s.step < currentStep && onStepClick;

          return (
            <React.Fragment key={s.step}>
              {/* Step item */}
              <div
                onClick={() => isClickable && onStepClick(s.step)}
                className={`flex flex-col items-center group relative z-10 ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/20'
                      : isActive
                      ? 'bg-[#119db0] text-white ring-4 ring-[#119db0]/20 shadow-lg shadow-[#119db0]/30'
                      : 'bg-[#f0f4f8] text-[#475569] border border-[#e2e8f0]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : s.step}
                </div>
                <span
                  className={`text-xs font-semibold mt-2 transition-colors ${
                    isActive
                      ? 'text-[#119db0]'
                      : isCompleted
                      ? 'text-[#10b981]'
                      : 'text-[#475569]'
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-1 rounded-full bg-[#e2e8f0] relative -top-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#119db0] to-[#10b981] transition-all duration-500"
                    style={{
                      width: currentStep > s.step ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
