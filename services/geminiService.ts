


import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import type { AspectRatio, ImageFile, GantiOutfitImages, GantiOutfitBodyOptions, PhotoWithIdolOptions, UnderwearLingerieOptions } from '../types';

// Lazy-initialized singleton for the AI client.
// This prevents the app from crashing on load if the API key isn't set in the environment.
let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (aiInstance) {
        return aiInstance;
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Konfigurasi API Key tidak ditemukan. Pastikan Anda telah mengatur environment variable 'API_KEY' di pengaturan proyek Vercel Anda.");
    }

    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
};


interface GenerateImageFromTextOptions {
    prompt: string;
    aspectRatio: AspectRatio['value'];
}

interface EditImageOptions {
    image: ImageFile;
    prompt: string;
    useFaceLock: boolean;
}

interface ChangeOutfitOptions {
    person: ImageFile;
    images: GantiOutfitImages;
    bodyOptions: GantiOutfitBodyOptions;
}

interface CreatePhotoWithIdolOptions {
    userImage: ImageFile;
    idolImage: ImageFile;
    useIdolFaceLock: boolean;
    options: PhotoWithIdolOptions;
}

export const removeWatermark = async (image: ImageFile): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        const prompt = "Remove any and all watermarks or logos from this image. Inpaint the area where the watermark was to seamlessly blend with the surroundings. Do not alter any other part of the image.";
        const base64ImageData = image.data.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: image.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        console.warn("Gagal menghapus watermark, mengembalikan gambar asli.");
        return image;
    } catch (error) {
        if (error instanceof Error && error.message.includes("API_KEY")) {
            throw error;
        }
        console.error("Error removing watermark, returning original image:", error);
        return image;
    }
};


export const generateImageFromText = async ({ prompt, aspectRatio }: GenerateImageFromTextOptions): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Data = response.generatedImages[0].image.imageBytes;
            const mimeType = 'image/jpeg';
            return {
                data: `data:${mimeType};base64,${base64Data}`,
                mimeType: mimeType,
            };
        } else {
            throw new Error("Tidak ada gambar yang dihasilkan.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal membuat gambar.");
    }
};

export const editImage = async ({ image, prompt, useFaceLock }: EditImageOptions): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        let finalPrompt: string;
        
        if (useFaceLock) {
            finalPrompt = `**Tugas Utama:** Lakukan editan pada gambar yang diberikan.
**Instruksi Editan dari Pengguna:** "${prompt}"

**Aturan Mutlak & Tidak Dapat Dilanggar:** Anda HARUS mempertahankan wajah orang dari gambar asli dengan kemiripan 100%. JANGAN mengubah fitur wajah, struktur tulang, ekspresi, atau identitasnya dengan cara apa pun. Wajah terkunci. Terapkan instruksi editan dari pengguna HANYA pada elemen non-wajah seperti pose, latar belakang, pakaian, atau gaya keseluruhan. Wajah asli harus ditransfer dengan sempurna ke gambar baru.`;
        } else {
            finalPrompt = prompt;
        }

        const base64ImageData = image.data.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: image.mimeType } },
                    { text: finalPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                 const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        throw new Error("Model tidak mengembalikan gambar. Coba prompt atau gambar yang berbeda.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal mengedit gambar.");
    }
};

export const changeOutfit = async ({ person, images, bodyOptions }: ChangeOutfitOptions): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        let prompt = `**[NON-NEGOTIABLE DIRECTIVE]**

**PRIMARY OBJECTIVE:** Create a hyper-realistic, full-body photograph.

**INPUTS:**
- Image 1: The person's face (this might be a close-up or a full photo).
- Image 2+ (Optional): Clothing items.
- Text Instructions: Body shape specifications.

**CRITICAL RULE #1: ABSOLUTE FACIAL IDENTITY PRESERVATION**
- **THIS IS THE MOST IMPORTANT RULE. FAILURE TO COMPLY WILL RESULT IN AN INCORRECT OUTPUT.**
- You MUST extract the exact face, bone structure, expression, and all unique features from Image 1.
- The final generated image MUST contain this EXACT face, with **100% IDENTICAL LIKENESS**.
- **DO NOT** create a new face. **DO NOT** interpret the face. **DO NOT** alter the person's identity. The face from Image 1 is the ONLY face you are permitted to use.

**STEP-BY-STEP EXECUTION PLAN:**

1.  **FACE ANALYSIS & LOCKING (Priority 1):**
    -   Meticulously analyze the face in Image 1. This is your reference face. Treat it as a locked, unchangeable asset.

2.  **BODY CONSTRUCTION (Priority 2):**
    -   If Image 1 is only a face, you must generate a complete, realistic, and proportionate full body.
    -   This new body **MUST STRICTLY CONFORM** to the following user-defined specifications:
        -   Overall Body Type: '${bodyOptions.bodyType}'
        -   Female Figure - Bust Size: '${bodyOptions.bustSize}'
        -   Female Figure - Hip Size: '${bodyOptions.hipSize}'
    -   The final body shape must be natural and consistent with these parameters.

3.  **SEAMLESS INTEGRATION (Priority 3):**
    -   Perfectly and seamlessly attach the locked reference face from Step 1 onto the newly constructed body from Step 2. The transition between the head and neck must be flawless and photorealistic.

4.  **OUTFIT APPLICATION (Priority 4):**
    -   Dress the complete figure (body + locked face) in the outfit provided by the subsequent images. Follow the specific instructions for applying the outfit pieces.

5.  **FINAL COMPOSITION & STYLING (Priority 5):**
    -   **Pose:** Place the subject in a natural, elegant, and confident full-body fashion pose that showcases the outfit and body shape.
    -   **Environment:** Use a clean, minimalist, professional photo studio background with soft, flattering lighting.
    -   **Quality:** The final image must be 8k, hyper-realistic, with sharp focus and exceptional detail.

**OUTFIT INSTRUCTIONS:**
`;
        const parts: Part[] = [
            { inlineData: { data: person.data.split(',')[1], mimeType: person.mimeType } },
        ];
        let imageCounter = 2; // person is image 1

        if (images.fullOutfit) {
            parts.push({ inlineData: { data: images.fullOutfit.data.split(',')[1], mimeType: images.fullOutfit.mimeType } });
            prompt += `- Dress the person in the complete outfit provided in image ${imageCounter}.\n`;
            imageCounter++;
        } else {
            if (images.outfit) {
                parts.push({ inlineData: { data: images.outfit.data.split(',')[1], mimeType: images.outfit.mimeType } });
                prompt += `- Use the top from image ${imageCounter}.\n`;
                imageCounter++;
            }
            if (images.pants) {
                parts.push({ inlineData: { data: images.pants.data.split(',')[1], mimeType: images.pants.mimeType } });
                prompt += `- Use the pants from image ${imageCounter}.\n`;
                imageCounter++;
            }
            if (images.shoes) {
                parts.push({ inlineData: { data: images.shoes.data.split(',')[1], mimeType: images.shoes.mimeType } });
                prompt += `- Use the shoes from image ${imageCounter}.\n`;
                imageCounter++;
            }
        }

        if (images.accessory) {
            parts.push({ inlineData: { data: images.accessory.data.split(',')[1], mimeType: images.accessory.mimeType } });
            prompt += `- Add the accessory from image ${imageCounter}.\n`;
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        throw new Error("Model tidak mengembalikan gambar. Pastikan gambar referensi jelas.");

    } catch (error) {
        console.error("Error changing outfit:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal mengganti pakaian.");
    }
};

export const improveIdolPrompt = async (prompt: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `You are a creative director for a photoshoot. Your task is to take a user's simple scene description for two people and expand it into two versions of a highly effective prompt. The response must be in JSON format and in English.

The user's original idea (in Indonesian) is: "${prompt}"

Provide your response as a JSON object with two keys: "detailed" and "concise".
1.  **detailed**: An expanded, highly descriptive, and evocative prompt, detailing the interaction, mood, and setting.
2.  **concise**: A shorter, more direct prompt using effective keywords to capture the scene's essence.

Both versions must be in English. The entire output must be a single, valid JSON object without any introductory text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detailed: { type: Type.STRING },
                        concise: { type: Type.STRING }
                    },
                    required: ["detailed", "concise"]
                },
            },
        });
        
        const jsonString = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.detailed === 'string' && typeof parsed.concise === 'string') {
            return parsed;
        } else {
            console.error("Parsed JSON from AI is missing required fields for idol prompt.");
            throw new Error("Gagal meningkatkan prompt idola: respons tidak valid.");
        }
    } catch (error) {
        console.error("Error improving idol prompt:", error);
        throw new Error("Gagal meningkatkan prompt idola.");
    }
};

export const createPhotoWithIdol = async ({ userImage, idolImage, useIdolFaceLock, options }: CreatePhotoWithIdolOptions): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        let sceneDescription = '';
        if (options.manualPrompt && options.manualPrompt.trim() !== '') {
            // Manual prompt is now pre-improved and pre-translated to English from the UI.
            sceneDescription = options.manualPrompt;
        } else {
            // Construct from templates and add quality modifiers
            sceneDescription = `A hyper-realistic and sharply detailed 8k photo.
- Pose: ${options.poseTemplate}.
- Camera Shot: a ${options.shotStyleTemplate}.
- Lighting: ${options.lightStyleTemplate}.`;
        }

        const prompt = `**Main Goal: Create a single, hyper-realistic, and highly detailed photograph of two people in a studio setting.**

**CRITICAL RULE #1: ABSOLUTE FACIAL SIMILARITY (NON-NEGOTIABLE)**
- **Person 1 (from the first image):** You MUST extract and preserve the face from the first image with 100% similarity. ALL facial features, bone structure, and identity must be perfectly maintained. This face is locked.
- **Person 2 (from the second image):** You MUST extract and preserve the face from the second image with 100% similarity. The same rules apply. This face is also locked if the user enables it.
- **WARNING:** Failure to perfectly replicate BOTH faces is a total failure of the task. Do not alter or interpret the faces.

**CRITICAL RULE #2: OUTFIT PRESERVATION (NON-NEGOTIABLE)**
- You MUST analyze the clothing worn by each person in their respective source images.
- Recreate these exact outfits on the corresponding person in the final generated image.
- **DO NOT CHANGE, ALTER, OR INVENT NEW OUTFITS.** The clothing must be preserved with high fidelity.

**Detailed Scene Instructions:**
${sceneDescription}

**Final Quality:** The final output must be an 8k resolution, hyper-realistic photograph with sharp focus. The result should look like a professional photoshoot. The environment should be a clean, professional studio backdrop that complements the overall mood of the scene and their outfits.`;

        const parts: Part[] = [
            { inlineData: { data: userImage.data.split(',')[1], mimeType: userImage.mimeType } },
            { inlineData: { data: idolImage.data.split(',')[1], mimeType: idolImage.mimeType } },
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        throw new Error("Model tidak mengembalikan gambar. Coba dengan gambar yang lebih jelas.");

    } catch (error) {
        console.error("Error creating photo with idol:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal membuat foto bersama idola.");
    }
};


export const improvePrompt = async (prompt: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `You are an expert prompt engineer. Your task is to take a user's simple idea and expand it into two versions of a highly effective prompt for an AI image generator. The response must be in JSON format.

The user's original idea (in Indonesian) is: "${prompt}"

Provide your response as a JSON object with two keys: "detailed" and "concise".
1.  **detailed**: An expanded, highly descriptive, and imaginative prompt. This version should be rich with specifics about color, lighting, quality, composition, and other artistic elements. The language should be artistic and evocative. This prompt must be in Indonesian.
2.  **concise**: A shorter, more direct prompt that still captures the core idea but is optimized for powerful results with fewer words. This version should use keywords and phrases that are highly effective for AI image models. This prompt must also be in Indonesian.

Do not add any introductory text or markdown formatting. The entire output must be a single, valid JSON object.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detailed: { type: Type.STRING },
                        concise: { type: Type.STRING }
                    },
                    required: ["detailed", "concise"]
                },
            },
        });

        const jsonString = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.detailed === 'string' && typeof parsed.concise === 'string') {
            return parsed;
        } else {
            console.error("Parsed JSON from AI is missing required fields.");
            throw new Error("Gagal meningkatkan prompt: respons tidak valid.");
        }
    } catch (error) {
        console.error("Error improving prompt with Gemini:", error);
        throw new Error("Gagal meningkatkan prompt.");
    }
};

export const translateToEnglish = async (text: string): Promise<string> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `Translate the following Indonesian text to English. Provide only the English translation, without any introductory text. Indonesian text: "${text}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        throw new Error("Gagal menerjemahkan teks.");
    }
};

export const improvePosePrompt = async (poseDescription: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `You are a creative director specializing in photography. Your task is to take a simple pose description and expand it into two versions of a highly effective prompt for an AI image generator. The response must be in JSON format and in English.

The user's original idea (in Indonesian) is: "${poseDescription}"

Provide your response as a JSON object with two keys: "detailed" and "concise".
1.  **detailed**: An expanded, highly descriptive, and evocative pose description.
2.  **concise**: A shorter, more direct pose description using effective keywords.

Both versions must be in English. The entire output must be a single, valid JSON object without any introductory text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detailed: { type: Type.STRING },
                        concise: { type: Type.STRING }
                    },
                    required: ["detailed", "concise"]
                },
            },
        });
        
        const jsonString = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.detailed === 'string' && typeof parsed.concise === 'string') {
            return parsed;
        } else {
            console.error("Parsed JSON from AI is missing required fields for pose prompt.");
            throw new Error("Gagal meningkatkan deskripsi pose: respons tidak valid.");
        }
    } catch (error) {
        console.error("Error improving pose prompt with Gemini:", error);
        throw new Error("Gagal meningkatkan deskripsi pose.");
    }
};

export const identifyFashion = async (image: ImageFile): Promise<string> => {
    try {
        const ai = getAiInstance();
        const prompt = `**Peran:** Anda adalah seorang ahli fashion dan stylist pribadi yang sangat berpengetahuan.
**Tugas:** Analisis gambar pakaian yang disediakan dan berikan deskripsi mendetail untuk setiap item yang terlihat.

**Format Output (Analisis Detail):**
Berikan jawaban dalam format Markdown. Untuk setiap item (misalnya, Atasan, Bawahan, Sepatu, Aksesori), buat bagian terpisah.
Di setiap bagian, berikan:
1.  **Nama Item (ID & EN):** Nama spesifik item dalam Bahasa Indonesia dan Bahasa Inggris. Contoh: "Kemeja Flanel Lengan Panjang (Long-Sleeve Flannel Shirt)".
2.  **Deskripsi Gaya:** Jelaskan gaya, potongan, bahan, pola, dan warna item tersebut. Jadilah deskriptif dan gunakan terminologi fashion yang tepat.
3.  **Saran Penggunaan:** Berikan ide singkat tentang bagaimana item ini bisa dipadupadankan atau untuk acara apa item ini cocok.

**Aturan Analisis:**
- Jika sebuah item tidak terlihat atau tidak dapat diidentifikasi, sebutkan itu.
- Fokus hanya pada item pakaian, sepatu, dan aksesori utama.
- Jaga agar nada tetap informatif, membantu, dan profesional.

---
**Tugas Tambahan: Ringkasan Prompt**
Setelah analisis lengkap, buat ringkasan satu kalimat dalam **Bahasa Inggris** yang mendeskripsikan outfit tersebut secara ringkas, cocok untuk digunakan dalam prompt pembuatan gambar. Awali ringkasan ini dengan separator unik: \`---PROMPT SUMMARY---\`.
**Contoh Format Ringkasan:** \`---PROMPT SUMMARY---A person wearing a long-sleeve red flannel shirt, dark blue skinny jeans, and white sneakers.\`
---

Mulai analisisnya sekarang.`;

        const base64ImageData = image.data.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: image.mimeType } },
                    { text: prompt },
                ],
            },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error identifying fashion:", error);
        throw new Error("Gagal mengidentifikasi item fashion.");
    }
};

export const improveMultiImagePrompt = async (prompt: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `You are a creative director for a complex photocomposition. Your task is to take a simple scene description, which references multiple images, and expand it into two highly effective prompt versions in English. The response must be in JSON format.

The user's original idea (in Indonesian) is: "${prompt}"

Provide your response as a JSON object with two keys: "detailed" and "concise".
1.  **detailed**: An expanded, highly descriptive prompt ensuring clear instructions for combining elements from different source images into a single, cohesive, hyper-realistic scene.
2.  **concise**: A shorter, more direct prompt using keywords to define the composition and elements from each photo.

Both versions must be in English. The entire output must be a single, valid JSON object without any introductory text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detailed: { type: Type.STRING },
                        concise: { type: Type.STRING }
                    },
                    required: ["detailed", "concise"]
                },
            },
        });
        
        const jsonString = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.detailed === 'string' && typeof parsed.concise === 'string') {
            return parsed;
        } else {
            console.error("Parsed JSON from AI is missing required fields for multi-image prompt.");
            throw new Error("Gagal meningkatkan prompt multi-gambar: respons tidak valid.");
        }
    } catch (error) {
        console.error("Error improving multi-image prompt:", error);
        throw new Error("Gagal meningkatkan prompt multi-gambar.");
    }
};

export const improveVideoPrompt = async (prompt: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const ai = getAiInstance();
        const fullPrompt = `You are an expert video prompt engineer for text-to-video models like Google Veo. Your task is to take a simple idea and expand it into two versions of a detailed, cinematic video prompt in English. The response must be in JSON format.

The user's original idea (in Indonesian) is: "${prompt}"

Provide your response as a JSON object with two keys: "detailed" and "concise".
1.  **detailed**: An expanded prompt including rich details about camera shots (e.g., wide shot, dolly zoom, close-up), camera movement (e.g., panning, tracking shot), subject actions, visual style, and lighting.
2.  **concise**: A shorter prompt that captures the cinematic essence with powerful keywords, focusing on the core action and visual style.

Both versions must be in English. The entire output must be a single, valid JSON object without any introductory text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detailed: { type: Type.STRING },
                        concise: { type: Type.STRING }
                    },
                    required: ["detailed", "concise"]
                },
            },
        });
        
        const jsonString = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonString);

        if (typeof parsed.detailed === 'string' && typeof parsed.concise === 'string') {
            return parsed;
        } else {
            console.error("Parsed JSON from AI is missing required fields for video prompt.");
            throw new Error("Gagal meningkatkan prompt video: respons tidak valid.");
        }
    } catch (error) {
        console.error("Error improving video prompt:", error);
        throw new Error("Gagal meningkatkan prompt video.");
    }
};

interface CombineImagesOptions {
    images: ImageFile[];
    prompt: string;
}

export const combineImages = async ({ images, prompt }: CombineImagesOptions): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        if (images.length < 2) {
            throw new Error("Dibutuhkan setidaknya dua gambar untuk digabungkan.");
        }

        const parts: Part[] = images.map(image => ({
            inlineData: { data: image.data.split(',')[1], mimeType: image.mimeType }
        }));

        const finalPrompt = `**Main Goal: Create a single, hyper-realistic, and cohesive photograph by combining elements from the ${images.length} images provided.**

**CRITICAL RULE: REFERENCING IMAGES**
- The images are provided sequentially. Refer to them as "Image 1", "Image 2", "Image 3", and so on in your process.
- You MUST follow the user's prompt to understand which elements to take from which image.

**User's Detailed Scene Instructions:**
"${prompt}"

**Execution Plan:**
1.  **Analyze all source images:** Understand the content of each image (people, objects, backgrounds).
2.  **Follow the user's prompt precisely:** Extract the specified elements (e.g., the person from Image 1, the car from Image 2, the background from Image 3).
3.  **Combine seamlessly:** Integrate the extracted elements into a single, photorealistic scene. Ensure lighting, shadows, perspective, and scale are consistent and believable across all combined elements.
4.  **Preserve Identity:** If the prompt involves people, you must maintain 100% facial similarity from the source images. Do not change their identities.
5.  **Final Quality:** The final output must be an 8k resolution, hyper-realistic photograph with sharp focus.

Begin the combination process now.`;

        parts.push({ text: finalPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        throw new Error("Model tidak mengembalikan gambar. Coba dengan prompt atau gambar yang berbeda.");

    } catch (error) {
        console.error("Error combining images:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal menggabungkan gambar.");
    }
};

export const generateLingerieModel = async ({ clothingImage, options }: { clothingImage: ImageFile, options: UnderwearLingerieOptions }): Promise<ImageFile> => {
    try {
        const ai = getAiInstance();
        const prompt = `**PRIMARY GOAL:** Create a hyper-realistic, professional photograph of a model wearing the specific lingerie/underwear item provided in the input image.

**CRITICAL RULE #1: EXACT CLOTHING REPLICATION**
- You MUST analyze the lingerie/underwear item in the provided image.
- The model in the final generated photo MUST be wearing this EXACT item. Replicate the design, color, fabric, and details with 100% accuracy.
- **DO NOT** invent a new design. **DO NOT** change the clothing.

**CRITICAL RULE #2: MODEL SPECIFICATIONS**
- Create a female model that strictly adheres to the following characteristics:
    - Ethnicity: '${options.ethnicity}'
    - Body Type: '${options.bodyType}', with a natural and realistic physique.
    - Bust Size: '${options.bustSize}'.
    - Hair Color: '${options.hairColor}'.

**SCENE & COMPOSITION:**
- Place the model in the following setting: '${options.setting}'.
- The pose MUST be as follows: '${options.pose}'. It should be elegant, confident, and suitable for a professional lingerie photoshoot, showcasing the clothing item well.
- The lighting should be flattering and professional, matching the mood of the setting.

**FINAL IMAGE QUALITY:**
- The output must be an 8k, hyper-realistic, and sharply focused photograph.
- The final image should have the quality of a high-end fashion magazine editorial.
- Ensure the integration of the clothing onto the model is seamless and photorealistic.`;

        const base64ImageData = clothingImage.data.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: clothingImage.mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                return {
                    data: `data:${mimeType};base64,${base64Data}`,
                    mimeType: mimeType
                };
            }
        }
        throw new Error("Model tidak mengembalikan gambar. Coba dengan gambar atau opsi yang berbeda.");

    } catch (error) {
        console.error("Error generating lingerie model:", error);
        throw new Error(error instanceof Error ? error.message : "Gagal membuat gambar model lingerie.");
    }
};