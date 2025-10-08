import React, { useEffect } from 'react';
import type { Demographics, EducationLevel, OccupationLevel } from '../types';

interface DemographicsStepProps {
    data: Demographics;
    onUpdate: (data: Demographics) => void;
}

const EDUCATION_LEVELS: EducationLevel[] = ['', 'Illiterate', 'Primary School', 'Middle School', 'High School', 'Diploma/Intermediate', 'Graduate', 'Professional/Post-graduate'];
const OCCUPATION_LEVELS: OccupationLevel[] = ['', 'Unemployed', 'Unskilled Worker', 'Semi-skilled Worker', 'Skilled Worker', 'Clerical/Shop-owner/Farmer', 'Semi-professional', 'Professional'];

const DemographicsStep: React.FC<DemographicsStepProps> = ({ data, onUpdate }) => {
    
    useEffect(() => {
        const getEducationScore = (level: EducationLevel): number => {
            switch (level) {
                case 'Professional/Post-graduate': return 7;
                case 'Graduate': return 6;
                case 'Diploma/Intermediate': return 4;
                case 'High School': return 3;
                case 'Middle School': return 2;
                case 'Primary School': return 1;
                case 'Illiterate': return 0;
                default: return 0;
            }
        };

        const getOccupationScore = (level: OccupationLevel): number => {
            switch (level) {
                case 'Professional': return 10;
                case 'Semi-professional': return 6;
                case 'Clerical/Shop-owner/Farmer': return 5;
                case 'Skilled Worker': return 4;
                case 'Semi-skilled Worker': return 3;
                case 'Unskilled Worker': return 2;
                case 'Unemployed': return 1;
                default: return 0;
            }
        };
        
        // Using Modified Kuppuswamy Scale with CPI adjustment for 2023/2024 (example values)
        const getIncomeScore = (income: number): number => {
            if (income >= 73688) return 12;
            if (income >= 36844) return 10;
            if (income >= 27633) return 6;
            if (income >= 18422) return 4;
            if (income >= 9343) return 3;
            if (income >= 3723) return 2;
            if (income > 0) return 1;
            return 0;
        };

        const { education, occupation, familyIncome } = data;
        const income = parseInt(familyIncome, 10) || 0;

        const totalScore = getEducationScore(education) + getOccupationScore(occupation) + getIncomeScore(income);

        let newStatus: Demographics['socioEconomicStatus'];
        if (totalScore >= 26) newStatus = 'Upper';
        else if (totalScore >= 16) newStatus = 'Upper-Middle';
        else if (totalScore >= 11) newStatus = 'Lower-Middle';
        else if (totalScore >= 5) newStatus = 'Upper-Lower';
        else newStatus = 'Lower';

        if (newStatus !== data.socioEconomicStatus) {
            onUpdate({ ...data, socioEconomicStatus: newStatus });
        }

    }, [data, onUpdate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        let updatedValue: string | number = value;

        if (id === 'phoneNumber' || id === 'familyIncome') {
            updatedValue = value.replace(/[^0-9]/g, '');
        }
        onUpdate({ ...data, [id]: updatedValue });
    };

    const inputStyles = "w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50";

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Patient Demographics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="name" className="font-semibold text-slate-700 md:text-right">Patient's Name</label>
                <input id="name" value={data.name} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label className="font-semibold text-slate-700 md:text-right">Age / Sex</label>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <input id="age" type="number" value={data.age} onChange={handleChange} className={inputStyles} placeholder="Age"/>
                    <select id="sex" value={data.sex} onChange={handleChange} className={inputStyles}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="attendantName" className="font-semibold text-slate-700 md:text-right">Attendant's Name</label>
                <input id="attendantName" value={data.attendantName} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                 <label className="font-semibold text-slate-700 md:text-right">Phone / Blood Group</label>
                 <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <input id="phoneNumber" type="tel" value={data.phoneNumber} onChange={handleChange} className={inputStyles} placeholder="Phone Number"/>
                    <select id="bloodGroup" value={data.bloodGroup} onChange={handleChange} className={inputStyles}>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="address" className="font-semibold text-slate-700 md:text-right">Address</label>
                <input id="address" value={data.address} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="maritalStatus" className="font-semibold text-slate-700 md:text-right">Marital Status</label>
                 <select id="maritalStatus" value={data.maritalStatus} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`}>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <label htmlFor="religion" className="font-semibold text-slate-700 md:text-right">Religion</label>
                <input id="religion" value={data.religion} onChange={handleChange} placeholder="e.g., Hinduism, Islam, Christianity" className={`md:col-span-2 ${inputStyles}`} />
            </div>

            {/* Socio-economic Calculator Section */}
            <div className="space-y-6 p-4 border border-teal-200 bg-teal-50 rounded-lg">
                <h3 className="font-bold text-lg text-teal-800">Socio-economic Status Calculator (Kuppuswamy Scale)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                    <label htmlFor="education" className="font-semibold text-slate-700 md:text-right">Education (Head of Family)</label>
                    <select id="education" value={data.education} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`}>
                        {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level || 'Select Education'}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                    <label htmlFor="occupation" className="font-semibold text-slate-700 md:text-right">Occupation (Head of Family)</label>
                    <select id="occupation" value={data.occupation} onChange={handleChange} className={`md:col-span-2 ${inputStyles}`}>
                        {OCCUPATION_LEVELS.map(level => <option key={level} value={level}>{level || 'Select Occupation'}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                    <label htmlFor="familyIncome" className="font-semibold text-slate-700 md:text-right">Total Monthly Family Income (₹)</label>
                    <input id="familyIncome" type="tel" value={data.familyIncome} onChange={handleChange} placeholder="e.g., 25000" className={`md:col-span-2 ${inputStyles}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                    <p className="font-semibold text-slate-700 md:text-right">Calculated Status</p>
                    <div className="md:col-span-2">
                        <p className="px-3 py-3 bg-white border border-slate-300 rounded-md font-bold text-teal-700">{data.socioEconomicStatus}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DemographicsStep;