import React from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ currentStep, totalSteps, label }) => {
  return (
    <div className="w-full max-w-md mx-auto px-8 pt-10 pb-6 bg-transparent">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-[1000] text-indigo-600 uppercase tracking-[0.3em] mb-1">
              Fase {currentStep} de {totalSteps}
            </p>
            <h3 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase italic">
              {label}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-[1000] text-slate-900 tracking-tighter">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 h-2 w-full">
          {[...Array(totalSteps)].map((_, i) => (
            <div 
              key={i}
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                i + 1 < currentStep 
                  ? 'bg-indigo-600 w-full opacity-30' 
                  : i + 1 === currentStep 
                    ? 'bg-indigo-600 w-[150%] shadow-[0_0_12px_rgba(79,70,229,0.4)]' 
                    : 'bg-slate-200 w-full'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;