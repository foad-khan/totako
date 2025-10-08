
import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    maxStepReached: number;
    onStepClick: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, maxStepReached, onStepClick }) => {
    const steps = [
        "Demographics",
        "Chief Complaint & HOP",
        "Past History",
        "Personal History",
        "Family History",
        "Summary"
    ];

    return (
        <div>
            <p className="text-sm font-medium text-slate-500 mb-2">
                Step {currentStep} of {totalSteps}
            </p>
            <div className="flex items-center">
                {steps.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    const isClickable = stepNumber <= maxStepReached;
                    
                    return (
                        <React.Fragment key={label}>
                            <button
                                type="button"
                                onClick={() => onStepClick(stepNumber)}
                                disabled={!isClickable}
                                className={`flex items-center text-left p-1 -m-1 rounded-lg transition-colors ${
                                    isClickable ? 'hover:bg-slate-100' : 'cursor-not-allowed'
                                }`}
                                aria-label={`Go to step ${stepNumber}: ${label}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors ${
                                        isCurrent ? 'bg-teal-600 text-white' : isCompleted ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </div>
                                <span className={`ml-2 text-xs sm:text-sm font-medium hidden md:inline transition-colors ${isCurrent ? 'text-teal-700' : 'text-slate-500'}`}>{label}</span>
                            </button>
                            {stepNumber < totalSteps && (
                                <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;