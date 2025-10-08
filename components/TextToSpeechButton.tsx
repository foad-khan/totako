import React, { useState, useEffect } from 'react';

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm3 2a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <rect x="6" y="6" width="8" height="8" rx="1" />
    </svg>
);


interface TextToSpeechButtonProps {
    textToSpeak: string;
    className?: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ textToSpeak, className = '' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const synth = window.speechSynthesis;
        // If text changes while speaking, this effect will stop the old speech.
        synth.cancel();
        setIsSpeaking(false);
        
        return () => {
            // On component unmount, cancel any speech.
            synth.cancel();
        };
    }, [textToSpeak]);
    
    const handleToggleSpeech = (e: React.MouseEvent) => {
        e.stopPropagation();
        const synth = window.speechSynthesis;
        if (!synth) return;

        if (synth.speaking) {
            synth.cancel();
        } else if (textToSpeak.trim()) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event);
                setIsSpeaking(false);
            };
            synth.speak(utterance);
        }
    };
    
    if (typeof window === 'undefined' || !window.speechSynthesis || !textToSpeak.trim()) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleToggleSpeech}
            className={`p-1.5 rounded-full text-white transition-colors ${
                isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
            } ${className}`}
            title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
        >
            {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
        </button>
    );
};

export default TextToSpeechButton;
