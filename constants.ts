import type { StyleCategory, RecommendedStyle, AspectRatio, CustomStyle } from './types';

export const RECOMMENDED_STYLES: RecommendedStyle[] = [
  {
    label: 'Action figure Bandai',
    value: 'Create a 1/7th scale commercial figure of the character in the illustration, with a realistic style and environment. Place the figure on a computer desk, using a circular, transparent acrylic base with no text. On the computer screen, display the ZBrush modeling process for the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with original artwork. Make it hyper-realistic, 8k, sharp focus, detailed textures, cinematic lighting.'
  },
  {
    label: 'Photo studios kece',
    value: 'Hands in Pockets – Relaxed Authority. A hyper-realistic cinematic editorial portrait of the person being uploaded (keep the face 100%). They are standing upright in a bright, natural studio with the background color matched to the type of clothing worn, surrounded by smoke (according to the color of the clothing) billowing under dramatic lighting behind the subject, create. Clothing: Matches the uploaded reference photo. Both hands are casually tucked into their pockets, shoulders relaxed, a confident expression, and the head is slightly tilted. Create a hyper-realistic portrait, 8k, sharp focus, detailed textures, and cinematic lighting.'
  },
  {
    label: 'Black and White',
    value: 'Use the face in this photo for a black-and-white studio shoot, showcasing 100% similarity in facial features and style to the uploaded photo. The lighting is soft and minimalist, creating sharp shadows and a moody atmosphere. The pose is relaxed, leaning slightly with one arm on the back of the chair, her face turned to the side. The background is plain, with a simple, modern aesthetic. Create hyperrealism, 8K, sharp focus, detailed textures, and cinematic lighting.'
  },
  {
    label: 'Basah Estetik',
    value: 'A low-angle medium close-up shot of (depict new face and hair as per the uploaded photo), wet skin and hair, intense and introspective expression looking up. Dramatic hard lighting from above creates deep shadows and highlights on the wet skin. The image is taken from the tips of the hair to the stomach or chest. Backlighting/rim light subtly defines the subject. Gives the effect of water droplets or splashes. The background is lit with a warm orange gradient on the left that blends with a deep maroon/purple on the right. The color palette is high-contrast, cinematic, and moody with rich tones and little desaturation. 8K quality, super realistic.'
  },
  {
    label: 'Kipas angin Estetik',
    value: 'A low-angle medium close-up shot of (depict new face and hair as per the uploaded photo), skin and hair blowing in the wind, an intense and introspective expression looking up. Dramatic hard lighting from above-front creates deep shadows and highlights on the naturally windblown hair. The image is taken from the tips of the hair to the stomach or chest. Backlighting/rim light subtly frames the subject. giving a windblown effect that enhances the aesthetic of the hair. The background is lit with a warm orange gradient on the left that blends with a deep maroon/purple on the right. The color palette is high-contrast, cinematic, and moody with rich tones and a slight desaturation. 8K quality, super realistic.'
  },
  {
    label: 'Me & toys',
    value: 'A man/woman wearing a shirt and pants (as in the uploaded photo) with a gentle expression, is holding an action figure that resembles him/herself, almost the same size as him/her. The action figure is wearing similar clothes, appears to be assembling parts or parts of an unfinished toy in the assembly. The toy display is arranged on a luxurious wooden table. In the background, a collection of other action figures can be seen on the shelf. Lock the face from the uploaded photo so that it displays 100% similar results. provide natural lighting, but aesthetic. 8k Quality, sharp focus, high contrast, realistic'
  },
  {
    label: 'GTA V5',
    value: 'The character (according to the uploaded photo reference, make it very similar 100%) exudes a confident and slightly mischievous aura, rendered in the iconic Grand Theft Auto (GTA) cartoon style. Focus on exaggerated and stylized proportions, sharp and clean lines, and a bright color palette reminiscent of GTA V character models. He stands in a dynamic and slightly arrogant pose, perhaps with a slight smirk, looking directly at the viewer. 4K quality, like the colors. and give it an airbrush spray effect, sharp focus, high contrast, realistic'
  },
  {
    label: 'pas photo estetik',
    value: 'A hyper-realistic, cinematic editorial portrait of the person you\'re uploading (make sure their face matches 100%). They stand upright in a studio with natural lighting and a background color that matches their clothing, with dramatic lighting behind the subject. Clothing: (As per the uploaded reference photo) Relaxed shoulders, a confident expression, and a slightly tilted head provide natural light to the face with contrasting details and colors. The scene is lit with a dramatic, warm backlight that creates a glow that matches the color of the clothing and soft fill light on the face. Create a hyper-realistic 8K portrait with sharp focus, detailed textures, and cinematic lighting. Professional studio portrait, eye-level, high-resolution, with sharp focus on the face. Automatic 1:1 crop, photo taken only from the chest to the head., sharp focus, high contrast, realistic'
  },
  {
    label: 'selfi keliling indo',
    value: 'A confident selfie of the person from the uploaded photo, taken at a famous Indonesian tourist destination. The AI should creatively choose a beautiful and iconic location in Indonesia. The person\'s outfit should be stylish and appropriate for the chosen location. The lighting should be natural and flattering. Critically important: maintain and lock the face from the attached photo, ensuring 100% similarity in features and expression. 8K quality, super realistic, sharp focus., sharp focus, high contrast, realistic'
  },
  {
    label: 'Miniatur gedung',
    value: 'A hyper-realistic, high-quality photograph of a miniature diorama. The diorama is a 100% accurate replica of the building and its surroundings from the uploaded photo, capturing every architectural detail, texture, and color. It\'s built with realistic materials like 3D-printed resin and acrylic, with detailed landscaping using miniature moss and sand. Warm, inviting miniature LED lights create a deep, atmospheric scene. The entire diorama is elegantly displayed on a luxurious marble table against a plain, soft, warm-colored background. The overall image has high contrast and sharp focus. Critically important: Any visible text from the original photo must be perfectly replicated, sharp focus, high contrast, realistic'
  },
  {
    label: 'Diorama',
    value: 'Create a hyper-realistic photograph of a miniature diorama displayed on a table. The diorama is a faithful recreation of the building or monument from the uploaded photo, capturing its essence as an iconic landmark. The composition must focus solely on the diorama, removing any original background such as the sky. Utilize dramatic lighting to create depth and atmosphere, ensuring the final image has sharp focus and intricate, high-quality details in every corner. The image should emulate a shot taken with a professional DSLR camera, resulting in a hyper-realistic, 8k, 16:9 landscape photograph., sharp focus, high contrast, realistic'
  },
  {
    label: 'black shoot estetik studios',
    value: 'An emotional cinematic portrait of myself (face key based on the uploaded photo), featuring me, my head slightly tilted, wearing the shirt and pants as shown in the uploaded photo. Warm, golden-blue light isolates her from the dark void, softly illuminating her hair, capturing the profound stillness. However, her face remains visible. High quality, sharp facial details, realistic.'
  },
  {
    label: 'Extreme Close Up',
    value: 'Create a very close-up of the face, focusing especially on the eyes, and only showing half of the face, leaving the hair down to the chin on the right side of the face visible. Make the pores of the skin very visible with high contrast. Maintain 100% similarity to the uploaded photo, and dramatically enhance this image to very high detail. Sharpen every texture, clarify reflections, perfect the lighting, and bring out small details to create a very sharp and high-fidelity result, so that the cornea of the eye is clearly visible. The photo was taken using a Canon EF 100mm f/2.8L Macro IS USM macro lens. Ensure the face is very realistic and the pores of the skin are clearly visible., sharp focus, high contrast, realistic'
  },
  {
    label: 'Dark Close Up With Smoke',
    value: 'Hands in Pockets – Relaxed Authority. A hyper-realistic, cinematic editorial portrait of the person being uploaded (keep the face 100%). They stand upright in a dark, gloomy studio, surrounded by billowing smoke under dramatic lighting. Clothing: As per the uploaded reference photo. Both hands are casually tucked into their pockets, shoulders relaxed, a confident expression, and the head is slightly tilted. Make it hyper-realistic, 8k, sharp focus, detailed textures, cinematic lighting., sharp focus, high contrast, realistic'
  },
  {
    label: 'Siluet estetik',
    value: 'A captivating, high-contrast monochrome portrait, captured in a precise 90-degree side profile of a woman. The image is composed with a long telephoto lens (e.g., 135mm or 200mm) at a wide aperture (e.g., f/2.8) for exceptional subject isolation and buttery smooth bokeh, shot from a slightly elevated eye-level to subtly emphasize the subject\'s contemplative gaze. Dramatic, razor-sharp rim lighting meticulously sculpts the exquisite contours of her profile – from the delicate arch of her brow and the bridge of her nose, along the elegant line of her jaw, to the individual wisps of hair framing her face. This light creates a luminous halo, separating her from an abyssal, velvet-black background that completely dissolves any sense of environment, pushing the silhouette to the forefront as a powerful, almost abstract form. The aesthetic draws heavily from the dramatic chiaroscuro of classic Film Noir and the minimalist elegance of Irving Penn\'s "Small Trades" series, rendered with the fine grain, deep blacks, and brilliant highlights characteristic of pushed Kodak T-Max 100 film. The emotional mood is one of profound introspection, enigmatic strength, and a timeless, serene allure., sharp focus, high contrast, realistic'
  },
  {
    label: 'Monokrom Luxury',
    value: 'Use the face in this photo for a black-and-white studio shoot, showcasing 100% similarity in facial features and style to the uploaded photo. The lighting is soft and minimalist, creating sharp shadows and a moody atmosphere. The pose is relaxed, leaning slightly with one arm on the back of the chair, her face turned to the side. The background is plain, with a simple, modern aesthetic. Create hyperrealism, 8K, sharp focus, detailed textures, and cinematic lighting., sharp focus, high contrast, realistic'
  },
  {
    label: 'Close potrait',
    value: 'A close-up portrait, captured with an 85mm prime lens at f/1.8, focusing on a subject with a genuinely sweet and serene smile that gently crinkles the eyes. The expression conveys a deep sense of quiet contentment and approachable warmth. The camera angle is subtly low, just below eye-level, lending an ethereal grace to the subject. Lighting is soft, diffused natural window light, meticulously sculpted to highlight the delicate planes of the face and create a luminous glow, reminiscent of Vermeer\'s intimate portraits. The background is starkly minimalist—a seamless, smooth off-white or light grey wall, or expansive negative space—with creamy, dreamlike bokeh that completely isolates the subject. The overall aesthetic is ultra-minimalist, inspired by the clean lines of Jil Sander and the understated elegance of Scandinavian design. The image is processed to evoke the soft, natural skin tones, subtle desaturation, and fine grain of Kodak Portra 400 film stock, imbuing it with a timeless, tranquil, and sophisticated feel. NOTE: For maximum results, please upload a half-body photo., sharp focus, high contrast, realistic'
  },
  {
    label: 'karikatur',
    value: `Create a captivating, laughter-filled, and highly expressive digital caricature portrait. Transform the subject into a unique and intriguing representation, where their most prominent facial features—such as the nose, eyes, lips, chin, or even a distinctive hairstyle—are exaggerated intelligently, absurdly, and artistically. Despite the exaggeration, ensure the subject's likeness remains instantly recognizable, yet with a distilled and iconic visual style, resembling a high-quality modern cartoon portrait.

*Artistic Style & Details:* Visualize in a contemporary digital illustration style, resembling high-end animation studio concept art (like Pixar, DreamWorks, or modern magazine illustration style). Use clean, expressive, and sometimes bold lines to define forms. Small details in facial expressions—playful crinkles around the eyes, a mischievous glint, or a cheeky smile—should be emphasized. Add simplified yet palpable texture, such as subtle creases in clothing or dynamically flowing hair details, to add depth without distracting from the main focus.

*Color Palette:* Apply a bright, cheerful, and vibrant color palette. Use high yet harmonious saturation, with smooth color gradients and soft tonal transitions to add volume and dimension. Dominate with eye-catching primary and secondary colors (e.g., bright red, cheerful yellow, electric blue), or clever complementary color schemes to create delightful, pop-art contrast. Avoid dull or dark colors; every pigment should radiate positive energy.

*Lighting & Shadows:* Employ a dramatic yet playful lighting scheme, specifically designed to highlight the exaggerated facial features. Consider soft studio lighting from the front to accentuate expressions, or clever side-lighting to create artistic depth and shadows. Add a subtle, sparkling rim light effect around the subject's silhouette to separate them from the background and add definition. Shadows should be intelligent, minimalist, and strategically used to add dimension without appearing gloomy or distracting from the visual humor. Highlights should be clear and deliberately placed to draw the eye to key features.

*Composition & Background:* The composition should be a close-up shoulder-up portrait or headshot, focusing full and undivided attention on the subject's face and expression. The viewpoint should be dynamic, perhaps with a slight camera tilt or a clever eye-level perspective, to add a sense of playfulness and energy. The background should be minimalist, clean, and non-distracting, perhaps a soft solid color gradient, a very simple abstract pattern, or a gently contrasting color field that serves as a canvas, supporting the caricature without competing with it. Ensure negative space is effectively used to frame the subject.

*Quality & Mood:* The final output must have very high resolution (minimum 4K, ideally 8K), with exceptionally clean, sharp, and professional rendering. The primary focus should be perfectly sharp on the exaggerated features. Capture the essence of the subject's personality with a cheerful, goofy, or witty expression, radiating an aura of joy, intelligent humor, and positive energy. The image should feel alive, dynamic, and exude an undeniable appeal, inviting a wide smile from anyone who views it., sharp focus, high contrast, realistic`
  },
  {
    label: 'Hyper detailed',
    value: 'Dramatically enhance this image into a hyper-detailed and ultra-realistic visual masterpiece, with unparalleled cinematic resolution. Every texture must possess microscopic definition: clearly visible fabric fibers, subtle scratches on polished metal surfaces, authentic skin pores, or intricate and profound wood grain patterns. Material surfaces must exhibit accurate characteristics, be it realistic wear and tear, rich patina, a flawless sheen reflecting light, or a tangible rough texture.\n\nReflections must be crystal clear and physically accurate, mirroring the surroundings with photorealistic precision, complete with realistic distortions on curved surfaces and profound light refraction effects.\n\nLighting must be sophisticated and multidimensional, powered by realistic Global Illumination (GI) to accentuate every volume, form, and depth. Highlights must be sharp, specular, and dynamic, while shadows must be soft yet possess definition in their deepest details, with gradient penumbra and accurate color nuances. Include volumetric light effects such as god rays, crepuscular rays, or subtle ambient haze to add atmospheric depth.\n\nThe color palette must be rich and varied, with seamless gradient transitions, striking dynamic contrast, and perfectly calibrated color accuracy. Color depth must be palpable, from deep blacks to brilliant whites, with vibrant yet natural vibrancy.\n\nComposition must be captivating, with deliberate depth of field and soft bokeh effects to guide the eye to the main focal point. Micro-details such as glistening dew drops, dust motes suspended in the air, frozen water splashes, or other minute particles must be visible, creating an immersive atmosphere and infinite detail.\n\nThe final output must possess ultra-high resolution (8K/16K), rendered with blockbuster film studio quality, highlighting every pixel with unparalleled clarity, sharpness, and authenticity, resembling a perfect macro photograph or the finest Hollywood visual effects., sharp focus, high contrast, realistic'
  },
  {
    label: 'sketsa',
    value: 'Transform this photo into a detailed facial sketch using black pen strokes on aged, canvas-textured paper. Focus on capturing the likeness with expressive, confident lines and cross-hatching for shading., sharp focus, high contrast, realistic'
  },
  {
    label: 'cartoon estetik',
    value: 'Convert the detected human subject in the attached image into a cartoon style, vibrant color fills, bold black internal line art, smooth shapes, simplified textures. Add a uniform outer white stroke of 12 px around the subject. Preserve the original photo background. Keep proportions similar to the photo. On a new top layer, draw white doodle elements around the subject’s silhouette without covering the face: small sparkles, stars, dots, swirls, motion lines, leaf sprigs.'
  },
  {
    label: 'Action Figure Custom Outfit',
    value: '__ACTION_FIGURE_CUSTOM__'
  },
  {
    label: 'Prompt Ajaib Kamu',
    value: '__CUSTOM_PROMPT__'
  }
];

export const STYLE_CATEGORIES: StyleCategory[] = [
    {
        id: 'baseStyle',
        name: 'Gaya Dasar',
        options: [
            { value: 'digital art', label: 'Seni Digital' },
            { value: 'photorealistic', label: 'Fotorealistik' },
            { value: 'anime style', label: 'Gaya Anime' },
            { value: 'oil painting', label: 'Lukisan Cat Minyak' },
            { value: 'watercolor', label: 'Lukisan Cat Air' },
            { value: 'fantasy', label: 'Fantasi' },
            { value: 'cyberpunk', label: 'Cyberpunk' },
        ],
    },
    {
        id: 'lighting',
        name: 'Pencahayaan',
        options: [
            { value: 'cinematic lighting', label: 'Sinematik' },
            { value: 'soft lighting', label: 'Lembut' },
            { value: 'dramatic lighting', label: 'Dramatis' },
            { value: 'neon lighting', label: 'Neon' },
            { value: 'natural lighting', label: 'Alami' },
        ],
    },
    {
        id: 'colorPalette',
        name: 'Palet Warna',
        options: [
            { value: 'vibrant colors', label: 'Cerah' },
            { value: 'monochromatic', label: 'Monokromatik' },
            { value: 'pastel colors', label: 'Pastel' },
            { value: 'dark and moody', label: 'Gelap & Murung' },
            { value: 'earth tones', label: 'Warna Bumi' },
        ],
    },
    {
        id: 'composition',
        name: 'Komposisi',
        options: [
            { value: 'wide angle shot', label: 'Sudut Lebar' },
            { value: 'close-up shot', label: 'Close-up' },
            { value: 'dynamic angle', label: 'Sudut Dinamis' },
            { value: "bird's eye view", label: 'Pemandangan Atas' },
            { value: 'portait', label: 'Potret' },
        ],
    },
    {
        id: 'details',
        name: 'Detail',
        options: [
            { value: 'highly detailed, 4k resolution', label: 'Sangat Detail, 4K' },
            { value: 'intricate details', label: 'Detail Rumit' },
            { value: 'sharp focus', label: 'Fokus Tajam' },
            { value: 'minimalist', label: 'Minimalis' },
        ],
    },
];

export const ASPECT_RATIOS: AspectRatio[] = [
    { value: '1:1', label: 'Persegi (1:1)' },
    { value: '16:9', label: 'Lanskap (16:9)' },
    { value: '9:16', label: 'Potret (9:16)' },
    { value: '4:3', label: 'Lanskap Klasik (4:3)' },
    { value: '3:4', label: 'Potret Klasik (3:4)' },
];

export const POSE_PRESETS = [
    { label: 'Pose Berdiri Santai', prompt: 'Ubah pose menjadi berdiri santai, dengan satu tangan di saku dan sedikit senyum.' },
    { label: 'Pose Duduk Elegan', prompt: 'Ubah pose menjadi duduk elegan di kursi antik, dengan kaki disilangkan.' },
    { label: 'Pose Berjalan Dinamis', prompt: 'Ubah pose menjadi berjalan dinamis ke arah kamera dengan ekspresi percaya diri.' },
    { label: 'Pose Melompat Gembira', prompt: 'Ubah pose menjadi melompat dengan ekspresi gembira dan lengan terangkat.' },
];

export const CUSTOM_STYLES: CustomStyle[] = [
    {
        id: 'gantiOutfit',
        name: 'Ganti Outfit',
        note: 'Unggah foto orang dan pakaian yang ingin dikenakan. AI akan menggabungkannya dengan menjaga wajah asli.',
    },
    {
        id: 'photoWithIdol',
        name: 'Foto Bareng Idol',
        note: 'Unggah foto Anda dan foto idola Anda. AI akan membuat foto studio di mana Anda berdua berpose bersama.',
    },
    {
        id: 'touchUpWajah',
        name: 'Touch Up Wajah',
        note: 'Sempurnakan foto potret Anda dengan riasan, gaya rambut baru, dan perbaikan kulit sambil mempertahankan identitas asli.',
    },
    {
        id: 'semuaBisaDisini',
        name: 'Semua Bisa Disini',
        note: 'Gabungkan beberapa foto menjadi satu adegan. Tentukan jumlah foto, unggah, lalu tulis prompt untuk mendeskripsikan hasilnya.',
    },
     {
        id: 'promptVideoVeo',
        name: 'Prompt Video Veo',
        note: 'Buat dan sempurnakan prompt teks untuk AI generator video seperti Veo. AI akan memperkaya ide Anda dan menerjemahkannya ke Bahasa Inggris.',
    },
    {
        id: 'identifikasiFashion',
        name: 'Identifikasi Fashion',
        note: 'Unggah foto outfit dan AI akan memberikan deskripsi detail setiap item untuk referensi prompt Anda. Fitur ini menghasilkan teks, bukan gambar.',
    },
    {
        id: 'removeWatermark',
        name: 'Hapus Watermark',
        note: 'Unggah gambar yang memiliki watermark atau logo, dan AI akan mencoba menghapusnya secara bersih.',
    },
    {
        id: 'tingkatkanKualitas',
        name: 'Tingkatkan Kualitas Foto (DSLR)',
        note: 'Unggah foto untuk meningkatkan resolusi, ketajaman, warna, dan pencahayaan secara dramatis, seolah diambil dengan kamera DSLR profesional. Wajah akan 100% dipertahankan.',
    }
];

export const LIPSTICK_COLORS = [
    { name: 'Classic Red', displayName: 'Merah Klasik', value: '#C00000' },
    { name: 'Nude Pink', displayName: 'Pink Nude', value: '#E4AFA2' },
    { name: 'Deep Plum', displayName: 'Plum Gelap', value: '#5A2D5A' },
    { name: 'Coral Peach', displayName: 'Peach Koral', value: '#FF7F50' },
    { name: 'Hot Pink', displayName: 'Pink Terang', value: '#FF69B4' },
    { name: 'Dark Chocolate', displayName: 'Cokelat Gelap', value: '#3D1C02' },
];

export const HAIRSTYLE_PRESETS = [
    // --- GAYA RAMBUT WANITA ---
    { label: 'Wanita: Bob Klasik', value: 'a classic, chin-length bob with a sharp, clean cut' },
    { label: 'Wanita: Long Bob (Lob)', value: 'a long bob (lob) haircut that grazes the shoulders' },
    { label: 'Wanita: Bob A-Line', value: 'an A-line bob that is shorter in the back and longer in the front' },
    { label: 'Wanita: Bob Shaggy', value: 'a shaggy bob with choppy layers and a lot of texture' },
    { label: 'Wanita: Bob Tumpul (Blunt)', value: 'a blunt bob cut straight across with no layers' },
    { label: 'Wanita: Bob ala Prancis', value: 'a chic French bob, typically shorter and paired with bangs' },
    { label: 'Wanita: Pixie Cut Klasik', value: 'a classic short pixie cut, cropped close to the head' },
    { label: 'Wanita: Pixie Panjang', value: 'a longer pixie cut with more volume and length on top' },
    { label: 'Wanita: Rambut Lurus Panjang', value: 'long, sleek, and perfectly straight hair' },
    { label: 'Wanita: Rambut Panjang Bergelombang', value: 'long, wavy beach hair with soft, natural-looking waves' },
    { label: 'Wanita: Ikal Bervolume Panjang', value: 'long hair with big, voluminous curls' },
    { label: 'Wanita: Lapisan Panjang (Layers)', value: 'long hair with face-framing layers for movement and shape' },
    { label: 'Wanita: Panjang dengan Poni Tumpul', value: 'long straight hair with heavy, blunt bangs' },
    { label: 'Wanita: Sebahu Bergelombang', value: 'shoulder-length hair with gentle waves' },
    { label: 'Wanita: Potongan Shag', value: 'a retro-inspired shag haircut with lots of layers' },
    { label: 'Wanita: Potongan Wolf Cut', value: 'a trendy wolf cut, which is a mix between a shag and a mullet' },
    { label: 'Wanita: Poni Gorden (Curtain Bangs)', value: 'stylish curtain bangs that frame the face' },
    { label: 'Wanita: Poni Tipis (Wispy)', value: 'light and wispy bangs for a softer look' },
    { label: 'Wanita: Kuncir Kuda Tinggi', value: 'a high, sleek ponytail' },
    { label: 'Wanita: Cepol Berantakan (Messy Bun)', value: 'a casual and chic messy bun' },
    { label: 'Wanita: Cepol Atas (Top Knot)', value: 'a stylish top knot bun' },
    { label: 'Wanita: Kepang Prancis', value: 'a classic French braid' },
    { label: 'Wanita: Kepang Belanda', value: 'a Dutch braid that stands out from the scalp' },
    { label: 'Wanita: Kepang Ekor Ikan', value: 'an intricate fishtail braid' },
    { label: 'Wanita: Kepang Mahkota', value: 'a beautiful crown braid wrapped around the head' },
    { label: 'Wanita: Kepang Boxer', value: 'two tight Dutch braids, also known as boxer braids' },
    { label: 'Wanita: Afro Alami', value: 'natural, voluminous afro-textured curly hair' },
    { label: 'Wanita: Ikal Ringlet Rapat', value: 'tightly coiled ringlet curls' },
    { label: 'Wanita: Gelombang Hollywood', value: 'glamorous, vintage Hollywood waves' },
    { label: 'Wanita: Gaya Setengah Ikat', value: 'a half-up, half-down hairstyle' },
    { label: 'Wanita: Cepol Spasi (Space Buns)', value: 'two buns placed on top of the head, known as space buns' },
    { label: 'Wanita: Potongan Hime', value: 'a Japanese Hime cut with straight, cheek-length sidelocks and a frontal fringe' },
    { label: 'Wanita: Kuncir Kuda Gelembung', value: 'a bubble ponytail with elastics tied down the length of the hair' },
    { label: 'Wanita: Rambut Basah (Wet Look)', value: 'a sleek, wet-look hairstyle, combed back' },
    { label: 'Wanita: Gaya Finger Waves (1920-an)', value: 'a 1920s-style finger wave hairstyle' },
    { label: 'Wanita: Gaya Beehive (1960-an)', value: 'a voluminous 1960s beehive updo' },
    { label: 'Wanita: Gaya Feathered (1970-an)', value: '70s-style feathered hair, flicked away from the face' },
    { label: 'Wanita: Rambut Gimbal (Dreadlocks)', value: 'stylized dreadlocks' },
    { label: 'Wanita: Faux Hawk', value: 'a faux hawk hairstyle where the sides are slicked back' },
    { label: 'Wanita: Rambut Dikepang Cornrow', value: 'intricate cornrow braids close to the scalp' },
    { label: 'Wanita: Kuncir Samping', value: 'a low side ponytail draped over the shoulder' },
    { label: 'Wanita: Rambut Keriting Perm', value: '80s style perm with tight curls' },
    { label: 'Wanita: Bob Asimetris', value: 'an asymmetrical bob, longer on one side than the other' },
    { label: 'Wanita: Bob Terbalik (Inverted)', value: 'an inverted bob with a stacked back and longer front' },
    { label: 'Wanita: Chignon Rendah', value: 'an elegant low chignon bun at the nape of the neck' },
    { label: 'Wanita: Kepang Air Terjun', value: 'a romantic waterfall braid' },
    { label: 'Wanita: Rambut Pin-up (1950-an)', value: '1950s pin-up hairstyle with victory rolls' },
    { label: 'Wanita: Rambut Super Panjang', value: 'fairytale-like, extra-long hair reaching the waist' },
    { label: 'Wanita: Potongan Mangkuk Modern', value: 'a modern and chic take on the classic bowl cut' },

    // --- GAYA RAMBUT PRIA ---
    { label: 'Pria: Undercut Modern', value: 'a modern men\'s undercut hairstyle with short sides and a longer top' },
    { label: 'Pria: Potongan Buzz Cut', value: 'a very short buzz cut, uniform in length' },
    { label: 'Pria: Potongan Crew Cut', value: 'a classic crew cut, short on the sides, slightly longer on top' },
    { label: 'Pria: Slicked Back', value: 'a slicked-back hairstyle, often with a wet look' },
    { label: 'Pria: Pompadour', value: 'a voluminous pompadour hairstyle' },
    { label: 'Pria: Quiff', value: 'a stylish quiff with volume at the front' },
    { label: 'Pria: Belah Samping (Side Part)', value: 'a classic, clean side part hairstyle' },
    { label: 'Pria: Sisir Samping (Comb Over)', value: 'a comb-over hairstyle, often with a fade' },
    { label: 'Pria: Potongan French Crop', value: 'a textured French crop with a short fringe' },
    { label: 'Pria: High Fade', value: 'a high fade haircut where the fade starts high on the sides' },
    { label: 'Pria: Mid Fade', value: 'a mid fade haircut' },
    { label: 'Pria: Low Fade', value: 'a low fade haircut that tapers down the neck' },
    { label: 'Pria: Skin Fade', value: 'a skin fade that tapers down to the bare skin' },
    { label: 'Pria: Taper Fade', value: 'a classic taper fade hairstyle' },
    { label: 'Pria: Rambut Panjang Sebahu', value: 'shoulder-length long hair, often with a center part' },
    { label: 'Pria: Man Bun', value: 'a man bun hairstyle with the hair tied up in a bun' },
    { label: 'Pria: Top Knot', value: 'a top knot, similar to a man bun but higher on the head' },
    { label: 'Pria: Bro Flow', value: 'a medium-length "bro flow" hairstyle, swept back' },
    { label: 'Pria: Rambut Keriting Pendek', value: 'short curly hair, often with a fade on the sides' },
    { label: 'Pria: Rambut Keriting Sedang', value: 'medium-length curly hair with natural volume' },
    { label: 'Pria: Rambut Bergelombang', value: 'natural wavy hair with a relaxed look' },
    { label: 'Pria: Potongan Caesar', value: 'a Caesar cut with a short, horizontal fringe' },
    { label: 'Pria: Ivy League', value: 'an Ivy League haircut, a slightly longer version of the crew cut' },
    { label: 'Pria: Poni Berantakan', value: 'a messy fringe hairstyle' },
    { label: 'Pria: Rambut Spiky (90-an)', value: '90s-style spiky hair' },
    { label: 'Pria: Faux Hawk (Fohawk)', value: 'a faux hawk (fohawk) hairstyle' },
    { label: 'Pria: Mohawk', value: 'a classic mohawk hairstyle' },
    { label: 'Pria: Mullet', value: 'a mullet hairstyle, short in the front and long in the back' },
    { label: 'Pria: Potongan Disconnected Undercut', value: 'a disconnected undercut with a sharp contrast in length' },
    { label: 'Pria: Hard Part', value: 'a hairstyle with a shaved line for the part (hard part)' },
    { label: 'Pria: Rambut Gimbal (Dreadlocks)', value: 'well-maintained dreadlocks' },
    { label: 'Pria: Kepang Viking', value: 'Viking-style braids, often with shaved sides' },
    { label: 'Pria: Kepang Pria (Man Braids)', value: 'braided hairstyles for men, such as cornrows or box braids' },
    { label: 'Pria: Afro Alami', value: 'a natural, well-shaped afro hairstyle' },
    { label: 'Pria: Potongan High and Tight', value: 'a high and tight military-style haircut' },
    { label: 'Pria: Rambut Panjang Lurus', value: 'long, straight hair for men' },
    { label: 'Pria: Kuncir Setengah Ikat', value: 'a half-up ponytail for men with long hair' },
    { label: 'Pria: Burst Fade', value: 'a burst fade around the ears' },
    { label: 'Pria: Textured Crop', value: 'a modern textured crop haircut' },
    { label: 'Pria: Potongan Edgar', value: 'an Edgar cut, a sharp variation of the Caesar cut' },
    { label: 'Pria: Rambut Surfer', value: 'sun-bleached, messy surfer hair' },
    { label: 'Pria: Potongan Butch', value: 'a butch cut, a type of buzz cut but slightly longer' },
    { label: 'Pria: Rambut Ikal Afro High Top', value: 'a high top fade with coily afro hair' },
    { label: 'Pria: Gaya Rambut Twists', value: 'two-strand twists hairstyle' },
    { label: 'Pria: Garis Tepi (Line Up)', value: 'a sharp line up or edge up on the hairline' },
    { label: 'Pria: Rambut Berantakan (Bedhead)', value: 'an intentionally messy "bedhead" look' },
    { label: 'Pria: Potongan Flat Top', value: 'a flat top hairstyle where the hair on top is cut flat' },
    { label: 'Pria: Potongan Mangkuk (Bowl Cut)', value: 'a modern take on the bowl cut' },
    { label: 'Pria: Rambut Belah Tengah (90-an)', value: 'a 90s-style center part hairstyle, also known as the curtain hairstyle' },
    { label: 'Pria: Rambut Panjang dengan Undercut', value: 'long hair on top with shaved or faded undercut sides' },
];

export const IDOL_POSE_TEMPLATES = [
    { label: 'Gendong Belakang (Piggyback)', value: 'One person giving the other a joyful piggyback ride, both laughing uncontrollably' },
    { label: 'Berbisik Rahasia', value: 'One person playfully whispering a secret into the other\'s ear, who is reacting with a surprised smile' },
    { label: 'Punggung ke Punggung Keren', value: 'Standing back-to-back with arms crossed, both looking confidently at the camera like movie stars' },
    { label: 'Selfie Kocak', value: 'Huddled together, taking a funny-face selfie with a smartphone' },
    { label: 'High-Five Epik di Udara', value: 'Captured mid-air, executing an epic, perfectly synchronized high-five' },
    { label: 'Pose Prom Klasik', value: 'A classic prom pose, one person stands behind the other with arms wrapped around their waist, both smiling warmly' },
    { label: 'Berbagi Headphone', value: 'Sitting close together, sharing a pair of headphones, lost in the music' },
    { label: 'Tarian Konyol', value: 'In the middle of a spontaneous, silly dance-off, with exaggerated moves and joyful expressions' },
    { label: 'Tatapan Penuh Makna', value: 'Facing each other, holding hands, and sharing a deep, meaningful look' },
    { label: 'Adu Panco', value: 'Engaged in a dramatic, over-the-top arm-wrestling match on a small table' },
    { label: 'Pose Hati ala Korea', value: 'Both making a heart shape together with their hands or arms' },
    { label: 'Makan Es Krim Bareng', value: 'Playfully feeding each other ice cream, with a little bit of mess' },
    { label: 'Berteduh di Bawah Jaket', value: 'One person holding a jacket over both of their heads as if sheltering from rain, huddled close' },
    { label: 'Gaya "Follow Me"', value: 'One person leading the other by the hand, shot from the perspective of the person being led' },
    { label: 'Main Gitar Bareng', value: 'Sitting on stools, one person teaching the other how to play an acoustic guitar' },
    { label: 'Pose Majalah Fashion', value: 'Posing with high-fashion, serious expressions, as if on the cover of Vogue' },
    { label: 'Rangkulan Bahu Sahabat', value: 'A casual and warm side-hug, with arms draped over each other\'s shoulders' },
    { label: 'Meniup Gelembung Sabun', value: 'Blowing soap bubbles together, with a dreamy, lighthearted atmosphere' },
    { label: 'Duel Lirik Lagu', value: 'Back-to-back, each holding a microphone as if in a dramatic singing duel' },
    { label: 'Saling Menyandarkan Kepala', value: 'Sitting on the floor, leaning against each other with their heads resting on the other\'s shoulder' },
    { label: 'Pose "Titanic"', value: 'Recreating the famous "king of the world" pose from Titanic at the bow of a ship (or pretending to)' },
    { label: 'Menunjuk ke Arah yang Sama', value: 'Both pointing excitedly at something off-camera with wide, curious eyes' },
    { label: 'Gaya Fotobox Gila', value: 'A sequence of four hilarious, expressive poses as if taken in a photobooth' },
    { label: 'Membaca Buku Bersama', value: 'Sharing a single large book, engrossed in the story' },
    { label: 'Pose Pahlawan Super', value: 'Standing in heroic power poses, as if they are a superhero duo ready for action' },
    { label: 'Saling Suap Makanan', value: 'Playfully feeding each other a piece of cake or a strawberry' },
    { label: 'Bersulang Minuman', value: 'Clinking glasses or mugs together in a celebratory toast' },
    { label: 'Pose Dab Sinkron', value: 'Both hitting a perfectly synchronized dab pose' },
    { label: 'Gaya "Hear No Evil, See No Evil"', value: 'Playfully covering each other\'s ears and eyes' },
    { label: 'Lompatan Bintang Gembira', value: 'Both captured mid-jump in a star shape (jumping jack), full of energy and excitement' },
];

export const SHOT_STYLE_TEMPLATES = [
    { label: 'Potret Close-Up', value: 'an intimate close-up portrait shot, focusing on facial expressions' },
    { label: 'Medium Shot', value: 'a medium shot, capturing them from the waist up' },
    { label: 'Full-Body Shot', value: 'a full-body shot, showcasing their poses and outfits completely' },
    { label: 'Sudut Rendah (Low-Angle)', value: 'a dynamic low-angle shot, making them look powerful and larger-than-life' },
    { label: 'Sudut Tinggi (High-Angle)', value: 'a charming high-angle shot, looking down on them' },
    { label: 'Dutch Angle', value: 'a dramatic Dutch angle shot, with the camera tilted for a disorienting, stylish effect' },
    { label: 'Over-the-Shoulder Shot', value: 'an over-the-shoulder shot, creating a sense of intimacy and perspective' },
    { label: 'Candid Shot', value: 'a candid shot, appearing natural and unposed' },
    { label: 'Wide Shot', value: 'a wide shot, showing them within a larger studio environment' },
    { label: 'Siluet', value: 'a silhouette shot, with them backlit and their forms outlined against a bright background' },
    { label: 'Soft Focus', value: 'a soft-focus shot, creating a dreamy and romantic atmosphere' },
    { label: 'Lensa Fisheye', value: 'a playful fisheye lens shot, distorting the scene for a fun, exaggerated look' },
    { label: 'Motion Blur', value: 'a shot with creative motion blur, capturing a moment of action and energy' },
    { label: 'Cowboy Shot', value: 'a cowboy shot, framed from mid-thigh up' },
    { label: 'Two-Shot', value: 'a classic two-shot, framing both subjects equally' },
];

export const LIGHT_STYLE_TEMPLATES = [
    { label: 'Cahaya Studio Lembut', value: 'soft, diffused studio lighting that is flattering and clean' },
    { label: 'Rim Light Dramatis', value: 'dramatic rim lighting, creating a bright outline around the subjects' },
    { label: 'Cahaya Neon Berwarna', value: 'vibrant, colorful neon lighting, casting pink and blue glows' },
    { label: 'Golden Hour', value: 'warm, golden hour lighting, as if from a setting sun' },
    { label: 'High-Key (Terang)', value: 'bright, high-key lighting with minimal shadows for an upbeat feel' },
    { label: 'Low-Key (Gelap & Misterius)', value: 'moody, low-key lighting with deep shadows and high contrast' },
    { label: 'Cahaya dari Satu Sisi', value: 'strong side lighting (split lighting), illuminating one side of their faces dramatically' },
    { label: 'Backlight Kuat', value: 'strong backlighting, creating a halo effect around them' },
    { label: 'Cahaya Jendela Alami', value: 'soft, natural light as if from a large window' },
    { label: 'Cahaya Keras & Langsung', value: 'hard, direct lighting, creating a sharp, defined shadows like a spotlight' },
    { label: 'Gaya Film Noir', value: 'classic film noir lighting, with Venetian blind shadows and a mysterious atmosphere' },
    { label: 'Cahaya Lilin Hangat', value: 'intimate, warm light as if the scene is lit only by candles' },
    { label: 'Proyeksi Latar (Gobo)', value: 'light projected through a pattern (a gobo), casting interesting shapes on the background' },
    { label: 'Cahaya Rembrandt', value: 'Rembrandt lighting, with a characteristic triangle of light on the less-illuminated cheek' },
    { label: 'Cahaya Atas (Butterfly)', value: 'flattering butterfly lighting from above, creating a small shadow under the nose' },
];