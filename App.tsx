
import React, { useState, useCallback, useEffect } from 'react';
import { PatientHistory } from './types';
import StepIndicator from './components/StepIndicator';
import DemographicsStep from './components/DemographicsStep';
import ChiefComplaintStep from './components/ChiefComplaintStep';
import PastHistoryStep from './components/PastHistoryStep';
import PersonalHistoryStep from './components/PersonalHistoryStep';
import FamilyHistoryStep from './components/FamilyHistoryStep';
import SummaryStep from './components/SummaryStep';

const TOTAL_STEPS = 6;

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [maxStepReached, setMaxStepReached] = useState(1);
    const [patientHistory, setPatientHistory] = useState<PatientHistory>({
        demographics: {
            name: '',
            age: '',
            sex: 'Male',
            occupation: '',
            address: '',
            attendantName: '',
            phoneNumber: '',
            bloodGroup: 'A+',
            education: '',
            maritalStatus: 'Single',
            familyIncome: '',
            socioEconomicStatus: 'Lower-Middle',
            religion: '',
        },
        chiefComplaints: [{ 
            id: crypto.randomUUID(), 
            complaint: '', 
            duration: { years: '', months: '', days: '' },
            hop: {
                site: '',
                onset: '',
                character: '',
                progression: '',
                progressionOther: '',
                timingAndDuration: '',
                rateFrequency: '',
                associativeFactor: '',
                aggravatingFactor: '',
                relievingFactor: '',
                other: '',
            }
        }],
        pastHistory: {
            hasDiabetes: false,
            hasTB: false,
            hasThyroid: false,
            other: '',
        },
        personalHistory: {
            diet: 'Vegetarian',
            sleep: '',
            appetite: '',
            bladder: '',
            bowel: '',
            habits: [],
            other: '',
        },
        familyHistory: {
            hasDiabetes: false,
            hasTB: false,
            hasThyroid: false,
            other: '',
        },
    });

    useEffect(() => {
        setMaxStepReached(prev => Math.max(prev, currentStep));
    }, [currentStep]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    const updateHistory = useCallback(<K extends keyof PatientHistory>(section: K, data: PatientHistory[K]) => {
        setPatientHistory(prev => ({
            ...prev,
            [section]: data,
        }));
    }, []);

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    
    const goToStep = (step: number) => {
        if (step <= maxStepReached) {
            setCurrentStep(step);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <DemographicsStep data={patientHistory.demographics} onUpdate={(data) => updateHistory('demographics', data)} />;
            case 2:
                return <ChiefComplaintStep 
                    chiefComplaints={patientHistory.chiefComplaints}
                    onUpdate={(data) => updateHistory('chiefComplaints', data)}
                 />;
            case 3:
                return <PastHistoryStep data={patientHistory.pastHistory} onUpdate={(data) => updateHistory('pastHistory', data)} />;
            case 4:
                return <PersonalHistoryStep data={patientHistory.personalHistory} onUpdate={(data) => updateHistory('personalHistory', data)} />;
            case 5:
                return <FamilyHistoryStep data={patientHistory.familyHistory} onUpdate={(data) => updateHistory('familyHistory', data)} />;
            case 6:
                return <SummaryStep history={patientHistory} />;
            default:
                return <div>Unknown Step</div>;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl font-bold text-teal-700">AI Patient History</h1>
                <p className="text-slate-600 mt-2">A guided tool for structured patient history taking, powered by AI.</p>
            </header>
            
            <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <StepIndicator 
                        currentStep={currentStep} 
                        totalSteps={TOTAL_STEPS} 
                        maxStepReached={maxStepReached}
                        onStepClick={goToStep}
                    />
                </div>

                <div className="p-6 md:p-8">
                    {renderStep()}
                </div>

                <div className="flex justify-between p-6 bg-slate-50 rounded-b-xl border-t border-slate-200">
                    {currentStep > 1 ? (
                        <button
                            onClick={prevStep}
                            className="px-6 py-2 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                        >
                            Previous
                        </button>
                    ) : (
                        <div /> 
                    )}
                    {currentStep < TOTAL_STEPS && (
                        <button
                            onClick={nextStep}
                            className="px-6 py-2 text-base font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            Next
                        </button>
                    )}
                </div>
            </main>

            <footer className="w-full max-w-4xl text-center mt-8 text-slate-500 text-sm">
                <p>Made with ❤️ by Abdullah Soad.</p>
            </footer>
        </div>
    );
};

export default App;