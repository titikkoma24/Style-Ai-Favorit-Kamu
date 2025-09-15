import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GantiOutfitBodyOptions, GantiOutfitImages, ImageFile, PhotoWithIdolOptions, UnderwearLingerieOptions } from '../types';

// According to guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to handle potential API errors, especially rate limiting.
const handleGeminiError = (error: unknown): string => {
    if (error instanceof Error) {
        // Check for specific error status or message for rate limiting
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
            return "Batas penggunaan API telah tercapai. Ini adalah batasan dari paket gratis. Silakan coba lagi nanti.";
        }
         if (error.message.includes('billed users')) {
            return "Model API yang diminta hanya tersedia untuk akun dengan penagihan aktif. Silakan periksa pengaturan akun Google Cloud Anda.";
        }
        return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui.';
};


// Helper function to convert ImageFile to Gemini Part
const imageFileToPart = (image: ImageFile) => {
    // The Gemini API expects only the Base64 data, not the data URL prefix.
    const base64Data = image.data.startsWith('data:') 
        ? image.data.split(',')[1] 
        : image.data;
    
    return {
        inlineData: {
            data: base64Data,
            mimeType: image.mimeType,
        },
    };
};

/**
 * Generates an image from a text prompt using a more accessible model.
 */
export const generateImageFromText = async ({ prompt, aspectRatio }: { prompt: string; aspectRatio: AspectRatio['value'] }): Promise<ImageFile> => {
    try {
        // Aspect ratio needs to be part of the prompt for this model.
        const fullPrompt = `${prompt}. The image must have a ${aspectRatio} aspect ratio.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/jpeg'; // Fallback MIME type
                    return {
                        data: `data:${mimeType};base64,${base64ImageBytes}`,
                        mimeType: mimeType,
                    };
                }
            }
        }
        throw new Error('Pembuatan gambar gagal: tidak ada gambar yang dikembalikan dari model.');
    } catch (error) {
        throw new Error(handleGeminiError(error));
    }
};


/**
 * Edits an existing image based on a text prompt.
 */
export const editImage = async ({ image, prompt, useFaceLock }: { image: ImageFile; prompt: string; useFaceLock: boolean }): Promise<ImageFile> => {
    try {
        // Prompt engineering is used to enforce face-locking, as there isn't a direct API parameter.
        const fullPrompt = useFaceLock 
            ? `CRITICAL RULE: Maintain 100% facial similarity to the person in the original image. Do not change their facial features, structure, or identity. Apply the following changes around this core rule: ${prompt}`
            : prompt;
            
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imageFileToPart(image),
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }

        throw new Error('Pengeditan gambar gagal: tidak ada gambar yang dikembalikan dari model.');
    } catch (error) {
         throw new Error(handleGeminiError(error));
    }
};

/**
 * Translates text from Indonesian to English.
 */
export const translateToEnglish = async (text: string): Promise<string> => {
    if (!text || !text.trim()) {
        return '';
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following Indonesian text to English. Return only the translation, without any preamble, labels, or explanation.
            Indonesian text: "${text}"`,
            config: {
                // Disable thinking for faster, direct translations.
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Translation failed:", error);
        throw new Error(handleGeminiError(error));
    }
};

/**
 * Attempts to remove watermarks from an image.
 */
export const removeWatermark = async (image: ImageFile): Promise<ImageFile> => {
    try {
        const prompt = "Please meticulously analyze the provided image to identify and completely remove any watermarks, logos, or overlaid text. The goal is a perfectly clean image with the watermarked areas seamlessly inpainted to match the surrounding content and textures. Preserve the original image quality and details. Do not alter any other part of the image.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imageFileToPart(image),
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }
        
        // Fallback: If no image is returned, return the original.
        console.warn("Remove watermark did not return an image, returning original.");
        return image;
    } catch (error) {
        throw new Error(handleGeminiError(error));
    }
};

/**
 * Identifies fashion items in an image and provides a detailed analysis and a prompt summary.
 */
export const identifyFashion = async (image: ImageFile): Promise<string> => {
    try {
        const prompt = `**TASK:** Analyze the clothing and accessories worn by the person in the image with extreme detail. Then, create a concise, descriptive prompt summary.

**FORMATTING RULE:** You MUST separate the two sections with the exact string '---PROMPT SUMMARY---'.

**SECTION 1: DETAILED ANALYSIS**
Break down every single visible fashion item. For each item, describe:
- **Type:** (e.g., t-shirt, blazer, skinny jeans, A-line skirt, handbag, sneakers)
- **Color:** Be specific (e.g., navy blue, crimson red, off-white, charcoal gray).
- **Material/Texture:** (e.g., denim, silk, leather, chunky knit, sheer chiffon)
- **Fit/Cut:** (e.g., oversized, slim-fit, high-waisted, cropped, wide-leg)
- **Pattern/Details:** (e.g., pinstriped, floral print, embroidered logo, ripped details, gold hardware)
- **Style/Vibe:** (e.g., casual, formal, bohemian, streetwear, minimalist, vintage)

**SECTION 2: PROMPT SUMMARY**
Synthesize the detailed analysis into a single, cohesive, comma-separated string suitable for an AI image generator prompt. Start with the most significant item.
Example: "a minimalist off-white oversized blazer, a black silk camisole, high-waisted light-wash denim jeans, a pair of white leather sneakers, a gold chain necklace".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imageFileToPart(image),
                    { text: prompt },
                ]
            },
        });

        return response.text;
    } catch (error) {
         throw new Error(handleGeminiError(error));
    }
};

/**
 * Creates a new image of a person wearing a different outfit.
 */
export const changeOutfit = async ({ person, images, bodyOptions }: { person: ImageFile; images: GantiOutfitImages; bodyOptions: GantiOutfitBodyOptions; }): Promise<ImageFile> => {
    try {
        const parts: any[] = [{ text: "**TASK: Create a hyper-realistic, full-body photograph of the person from the 'PERSON' image, but dress them in a new outfit described by the 'OUTFIT' images and text instructions.**" }];
        
        parts.push({ text: "\n\n**PERSON (Reference Image):**" }, imageFileToPart(person));

        parts.push({ text: "\n\n**CRITICAL RULES:**" });
        parts.push({ text: "1.  **Face Lock:** You MUST maintain 100% facial similarity to the person in the reference image. Their identity, facial structure, and expression must be perfectly preserved." });
        parts.push({ text: `2.  **Body Shape:** The person's body should be modeled according to these specifications: Body Type: ${bodyOptions.bodyType}, Bust Size (for female appearance): ${bodyOptions.bustSize}, Hip Size (for female appearance): ${bodyOptions.hipSize}.` });
        
        parts.push({ text: "\n\n**OUTFIT (Component Images & Description):**" });
        let outfitDescription = "";
        if (images.fullOutfit) {
            parts.push({ text: "Use this single image for the full dress code:" }, imageFileToPart(images.fullOutfit));
            outfitDescription = "The person is wearing the full outfit shown in the 'Full Dresscode' image.";
        } else {
            parts.push({ text: "Combine the following clothing items to create the final outfit:" });
            if (images.outfit) {
                parts.push({ text: "- Top/Shirt/Dress:" }, imageFileToPart(images.outfit));
                outfitDescription += "For the top, use the item from the 'Top' image. ";
            }
            if (images.pants) {
                parts.push({ text: "- Bottoms/Pants/Skirt:" }, imageFileToPart(images.pants));
                outfitDescription += "For the bottoms, use the item from the 'Bottoms' image. ";
            }
            if (images.shoes) {
                parts.push({ text: "- Footwear:" }, imageFileToPart(images.shoes));
                outfitDescription += "For the footwear, use the item from the 'Footwear' image. ";
            }
        }
         if (images.accessory) {
            parts.push({ text: "- Accessory:" }, imageFileToPart(images.accessory));
            outfitDescription += "Also include the accessory from the 'Accessory' image.";
        }

        parts.push({ text: `\n\n**FINAL INSTRUCTIONS:**\n- **Prompt:** ${outfitDescription}\n- **Pose & Scene:** Place the person in a confident, natural fashion pose against a minimalist, aesthetic, plain studio background that complements the outfit.\n- **Quality:** The final image must be an 8k, hyper-realistic, high-resolution portrait photograph with professional, soft lighting.` });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }

        throw new Error('Ganti outfit gagal: tidak ada gambar yang dikembalikan.');
    } catch (error) {
        throw new Error(handleGeminiError(error));
    }
};

/**
 * Creates a composite image of a user with an "idol".
 */
export const createPhotoWithIdol = async ({ userImage, idolImage, useIdolFaceLock, options }: { userImage: ImageFile; idolImage: ImageFile; useIdolFaceLock: boolean; options: PhotoWithIdolOptions; }): Promise<ImageFile> => {
    try {
        const parts: any[] = [];
        
        parts.push({ text: `**TASK: Create a hyper-realistic, 8k studio photograph featuring two people together: Person A (from the user image) and Person B (from the idol image).**` });
        parts.push({ text: "\n\n**PERSON A (User):**" }, imageFileToPart(userImage));
        parts.push({ text: "\n\n**PERSON B (Idol):**" }, imageFileToPart(idolImage));

        parts.push({ text: "\n\n**CRITICAL RULES:**" });
        parts.push({ text: "1.  **Person A Face Lock:** You MUST maintain 100% facial similarity for Person A. Their identity and facial features from their image must be perfectly preserved." });
        if (useIdolFaceLock) {
            parts.push({ text: "2.  **Person B Face Lock:** You MUST also maintain 100% facial similarity for Person B. Their identity and facial features from their image must be perfectly preserved." });
        } else {
            parts.push({ text: "2.  **Person B Likeness:** Person B should be clearly recognizable as the person from their image, but you have some artistic freedom with their exact expression to fit the scene." });
        }

        const prompt = options.manualPrompt.trim() 
            ? options.manualPrompt 
            : `- **Pose:** ${options.poseTemplate}.\n- **Camera Shot:** A ${options.shotStyleTemplate}.\n- **Lighting:** ${options.lightStyleTemplate}.`;
        
        parts.push({ text: `\n\n**SCENE DESCRIPTION:**\n${prompt}` });
        parts.push({ text: "\n\n**FINAL INSTRUCTIONS:**\nCombine all these elements into a single, seamless, high-resolution photograph. The interaction between the two people should look natural and believable. The setting is a professional photo studio with a clean, minimalist background that complements the lighting style." });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }

        throw new Error('Pembuatan foto dengan idola gagal: tidak ada gambar yang dikembalikan.');
    } catch(error) {
        throw new Error(handleGeminiError(error));
    }
};

/**
 * Combines multiple images based on a text prompt.
 */
export const combineImages = async ({ images, prompt }: { images: ImageFile[]; prompt: string; }): Promise<ImageFile> => {
    try {
        const parts: any[] = [];
        
        parts.push({ text: `**TASK: Create a single, cohesive, hyper-realistic image by intelligently combining and interpreting the elements from the following ${images.length} images based on the provided prompt.**` });
        parts.push({ text: "\n\n**PROMPT:**" }, { text: prompt });

        parts.push({ text: "\n\n**SOURCE IMAGES:**" });
        images.forEach((image, index) => {
            parts.push({ text: `Image ${index + 1}:` }, imageFileToPart(image));
        });

        parts.push({ text: "\n\n**FINAL INSTRUCTIONS:**\nAnalyze the prompt and the source images. Generate a new, single image that follows the prompt's instructions, using the visual information from the source images as key references. The final output must be a high-quality, 8k resolution, photorealistic image." });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }
        throw new Error('Kombinasi gambar gagal: tidak ada gambar yang dikembalikan.');
    } catch(error) {
         throw new Error(handleGeminiError(error));
    }
};

/**
 * Generates a model wearing a piece of lingerie.
 */
export const generateLingerieModel = async ({ clothingImage, options }: { clothingImage: ImageFile; options: UnderwearLingerieOptions; }): Promise<ImageFile> => {
    try {
        const parts: any[] = [];

        parts.push({ text: "**TASK: Create a hyper-realistic photograph of a model wearing the lingerie/underwear from the provided image.**" });
        parts.push({ text: "\n\n**LINGERIE/UNDERWEAR (Reference Image):**" }, imageFileToPart(clothingImage));

        parts.push({ text: "\n\n**MODEL & SCENE SPECIFICATIONS:**" });
        parts.push({ text: `- **Ethnicity:** ${options.ethnicity}` });
        parts.push({ text: `- **Body Type:** A healthy and beautiful ${options.bodyType} body type.` });
        parts.push({ text: `- **Bust Size:** ${options.bustSize}` });
        parts.push({ text: `- **Hair Color:** ${options.hairColor}` });
        parts.push({ text: `- **Setting:** The background should be a ${options.setting}.` });
        parts.push({ text: `- **Pose:** The model should be in the following pose: ${options.pose}` });

        parts.push({ text: "\n\n**CRITICAL RULES & FINAL INSTRUCTIONS:**\n1.  **Product Accuracy:** The lingerie/underwear worn by the model must be an exact, detailed match to the one in the reference image. Every detail, color, and pattern must be replicated perfectly.\n2.  **Realism:** The final output must be a tasteful, elegant, and professional-looking 8k photograph. The lighting should be soft and flattering.\n3.  **Face:** The model's face should be beautiful and fit the overall aesthetic, but should not be a recognizable person. A new, unique face should be generated." });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return {
                        data: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }
        throw new Error('Pembuatan model lingerie gagal: tidak ada gambar yang dikembalikan.');
    } catch(error) {
         throw new Error(handleGeminiError(error));
    }
};

const improvePromptWithSystemInstruction = async (userPrompt: string, systemInstruction: string): Promise<{ detailed: string; concise: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User's idea: "${userPrompt}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
        });

        const result = JSON.parse(response.text);
        if (typeof result.detailed === 'string' && typeof result.concise === 'string') {
            return result;
        }
        throw new Error("Invalid JSON structure");
    } catch (e) {
        console.error("Gagal mem-parsing JSON dari peningkatan prompt:", e);
        // Fallback in case of invalid JSON
        throw new Error(handleGeminiError(e));
    }
};

/**
 * Improves a general text prompt for image generation.
 */
export const improvePrompt = (prompt: string) => improvePromptWithSystemInstruction(
    prompt,
    `You are a creative assistant for an AI image generator. Your task is to take a user's basic idea and expand it into two versions: a "detailed" version and a "concise" version.

**Response Format:**
You MUST respond with a valid JSON object with two keys: "detailed" and "concise". Do not include any other text or markdown formatting.
Example:
{
  "detailed": "A full, rich, descriptive paragraph for the prompt.",
  "concise": "A comma-separated list of keywords for the prompt."
}

**Instructions:**
1.  **Detailed Version:** Write a rich, descriptive paragraph. Evoke a mood, describe the lighting, the composition, the colors, and the feeling of the scene. Add artistic details that enhance the original idea.
2.  **Concise Version:** Create a comma-separated list of keywords and short phrases. This should be a direct, punchy version of the prompt that an AI can easily parse. Include the core subject, style, lighting, and quality keywords.`
);

/**
 * Improves a prompt for the "photo with an idol" feature.
 */
export const improveIdolPrompt = (prompt: string) => improvePromptWithSystemInstruction(
    prompt,
    `You are a creative assistant for an AI image generator. The user wants to create a photo of themselves with their idol. Your task is to take the user's basic scene idea and expand it into two versions for a prompt: "detailed" and "concise". The prompt should describe the scene and the interaction between the two people.

**Response Format:**
You MUST respond with a valid JSON object with two keys: "detailed" and "concise".
Example:
{
  "detailed": "A detailed description of the scene with the user and their idol.",
  "concise": "A short, punchy description of the scene with the user and their idol."
}

**Instructions:**
1.  **Detailed Version:** Describe a heartwarming or cool interaction. What are they doing? What are their expressions? What's the mood?
2.  **Concise Version:** Summarize the scene in a short phrase.`
);

/**
 * Improves a prompt for combining multiple images.
 */
export const improveMultiImagePrompt = (prompt: string) => improvePromptWithSystemInstruction(
    prompt,
    `You are a creative assistant for an AI image generator. The user will provide multiple images and a prompt describing how to combine them. Your task is to refine and expand this prompt into "detailed" and "concise" versions.

**Response Format:**
You MUST respond with a valid JSON object with two keys: "detailed" and "concise".

**Instructions:**
- Refer to the images generically (e.g., "the person from Image 1", "the background from Image 2").
- The detailed version should be very specific about the composition and integration.
- The concise version should be a clear, short command.`
);

/**
 * Improves and translates a prompt for video generation.
 */
export const improveVideoPrompt = async (prompt: string): Promise<{ detailed: string; concise: string }> => {
    try {
        return await improvePromptWithSystemInstruction(
            prompt,
            `You are an expert video prompt writer for Google's Veo model. Your task is to take a user's simple idea (likely in Indonesian) and transform it into two high-quality, English video prompts: a "detailed" version and a "concise" version.

**Response Format:**
You MUST respond with a valid JSON object with two keys: "detailed" and "concise". Both keys must have English string values.

**Instructions for Prompts:**
- **Translate to English:** The final prompts must be in English.
- **Cinematic Language:** Use terms like "cinematic shot," "dolly shot," "wide angle," "close-up," "slow motion."
- **Describe Motion:** Clearly describe the movement in the scene (e.g., "a car speeding down a highway," "leaves gently falling").
- **Specify Visuals:** Detail the subject, setting, lighting (e.g., "golden hour," "neon-lit"), and mood.
- **Detailed Version:** A longer prompt (2-3 sentences) that sets a full scene.
- **Concise Version:** A shorter prompt (1 sentence) that captures the core action and style.`
        );
    } catch (e) {
        // Fallback if JSON parsing or API fails
        try {
            const translatedPrompt = await translateToEnglish(prompt);
            return { detailed: translatedPrompt, concise: translatedPrompt };
        } catch (transError) {
             throw new Error(handleGeminiError(transError));
        }
    }
};

/**
 * Improves a prompt for changing a subject's pose in an image.
 */
export const improvePosePrompt = (prompt: string) => improvePromptWithSystemInstruction(
    prompt,
    `You are a creative assistant for an AI image generator. The user has an existing image and wants to change the pose of the subject. Your task is to refine the user's pose description into "detailed" and "concise" versions.

**Response Format:**
You MUST respond with a valid JSON object with two keys: "detailed" and "concise".

**Instructions:**
- **Detailed Version:** Be descriptive. Mention body language, expression, and the overall mood of the pose.
- **Concise Version:** A short, clear command for the pose change.`
);