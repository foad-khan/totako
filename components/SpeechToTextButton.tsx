import React, { useState, useRef, useEffect } from 'react';

// FIX: Add types for the Web Speech API to fix TypeScript errors.
// These types are not part of the standard DOM library definitions.
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechToTextButtonProps {
    onTranscript: (transcript: string) => void;
    currentText: string;
}

const LANGUAGES = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'mr-IN', name: 'Marathi' },
    { code: 'gu-IN', name: 'Gujarati' },
    { code: 'kn-IN', name: 'Kannada' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'ur-IN', name: 'Urdu' },
];

const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
    </svg>
);

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ onTranscript, currentText }) => {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-IN');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                // Append new transcript to existing text
                const separator = currentText.trim() === '' ? '' : ' ';
                onTranscript(currentText + separator + finalTranscript);
            }
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [currentText, onTranscript]);

    const handleToggleListen = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.lang = language;
            recognition.start();
        }
        setIsListening(!isListening);
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        return null; // Don't render if API is not supported
    }

    return (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isListening}
                className="text-xs bg-slate-200 text-slate-600 rounded-md border-none focus:ring-0 p-1"
                onClick={(e) => e.stopPropagation()} // prevent textarea focus
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
            </select>
            <button
                type="button"
                onClick={handleToggleListen}
                className={`p-1.5 rounded-full text-white transition-colors ${
                    isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
                }`}
                title={isListening ? "Stop Dictating" : "Start Dictating"}
            >
                <MicrophoneIcon />
            </button>
        </div>
    );
};

export default SpeechToTextButton;