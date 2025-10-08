import React from 'react';
import type { PastHistoryData } from '../types';
import SpeechToTextButton from './SpeechToTextButton';

interface PastHistoryStepProps {
    data: PastHistoryData;
    onUpdate: (data: PastHistoryData) => void;
}

const PAST_CONDITIONS: { key: keyof Omit<PastHistoryData, 'other'>; label: string }[] = [
    { key: 'hasDiabetes', label: 'Diabetes Mellitus' },
    { key: 'hasTB', label: 'Tuberculosis (TB)' },
    { key: 'hasThyroid', label: 'Thyroid Disorders' },
];

const PastHistoryStep: React.FC<PastHistoryStepProps> = ({ data, onUpdate }) => {
    
    const handleCheckboxChange = (conditionKey: keyof Omit<PastHistoryData, 'other'>) => {
        onUpdate({ ...data, [conditionKey]: !data[conditionKey] });
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...data, other: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Past History</h2>
            
            <div className="space-y-4">
                <label className="block font-semibold text-slate-700">
                    Does the patient have a history of the following?
                </label>
                <div className="space-y-2">
                    {PAST_CONDITIONS.map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`past_${key}`}
                                checked={data[key]}
                                onChange={() => handleCheckboxChange(key)}
                                className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor={`past_${key}`} className="ml-2 text-slate-700">{label}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="otherPastHistory" className="block font-semibold text-slate-700 mb-2">
                    Other Significant Past History (Please Specify)
                </label>
                <div className="relative">
                    <textarea
                        id="otherPastHistory"
                        rows={8}
                        value={data.other}
                        onChange={handleOtherChange}
                        placeholder="Mention any other significant past illnesses, hospitalizations, surgeries, trauma, or allergies."
                        className="w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                    />
                    <SpeechToTextButton 
                        currentText={data.other}
                        onTranscript={(transcript) => onUpdate({ ...data, other: transcript })}
                    />
                </div>
            </div>
        </div>
    );
};

export default PastHistoryStep;