import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PromptStudio from './components/PromptStudio';
import ImageDisplay from './components/ImageDisplay';
import { generateImageFromText, editImage, translateToEnglish, changeOutfit, createPhotoWithIdol, removeWatermark, identifyFashion, combineImages } from './services/geminiService';
import type { AspectRatio, GantiOutfitBodyOptions, GantiOutfitImages, ImageFile, PhotoWithIdolOptions, SemuaBisaDisiniOptions, TouchUpOptions } from './types';

interface GenerateOptions {
    prompt: string;
    image: ImageFile | null;
    idolImage?: ImageFile | null;
    useFaceLock: boolean;
    useIdolFaceLock?: boolean;
    aspectRatio: AspectRatio['value'];
    translatePrompt?: boolean;
    customStyle?: 'gantiOutfit' | 'photoWithIdol' | 'touchUpWajah' | 'identifikasiFashion' | 'removeWatermark' | 'tingkatkanKualitas' | 'semuaBisaDisini';
    customStyleImages?: GantiOutfitImages;
    touchUpOptions?: TouchUpOptions;
    gantiOutfitBodyOptions?: GantiOutfitBodyOptions;
    photoWithIdolOptions?: PhotoWithIdolOptions;
    semuaBisaDisiniOptions?: SemuaBisaDisiniOptions;
}

const App: React.FC = () => {
    const [generatedImage, setGeneratedImage] = useState<ImageFile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fashionAnalysisResult, setFashionAnalysisResult] = useState<string | null>(null);
    const [fashionAnalysisSummary, setFashionAnalysisSummary] = useState<string | null>(null);
    const [history, setHistory] = useState<ImageFile[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    const updateHistory = (newImage: ImageFile) => {
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newImage);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        setGeneratedImage(newImage);
    };

    const handleGenerate = useCallback(async (options: GenerateOptions) => {
        setIsLoading(true);
        setError(null);
        setFashionAnalysisResult(null);
        setFashionAnalysisSummary(null);

        try {
            if (options.customStyle === 'removeWatermark' && options.image) {
                const cleanedImageFile = await removeWatermark(options.image);
                updateHistory(cleanedImageFile);
                return;
            }
            
            if (options.customStyle === 'identifikasiFashion' && options.image) {
                const analysisText = await identifyFashion(options.image);
                const separator = '---PROMPT SUMMARY---';
                const parts = analysisText.split(separator);

                if (parts.length > 1) {
                    setFashionAnalysisResult(parts[0].trim());
                    setFashionAnalysisSummary(parts[1].trim());
                } else {
                    setFashionAnalysisResult(analysisText);
                    setFashionAnalysisSummary(null);
                }
                
                setGeneratedImage(null);
                setHistory([]);
                setCurrentIndex(-1);
                return; 
            }

            let initialImageFile: ImageFile;

            if (options.customStyle === 'semuaBisaDisini' && options.semuaBisaDisiniOptions) {
                const { images, prompt, numberOfPhotos } = options.semuaBisaDisiniOptions;
                const validImages = images.filter(img => img !== null) as ImageFile[];
                if (validImages.length !== numberOfPhotos) {
                    throw new Error(`Harap unggah ${numberOfPhotos} gambar yang diperlukan.`);
                }
                if (!prompt.trim()) {
                    throw new Error("Prompt tidak boleh kosong.");
                }

                initialImageFile = await combineImages({
                    images: validImages,
                    prompt: prompt,
                });
            } else if (options.customStyle === 'gantiOutfit' && options.image && options.customStyleImages && options.gantiOutfitBodyOptions) {
                 initialImageFile = await changeOutfit({
                    person: options.image,
                    images: options.customStyleImages,
                    bodyOptions: options.gantiOutfitBodyOptions,
                });
            } else if (options.customStyle === 'photoWithIdol' && options.image && options.idolImage && options.photoWithIdolOptions) {
                initialImageFile = await createPhotoWithIdol({
                    userImage: options.image,
                    idolImage: options.idolImage,
                    useIdolFaceLock: options.useIdolFaceLock ?? true,
                    options: options.photoWithIdolOptions,
                });
            } else if (options.customStyle === 'touchUpWajah' && options.image && options.touchUpOptions) {
                const { lipColor, blushIntensity, brightenFace, healSkin, hairstyle, hairColor } = options.touchUpOptions;
                const instructions = [];
                if (healSkin) {
                    instructions.push('Skin Healing: Remove any blemishes, acne, or skin imperfections for a smooth, clear complexion.');
                }
                if (brightenFace) {
                    instructions.push('Face Brightening: Brighten the facial area for a radiant glow, while maintaining natural skin tones.');
                }
                if (lipColor) {
                    instructions.push(`Lipstick Application: Apply "${lipColor}" lipstick. If the color is a hex code, match it precisely. If it's a name, interpret it beautifully.`);
                }
                if (blushIntensity !== 'none') {
                    instructions.push(`Blush: Apply a ${blushIntensity} amount of natural-looking blush to the cheeks.`);
                }
                if (hairstyle) {
                    instructions.push(`Hairstyle Change: Change the hair to ${hairstyle}.`);
                }
                if (hairColor) {
                    instructions.push(`Hair Color Change: Change the hair color to ${hairColor}.`);
                }

                if (instructions.length === 0) {
                    throw new Error('Pilih setidaknya satu opsi touch up.');
                }

                const touchUpPrompt = `**Primary Goal: Perform a hyper-realistic, professional beauty touch-up on the person in the image while maintaining their exact identity.**

**ABSOLUTE & CRITICAL RULE: You MUST maintain 100% similarity to the original person's facial structure, bone structure, unique features (like moles or scars unless 'heal skin' is requested for blemishes), and overall identity. DO NOT change the person into someone else. The likeness must be perfectly preserved.**

**Allowed Aesthetic Enhancements:**
Apply these specific enhancements to the face:
- ${instructions.join('\n- ')}

**Scene Modification:**
After completing the facial enhancements, perform the following scene changes:
1.  **Background:** Replace the original background with a minimalist, aesthetic, plain studio background.
2.  **Background Color:** The color of this new background must be harmonious and complementary to the subject's clothing.
3.  **Lighting:** Ensure the overall lighting on both the subject and the new background is soft, natural, and flattering.

The final image must look like a professional, high-resolution portrait photograph.`;

                initialImageFile = await editImage({
                    image: options.image,
                    prompt: touchUpPrompt,
                    useFaceLock: false, // Face lock is now handled explicitly in the detailed prompt above
                });
            } else if (options.customStyle === 'tingkatkanKualitas' && options.image) {
                 const enhancePrompt = `**Tugas Utama:** Tingkatkan kualitas foto ini secara dramatis ke standar kamera DSLR profesional sambil mempertahankan subjek, komposisi, dan semua elemen asli dengan sempurna.

**Aturan Mutlak:** JANGAN mengubah komposisi, subjek, pose, pakaian, latar belakang, atau ornamen apa pun dalam gambar. Konten harus tetap sama persis.

**Peningkatan Kualitas yang Diizinkan:**
- **Resolusi & Detail:** Render ulang seluruh gambar ke resolusi 8k yang hiper-realistis. Tingkatkan ketajaman dan kejernihan semua detail dan tekstur secara dramatis. Gambar akhir harus sangat jernih.
- **Koreksi Warna:** Analisis dan perbaiki gradasi warna. Buat warna lebih hidup, kaya, dan nyata tanpa membuatnya terlalu jenuh. Perbaiki setiap cast warna yang salah.
- **Peningkatan Pencahayaan:** Analisis sumber cahaya yang ada di foto. Tingkatkan pencahayaan secara halus dan realistis agar lebih bagus dan profesional, seolah-olah diambil dengan peralatan studio kelas atas atau cahaya alami terbaik. Tingkatkan highlight dan bayangan untuk menciptakan kedalaman yang lebih baik.
- **Efek Lensa:** Simulasikan efek pemotretan dengan lensa prime DSLR berkualitas tinggi, menghasilkan gambar yang bersih, tajam dengan rendering yang indah.

Output akhir harus berupa gambar yang sama persis, tetapi ditingkatkan ke standar fotografi profesional beresolusi tinggi.`;
                initialImageFile = await editImage({
                    image: options.image,
                    prompt: enhancePrompt,
                    useFaceLock: true,
                });
            } else if (options.image) {
                let promptForGeneration = options.prompt;
                if (options.translatePrompt && options.prompt) {
                    promptForGeneration = await translateToEnglish(options.prompt);
                }
                if (!promptForGeneration) throw new Error('Prompt tidak boleh kosong.');

                initialImageFile = await editImage({
                    image: options.image,
                    prompt: `Terapkan gaya berikut pada keseluruhan gambar: ${promptForGeneration}`,
                    useFaceLock: options.useFaceLock,
                });
            } else {
                 if (!options.prompt) throw new Error('Prompt tidak boleh kosong.');
                initialImageFile = await generateImageFromText({
                    prompt: options.prompt,
                    aspectRatio: options.aspectRatio,
                });
            }

            const cleanImageFile = await removeWatermark(initialImageFile);
            updateHistory(cleanImageFile);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memproses permintaan. Silakan coba lagi.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [history, currentIndex]);

    const handleEditImage = useCallback(async (editPrompt: string, useFaceLock: boolean) => {
        if (currentIndex < 0) {
            setError('Tidak ada gambar untuk diedit.');
            return;
        }
         if (!editPrompt) {
            setError('Prompt edit tidak boleh kosong.');
            return;
        }
        setIsLoading(true);
        setError(null);
        
        try {
            const currentImage = history[currentIndex];
            const editedImageFile = await editImage({
                image: currentImage,
                prompt: editPrompt,
                useFaceLock: useFaceLock,
            });

            const cleanImageFile = await removeWatermark(editedImageFile);
            updateHistory(cleanImageFile);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengedit gambar. Silakan coba lagi.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [history, currentIndex]);

    const handleApplyFashionToFace = useCallback(async (faceImage: ImageFile, fashionPrompt: string) => {
        if (!faceImage || !fashionPrompt) {
            setError('Wajah dan prompt fashion diperlukan.');
            return;
        }
        setIsLoading(true);
        setError(null);
        
        try {
            const fullPrompt = `**Tugas Utama:** Buat sebuah foto seluruh badan yang hiper-realistis dari orang yang ada di foto yang diunggah.
**Aturan Wajah:** Pertahankan kemiripan wajah 100% dari foto yang diunggah. Wajah terkunci.
**Pakaian:** Orang tersebut harus mengenakan pakaian berikut: ${fashionPrompt}.
**Pose & Latar:** Posisikan orang tersebut dalam pose fashion yang percaya diri dan alami. Latar belakang harus berupa latar studio minimalis yang melengkapi pakaiannya.
**Kualitas:** 8k, fokus tajam, pencahayaan sinematik.`;

            const initialImageFile = await editImage({
                image: faceImage,
                prompt: fullPrompt,
                useFaceLock: true, // Critical for this feature
            });

            const cleanImageFile = await removeWatermark(initialImageFile);

            setFashionAnalysisResult(null);
            setFashionAnalysisSummary(null);
            updateHistory(cleanImageFile);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menerapkan outfit. Silakan coba lagi.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentIndex]);

    const handleUndo = useCallback(() => {
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        setGeneratedImage(history[newIndex]);
    }, [currentIndex, history]);

    const handleRedo = useCallback(() => {
        const newIndex = Math.min(history.length - 1, currentIndex + 1);
        setCurrentIndex(newIndex);
        setGeneratedImage(history[newIndex]);
    }, [currentIndex, history]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Header />
            <main className="container mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PromptStudio 
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                    />
                    <ImageDisplay 
                        imageUrl={generatedImage ? generatedImage.data : null} 
                        isLoading={isLoading} 
                        error={error}
                        analysisResult={fashionAnalysisResult}
                        analysisSummary={fashionAnalysisSummary}
                        onEdit={handleEditImage}
                        onApplyFashion={handleApplyFashionToFace}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={currentIndex > 0}
                        canRedo={currentIndex < history.length - 1}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;