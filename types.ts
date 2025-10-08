export type EducationLevel =
  | ''
  | 'Illiterate'
  | 'Primary School'
  | 'Middle School'
  | 'High School'
  | 'Diploma/Intermediate'
  | 'Graduate'
  | 'Professional/Post-graduate';

export type OccupationLevel =
  | ''
  | 'Unemployed'
  | 'Unskilled Worker'
  | 'Semi-skilled Worker'
  | 'Skilled Worker'
  | 'Clerical/Shop-owner/Farmer'
  | 'Semi-professional'
  | 'Professional';

export interface Demographics {
    name: string;
    age: string;
    sex: 'Male' | 'Female' | 'Other';
    occupation: OccupationLevel;
    address: string;
    attendantName: string;
    phoneNumber: string;
    bloodGroup: string;
    education: EducationLevel;
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    familyIncome: string;
    socioEconomicStatus: 'Upper' | 'Upper-Middle' | 'Lower-Middle' | 'Upper-Lower' | 'Lower';
    religion: string;
}

export interface PersonalHistory {
    diet: 'Vegetarian' | 'Non-Vegetarian' | 'Mixed';
    sleep: string;
    appetite: string;
    bladder: string;
    bowel: string;
    habits: string[];
    other: string;
}

export interface Duration {
    years: string;
    months: string;
    days: string;
}

export type OnsetType = '' | 'Acute (Min to hr)' | 'Sub-Acute (Days)' | 'Chronic/Insidious (Weeks to Months)';

export type ProgressionType = '' | 'Gradually Deteriorating' | 'Getting Better' | 'Remaining the same' | 'Remissions' | 'Exacerbations' | 'Other';

export interface HOPData {
    site: string;
    onset: OnsetType;
    character: string;
    progression: ProgressionType;
    progressionOther: string;
    timingAndDuration: string;
    rateFrequency: string;
    associativeFactor: string;
    aggravatingFactor: string;
    relievingFactor: string;
    other: string;
}

export interface ChiefComplaint {
    id: string;
    complaint: string;
    duration: Duration;
    hop: HOPData;
}

export interface FamilyHistory {
    hasDiabetes: boolean;
    hasTB: boolean;
    hasThyroid: boolean;
    other: string;
}

export interface PastHistoryData {
    hasDiabetes: boolean;
    hasTB: boolean;
    hasThyroid: boolean;
    other: string;
}

export interface PatientHistory {
    demographics: Demographics;
    chiefComplaints: ChiefComplaint[];
    pastHistory: PastHistoryData;
    personalHistory: PersonalHistory;
    familyHistory: FamilyHistory;
}

export interface DifferentialDiagnosis {
    diagnosis: string;
    rationale: string;
}