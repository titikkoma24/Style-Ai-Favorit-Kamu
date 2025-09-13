import React, { useState, useCallback, useEffect } from 'react';
import Spinner from './Spinner';
import { POSE_PRESETS } from '../constants';
import { improvePosePrompt } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import type { ImageFile } from '../types';

interface ImageDisplayProps {
    imageUrl: string | null;
    isLoading: boolean;
    error: string | null;
    analysisResult?: string | null;
    analysisSummary?: string | null;
    onEdit: (prompt: string, useFaceLock: boolean) => void;
    onApplyFashion: (faceImage: ImageFile, fashionPrompt: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 6.343l-2.828 2.828M17.657 17.657l2.828 2.828M18 5h4M21 3v4M16.243 7.757l-2.828-2.828M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H9" />
    </svg>
);

const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 000 10h3" />
    </svg>
);

const EditSection: React.FC<{ 
    onEdit: (prompt: string, useFaceLock: boolean) => void;
    imageUrl: string;
    isLoading: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}> = ({ onEdit, imageUrl, isLoading, onUndo, onRedo, canUndo, canRedo }) => {
    const [bgInput, setBgInput] = useState('');
    const [poseInput, setPoseInput] = useState('');
    const [activeMenu, setActiveMenu] = useState<null | 'background' | 'pose'>(null);
    const [isFaceLockForEditEnabled, setIsFaceLockForEditEnabled] = useState<boolean>(true);
    const [isImprovingPose, setIsImprovingPose] = useState<boolean>(false);

    const handleSaveImage = useCallback(() => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `style-ai-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [imageUrl]);
    
    const handleEdit = (prompt: string) => {
        onEdit(prompt, isFaceLockForEditEnabled);
    };

    const handleCustomBgSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(bgInput.trim()) handleEdit(`Ubah latar belakang menjadi: ${bgInput}`);
    };

    const handleCustomPoseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(poseInput.trim()) handleEdit(`Ubah pose subjek menjadi: ${poseInput}`);
    };

    const handleImprovePose = async () => {
        if (!poseInput.trim() || isImprovingPose) return;
        setIsImprovingPose(true);
        try {
            const improved = await improvePosePrompt(poseInput);
            setPoseInput(improved);
        } catch (error) {
            console.error("Gagal meningkatkan pose:", error);
            // Di aplikasi nyata, tampilkan notifikasi error kepada pengguna
        } finally {
            setIsImprovingPose(false);
        }
    };

    const renderMenu = () => {
        if (activeMenu === 'background') {
            return (
                <div className="bg-gray-800 p-3 rounded-md mt-2 flex flex-col gap-2">
                    <button onClick={() => handleEdit('Ubah latar belakang menjadi latar studio polos yang warnanya melengkapi subjek.')} className="text-xs w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition">Latar Studio (Netral)</button>
                    <button onClick={() => handleEdit('Ubah latar belakang menjadi latar studio polos dengan warna cerah yang kontras dengan subjek.')} className="text-xs w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition">Latar Studio (Kontras)</button>
                    <form onSubmit={handleCustomBgSubmit} className="flex gap-2">
                        <input type="text" value={bgInput} onChange={e => setBgInput(e.target.value)} placeholder="Deskripsikan latar belakang..." className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-xs focus:ring-1 focus:ring-indigo-500" />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 rounded-md transition">Ganti</button>
                    </form>
                </div>
            );
        }
        if (activeMenu === 'pose') {
             return (
                <div className="bg-gray-800 p-3 rounded-md mt-2 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                         {POSE_PRESETS.map(pose => (
                             <button key={pose.label} onClick={() => handleEdit(pose.prompt)} className="text-xs w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition">{pose.label}</button>
                         ))}
                    </div>
                     <div className="mt-2 border-t border-gray-700 pt-3">
                         <label htmlFor="customPose" className="block text-xs font-medium text-gray-400 mb-2">Atau, deskripsikan pose kustom Anda:</label>
                         <form onSubmit={handleCustomPoseSubmit} className="flex flex-col gap-2">
                            <div className="relative">
                                <input 
                                    id="customPose"
                                    type="text" 
                                    value={poseInput} 
                                    onChange={e => setPoseInput(e.target.value)} 
                                    placeholder="mis: menari di bawah hujan" 
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pr-10 text-xs focus:ring-1 focus:ring-indigo-500" 
                                />
                                <button 
                                    type="button"
                                    onClick={handleImprovePose}
                                    disabled={isImprovingPose || !poseInput.trim()}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-md transition"
                                    aria-label="Tingkatkan pose dengan AI"
                                >
                                     {isImprovingPose ? (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <SparklesIcon className="w-4 h-4"/>
                                    )}
                                </button>
                            </div>
                             <button 
                                type="submit"
                                disabled={!poseInput.trim() || isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-2 rounded-md transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Ganti Pose Kustom
                            </button>
                         </form>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full mt-4 p-2 bg-gray-900/50 rounded-lg border border-gray-700">
             <div className="flex items-center p-2 mb-3 border-b border-gray-700">
                <input 
                    type="checkbox" 
                    id="editFaceLock" 
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                    checked={isFaceLockForEditEnabled}
                    onChange={(e) => setIsFaceLockForEditEnabled(e.target.checked)}
                />
                <label htmlFor="editFaceLock" className="ml-2 text-sm text-gray-300 font-medium">
                    Kunci Wajah & Ekspresi
                </label>
                <p className="ml-auto text-xs text-gray-400 hidden sm:block">Gunakan untuk menjaga wajah saat mengganti pose atau gaya.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={onUndo} disabled={isLoading || !canUndo} className="flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait p-2 rounded-md transition">
                    <UndoIcon className="w-4 h-4" /> Undo
                </button>
                <button onClick={onRedo} disabled={isLoading || !canRedo} className="flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait p-2 rounded-md transition">
                    <RedoIcon className="w-4 h-4" /> Redo
                </button>
                <button onClick={() => handleEdit('Pertajam gambar, tingkatkan fokus dan kejernihan detail.')} disabled={isLoading} className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait p-2 rounded-md transition">Tingkatkan Ketajaman</button>
                <button onClick={() => handleEdit('Tingkatkan warna pada gambar, buat lebih cerah dan jenuh.')} disabled={isLoading} className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait p-2 rounded-md transition">Tingkatkan Warna</button>
                <button onClick={() => setActiveMenu(activeMenu === 'background' ? null : 'background')} disabled={isLoading} className={`text-sm p-2 rounded-md transition ${activeMenu === 'background' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Ganti Latar</button>
                <button onClick={() => setActiveMenu(activeMenu === 'pose' ? null : 'pose')} disabled={isLoading} className={`text-sm p-2 rounded-md transition ${activeMenu === 'pose' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Ganti Pose</button>
                <button onClick={() => handleEdit('Hapus latar belakang, sisakan hanya subjek utama dengan latar belakang abu-abu netral.')} disabled={isLoading} className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait p-2 rounded-md transition">Hapus Latar</button>
                <button onClick={handleSaveImage} className="text-sm bg-green-600 hover:bg-green-700 p-2 rounded-md transition">Simpan</button>
            </div>
            {renderMenu()}
        </div>
    );
};

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, error, onEdit, onUndo, onRedo, canUndo, canRedo, analysisResult, analysisSummary, onApplyFashion }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSummaryCopied, setIsSummaryCopied] = useState(false);
    const [faceForFashion, setFaceForFashion] = useState<ImageFile | null>(null);

    useEffect(() => {
        setIsCopied(false);
        setIsSummaryCopied(false);
        // Reset face image uploader when a new analysis result comes in
        setFaceForFashion(null); 
    }, [analysisResult, analysisSummary]);

    const handleCopyToClipboard = useCallback(() => {
        if (!analysisResult) return;
        navigator.clipboard.writeText(analysisResult).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [analysisResult]);
    
    const handleCopySummaryToClipboard = useCallback(() => {
        if (!analysisSummary) return;
        navigator.clipboard.writeText(analysisSummary).then(() => {
            setIsSummaryCopied(true);
            setTimeout(() => setIsSummaryCopied(false), 2000);
        });
    }, [analysisSummary]);

    const handleFaceImageSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFaceForFashion({ data: reader.result as string, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex items-center justify-center min-h-[300px] lg:min-h-0 aspect-square">
                {isLoading && <Spinner />}
                {!isLoading && error && (
                    <div className="text-center text-red-400">
                        <h3 className="font-semibold">Oops! Terjadi kesalahan.</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !error && analysisResult && (
                    <div className="relative w-full h-full bg-gray-900 rounded-md p-4 overflow-y-auto">
                        <div>
                            <h3 className="text-lg font-semibold text-indigo-400 mb-3 border-b border-gray-700 pb-2">Hasil Analisis Fashion</h3>
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{analysisResult}</pre>
                            <button 
                                onClick={handleCopyToClipboard}
                                className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition text-gray-300 hover:text-white"
                                aria-label="Salin hasil analisis"
                            >
                                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                            </button>
                        </div>

                        {analysisSummary && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <h4 className="text-md font-semibold text-purple-400 mb-2">Ringkasan untuk Prompt</h4>
                                 <div className="relative bg-gray-800 p-3 rounded-md">
                                    <p className="text-gray-300 text-sm font-mono pr-10">{analysisSummary}</p>
                                    <button 
                                        onClick={handleCopySummaryToClipboard}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition text-gray-300 hover:text-white"
                                        aria-label="Salin ringkasan prompt"
                                    >
                                        {isSummaryCopied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                                    </button>
                                 </div>
                            </div>
                        )}
                    </div>
                )}
                {!isLoading && !error && !analysisResult && imageUrl && (
                    <img src={imageUrl} alt="Generated art" className="w-full h-full object-contain rounded-md" />
                )}
                {!isLoading && !error && !analysisResult && !imageUrl && (
                     <div className="text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm font-medium">Hasil Gambar Anda Akan Tampil di Sini</p>
                    </div>
                )}
            </div>
            {analysisResult && analysisSummary && (
                <div className="w-full mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-4">
                    <div>
                        <h4 className="text-md font-semibold text-green-400">Terapkan Outfit pada Wajah</h4>
                        <p className="text-xs text-gray-400 mt-1">Unggah foto wajah yang jelas, dan AI akan membuat gambar baru orang tersebut mengenakan pakaian yang dianalisis.</p>
                    </div>
                    
                    <ImageUploader 
                        label="Unggah Foto Wajah"
                        image={faceForFashion}
                        onImageSelect={handleFaceImageSelect}
                        onImageRemove={() => setFaceForFashion(null)}
                        showRemoveButton={true}
                    />

                    <button 
                        onClick={() => {
                            if (faceForFashion && analysisSummary) {
                                onApplyFashion(faceForFashion, analysisSummary);
                            }
                        }}
                        disabled={!faceForFashion || isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Menerapkan Outfit...</span>
                            </>
                        ) : (
                            <span>Buat Gambar dengan Outfit Ini</span>
                        )}
                    </button>
                </div>
            )}
            {imageUrl && !analysisResult && (
                <EditSection 
                    onEdit={onEdit} 
                    imageUrl={imageUrl} 
                    isLoading={isLoading} 
                    onUndo={onUndo}
                    onRedo={onRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            )}
        </div>
    );
};

export default ImageDisplay;