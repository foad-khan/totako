import React from 'react';
import type { PersonalHistory } from '../types';
import SpeechToTextButton from './SpeechToTextButton';

interface PersonalHistoryStepProps {
    data: PersonalHistory;
    onUpdate: (data: PersonalHistory) => void;
}

const HABITS = ["Smoking", "Alcohol", "Tobacco Chewing", "Drug Abuse"];

const PersonalHistoryStep: React.FC<PersonalHistoryStepProps> = ({ data, onUpdate }) => {
    
    const handleHabitChange = (habit: string) => {
        const newHabits = data.habits.includes(habit)
            ? data.habits.filter(h => h !== habit)
            : [...data.habits, habit];
        onUpdate({ ...data, habits: newHabits });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onUpdate({ ...data, [e.target.id]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Personal History</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="diet" className="font-semibold text-slate-700 md:text-right">Diet</label>
                <select
                    id="diet"
                    value={data.diet}
                    onChange={handleInputChange}
                    className="md:col-span-2 w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                >
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Mixed</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="sleep" className="font-semibold text-slate-700 md:text-right">Sleep Pattern</label>
                <input
                    id="sleep"
                    type="text"
                    value={data.sleep}
                    onChange={handleInputChange}
                    placeholder="e.g., 6-8 hours, disturbed"
                    className="md:col-span-2 w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="appetite" className="font-semibold text-slate-700 md:text-right">Appetite</label>
                <input
                    id="appetite"
                    type="text"
                    value={data.appetite}
                    onChange={handleInputChange}
                    placeholder="e.g., Normal, decreased, increased"
                    className="md:col-span-2 w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="bladder" className="font-semibold text-slate-700 md:text-right">Bladder Habits</label>
                <input
                    id="bladder"
                    type="text"
                    value={data.bladder}
                    onChange={handleInputChange}
                    placeholder="e.g., Normal, frequency, urgency"
                    className="md:col-span-2 w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="bowel" className="font-semibold text-slate-700 md:text-right">Bowel Habits</label>
                <input
                    id="bowel"
                    type="text"
                    value={data.bowel}
                    onChange={handleInputChange}
                    placeholder="e.g., Regular, constipation, diarrhea"
                    className="md:col-span-2 w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-start">
                <label className="font-semibold text-slate-700 md:text-right mt-2">Habits</label>
                <div className="md:col-span-2 space-y-2">
                    {HABITS.map(habit => (
                        <div key={habit} className="flex items-center">
                            <input
                                type="checkbox"
                                id={habit}
                                checked={data.habits.includes(habit)}
                                onChange={() => handleHabitChange(habit)}
                                className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor={habit} className="ml-2 text-slate-700">{habit}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="other" className="block font-semibold text-slate-700 mb-2">
                    Other Relevant History
                </label>
                <div className="relative">
                    <textarea
                        id="other"
                        rows={3}
                        value={data.other}
                        onChange={handleInputChange}
                        placeholder="Mention any other details like marital status or sexual history if relevant."
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

export default PersonalHistoryStep;