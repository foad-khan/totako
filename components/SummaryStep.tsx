
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateHistorySummary, generateDifferentialDiagnosis } from '../services/geminiService';
import type { PatientHistory, DifferentialDiagnosis } from '../types';
import Loader from './Loader';
import PrintableReport from './PrintableReport';
import TextToSpeechButton from './TextToSpeechButton';

interface SummaryStepProps {
    history: PatientHistory;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ history }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<string>('');

    const [isDDLoading, setIsDDLoading] = useState(false);
    const [ddError, setDDError] = useState<string | null>(null);
    const [diagnoses, setDiagnoses] = useState<DifferentialDiagnosis[]>([]);
    
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary('');
        try {
            const result = await generateHistorySummary(history);
            setSummary(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDD = async () => {
        setIsDDLoading(true);
        setDDError(null);
        setDiagnoses([]);
        try {
            const result = await generateDifferentialDiagnosis(history.chiefComplaints);
            setDiagnoses(result);
        } catch (err) {
            setDDError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsDDLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const patientName = history.demographics.name.trim() || 'Unknown';
            pdf.save(`Patient_History_${patientName.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("Failed to export PDF:", err);
            setError("Sorry, there was an error creating the PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const hasChiefComplaints = history.chiefComplaints.some(c => c.complaint.trim() !== '');

    return (
        <div className="space-y-6">
            {/* Hidden component for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px' /* A4 width in pixels approx */ }}>
                <div ref={reportRef}>
                    <PrintableReport history={history} summary={summary} diagnoses={diagnoses} />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-teal-700 border-b pb-2">Generate Case Summary &amp; Insights</h2>
            <p className="text-slate-600">
                You have completed all the steps. Use the buttons below to generate a professional case summary, get AI-suggested diagnoses, or export the full history as a PDF.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
                 <button
                    onClick={handleGenerateSummary}
                    disabled={isLoading}
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><Loader /> Generating...</> : '📝 Generate AI Summary'}
                </button>
                <button
                    onClick={handleGenerateDD}
                    disabled={isDDLoading || !hasChiefComplaints}
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={!hasChiefComplaints ? "Please enter at least one chief complaint" : "Get AI Differential Diagnosis"}
                >
                    {isDDLoading ? <><Loader /> Generating...</> : '🩺 Get AI Differential Diagnosis'}
                </button>
                 <button
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-slate-700 rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isExporting ? <><Loader /> Exporting...</> : '📄 Export to PDF'}
                </button>
            </div>

            {error && <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded-md mt-4">{error}</div>}

            {summary && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg relative">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-teal-800">Generated Summary</h3>
                        <TextToSpeechButton textToSpeak={summary} />
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap">
                        {summary}
                    </div>
                </div>
            )}

            {ddError && <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded-md mt-4">{ddError}</div>}

            {diagnoses.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-blue-800">Potential Differential Diagnoses</h3>
                        <TextToSpeechButton textToSpeak={diagnoses.map(d => `${d.diagnosis}. Rationale: ${d.rationale}`).join(' \n\n ')} />
                    </div>
                    <p className="text-sm text-slate-600 mb-4 italic">
                        <strong>Disclaimer:</strong> This is an AI-generated list for educational purposes only and is not a substitute for professional clinical judgment.
                    </p>
                    <ul className="space-y-3">
                        {diagnoses.map((item, index) => (
                            <li key={index} className="p-3 bg-white border border-slate-200 rounded-md shadow-sm relative">
                                <p className="font-bold text-slate-800">{index + 1}. {item.diagnosis}</p>
                                <p className="text-slate-600 mt-1 pl-4">{item.rationale}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SummaryStep;