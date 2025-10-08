import React from 'react';
import type { FamilyHistory } from '../types';
import SpeechToTextButton from './SpeechToTextButton';

interface FamilyHistoryStepProps {
    data: FamilyHistory;
    onUpdate: (data: FamilyHistory) => void;
}

const FAMILY_CONDITIONS: { key: keyof Omit<FamilyHistory, 'other'>; label: string }[] = [
    { key: 'hasDiabetes', label: 'Diabetes Mellitus' },
    { key: 'hasTB', label: 'Tuberculosis (TB)' },
    { key: 'hasThyroid', label: 'Thyroid Disorders' },
];

const FamilyHistoryStep: React.FC<FamilyHistoryStepProps> = ({ data, onUpdate }) => {
    
    const handleCheckboxChange = (conditionKey: keyof Omit<FamilyHistory, 'other'>) => {
        onUpdate({ ...data, [conditionKey]: !data[conditionKey] });
    };

    const handleOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...data, other: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Family History</h2>
            
            <div className="space-y-4">
                <label className="block font-semibold text-slate-700">
                    Is there a history of the following in the family?
                </label>
                <div className="space-y-2">
                    {FAMILY_CONDITIONS.map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                id={key}
                                checked={data[key]}
                                onChange={() => handleCheckboxChange(key)}
                                className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor={key} className="ml-2 text-slate-700">{label}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="otherFamilyHistory" className="block font-semibold text-slate-700 mb-2">
                    Other Significant Family History
                </label>
                <div className="relative">
                    <textarea
                        id="otherFamilyHistory"
                        rows={6}
                        value={data.other}
                        onChange={handleOtherChange}
                        placeholder="Mention any other significant hereditary diseases (e.g., Hypertension, Coronary Artery Disease, Cancers) or history of similar illness in the family."
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

export default FamilyHistoryStep;