export interface StyleOption {
    value: string;
    label: string;
}

export interface StyleCategory {
    id: string;
    name: string;
    options: StyleOption[];
}

export interface RecommendedStyle {
    label: string;
    value: string;
}

export interface AspectRatio {
    value: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
    label: string;
}

export interface ImageFile {
    data: string;
    mimeType: string;
}

export interface GantiOutfitImages {
    outfit: ImageFile | null;
    pants: ImageFile | null;
    shoes: ImageFile | null;
    accessory: ImageFile | null;
    fullOutfit: ImageFile | null;
}

export interface GantiOutfitBodyOptions {
    bodyType: 'sangat kurus' | 'kurus' | 'standar' | 'berisi' | 'gemuk' | 'sangat gemuk';
    bustSize: 'kecil' | 'sedang' | 'besar';
    hipSize: 'ramping' | 'sedang' | 'lebar';
}

export interface CustomStyle {
    id: 'gantiOutfit' | 'photoWithIdol' | 'touchUpWajah' | 'semuaBisaDisini' | 'promptVideoVeo' | 'identifikasiFashion' | 'removeWatermark' | 'tingkatkanKualitas';
    name: string;
    note: string;
}

export interface TouchUpOptions {
    lipColor: string;
    blushIntensity: 'none' | 'subtle' | 'medium' | 'strong';
    brightenFace: boolean;
    healSkin: boolean;
    hairstyle: string;
    hairColor: string;
}

export interface PhotoWithIdolOptions {
    manualPrompt: string;
    poseTemplate: string;
    shotStyleTemplate: string;
    lightStyleTemplate: string;
}

export interface SemuaBisaDisiniOptions {
    numberOfPhotos: number;
    images: (ImageFile | null)[];
    prompt: string;
}