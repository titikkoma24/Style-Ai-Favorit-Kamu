
import React from 'react';

const ExternalLinkIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                        Style AI Favorit Kamu
                    </h1>
                    <p className="text-gray-400 mt-1">Buat prompt seni AI kustom Anda</p>
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
                </div>
            </div>
        </header>
    );
};

export default Header;