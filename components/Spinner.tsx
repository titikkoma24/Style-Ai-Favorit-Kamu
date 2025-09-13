import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="text-center text-gray-400">
            <svg className="animate-spin h-10 w-10 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 font-medium">Membuat & menyempurnakan gambar Anda...</p>
            <p className="text-sm">Ini mungkin memakan waktu sedikit lebih lama.</p>
        </div>
    );
};

export default Spinner;