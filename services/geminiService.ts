import { GoogleGenAI, Type } from "@google/genai";
import type { PatientHistory, Duration, FamilyHistory, PastHistoryData, ChiefComplaint, DifferentialDiagnosis, HOPData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHOPQuestions = async (chiefComplaint: string): Promise<string[]> => {
    if (!chiefComplaint.trim()) {
        return [];
    }
    
    try {
        const prompt = `You are an expert medical educator. A user has identified a patient's chief complaint. Generate a structured list of essential follow-up questions to thoroughly explore the History of Presenting Complaint (HOP). Frame the questions clearly and concisely. The patient's chief complaint is: "${chiefComplaint}".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                },
              },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.questions || [];
    } catch (error) {
        console.error("Error generating HOP questions:", error);
        throw new Error("Failed to generate questions. Please check your API key and try again.");
    }
};

const formatDurationForSummary = (duration: Duration): string => {
    const parts = [];
    const years = parseInt(duration.years, 10) || 0;
    const months = parseInt(duration.months, 10) || 0;
    const days = parseInt(duration.days, 10) || 0;

    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

    return parts.join(', ');
};

const formatFamilyHistoryForSummary = (familyHistory: FamilyHistory): string => {
    const conditions = [];
    if (familyHistory.hasDiabetes) conditions.push('Diabetes Mellitus');
    if (familyHistory.hasTB) conditions.push('Tuberculosis (TB)');
    if (familyHistory.hasThyroid) conditions.push('Thyroid Disorders');

    const otherHistory = familyHistory.other.trim();
    if (otherHistory) {
        conditions.push(otherHistory);
    }
    
    if (conditions.length === 0) {
        return 'No significant family history reported.';
    }

    return conditions.join(', ');
};

const formatPastHistoryForSummary = (pastHistory: PastHistoryData): string => {
    const conditions = [];
    if (pastHistory.hasDiabetes) conditions.push('Diabetes Mellitus');
    if (pastHistory.hasTB) conditions.push('Tuberculosis (TB)');
    if (pastHistory.hasThyroid) conditions.push('Thyroid Disorders');

    const otherHistory = pastHistory.other.trim();
    if (otherHistory) {
        conditions.push(otherHistory);
    }
    
    if (conditions.length === 0) {
        return 'No significant past history reported.';
    }

    return conditions.join(', ');
};

const formatHopForSummary = (hop: HOPData): string => {
    const progressionValue = hop.progression === 'Other'
        ? hop.progressionOther.trim()
        : hop.progression;

    const parts = [
        { label: 'Site', value: hop.site },
        { label: 'Onset', value: hop.onset },
        { label: 'Character', value: hop.character },
        { label: 'Progression', value: progressionValue },
        { label: 'Timing/Duration of Episodes', value: hop.timingAndDuration },
        { label: 'Rate/Frequency', value: hop.rateFrequency },
        { label: 'Associative Factors', value: hop.associativeFactor },
        { label: 'Aggravating Factors', value: hop.aggravatingFactor },
        { label: 'Relieving Factors', value: hop.relievingFactor },
        { label: 'Other Details', value: hop.other },
    ];

    const details = parts
        .filter(part => part.value && part.value.trim() !== '')
        .map(part => `    - ${part.label}: ${part.value.trim()}`)
        .join('\n');
        
    return details ? `\n  - History of Presenting Complaint:\n${details}` : '';
};


export const generateHistorySummary = async (history: PatientHistory): Promise<string> => {
    try {
        const complaintsList = history.chiefComplaints
            .filter(c => c.complaint.trim())
            .map(c => {
                const durationStr = formatDurationForSummary(c.duration);
                const hopDetails = formatHopForSummary(c.hop);
                return `- ${c.complaint}${durationStr ? ` (${durationStr})` : ''}${hopDetails}`;
            })
            .join('\n');

        const prompt = `
        You are an AI assistant tasked with creating a comprehensive medical history summary. Based on the following patient data, generate a well-structured, and professionally formatted medical history summary. The summary should be written in clear medical English, suitable for a case presentation.

        Patient Data:
        - Demographics: 
          - Name: ${history.demographics.name}
          - Age/Sex: ${history.demographics.age} / ${history.demographics.sex}
          - Marital Status: ${history.demographics.maritalStatus || 'Not specified.'}
          - Occupation: ${history.demographics.occupation}
          - Religion: ${history.demographics.religion || 'Not specified.'}
          - Education: ${history.demographics.education || 'Not specified.'}
          - Total Family Monthly Income: ${history.demographics.familyIncome ? `₹${history.demographics.familyIncome}` : 'Not specified.'}
          - Socio-economic Status: ${history.demographics.socioEconomicStatus || 'Not specified.'} (Calculated)
          - Address: ${history.demographics.address}
          - Attendant's Name: ${history.demographics.attendantName || 'Not specified.'}
          - Blood Group: ${history.demographics.bloodGroup || 'Not specified.'}
          - Phone Number: ${history.demographics.phoneNumber || 'Not specified.'}
        - Chief Complaints & History of Presenting Complaint:
          ${complaintsList || 'No chief complaints reported.'}
        - Past Medical & Surgical History: ${formatPastHistoryForSummary(history.pastHistory)}
        - Personal History: 
          - Diet: ${history.personalHistory.diet}
          - Sleep: ${history.personalHistory.sleep || 'Not specified.'}
          - Appetite: ${history.personalHistory.appetite || 'Not specified.'}
          - Bladder: ${history.personalHistory.bladder || 'Not specified.'}
          - Bowel: ${history.personalHistory.bowel || 'Not specified.'}
          - Habits: ${history.personalHistory.habits.join(', ') || 'No significant habits reported.'}
          - Other: ${history.personalHistory.other || 'None.'}
        - Family History: ${formatFamilyHistoryForSummary(history.familyHistory)}

        Structure the output with clear headings for each section (e.g., Patient Profile, Chief Complaints & History of Presenting Complaint, etc.). Ensure the language is formal and clinical.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary. Please check your API key and try again.");
    }
};

export const generateDifferentialDiagnosis = async (complaints: ChiefComplaint[]): Promise<DifferentialDiagnosis[]> => {
    const complaintString = complaints
        .filter(c => c.complaint.trim())
        .map(c => {
            const durationStr = formatDurationForSummary(c.duration);
            return `${c.complaint.trim()}${durationStr ? ` (for ${durationStr})` : ''}`;
        })
        .join(', ');
        
    if (!complaintString) {
        return [];
    }

    try {
        const prompt = `As a senior medical diagnostician, provide a list of potential differential diagnoses based on the following chief complaints from a patient. For each diagnosis, give a brief, clear rationale explaining why it's a consideration. The complaints are: "${complaintString}".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        diagnoses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    diagnosis: { 
                                        type: Type.STRING,
                                        description: "The name of the potential diagnosis."
                                    },
                                    rationale: { 
                                        type: Type.STRING,
                                        description: "A brief explanation for considering this diagnosis."
                                    }
                                },
                                required: ["diagnosis", "rationale"]
                            }
                        }
                    },
                    required: ["diagnoses"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.diagnoses || [];
    } catch (error) {
        console.error("Error generating differential diagnosis:", error);
        throw new Error("Failed to generate differential diagnosis. Please check your API key and try again.");
    }
};