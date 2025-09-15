import React, { useState, useEffect, useCallback } from 'react';
import { STYLE_CATEGORIES, RECOMMENDED_STYLES, ASPECT_RATIOS, CUSTOM_STYLES, LIPSTICK_COLORS, HAIRSTYLE_PRESETS, IDOL_POSE_TEMPLATES, SHOT_STYLE_TEMPLATES, LIGHT_STYLE_TEMPLATES, LINGERIE_POSE_TEMPLATES } from '../constants';
import { improvePrompt, translateToEnglish, improveIdolPrompt, improveMultiImagePrompt, improveVideoPrompt } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import type { StyleCategory, AspectRatio, GantiOutfitImages, ImageFile, CustomStyle, TouchUpOptions, GantiOutfitBodyOptions, PhotoWithIdolOptions, SemuaBisaDisiniOptions, UnderwearLingerieOptions } from '../types';

interface PromptStudioProps {
    onGenerate: (options: { 
        prompt: string; 
        image: ImageFile | null; 
        idolImage?: ImageFile | null;
        useFaceLock: boolean;
        useIdolFaceLock?: boolean;
        aspectRatio: AspectRatio['value'];
        translatePrompt?: boolean;
        customStyle?: CustomStyle['id'];
        customStyleImages?: GantiOutfitImages;
        touchUpOptions?: TouchUpOptions;
        gantiOutfitBodyOptions?: GantiOutfitBodyOptions;
        photoWithIdolOptions?: PhotoWithIdolOptions;
        semuaBisaDisiniOptions?: SemuaBisaDisiniOptions;
        underwearLingerieOptions?: UnderwearLingerieOptions;
    }) => void;
    isLoading: boolean;
}

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

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 6.343l-2.828 2.828M17.657 17.657l2.828 2.828M18 5h4M21 3v4M16.243 7.757l-2.828-2.828M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);

const ImprovedOptionsDisplay: React.FC<{
    detailed: string;
    concise: string;
    onSelect: (version: string) => void;
    onClose: () => void;
}> = ({ detailed, concise, onSelect, onClose }) => {
    return (
        <div className="mt-3 p-4 bg-gray-900/70 border border-gray-700 rounded-lg flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-purple-400">Pilih Versi Prompt</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            {/* Detailed Version */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Versi Detail:</label>
                <p className="text-xs bg-gray-800 p-2 rounded-md text-gray-400 max-h-24 overflow-y-auto">{detailed}</p>
                <button onClick={() => onSelect(detailed)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md transition self-start">
                    Gunakan Versi Ini
                </button>
            </div>
             {/* Concise Version */}
             <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Versi Ringkas:</label>
                <p className="text-xs bg-gray-800 p-2 rounded-md text-gray-400 max-h-24 overflow-y-auto">{concise}</p>
                <button onClick={() => onSelect(concise)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md transition self-start">
                    Gunakan Versi Ini
                </button>
            </div>
        </div>
    );
};


const PromptStudio: React.FC<PromptStudioProps> = ({ onGenerate, isLoading }) => {
    const [mainSubject, setMainSubject] = useState<string>('Seekor kucing astronot yang agung duduk di atas bulan, memandangi galaksi nebula');
    const [translatedMainSubject, setTranslatedMainSubject] = useState<string>('');
    const [isTranslatingSubject, setIsTranslatingSubject] = useState<boolean>(false);
    const [isImprovingSubject, setIsImprovingSubject] = useState<boolean>(false);
    const [selections, setSelections] = useState<Record<string, string>>({
        baseStyle: 'digital art',
        lighting: 'cinematic lighting',
        colorPalette: 'vibrant colors',
        composition: 'wide angle shot',
        details: 'highly detailed, 4k resolution',
    });
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<ImageFile | null>(null);
    const [isFaceLockEnabled, setIsFaceLockEnabled] = useState<boolean>(false);
    const [selectedStyle, setSelectedStyle] = useState<string>(RECOMMENDED_STYLES[0].value);
    const [styleModifiers, setStyleModifiers] = useState({
        sharpen: false,
        highContrast: false,
        realistic: false,
    });
    const [aspectRatio, setAspectRatio] = useState<AspectRatio['value']>('1:1');
    const [isRatioLocked, setIsRatioLocked] = useState<boolean>(false);
    
    // State untuk "Prompt Ajaib Kamu"
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [translatedCustomPrompt, setTranslatedCustomPrompt] = useState<string>('');
    const [isTranslatingCustomPrompt, setIsTranslatingCustomPrompt] = useState<boolean>(false);
    const [translateCustomPrompt, setTranslateCustomPrompt] = useState<boolean>(true);
    const [isImprovingPrompt, setIsImprovingPrompt] = useState<boolean>(false);
    
    // State untuk "Action Figure Custom Outfit"
    const [actionFigureOutfit, setActionFigureOutfit] = useState<string>('');
    const [translatedActionFigureOutfit, setTranslatedActionFigureOutfit] = useState<string>('');
    const [isTranslatingOutfit, setIsTranslatingOutfit] = useState<boolean>(false);

    // State untuk "Giant Selfie"
    const [giantSelfieMonument, setGiantSelfieMonument] = useState<string>('Monas, Jakarta');
    const [translatedGiantSelfieMonument, setTranslatedGiantSelfieMonument] = useState<string>('');
    const [isTranslatingMonument, setIsTranslatingMonument] = useState<boolean>(false);

    // State untuk Style Kustom
    const [activeTab, setActiveTab] = useState<'rekomendasi' | 'kustom'>('rekomendasi');
    const [activeCustomStyle, setActiveCustomStyle] = useState<CustomStyle['id'] | null>(null);
    const [gantiOutfitImages, setGantiOutfitImages] = useState<GantiOutfitImages>({ outfit: null, pants: null, shoes: null, accessory: null, fullOutfit: null });
    const [gantiOutfitBodyOptions, setGantiOutfitBodyOptions] = useState<GantiOutfitBodyOptions>({
        bodyType: 'standar',
        bustSize: 'sedang',
        hipSize: 'sedang',
    });
    const [idolImage, setIdolImage] = useState<ImageFile | null>(null);
    const [isIdolFaceLockEnabled, setIsIdolFaceLockEnabled] = useState<boolean>(true);
    const [photoWithIdolOptions, setPhotoWithIdolOptions] = useState<PhotoWithIdolOptions>({
        manualPrompt: '',
        poseTemplate: IDOL_POSE_TEMPLATES[0].value,
        shotStyleTemplate: SHOT_STYLE_TEMPLATES[0].value,
        lightStyleTemplate: LIGHT_STYLE_TEMPLATES[0].value,
    });
    const [isImprovingIdolPrompt, setIsImprovingIdolPrompt] = useState<boolean>(false);
    const [idolTemplatePrompt, setIdolTemplatePrompt] = useState<string>('');
    const [touchUpOptions, setTouchUpOptions] = useState<TouchUpOptions>({
        lipColor: '',
        blushIntensity: 'none',
        brightenFace: false,
        healSkin: true,
        hairstyle: '',
        hairColor: '',
    });
    const [fashionAnalysisImage, setFashionAnalysisImage] = useState<ImageFile | null>(null);
    const [semuaBisaDisiniOptions, setSemuaBisaDisiniOptions] = useState<SemuaBisaDisiniOptions>({
        numberOfPhotos: 2,
        images: [null, null],
        prompt: '',
    });
    const [isImprovingSBDPrompt, setIsImprovingSBDPrompt] = useState(false);
    const [veoManualPrompt, setVeoManualPrompt] = useState<string>('');
    const [isImprovingVeoPrompt, setIsImprovingVeoPrompt] = useState<boolean>(false);
    const [improvedVeoPrompt, setImprovedVeoPrompt] = useState<{ detailed: string, concise: string } | null>(null);
    const [selectedVeoVersion, setSelectedVeoVersion] = useState<'detailed' | 'concise'>('detailed');
    const [underwearLingerieOptions, setUnderwearLingerieOptions] = useState<UnderwearLingerieOptions>({
        ethnicity: 'indonesia',
        bodyType: 'atletis',
        hairColor: 'coklat',
        setting: 'studio minimalis',
        bustSize: 'sedang',
        pose: LINGERIE_POSE_TEMPLATES[0].value,
    });
    
    // State for improved prompt choices
    const [improvedOptions, setImprovedOptions] = useState<{
        key: string; // To identify which input the options are for
        detailed: string;
        concise: string;
        onSelect: (version: string) => void;
        onClose: () => void;
    } | null>(null);


    // Effect for debounced translation of main subject
    useEffect(() => {
        if (!mainSubject.trim() || uploadedImage) {
            setTranslatedMainSubject('');
            setIsTranslatingSubject(false);
            return;
        }

        setIsTranslatingSubject(true);
        const timer = setTimeout(async () => {
            try {
                const translation = await translateToEnglish(mainSubject);
                setTranslatedMainSubject(translation);
            } catch (error) {
                console.error("Gagal menerjemahkan subjek utama:", error);
                setTranslatedMainSubject(mainSubject); // Fallback to original on error
            } finally {
                setIsTranslatingSubject(false);
            }
        }, 5000); // 5 second delay

        return () => clearTimeout(timer);
    }, [mainSubject, uploadedImage]);


    useEffect(() => {
        let finalPrompt: string;
        if (activeTab === 'kustom' && activeCustomStyle === 'promptVideoVeo') {
            if (improvedVeoPrompt) {
                 finalPrompt = improvedVeoPrompt[selectedVeoVersion];
            } else {
                 finalPrompt = 'Tulis ide Anda di atas dan klik "Tingkatkan" untuk membuat prompt video.';
            }
        } else if (uploadedImage) {
            const customStylesWithAutoPrompt: CustomStyle['id'][] = ['gantiOutfit', 'touchUpWajah', 'identifikasiFashion', 'removeWatermark', 'tingkatkanKualitas', 'semuaBisaDisini', 'promptVideoVeo', 'underwearLingerie'];
            if (activeTab === 'kustom' && activeCustomStyle && customStylesWithAutoPrompt.includes(activeCustomStyle)) {
                 if(activeCustomStyle === 'semuaBisaDisini') {
                    finalPrompt = semuaBisaDisiniOptions.prompt || "Tulis deskripsi untuk menggabungkan foto di atas.";
                 } else {
                    finalPrompt = "Prompt dibuat secara otomatis berdasarkan gambar dan gaya yang dipilih.";
                 }
            } else if (activeTab === 'kustom' && activeCustomStyle === 'photoWithIdol') {
                 if (photoWithIdolOptions.manualPrompt.trim()) {
                    finalPrompt = photoWithIdolOptions.manualPrompt;
                } else if (idolTemplatePrompt.trim()) {
                    finalPrompt = idolTemplatePrompt;
                }
                 else {
                    finalPrompt = "Pilih template dan klik 'Buat Prompt dari Template' di atas, atau tulis prompt manual.";
                }
            } else if (selectedStyle === '__GIANT_SELFIE__') {
                const monumentText = translatedGiantSelfieMonument || giantSelfieMonument;
                finalPrompt = `Transform the photo man/woman into a giant with a crouching position like a giant on the side ${monumentText}, while maintaining the resemblance of his face to the uploaded reference photo. His hands holding his head looked confused looking at the camera with a dramatic effect using a Nikon D3000 camera. The photo style is very realistic, with cinematic lighting, cloudy blue skies, and small people walking around, as if photographed with a 16mm ultra wide angle lens.`;
            } else if (selectedStyle === '__ACTION_FIGURE_CUSTOM__') {
                const basePrompt = `A hyper-realistic 3D render, 3:4 ratio. A collectible action figure, 100% face similarity to the uploaded photo`;
                if (translatedActionFigureOutfit) {
                    finalPrompt = `${basePrompt}, wearing ${translatedActionFigureOutfit}.`;
                } else {
                    finalPrompt = `${basePrompt}.`;
                }
            } else if (selectedStyle === '__CUSTOM_PROMPT__') {
                 if (translateCustomPrompt) {
                    if (isTranslatingCustomPrompt) {
                        finalPrompt = 'Menerjemahkan prompt Anda...';
                    } else {
                        finalPrompt = translatedCustomPrompt || customPrompt;
                    }
                } else {
                    finalPrompt = customPrompt;
                }
            } else {
                 const modifiers = [];
                if (styleModifiers.sharpen) modifiers.push('sharp focus');
                if (styleModifiers.highContrast) modifiers.push('high contrast');
                if (styleModifiers.realistic) modifiers.push('realistic');

                finalPrompt = selectedStyle;
                if (modifiers.length > 0) {
                    finalPrompt += `, ${modifiers.join(', ')}`;
                }
            }
        } else {
             const styleParts = Object.values(selections)
                .filter(value => value && value.trim() !== '')
                .join(', ');
            const subjectToUse = translatedMainSubject.trim() ? translatedMainSubject : mainSubject;
            finalPrompt = subjectToUse.trim() ? `${subjectToUse.trim()}, ${styleParts}` : styleParts;
        }
        
        setGeneratedPrompt(finalPrompt);
    }, [mainSubject, translatedMainSubject, selections, uploadedImage, selectedStyle, styleModifiers, customPrompt, activeTab, activeCustomStyle, translatedActionFigureOutfit, translateCustomPrompt, translatedCustomPrompt, isTranslatingCustomPrompt, photoWithIdolOptions.manualPrompt, idolTemplatePrompt, semuaBisaDisiniOptions.prompt, improvedVeoPrompt, selectedVeoVersion, giantSelfieMonument, translatedGiantSelfieMonument]);

    // Effect untuk terjemahan monumen giant selfie
    useEffect(() => {
        if (selectedStyle !== '__GIANT_SELFIE__' || !giantSelfieMonument.trim()) {
            setTranslatedGiantSelfieMonument('');
            if (isTranslatingMonument) setIsTranslatingMonument(false);
            return;
        }

        setIsTranslatingMonument(true);
        const timer = setTimeout(async () => {
            try {
                const translation = await translateToEnglish(giantSelfieMonument);
                setTranslatedGiantSelfieMonument(translation);
            } catch (error) {
                console.error("Gagal menerjemahkan monumen:", error);
                setTranslatedGiantSelfieMonument('');
            } finally {
                setIsTranslatingMonument(false);
            }
        }, 5000); // Jeda 5 detik

        return () => clearTimeout(timer);
    }, [giantSelfieMonument, selectedStyle]);

    // Effect untuk terjemahan kostum action figure
    useEffect(() => {
        if (selectedStyle !== '__ACTION_FIGURE_CUSTOM__' || !actionFigureOutfit.trim()) {
            setTranslatedActionFigureOutfit('');
            if (isTranslatingOutfit) setIsTranslatingOutfit(false);
            return;
        }

        setIsTranslatingOutfit(true);
        const timer = setTimeout(async () => {
            try {
                const translation = await translateToEnglish(actionFigureOutfit);
                setTranslatedActionFigureOutfit(translation);
            } catch (error) {
                console.error("Gagal menerjemahkan kostum:", error);
                setTranslatedActionFigureOutfit('');
            } finally {
                setIsTranslatingOutfit(false);
            }
        }, 5000); // Jeda 5 detik

        return () => clearTimeout(timer);
    }, [actionFigureOutfit, selectedStyle]);
    
    // Effect untuk terjemahan "Prompt Ajaib Kamu" secara reaktif
    useEffect(() => {
        if (selectedStyle !== '__CUSTOM_PROMPT__' || !customPrompt.trim() || !translateCustomPrompt) {
            setTranslatedCustomPrompt('');
            setIsTranslatingCustomPrompt(false);
            return;
        }

        setIsTranslatingCustomPrompt(true);
        const timer = setTimeout(async () => {
            try {
                const translation = await translateToEnglish(customPrompt);
                setTranslatedCustomPrompt(translation);
            } catch (error) {
                console.error("Gagal menerjemahkan prompt kustom:", error);
                setTranslatedCustomPrompt('Gagal menerjemahkan.'); // Show error in UI
            } finally {
                setIsTranslatingCustomPrompt(false);
            }
        }, 1500); // 1.5 second delay

        return () => clearTimeout(timer);
    }, [customPrompt, selectedStyle, translateCustomPrompt]);

    // Effect to auto-manage face lock
    useEffect(() => {
        if (activeTab === 'kustom') {
            if (['gantiOutfit', 'photoWithIdol', 'touchUpWajah', 'tingkatkanKualitas'].includes(activeCustomStyle || '')) {
                setIsFaceLockEnabled(true);
            } else if (['underwearLingerie', 'identifikasiFashion', 'removeWatermark', 'semuaBisaDisini'].includes(activeCustomStyle || '')) {
                setIsFaceLockEnabled(false);
            }
        }
    }, [activeTab, activeCustomStyle]);

    const handleSelectionChange = (categoryId: string, value: string) => {
        setSelections(prev => ({ ...prev, [categoryId]: value, }));
    };

    const handleCopyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [generatedPrompt]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setUploadedImage({ data: result, mimeType: file.type });
                setIsFaceLockEnabled(true);

                if (!isRatioLocked) {
                    const img = new Image();
                    img.onload = () => {
                        const ratio = img.width / img.height;
                        const closest = ASPECT_RATIOS.reduce((prev, curr) => {
                            const currRatioVal = eval(curr.value.replace(':', '/'));
                            const prevRatioVal = eval(prev.value.replace(':', '/'));
                            return (Math.abs(currRatioVal - ratio) < Math.abs(prevRatioVal - ratio) ? curr : prev);
                        });
                        setAspectRatio(closest.value);
                    };
                    img.src = result;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setUploadedImage(null);
        setIsFaceLockEnabled(false);
        setActiveCustomStyle(null);
        setGantiOutfitImages({ outfit: null, pants: null, shoes: null, accessory: null, fullOutfit: null });
        setIdolImage(null);
        setStyleModifiers({ sharpen: false, highContrast: false, realistic: false });
        setActionFigureOutfit('');
        setTranslatedActionFigureOutfit('');
        setFashionAnalysisImage(null);
    };

    const handleGantiOutfitImageChange = (type: keyof GantiOutfitImages, file: File | null) => {
        const processFile = (f: File, callback: (result: ImageFile) => void) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback({ data: reader.result as string, mimeType: f.type });
            };
            reader.readAsDataURL(f);
        };

        if (file) {
            processFile(file, (imageFile) => {
                setGantiOutfitImages(prev => {
                    const newState = { ...prev, [type]: imageFile };
                    // Logic to enforce mode exclusivity
                    if (type === 'fullOutfit') {
                        newState.outfit = null;
                        newState.pants = null;
                        newState.shoes = null;
                    } else if (['outfit', 'pants', 'shoes'].includes(type)) {
                        newState.fullOutfit = null;
                    }
                    return newState;
                });
            });
        } else {
             setGantiOutfitImages(prev => ({ ...prev, [type]: null }));
        }
    };
    
    const handleIdolImageChange = (file: File | null) => {
         if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdolImage({ data: reader.result as string, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        } else {
            setIdolImage(null);
        }
    };

    const handleSBDPhotoCountChange = (count: number) => {
        setSemuaBisaDisiniOptions(prev => ({
            ...prev,
            numberOfPhotos: count,
            images: Array(count).fill(null).map((_, i) => prev.images[i] || null),
        }));
    };

    const handleSBDImageChange = (index: number, file: File | null) => {
        const processFile = (f: File, callback: (result: ImageFile) => void) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback({ data: reader.result as string, mimeType: f.type });
            };
            reader.readAsDataURL(f);
        };
        
        const newImages = [...semuaBisaDisiniOptions.images];
        if (file) {
            processFile(file, (imageFile) => {
                newImages[index] = imageFile;
                setSemuaBisaDisiniOptions(prev => ({ ...prev, images: newImages }));
            });
        } else {
            newImages[index] = null;
            setSemuaBisaDisiniOptions(prev => ({ ...prev, images: newImages }));
        }
    };
    
    const handleImproveSBDPrompt = async () => {
        if (!semuaBisaDisiniOptions.prompt.trim() || isImprovingSBDPrompt) return;
        setIsImprovingSBDPrompt(true);
        try {
            const improved = await improveMultiImagePrompt(semuaBisaDisiniOptions.prompt);
            setImprovedOptions({
                ...improved,
                key: 'sbd',
                onSelect: (version) => {
                    setSemuaBisaDisiniOptions(p => ({ ...p, prompt: version }));
                    setImprovedOptions(null);
                },
                onClose: () => setImprovedOptions(null)
            });
        } catch (error) {
            console.error("Gagal meningkatkan prompt 'Semua Bisa Disini':", error);
        } finally {
            setIsImprovingSBDPrompt(false);
        }
    };


    const handleImproveSubject = async () => {
        if (!mainSubject.trim() || isImprovingSubject) return;
        setIsImprovingSubject(true);
        try {
            const improved = await improvePrompt(mainSubject);
            setImprovedOptions({
                ...improved,
                key: 'mainSubject',
                onSelect: (version) => {
                    setMainSubject(version);
                    setImprovedOptions(null);
                },
                onClose: () => setImprovedOptions(null)
            });
        } catch (error) {
            console.error("Gagal meningkatkan subjek:", error);
        } finally {
            setIsImprovingSubject(false);
        }
    };

    const handleImprovePrompt = async () => {
        if (!customPrompt.trim() || isImprovingPrompt) return;
        setIsImprovingPrompt(true);
        try {
            const improved = await improvePrompt(customPrompt);
            setImprovedOptions({
                ...improved,
                key: 'customPrompt',
                onSelect: (version) => {
                    setCustomPrompt(version);
                    setImprovedOptions(null);
                },
                onClose: () => setImprovedOptions(null)
            });
        } catch (error) {
            console.error("Gagal meningkatkan prompt:", error);
        } finally {
            setIsImprovingPrompt(false);
        }
    };

    const handleImproveIdolManualPrompt = async () => {
        if (!photoWithIdolOptions.manualPrompt.trim() || isImprovingIdolPrompt) return;
        setIsImprovingIdolPrompt(true);
        try {
            const improved = await improveIdolPrompt(photoWithIdolOptions.manualPrompt);
             setImprovedOptions({
                ...improved,
                key: 'idol',
                onSelect: (version) => {
                    setPhotoWithIdolOptions(p => ({ ...p, manualPrompt: version }));
                    setImprovedOptions(null);
                },
                onClose: () => setImprovedOptions(null)
            });
        } catch (error) {
            console.error("Gagal meningkatkan prompt idola:", error);
            // Optionally, show an alert to the user
        } finally {
            setIsImprovingIdolPrompt(false);
        }
    };

    const handleGenerateIdolTemplatePrompt = () => {
        const { poseTemplate, shotStyleTemplate, lightStyleTemplate } = photoWithIdolOptions;
        if (!poseTemplate || !shotStyleTemplate || !lightStyleTemplate) {
            alert("Silakan pilih opsi untuk Pose, Gaya Pengambilan Gambar, dan Pencahayaan.");
            return;
        }
        
        const prompt = `A hyper-realistic and sharply detailed 8k photo.
- Pose: ${poseTemplate}.
- Camera Shot: a ${shotStyleTemplate}.
- Lighting: ${lightStyleTemplate}.`;
        
        setIdolTemplatePrompt(prompt);
    };
    
    const handleImproveVeoPrompt = async () => {
        if (!veoManualPrompt.trim() || isImprovingVeoPrompt) return;
        setIsImprovingVeoPrompt(true);
        setImprovedVeoPrompt(null);
        try {
            const improved = await improveVideoPrompt(veoManualPrompt);
            setImprovedVeoPrompt(improved);
            setSelectedVeoVersion('detailed');
        } catch (error) {
            console.error("Gagal meningkatkan prompt Veo:", error);
            // setImprovedVeoPrompt("Gagal meningkatkan prompt. Silakan coba lagi.");
        } finally {
            setIsImprovingVeoPrompt(false);
        }
    };

    const handleGenerateClick = () => {
        if (activeTab === 'kustom' && activeCustomStyle === 'underwearLingerie') {
            if (!uploadedImage) {
                alert('Silakan unggah foto underwear/lingerie.');
                return;
            }
            onGenerate({
                prompt: 'underwear-lingerie-prompt',
                image: uploadedImage,
                useFaceLock: false, // Not applicable
                aspectRatio,
                customStyle: 'underwearLingerie',
                underwearLingerieOptions: underwearLingerieOptions,
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'semuaBisaDisini') {
            onGenerate({
                prompt: 'semua-bisa-disini-prompt',
                image: null, 
                useFaceLock: false,
                aspectRatio,
                customStyle: 'semuaBisaDisini',
                semuaBisaDisiniOptions: semuaBisaDisiniOptions,
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'removeWatermark') {
            if (!uploadedImage) {
                alert('Silakan unggah foto yang ingin dibersihkan dari watermark.');
                return;
            }
            onGenerate({
                prompt: 'remove-watermark-prompt',
                image: uploadedImage,
                useFaceLock: false,
                aspectRatio,
                customStyle: 'removeWatermark',
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'tingkatkanKualitas') {
            if (!uploadedImage) {
                alert('Silakan unggah foto yang ingin ditingkatkan kualitasnya.');
                return;
            }
            onGenerate({
                prompt: 'tingkatkan-kualitas-prompt',
                image: uploadedImage,
                useFaceLock: true,
                aspectRatio,
                customStyle: 'tingkatkanKualitas',
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'identifikasiFashion') {
            if (!fashionAnalysisImage) {
                alert('Silakan unggah foto outfit untuk dianalisis.');
                return;
            }
            onGenerate({
                prompt: 'identifikasi-fashion-prompt',
                image: fashionAnalysisImage,
                useFaceLock: false,
                aspectRatio,
                customStyle: 'identifikasiFashion',
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'gantiOutfit') {
            const hasFullOutfit = gantiOutfitImages.fullOutfit;
            const hasSeparates = gantiOutfitImages.outfit || gantiOutfitImages.pants || gantiOutfitImages.shoes;
            if (!hasFullOutfit && !hasSeparates) {
                alert('Silakan unggah "Full Dresscode" atau setidaknya satu bagian pakaian (Baju, Celana, atau Sepatu).');
                return;
            }
            onGenerate({
                prompt: 'ganti-outfit-prompt',
                image: uploadedImage,
                useFaceLock: true,
                aspectRatio,
                customStyle: 'gantiOutfit',
                customStyleImages: gantiOutfitImages,
                gantiOutfitBodyOptions: gantiOutfitBodyOptions,
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'photoWithIdol') {
            if (!idolImage) {
                alert('Silakan unggah foto idola Anda.');
                return;
            }
            const hasManualPrompt = photoWithIdolOptions.manualPrompt.trim() !== '';
            if (!hasManualPrompt && !photoWithIdolOptions.poseTemplate) {
                alert('Silakan tulis prompt manual atau pilih setidaknya satu template pose.');
                return;
            }
            onGenerate({
                prompt: 'photo-with-idol-prompt',
                image: uploadedImage,
                idolImage: idolImage,
                useFaceLock: true,
                useIdolFaceLock: isIdolFaceLockEnabled,
                aspectRatio,
                customStyle: 'photoWithIdol',
                photoWithIdolOptions: photoWithIdolOptions,
            });
        } else if (activeTab === 'kustom' && activeCustomStyle === 'touchUpWajah') {
            if (!touchUpOptions.lipColor && touchUpOptions.blushIntensity === 'none' && !touchUpOptions.brightenFace && !touchUpOptions.healSkin && !touchUpOptions.hairstyle && !touchUpOptions.hairColor) {
                alert('Pilih setidaknya satu opsi "Touch Up" untuk melanjutkan.');
                return;
            }
            onGenerate({
                prompt: 'touch-up-wajah-prompt',
                image: uploadedImage,
                useFaceLock: true,
                aspectRatio,
                customStyle: 'touchUpWajah',
                touchUpOptions: touchUpOptions,
            });
        } else {
             const isCustom = uploadedImage && selectedStyle === '__CUSTOM_PROMPT__';
             const promptToSend = isCustom ? customPrompt : generatedPrompt;
            if ((isCustom && !promptToSend.trim()) || (!uploadedImage && !mainSubject.trim())) {
                 alert('Prompt tidak boleh kosong.');
                 return;
            }

            onGenerate({
                prompt: promptToSend,
                image: uploadedImage,
                useFaceLock: isFaceLockEnabled,
                aspectRatio,
                translatePrompt: isCustom && translateCustomPrompt,
            });
        }
    };
    
    const TabButton: React.FC<{
        label: string;
        isActive: boolean;
        onClick: () => void;
    }> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    const isFullOutfitMode = !!gantiOutfitImages.fullOutfit;
    const isSeparatePiecesMode = !!gantiOutfitImages.outfit || !!gantiOutfitImages.pants || !!gantiOutfitImages.shoes;
    const isFaceLockDisabled = activeTab === 'kustom' && (['gantiOutfit', 'photoWithIdol', 'touchUpWajah', 'tingkatkanKualitas'].includes(activeCustomStyle || ''));
    const isFaceLockControlDisabled = isFaceLockDisabled || (activeCustomStyle !== null && !['gantiOutfit', 'photoWithIdol', 'touchUpWajah', 'tingkatkanKualitas'].includes(activeCustomStyle));

    const uploaderLabel = activeCustomStyle === 'underwearLingerie' 
        ? '3. Unggah Foto Underwear/Lingerie' 
        : uploadedImage ? 'Foto Utama' : '3. Unggah Foto (Opsional)';
    
    const generateButtonText = 
        (activeTab === 'kustom' && activeCustomStyle === 'identifikasiFashion') ? 'Mulai Analisis' :
        (activeTab === 'kustom' && activeCustomStyle === 'removeWatermark') ? 'Hapus Watermark' :
        (activeTab === 'kustom' && activeCustomStyle === 'tingkatkanKualitas') ? 'Tingkatkan Kualitas' :
        'Buat Gambar';
        
    const loadingText = 
        (activeTab === 'kustom' && activeCustomStyle === 'identifikasiFashion') ? 'Menganalisis...' :
        (activeTab === 'kustom' && activeCustomStyle === 'removeWatermark') ? 'Menghapus...' :
        (activeTab === 'kustom' && activeCustomStyle === 'tingkatkanKualitas') ? 'Meningkatkan...' :
        'Membuat...';


    return (
        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 flex flex-col gap-6 h-full">
            
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">
                        {uploadedImage ? 'Aspek Rasio (Direkomendasikan)' : '1. Pilih Aspek Rasio'}
                    </label>
                    <select
                        id="aspectRatio"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio['value'])}
                        disabled={isRatioLocked || !!uploadedImage}
                    >
                        {ASPECT_RATIOS.map(ratio => (
                            <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end pb-1">
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="ratioLock" 
                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                            checked={isRatioLocked}
                            onChange={(e) => setIsRatioLocked(e.target.checked)}
                        />
                        <label htmlFor="ratioLock" className="ml-2 text-sm text-gray-300">
                            Kunci Rasio
                        </label>
                    </div>
                </div>
            </div>

            {!uploadedImage && (
                <div>
                    <label htmlFor="mainSubject" className="block text-sm font-medium text-gray-300 mb-2">
                        2. Masukkan Subjek Utama
                    </label>
                    <textarea
                        id="mainSubject"
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Contoh: Seekor naga megah terbang di atas kota futuristik"
                        value={mainSubject}
                        onChange={(e) => {
                            setMainSubject(e.target.value);
                            if (improvedOptions?.key === 'mainSubject') setImprovedOptions(null);
                        }}
                    />
                    {isTranslatingSubject && (
                        <p className="text-xs text-amber-400 mt-2 animate-pulse">Menerjemahkan subjek utama setelah 5 detik jeda...</p>
                    )}
                    <button 
                        onClick={handleImproveSubject} 
                        disabled={isImprovingSubject || !mainSubject.trim()} 
                        className="mt-2 w-full text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition flex items-center justify-center gap-2"
                    >
                        {isImprovingSubject ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-5 h-5"/>}
                        {isImprovingSubject ? 'Meningkatkan...' : 'Tingkatkan dengan AI'}
                    </button>
                     {improvedOptions?.key === 'mainSubject' && <ImprovedOptionsDisplay {...improvedOptions} />}
                </div>
            )}
            
            <ImageUploader 
                label={uploaderLabel}
                image={uploadedImage}
                onImageSelect={(file) => {
                    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleImageUpload(event);
                }}
                onImageRemove={removeImage}
                showRemoveButton={!!uploadedImage}
            />
            {uploadedImage && (
             <div className="flex items-center -mt-3">
                <input 
                    type="checkbox" 
                    id="faceLock" 
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    checked={isFaceLockEnabled}
                    onChange={(e) => setIsFaceLockEnabled(e.target.checked)}
                    disabled={isFaceLockControlDisabled}
                />
                <label htmlFor="faceLock" className={`ml-2 text-sm ${uploadedImage ? 'text-gray-300' : 'text-gray-500'}`}>
                    Kunci Wajah
                </label>
                {isFaceLockDisabled && <span className="text-xs text-gray-400 ml-2">(Otomatis aktif)</span>}
             </div>
            )}


            {uploadedImage ? (
                <div>
                    <div className="flex gap-2 border-b border-gray-700 mb-4">
                        <TabButton label="Rekomendasi Style" isActive={activeTab === 'rekomendasi'} onClick={() => setActiveTab('rekomendasi')} />
                        <TabButton label="Style Kustom" isActive={activeTab === 'kustom'} onClick={() => setActiveTab('kustom')} />
                    </div>
                    {activeTab === 'rekomendasi' && (
                         <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-2">2. Pilih Rekomendasi</h3>
                             <select
                                id="recommendedStyle"
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                            >
                                {RECOMMENDED_STYLES.map(style => (
                                    <option key={style.label} value={style.value}>{style.label}</option>
                                ))}
                            </select>
                            
                            {selectedStyle === '__GIANT_SELFIE__' && (
                                 <div className="mt-4 flex flex-col gap-3 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                     <label htmlFor="giantSelfieMonument" className="block text-xs font-medium text-gray-400">Tuliskan nama monumen atau tempat ikonik (dalam Bahasa Indonesia):</label>
                                     <input
                                        id="giantSelfieMonument"
                                        type="text"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Contoh: Monas, Jakarta"
                                        value={giantSelfieMonument}
                                        onChange={(e) => setGiantSelfieMonument(e.target.value)}
                                    />
                                    {isTranslatingMonument && <p className="text-xs text-amber-400 animate-pulse">Menerjemahkan setelah 5 detik jeda...</p>}
                                 </div>
                            )}

                             {selectedStyle === '__ACTION_FIGURE_CUSTOM__' && (
                                 <div className="mt-4 flex flex-col gap-3 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                     <label htmlFor="actionFigureOutfit" className="block text-xs font-medium text-gray-400">Deskripsikan kostum figur aksi (dalam Bahasa Indonesia):</label>
                                     <textarea
                                        id="actionFigureOutfit"
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Contoh: Baju zirah futuristik berwarna perak dengan aksen biru neon"
                                        value={actionFigureOutfit}
                                        onChange={(e) => setActionFigureOutfit(e.target.value)}
                                    />
                                    {isTranslatingOutfit && <p className="text-xs text-amber-400 animate-pulse">Menerjemahkan setelah 5 detik jeda...</p>}
                                 </div>
                            )}

                            {selectedStyle === '__CUSTOM_PROMPT__' && (
                                 <div className="mt-4 flex flex-col gap-3 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                     <label htmlFor="customPrompt" className="block text-xs font-medium text-gray-400">Tulis deskripsi Anda dalam Bahasa Indonesia:</label>
                                     <textarea
                                        id="customPrompt"
                                        rows={4}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Contoh: Seorang ksatria cyberpunk dengan baju zirah neon..."
                                        value={customPrompt}
                                        onChange={(e) => {
                                            setCustomPrompt(e.target.value);
                                            if (improvedOptions?.key === 'customPrompt') setImprovedOptions(null);
                                        }}
                                    />
                                    <div className='flex flex-col sm:flex-row gap-3'>
                                        <button onClick={handleImprovePrompt} disabled={isImprovingPrompt || !customPrompt.trim()} className="flex-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition flex items-center justify-center gap-2">
                                            {isImprovingPrompt ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-5 h-5"/>}
                                            {isImprovingPrompt ? 'Meningkatkan...' : 'Tingkatkan dengan AI'}
                                        </button>
                                        <div className="flex items-center justify-center p-2 bg-gray-800 rounded-md">
                                            <input type="checkbox" id="translate" checked={translateCustomPrompt} onChange={(e) => setTranslateCustomPrompt(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                                            <label htmlFor="translate" className="ml-2 text-sm text-gray-300">Terjemahkan</label>
                                        </div>
                                    </div>
                                    {improvedOptions?.key === 'customPrompt' && <ImprovedOptionsDisplay {...improvedOptions} />}
                                </div>
                            )}

                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-gray-400 mb-2">Opsi Tambahan:</h4>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    <div className="flex items-center"><input type="checkbox" id="sharpen" checked={styleModifiers.sharpen} onChange={(e) => setStyleModifiers(prev => ({ ...prev, sharpen: e.target.checked }))} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"/><label htmlFor="sharpen" className="ml-2 text-sm text-gray-300">Pertajam gambar</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="highContrast" checked={styleModifiers.highContrast} onChange={(e) => setStyleModifiers(prev => ({ ...prev, highContrast: e.target.checked }))} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"/><label htmlFor="highContrast" className="ml-2 text-sm text-gray-300">Kontras tinggi</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="realistic" checked={styleModifiers.realistic} onChange={(e) => setStyleModifiers(prev => ({ ...prev, realistic: e.target.checked }))} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"/><label htmlFor="realistic" className="ml-2 text-sm text-gray-300">Realistis</label></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'kustom' && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-2">2. Pilih Style Kustom</h3>
                            <div className="flex flex-wrap gap-2">
                                {CUSTOM_STYLES.map(style => (
                                    <button 
                                        key={style.id}
                                        onClick={() => {
                                            const newStyle = activeCustomStyle === style.id ? null : style.id;
                                            setActiveCustomStyle(newStyle);
                                            if (newStyle !== 'identifikasiFashion') {
                                                setFashionAnalysisImage(null);
                                            }
                                        }}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeCustomStyle === style.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                            
                            {activeCustomStyle && (
                                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col gap-4">
                                     <p className="text-xs text-center text-amber-300 bg-amber-900/30 p-2 rounded-md border border-amber-800">{CUSTOM_STYLES.find(s => s.id === activeCustomStyle)?.note}</p>
                                    {activeCustomStyle === 'underwearLingerie' && (
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-base font-semibold text-gray-200 mb-0">Kustomisasi Model</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="modelEthnicity" className="block text-xs font-medium text-gray-400 mb-1">Etnis</label>
                                                    <select
                                                        id="modelEthnicity"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.ethnicity}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, ethnicity: e.target.value as UnderwearLingerieOptions['ethnicity'] }))}
                                                    >
                                                        <option value="asia">Asia</option>
                                                        <option value="indonesia">Indonesia</option>
                                                        <option value="kaukasia">Kaukasia</option>
                                                        <option value="latina">Latina</option>
                                                        <option value="kulit hitam">Kulit Hitam</option>
                                                        <option value="timur tengah">Timur Tengah</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="modelBodyType" className="block text-xs font-medium text-gray-400 mb-1">Tipe Badan</label>
                                                    <select
                                                        id="modelBodyType"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.bodyType}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, bodyType: e.target.value as UnderwearLingerieOptions['bodyType'] }))}
                                                    >
                                                        <option value="langsing">Langsing</option>
                                                        <option value="atletis">Atletis</option>
                                                        <option value="berisi">Berisi</option>
                                                        <option value="melengkung">Melengkung (Curvy)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="modelBustSize" className="block text-xs font-medium text-gray-400 mb-1">Ukuran Dada</label>
                                                    <select
                                                        id="modelBustSize"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.bustSize}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, bustSize: e.target.value as UnderwearLingerieOptions['bustSize'] }))}
                                                    >
                                                        <option value="kecil">Kecil</option>
                                                        <option value="sedang">Sedang</option>
                                                        <option value="besar">Besar</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="modelHairColor" className="block text-xs font-medium text-gray-400 mb-1">Warna Rambut</label>
                                                    <select
                                                        id="modelHairColor"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.hairColor}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, hairColor: e.target.value as UnderwearLingerieOptions['hairColor'] }))}
                                                    >
                                                        <option value="pirang">Pirang</option>
                                                        <option value="coklat">Coklat</option>
                                                        <option value="hitam">Hitam</option>
                                                        <option value="merah">Merah</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="modelSetting" className="block text-xs font-medium text-gray-400 mb-1">Latar/Setting</label>
                                                    <select
                                                        id="modelSetting"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.setting}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, setting: e.target.value as UnderwearLingerieOptions['setting'] }))}
                                                    >
                                                        <option value="studio minimalis">Studio Minimalis</option>
                                                        <option value="kamar tidur mewah">Kamar Tidur Mewah</option>
                                                        <option value="pantai saat senja">Pantai Saat Senja</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="modelPose" className="block text-xs font-medium text-gray-400 mb-1">Pose</label>
                                                    <select
                                                        id="modelPose"
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                        value={underwearLingerieOptions.pose}
                                                        onChange={(e) => setUnderwearLingerieOptions(prev => ({ ...prev, pose: e.target.value }))}
                                                    >
                                                        {LINGERIE_POSE_TEMPLATES.map(pose => (
                                                            <option key={pose.label} value={pose.value}>{pose.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeCustomStyle === 'promptVideoVeo' && (
                                        <div className="flex flex-col gap-3">
                                            <label htmlFor="veoManualPrompt" className="block text-sm font-medium text-gray-300">Deskripsikan ide video Anda (dalam Bahasa Indonesia):</label>
                                            <textarea
                                                id="veoManualPrompt"
                                                rows={4}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Contoh: Seekor elang terbang di atas pegunungan Grand Canyon saat matahari terbit"
                                                value={veoManualPrompt}
                                                onChange={(e) => setVeoManualPrompt(e.target.value)}
                                            />
                                            <button 
                                                onClick={handleImproveVeoPrompt} 
                                                disabled={isImprovingVeoPrompt || !veoManualPrompt.trim()}
                                                className="w-full flex items-center justify-center gap-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition"
                                            >
                                                {isImprovingVeoPrompt ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-5 h-5"/>}
                                                {isImprovingVeoPrompt ? 'Meningkatkan...' : 'Tingkatkan dengan AI untuk Veo'}
                                            </button>
                                        </div>
                                    )}
                                    {activeCustomStyle === 'semuaBisaDisini' && (
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <label htmlFor="sbdPhotoCount" className="block text-sm font-medium text-gray-300 mb-2">Jumlah Foto</label>
                                                <select
                                                    id="sbdPhotoCount"
                                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                    value={semuaBisaDisiniOptions.numberOfPhotos}
                                                    onChange={(e) => handleSBDPhotoCountChange(parseInt(e.target.value, 10))}
                                                >
                                                    <option value={2}>2</option>
                                                    <option value={3}>3</option>
                                                    <option value={4}>4</option>
                                                    <option value={5}>5</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {semuaBisaDisiniOptions.images.map((img, index) => (
                                                    <ImageUploader
                                                        key={index}
                                                        label={`Foto ${index + 1}`}
                                                        image={img}
                                                        onImageSelect={(f) => handleSBDImageChange(index, f)}
                                                        onImageRemove={() => handleSBDImageChange(index, null)}
                                                        showRemoveButton
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <label htmlFor="sbdPrompt" className="block text-sm font-medium text-gray-300">Deskripsikan Hasil Akhir</label>
                                                <textarea
                                                    id="sbdPrompt"
                                                    rows={4}
                                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Contoh: Jadikan orang di Foto 1 sebagai seorang koki yang sedang memasak di dapur dari Foto 2."
                                                    value={semuaBisaDisiniOptions.prompt}
                                                    onChange={(e) => {
                                                        setSemuaBisaDisiniOptions(p => ({ ...p, prompt: e.target.value }));
                                                        if (improvedOptions?.key === 'sbd') setImprovedOptions(null);
                                                    }}
                                                />
                                                <button 
                                                    onClick={handleImproveSBDPrompt} 
                                                    disabled={isImprovingSBDPrompt || !semuaBisaDisiniOptions.prompt.trim()}
                                                    className="w-full flex items-center justify-center gap-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition"
                                                >
                                                    {isImprovingSBDPrompt ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-5 h-5"/>}
                                                    {isImprovingSBDPrompt ? 'Meningkatkan...' : 'Tingkatkan dengan AI'}
                                                </button>
                                                 {improvedOptions?.key === 'sbd' && <ImprovedOptionsDisplay {...improvedOptions} />}
                                            </div>
                                        </div>
                                    )}
                                    {activeCustomStyle === 'identifikasiFashion' && (
                                        <ImageUploader 
                                            label="Unggah Foto Outfit untuk Dianalisis" 
                                            image={fashionAnalysisImage} 
                                            onImageSelect={(file) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFashionAnalysisImage({ data: reader.result as string, mimeType: file.type });
                                                };
                                                reader.readAsDataURL(file);
                                            }} 
                                            onImageRemove={() => setFashionAnalysisImage(null)} 
                                            showRemoveButton={true} 
                                        />
                                    )}
                                    {activeCustomStyle === 'gantiOutfit' && (
                                        <>
                                            {/* Body Customization Section */}
                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="text-base font-semibold text-gray-200 mb-3">Kustomisasi Badan</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label htmlFor="bodyType" className="block text-xs font-medium text-gray-400 mb-1">Tipe Badan</label>
                                                        <select
                                                            id="bodyType"
                                                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                            value={gantiOutfitBodyOptions.bodyType}
                                                            onChange={(e) => setGantiOutfitBodyOptions(prev => ({ ...prev, bodyType: e.target.value as GantiOutfitBodyOptions['bodyType'] }))}
                                                        >
                                                            <option value="sangat kurus">Sangat Kurus</option>
                                                            <option value="kurus">Kurus</option>
                                                            <option value="standar">Standar</option>
                                                            <option value="berisi">Berisi</option>
                                                            <option value="gemuk">Gemuk</option>
                                                            <option value="sangat gemuk">Sangat Gemuk</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="bustSize" className="block text-xs font-medium text-gray-400 mb-1">Ukuran Dada (Wanita)</label>
                                                        <select
                                                            id="bustSize"
                                                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                            value={gantiOutfitBodyOptions.bustSize}
                                                            onChange={(e) => setGantiOutfitBodyOptions(prev => ({ ...prev, bustSize: e.target.value as GantiOutfitBodyOptions['bustSize'] }))}
                                                        >
                                                            <option value="kecil">Kecil</option>
                                                            <option value="sedang">Sedang</option>
                                                            <option value="besar">Besar</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="hipSize" className="block text-xs font-medium text-gray-400 mb-1">Ukuran Pinggul (Wanita)</label>
                                                        <select
                                                            id="hipSize"
                                                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
                                                            value={gantiOutfitBodyOptions.hipSize}
                                                            onChange={(e) => setGantiOutfitBodyOptions(prev => ({ ...prev, hipSize: e.target.value as GantiOutfitBodyOptions['hipSize'] }))}
                                                        >
                                                            <option value="ramping">Ramping</option>
                                                            <option value="sedang">Sedang</option>
                                                            <option value="lebar">Lebar</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="text-base font-semibold text-gray-200 mb-3">Unggah Pakaian</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <ImageUploader label="Unggah Full Dresscode" image={gantiOutfitImages.fullOutfit} onImageSelect={(f) => handleGantiOutfitImageChange('fullOutfit', f)} onImageRemove={() => handleGantiOutfitImageChange('fullOutfit', null)} showRemoveButton disabled={isSeparatePiecesMode} />
                                                    <ImageUploader label="Aksesori (Opsional)" image={gantiOutfitImages.accessory} onImageSelect={(f) => handleGantiOutfitImageChange('accessory', f)} onImageRemove={() => handleGantiOutfitImageChange('accessory', null)} showRemoveButton />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                                    <ImageUploader label="Unggah Baju" image={gantiOutfitImages.outfit} onImageSelect={(f) => handleGantiOutfitImageChange('outfit', f)} onImageRemove={() => handleGantiOutfitImageChange('outfit', null)} showRemoveButton disabled={isFullOutfitMode}/>
                                                    <ImageUploader label="Unggah Celana" image={gantiOutfitImages.pants} onImageSelect={(f) => handleGantiOutfitImageChange('pants', f)} onImageRemove={() => handleGantiOutfitImageChange('pants', null)} showRemoveButton disabled={isFullOutfitMode}/>
                                                    <ImageUploader label="Unggah Sepatu" image={gantiOutfitImages.shoes} onImageSelect={(f) => handleGantiOutfitImageChange('shoes', f)} onImageRemove={() => handleGantiOutfitImageChange('shoes', null)} showRemoveButton disabled={isFullOutfitMode}/>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {activeCustomStyle === 'photoWithIdol' && (
                                        <div className="flex flex-col gap-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <ImageUploader label="1. Foto Kamu" image={uploadedImage} onImageSelect={() => {}} onImageRemove={removeImage} showRemoveButton={false} disabled={true} />
                                                <div>
                                                    <ImageUploader label="2. Foto Doi/Idola" image={idolImage} onImageSelect={handleIdolImageChange} onImageRemove={() => setIdolImage(null)} showRemoveButton={true} />
                                                    <div className="flex items-center mt-2">
                                                        <input 
                                                            type="checkbox" 
                                                            id="idolFaceLock" 
                                                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                                                            checked={isIdolFaceLockEnabled}
                                                            onChange={(e) => setIsIdolFaceLockEnabled(e.target.checked)}
                                                        />
                                                        <label htmlFor="idolFaceLock" className="ml-2 text-sm text-gray-300">
                                                            Kunci Wajah Doi/Idola
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
                                                <h4 className="text-base font-semibold text-gray-200">Mode Manual</h4>
                                                <div className="relative">
                                                    <textarea
                                                        id="idolManualPrompt"
                                                        rows={3}
                                                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
                                                        placeholder="Tulis prompt adegan Anda di sini (mis: Berpose di karpet merah)"
                                                        value={photoWithIdolOptions.manualPrompt}
                                                        onChange={(e) => {
                                                            setPhotoWithIdolOptions(p => ({ ...p, manualPrompt: e.target.value }));
                                                            if (improvedOptions?.key === 'idol') setImprovedOptions(null);
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={handleImproveIdolManualPrompt} 
                                                        disabled={isImprovingIdolPrompt || !photoWithIdolOptions.manualPrompt.trim()}
                                                        className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-1 px-2 rounded-md transition"
                                                    >
                                                        {isImprovingIdolPrompt ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <SparklesIcon className="w-4 h-4"/>}
                                                        Tingkatkan
                                                    </button>
                                                </div>
                                                 {improvedOptions?.key === 'idol' && <ImprovedOptionsDisplay {...improvedOptions} />}
                                            </div>
                                             <div className="text-center text-gray-500 font-bold">ATAU</div>
                                             <div className={`border-t border-gray-700 pt-4 flex flex-col gap-4 ${photoWithIdolOptions.manualPrompt.trim() ? 'opacity-50' : ''}`}>
                                                <h4 className="text-base font-semibold text-gray-200">Mode Template</h4>
                                                <div>
                                                    <label htmlFor="poseTemplate" className="block text-xs font-medium text-gray-400 mb-1">Pilih Pose</label>
                                                    <select id="poseTemplate" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500" value={photoWithIdolOptions.poseTemplate} onChange={(e) => setPhotoWithIdolOptions(p => ({ ...p, poseTemplate: e.target.value }))} disabled={!!photoWithIdolOptions.manualPrompt.trim()}>
                                                        {IDOL_POSE_TEMPLATES.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="shotStyleTemplate" className="block text-xs font-medium text-gray-400 mb-1">Pilih Gaya Pengambilan Gambar</label>
                                                    <select id="shotStyleTemplate" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500" value={photoWithIdolOptions.shotStyleTemplate} onChange={(e) => setPhotoWithIdolOptions(p => ({ ...p, shotStyleTemplate: e.target.value }))} disabled={!!photoWithIdolOptions.manualPrompt.trim()}>
                                                        {SHOT_STYLE_TEMPLATES.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="lightStyleTemplate" className="block text-xs font-medium text-gray-400 mb-1">Pilih Gaya Pencahayaan</label>
                                                    <select id="lightStyleTemplate" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500" value={photoWithIdolOptions.lightStyleTemplate} onChange={(e) => setPhotoWithIdolOptions(p => ({ ...p, lightStyleTemplate: e.target.value }))} disabled={!!photoWithIdolOptions.manualPrompt.trim()}>
                                                        {LIGHT_STYLE_TEMPLATES.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                </div>
                                                <button 
                                                    onClick={handleGenerateIdolTemplatePrompt}
                                                    disabled={!!photoWithIdolOptions.manualPrompt.trim()}
                                                    className="w-full mt-2 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition"
                                                >
                                                    Buat Prompt dari Template
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {activeCustomStyle === 'touchUpWajah' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Kolom Kiri: Kulit & Riasan */}
                                            <div className="flex flex-col gap-4">
                                                <h4 className="text-base font-semibold text-gray-200">Kulit & Riasan</h4>
                                                {/* Opsi Kulit */}
                                                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                                                    <input type="checkbox" id="healSkin" checked={touchUpOptions.healSkin} onChange={(e) => setTouchUpOptions(p => ({...p, healSkin: e.target.checked}))} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                                                    <label htmlFor="healSkin" className="ml-2 text-sm text-gray-300">Hilangkan Noda/Jerawat</label>
                                                </div>
                                                <div className="flex items-center p-2 bg-gray-800 rounded-md">
                                                    <input type="checkbox" id="brightenFace" checked={touchUpOptions.brightenFace} onChange={(e) => setTouchUpOptions(p => ({...p, brightenFace: e.target.checked}))} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                                                    <label htmlFor="brightenFace" className="ml-2 text-sm text-gray-300">Cerahkah Wajah</label>
                                                </div>

                                                {/* Opsi Blush On */}
                                                <div>
                                                    <label htmlFor="blushIntensity" className="block text-sm font-medium text-gray-300 mb-2">Tambahkan Blush On</label>
                                                    <select
                                                        id="blushIntensity"
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                        value={touchUpOptions.blushIntensity}
                                                        onChange={(e) => setTouchUpOptions(p => ({...p, blushIntensity: e.target.value as TouchUpOptions['blushIntensity']}))}
                                                    >
                                                        <option value="none">Tidak Ada</option>
                                                        <option value="subtle">Tipis</option>
                                                        <option value="medium">Sedang</option>
                                                        <option value="strong">Tebal</option>
                                                    </select>
                                                </div>
                                                
                                                {/* Opsi Warna Bibir */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ganti Warna Bibir/Lipstik</label>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {LIPSTICK_COLORS.map(color => (
                                                            <button 
                                                                key={color.name} 
                                                                onClick={() => setTouchUpOptions(p => ({...p, lipColor: color.name}))} 
                                                                className={`p-1 rounded-full transition-transform transform hover:scale-110 ${touchUpOptions.lipColor === color.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : ''}`} 
                                                                title={color.displayName}
                                                            >
                                                                <div className="w-6 h-6 rounded-full" style={{backgroundColor: color.value}}></div>
                                                            </button>
                                                        ))}
                                                        
                                                        <label 
                                                            htmlFor="lipstickColorPicker" 
                                                            className={`p-1 rounded-full cursor-pointer transition-transform transform hover:scale-110 ${touchUpOptions.lipColor.startsWith('#') ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : ''}`}
                                                            title="Pilih warna kustom"
                                                        >
                                                            <div 
                                                                className="w-6 h-6 rounded-full border border-gray-500" 
                                                                style={{backgroundColor: touchUpOptions.lipColor.startsWith('#') ? touchUpOptions.lipColor : 'transparent', backgroundImage: touchUpOptions.lipColor.startsWith('#') ? 'none' : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'}}
                                                            ></div>
                                                            <input 
                                                                type="color" 
                                                                id="lipstickColorPicker"
                                                                className="opacity-0 w-0 h-0 absolute"
                                                                onInput={(e) => setTouchUpOptions(p => ({...p, lipColor: e.currentTarget.value}))}
                                                                value={touchUpOptions.lipColor.startsWith('#') ? touchUpOptions.lipColor : '#ffffff'}
                                                            />
                                                        </label>
                                                        <button 
                                                            onClick={() => setTouchUpOptions(p => ({...p, lipColor: ''}))} 
                                                            className={`p-1 rounded-full transition-transform transform hover:scale-110 ${touchUpOptions.lipColor === '' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-400' : ''}`}
                                                            title="Hapus Lipstik"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Kolom Kanan: Gaya & Warna Rambut */}
                                            <div className="flex flex-col gap-4">
                                                <h4 className="text-base font-semibold text-gray-200">Gaya & Warna Rambut</h4>
                                                <div>
                                                    <label htmlFor="hairstyle" className="block text-sm font-medium text-gray-300 mb-2">Ganti Gaya Rambut</label>
                                                    <select
                                                        id="hairstyle"
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                        value={touchUpOptions.hairstyle}
                                                        onChange={(e) => setTouchUpOptions(p => ({...p, hairstyle: e.target.value}))}
                                                    >
                                                        <option value="">Tidak Ada Perubahan</option>
                                                        {HAIRSTYLE_PRESETS.map(style => (
                                                            <option key={style.label} value={style.value}>{style.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="hairColor" className="block text-sm font-medium text-gray-300 mb-2">Ganti Warna Rambut</label>
                                                     <input 
                                                        type="text" 
                                                        id="hairColor"
                                                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                        placeholder="Contoh: Platinum blonde, deep brunette, vibrant red"
                                                        value={touchUpOptions.hairColor}
                                                        onChange={(e) => setTouchUpOptions(p => ({...p, hairColor: e.target.value}))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">3. Pilih Gaya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {STYLE_CATEGORIES.map(category => (
                            <div key={category.id}>
                                <label htmlFor={category.id} className="block text-xs font-medium text-gray-400 mb-1">{category.name}</label>
                                <select
                                    id={category.id}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    value={selections[category.id] || ''}
                                    onChange={(e) => handleSelectionChange(category.id, e.target.value)}
                                >
                                    {category.options.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-auto pt-6 border-t border-gray-700 flex flex-col gap-4">
                 <div className="relative">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Hasil Prompt Anda:</h4>
                     {activeTab === 'kustom' && activeCustomStyle === 'promptVideoVeo' && improvedVeoPrompt && (
                        <div className="flex gap-1 mb-2">
                             <button 
                                onClick={() => setSelectedVeoVersion('detailed')}
                                className={`px-3 py-1 text-xs rounded-md ${selectedVeoVersion === 'detailed' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Detail
                            </button>
                             <button 
                                onClick={() => setSelectedVeoVersion('concise')}
                                className={`px-3 py-1 text-xs rounded-md ${selectedVeoVersion === 'concise' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                Ringkas
                            </button>
                        </div>
                    )}
                    <pre className="text-sm bg-gray-900 p-4 rounded-md text-gray-400 font-mono whitespace-pre-wrap min-h-[80px]">
                        {generatedPrompt}
                    </pre>
                    <button 
                        onClick={handleCopyToClipboard}
                        className="absolute top-8 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition text-gray-300 hover:text-white"
                        aria-label="Salin prompt"
                    >
                       {isCopied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                    </button>
                </div>

                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || (activeTab === 'kustom' && activeCustomStyle === 'promptVideoVeo')}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{loadingText}</span>
                        </>
                    ) : (
                        <span>{generateButtonText}</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PromptStudio;