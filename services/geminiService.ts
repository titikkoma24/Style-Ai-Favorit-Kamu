import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { AspectRatio, ImageFile, GantiOutfitImages, GantiOutfitBodyOptions, PhotoWithIdolOptions } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
        // Jika model tidak mengembalikan gambar, kembalikan gambar asli
        console.warn("Gagal menghapus watermark, mengembalikan gambar asli.");
        return image;
    } catch (error) {
        console.error("Error removing watermark, returning original image:", error);
        // Jika terjadi error, kembalikan gambar asli agar alur tidak terhenti
        return image;
    }
};


export const generateImageFromText = async ({ prompt, aspectRatio }: GenerateImageFromTextOptions): Promise<ImageFile> => {
    try {
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
        throw new Error("Gagal membuat gambar.");
    }
};

export const editImage = async ({ image, prompt, useFaceLock }: EditImageOptions): Promise<ImageFile> => {
    try {
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

export const improveIdolPrompt = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are a creative director for a photoshoot. Take the following simple scene description for two people written in Indonesian and expand it into a more dynamic, detailed, and evocative prompt. Then, translate the entire improved prompt to English. Provide only the final English prompt, without any introductory text.

Original Indonesian description: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error improving idol prompt:", error);
        throw new Error("Gagal meningkatkan prompt idola.");
    }
};

export const createPhotoWithIdol = async ({ userImage, idolImage, useIdolFaceLock, options }: CreatePhotoWithIdolOptions): Promise<ImageFile> => {
    try {
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


export const improvePrompt = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `Anda adalah seorang ahli prompt engineering. Perluas dan tingkatkan deskripsi berikut untuk menghasilkan gambar AI yang lebih detail, artistik, dan imajinatif. Fokus pada penguatan dan penambahan detail spesifik tentang warna, pencahayaan, kualitas, komposisi, dan elemen lain yang diperlukan untuk gambar yang memukau, sambil mempertahankan ide intinya. Berikan jawaban hanya dalam bahasa Indonesia dan JANGAN tambahkan kata pengantar apa pun, langsung berikan prompt yang sudah ditingkatkan. Deskripsi asli: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error improving prompt with Gemini:", error);
        throw new Error("Gagal meningkatkan prompt.");
    }
};

export const translateToEnglish = async (text: string): Promise<string> => {
    try {
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

export const improvePosePrompt = async (poseDescription: string): Promise<string> => {
    try {
        const fullPrompt = `You are a creative director specializing in photography and character art. Take the following simple pose description written in Indonesian and expand it into a more dynamic, detailed, and evocative pose description. Provide the result **only in English**. Do not add any introductory text, just the improved pose description.

Original Indonesian description: "${poseDescription}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error improving pose prompt with Gemini:", error);
        throw new Error("Gagal meningkatkan deskripsi pose.");
    }
};

export const identifyFashion = async (image: ImageFile): Promise<string> => {
    try {
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

export const improveMultiImagePrompt = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are a creative director for a complex photocomposition. Take the following simple scene description, which references multiple images (like "Photo 1", "Photo 2"), and expand it into a more dynamic, detailed, and evocative prompt in English. Ensure the instructions are clear for an AI to combine elements from different source images into a single, cohesive, hyper-realistic scene. Provide only the final English prompt.

Original Indonesian description: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error improving multi-image prompt:", error);
        throw new Error("Gagal meningkatkan prompt multi-gambar.");
    }
};

export const improveVideoPrompt = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are an expert video prompt engineer for text-to-video models like Google Veo. Take the following simple idea in Indonesian, expand it into a detailed, cinematic video prompt in English. Include rich details about camera shots (e.g., wide shot, dolly zoom, close-up), camera movement (e.g., panning, tracking shot), subject actions, visual style, and lighting (e.g., hyperrealistic, 8k, cinematic lighting, golden hour). Provide only the final English prompt, without any introductory text.

Original Indonesian idea: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text.trim();
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