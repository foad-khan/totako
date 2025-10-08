import React, { useState } from 'react';
import { generateHOPQuestions } from '../services/geminiService';
import Loader from './Loader';
import type { ChiefComplaint } from '../types';
import SpeechToTextButton from './SpeechToTextButton';
import TextToSpeechButton from './TextToSpeechButton';

interface ChiefComplaintStepProps {
    chiefComplaints: ChiefComplaint[];
    onUpdate: (value: ChiefComplaint[]) => void;
}

const HOP_FIELDS = [
    { id: 'site', label: 'Site', placeholder: 'e.g., Right iliac fossa', type: 'text' },
    { id: 'onset', label: 'Onset', type: 'select', options: ['', 'Acute (Min to hr)', 'Sub-Acute (Days)', 'Chronic/Insidious (Weeks to Months)'] },
    { id: 'character', label: 'Character', placeholder: 'e.g., Aching, burning, sharp', type: 'text' },
    { id: 'progression', label: 'Progression', type: 'select', options: ['', 'Gradually Deteriorating', 'Getting Better', 'Remaining the same', 'Remissions', 'Exacerbations', 'Other'] },
    { id: 'timingAndDuration', label: 'Timing / Duration of Episodes', placeholder: 'e.g., Continuous, intermittent', type: 'text' },
    { id: 'rateFrequency', label: 'Rate / Frequency', placeholder: 'e.g., 3 episodes per day', type: 'text' },
    { id: 'associativeFactor', label: 'Associative Factors', placeholder: 'e.g., Nausea, vomiting, fever', type: 'textarea' },
    { id: 'aggravatingFactor', label: 'Aggravating Factors', placeholder: 'e.g., Movement, eating', type: 'textarea' },
    { id: 'relievingFactor', label: 'Relieving Factors', placeholder: 'e.g., Rest, medication', type: 'textarea' },
    { id: 'other', label: 'Other Details', placeholder: 'Any other relevant details about this complaint', type: 'textarea' },
];


const ChiefComplaintStep: React.FC<ChiefComplaintStepProps> = ({ chiefComplaints, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [openComplaintId, setOpenComplaintId] = useState<string | null>(chiefComplaints.length > 0 ? chiefComplaints[0].id : null);

    const updateComplaint = (id: string, updatedData: Partial<ChiefComplaint>) => {
        const newComplaints = chiefComplaints.map(c => c.id === id ? { ...c, ...updatedData } : c);
        onUpdate(newComplaints);
    };

    const handleComplaintTextChange = (id: string, value: string) => {
        updateComplaint(id, { complaint: value });
    };
    
    const handleDurationChange = (id: string, unit: 'years' | 'months' | 'days', value: string) => {
        const complaintToUpdate = chiefComplaints.find(c => c.id === id);
        if (!complaintToUpdate) return;
        
        const numericValue = value.replace(/[^0-9]/g, '');
        const newDuration = { ...complaintToUpdate.duration, [unit]: numericValue };
        const newComplaints = chiefComplaints.map(c => c.id === id ? { ...c, duration: newDuration } : c);

        const durationToDays = (duration: ChiefComplaint['duration']): number => {
            const years = parseInt(duration.years, 10) || 0;
            const months = parseInt(duration.months, 10) || 0;
            const days = parseInt(duration.days, 10) || 0;
            return (years * 365) + (months * 30) + days;
        };

        const sortedComplaints = newComplaints.sort((a, b) => {
            return durationToDays(b.duration) - durationToDays(a.duration);
        });

        onUpdate(sortedComplaints);
    };

    const handleAddComplaint = () => {
        const newId = crypto.randomUUID();
        onUpdate([...chiefComplaints, { 
            id: newId, 
            complaint: '', 
            duration: { years: '', months: '', days: '' },
            hop: {
                site: '', onset: '', character: '', progression: '', progressionOther: '',
                timingAndDuration: '', rateFrequency: '', associativeFactor: '',
                aggravatingFactor: '', relievingFactor: '', other: '',
            }
        }]);
        setOpenComplaintId(newId); // Open the new complaint's HOP
    };

    const handleRemoveComplaint = (id: string) => {
        const newComplaints = chiefComplaints.filter((c) => c.id !== id);
        onUpdate(newComplaints);
        if (openComplaintId === id) {
            setOpenComplaintId(newComplaints.length > 0 ? newComplaints[0].id : null);
        }
    };
    
    const handleHopChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const complaintToUpdate = chiefComplaints.find(c => c.id === id);
        if (!complaintToUpdate) return;
        
        const { name, value } = e.target;
        const newHopData = { ...complaintToUpdate.hop, [name]: value };

        if (name === 'progression' && value !== 'Other') {
            newHopData.progressionOther = '';
        }

        updateComplaint(id, { hop: newHopData });
    };

    const handleGenerateQuestions = async () => {
        const formatDuration = (duration: ChiefComplaint['duration']) => {
            const parts = [];
            const years = parseInt(duration.years, 10) || 0;
            const months = parseInt(duration.months, 10) || 0;
            const days = parseInt(duration.days, 10) || 0;
    
            if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
            if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
            if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
            
            if (parts.length === 0) return '';
            
            return ` for ${parts.join(', ')}`;
        };

        const activeComplaints = chiefComplaints
            .filter(c => c.complaint.trim() !== '')
            .map(c => `${c.complaint.trim()}${formatDuration(c.duration)}`)
            .join(', ');

        if (!activeComplaints) {
            setError("Please enter at least one chief complaint.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setQuestions([]);
        try {
            const result = await generateHOPQuestions(activeComplaints);
            setQuestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const hasComplaints = chiefComplaints.some(c => c.complaint.trim() !== '');
    const inputStyles = "w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50";
    const labelStyles = "block font-semibold text-slate-700 mb-1 text-sm";


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Chief Complaints & HOP</h2>
            
            <div className="space-y-4">
                <label className="block font-semibold text-slate-700 mb-2">
                    Chief Complaint(s)
                </label>
                <div className="space-y-3">
                    {chiefComplaints.map((item) => (
                        <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start gap-3">
                                <div className="flex-grow w-full">
                                    <label htmlFor={`complaint-${item.id}`} className="sr-only">Complaint</label>
                                    <input
                                        id={`complaint-${item.id}`}
                                        type="text"
                                        value={item.complaint}
                                        onChange={(e) => handleComplaintTextChange(item.id, e.target.value)}
                                        placeholder="e.g., Fever, Chest Pain"
                                        className={inputStyles}
                                    />
                                </div>
                                <fieldset className="flex items-center gap-2 p-2 border border-slate-300 rounded-md bg-slate-50">
                                    <legend className="text-xs px-1 font-medium text-slate-600">Duration</legend>
                                    <input type="number" min="0" value={item.duration.years} onChange={(e) => handleDurationChange(item.id, 'years', e.target.value)} placeholder="Yrs" className="w-20 text-center px-2 py-2 border border-slate-300 rounded-md shadow-sm bg-white" />
                                    <input type="number" min="0" value={item.duration.months} onChange={(e) => handleDurationChange(item.id, 'months', e.target.value)} placeholder="Mths" className="w-20 text-center px-2 py-2 border border-slate-300 rounded-md shadow-sm bg-white" />
                                    <input type="number" min="0" value={item.duration.days} onChange={(e) => handleDurationChange(item.id, 'days', e.target.value)} placeholder="Days" className="w-20 text-center px-2 py-2 border border-slate-300 rounded-md shadow-sm bg-white" />
                                </fieldset>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOpenComplaintId(openComplaintId === item.id ? null : item.id)}
                                        className={`px-3 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors ${openComplaintId === item.id ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                                    >
                                        Edit HOP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveComplaint(item.id)}
                                        disabled={chiefComplaints.length <= 1}
                                        className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {openComplaintId === item.id && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                     <h3 className="font-semibold text-slate-800 mb-2">History of Presenting Complaint for: <span className="text-teal-700">{item.complaint || '...'}</span></h3>
                                     <div className="p-4 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50">
                                        {HOP_FIELDS.map(field => (
                                             <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                <label htmlFor={`${field.id}-${item.id}`} className={labelStyles}>{field.label}</label>
                                                {field.type === 'select' ? (
                                                    <select id={`${field.id}-${item.id}`} name={field.id} value={item.hop[field.id as keyof typeof item.hop]} onChange={(e) => handleHopChange(item.id, e)} className={inputStyles}>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt || `Select ${field.label}`}</option>)}
                                                    </select>
                                                ) : field.type === 'textarea' ? (
                                                    <div className="relative">
                                                        <textarea id={`${field.id}-${item.id}`} name={field.id} rows={2} value={item.hop[field.id as keyof typeof item.hop]} onChange={(e) => handleHopChange(item.id, e)} placeholder={field.placeholder} className={inputStyles} />
                                                        <SpeechToTextButton 
                                                            currentText={item.hop[field.id as keyof typeof item.hop]}
                                                            onTranscript={(transcript) => handleHopChange(item.id, { target: { name: field.id, value: transcript } } as any)}
                                                        />
                                                    </div>
                                                ) : (
                                                     <input id={`${field.id}-${item.id}`} name={field.id} type="text" value={item.hop[field.id as keyof typeof item.hop]} onChange={(e) => handleHopChange(item.id, e)} placeholder={field.placeholder} className={inputStyles} />
                                                )}
                                             </div>
                                        ))}
                                        {item.hop.progression === 'Other' && (
                                            <div>
                                                <label htmlFor={`progressionOther-${item.id}`} className={labelStyles}>Specify Other Progression</label>
                                                <input id={`progressionOther-${item.id}`} name="progressionOther" value={item.hop.progressionOther} onChange={(e) => handleHopChange(item.id, e)} placeholder="Describe the progression" className={inputStyles} />
                                            </div>
                                        )}
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleAddComplaint}
                    className="mt-3 px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-100 rounded-lg hover:bg-teal-200 transition-colors"
                >
                    + Add Another Complaint
                </button>
            </div>
            
            <div>
                 <button
                    onClick={handleGenerateQuestions}
                    disabled={isLoading || !hasComplaints}
                    className="mt-3 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><Loader /> Generating...</> : '✨ Get AI Suggested Questions for HOP'}
                </button>
            </div>

            {error && <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded-md">{error}</div>}

            {questions.length > 0 && (
                 <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-teal-800">Suggested Questions to Ask:</h3>
                        <TextToSpeechButton textToSpeak={questions.join(' ')} />
                    </div>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                        {questions.map((q, index) => <li key={index}>{q}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ChiefComplaintStep;