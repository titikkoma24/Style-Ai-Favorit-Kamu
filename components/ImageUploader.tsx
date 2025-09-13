import React from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
    label: string;
    image: ImageFile | null;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    showRemoveButton?: boolean;
    disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageSelect, onImageRemove, showRemoveButton = false, disabled = false }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div className={disabled ? 'opacity-50' : ''}>
            <h3 className="block text-sm font-medium text-gray-300 mb-2">{label}</h3>
            <div className="flex items-center gap-4">
                {image ? (
                    <div className="relative w-24 h-24">
                        <img src={image.data} alt="Pratinjau Unggahan" className="w-full h-full object-cover rounded-md" />
                        {showRemoveButton && (
                            <button onClick={onImageRemove} disabled={disabled} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 transition disabled:cursor-not-allowed" aria-label={`Hapus ${label}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                ) : (
                    <label className={`w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md transition ${disabled ? 'cursor-not-allowed bg-gray-800' : 'cursor-pointer hover:border-indigo-500 hover:bg-gray-800'}`}>
                         <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="mt-1 text-xs text-gray-400">Pilih Foto</span>
                        </div>
                        <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} disabled={disabled} />
                    </label>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;