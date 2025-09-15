import React from 'react';

const ExternalLinkIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const LockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

interface HeaderProps {
    onLock: () => void;
    remainingTime?: number | null;
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const Header: React.FC<HeaderProps> = ({ onLock, remainingTime }) => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                        AImagination - sudutlain 2025
                    </h1>
                    <p className="text-orange-300/80 mt-1">Semua berawal dari ide anda, untuk menciptakan karya</p>
                </div>
                 <div className="flex items-center gap-2">
                    <a 
                        href="https://aistudio.google.com/prompts/new_video" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                        Buka Veo
                    </a>
                    <a 
                        href="https://gemini.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                        Buka Gemini
                    </a>
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={onLock}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-300 bg-red-900/40 border border-red-700 rounded-lg hover:bg-red-800/50 transition-colors"
                            title="Reset Access & Lock App"
                        >
                            <LockIcon className="w-4 h-4" />
                            Lock
                        </button>
                        {remainingTime !== null && remainingTime > 0 && (
                            <p className="text-xs text-amber-400 font-mono mt-1">
                                {formatTime(remainingTime)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;