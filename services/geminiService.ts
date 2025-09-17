// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Added .ts extension to resolve module import error.
import { Biome, Creature, Structure } from '../types.ts';

// Inisialisasi Gemini API Client
// Kunci API diasumsikan tersedia di variabel lingkungan.
const getApiKey = () => {
  // Try multiple possible environment variable names
  return import.meta.env.VITE_GEMINI_API_KEY || 
         import.meta.env.GEMINI_API_KEY || 
         process.env.GEMINI_API_KEY || 
         process.env.API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Mendefinisikan skema output JSON yang kita harapkan dari model AI.
// Ini memastikan kita mendapatkan data yang konsisten dan terstruktur.
const worldGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    biomes: {
      type: Type.ARRAY,
      description: "An array of unique zones found in the wasteland.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the zone." },
          description: { type: Type.STRING, description: "A short, evocative description of the zone." },
        },
        required: ["name", "description"],
      },
    },
    structures: {
      type: Type.ARRAY,
      description: "An array of structures, both makeshift and pre-Fall ruins.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the structure." },
          description: { type: Type.STRING, description: "A short, evocative description of the structure." },
          type: { type: Type.STRING, enum: ['SHELTER', 'LANDMARK', 'STORAGE'], description: "The functional type of the structure." },
        },
        required: ["name", "description", "type"],
      },
    },
    creatures: {
      type: Type.ARRAY,
      description: "An array of mutated creatures inhabiting the world.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the creature." },
          description: { type: Type.STRING, description: "A short, evocative description of the creature." },
          temperament: { type: Type.STRING, enum: ['DOCILE', 'NEUTRAL', 'HOSTILE'], description: "The creature's temperament." },
        },
        required: ["name", "description", "temperament"],
      },
    },
  },
  required: ["biomes", "structures", "creatures"],
};


export interface GeneratedWorldElements {
    biomes: Omit<Biome, 'id'>[];
    structures: Omit<Structure, 'id'>[];
    creatures: Omit<Creature, 'id'>[];
}


/**
 * Memanggil Gemini API untuk menghasilkan elemen-elemen dunia awal.
 * Menggunakan prompt yang terperinci dan skema JSON untuk output yang andal.
 */
export async function generateWorldElements(): Promise<GeneratedWorldElements> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate unique world elements for a starting area in the ruins of a former city. I need 2 distinct zones (biomes), 2 structures (one makeshift shelter, one pre-Fall ruin), and 3 mutated creatures. Provide a concise name and a compelling one-sentence description. For creatures, specify their temperament from this list: 'DOCILE', 'NEUTRAL', 'HOSTILE'.",
      config: {
        systemInstruction: "You are a world-building assistant for a post-apocalyptic survival game called 'Project MANUS'. The setting is Earth, decades after a global cataclysm known as 'The Fall'. Survivors live in small, isolated pockets. The tone is gritty, hopeful, and tense. Your responses must be in valid JSON format.",
        responseMimeType: "application/json",
        responseSchema: worldGenerationSchema,
      },
    });

    // Langsung parse teks respons sebagai JSON.
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Validasi dasar untuk memastikan data yang diterima sesuai harapan
    if (!parsedData.biomes || !parsedData.structures || !parsedData.creatures) {
        throw new Error("AI response is missing required world element arrays.");
    }
    
    return parsedData as GeneratedWorldElements;

  } catch (error) {
    console.error("Error calling Gemini API for world generation:", error);
    // Jika AI gagal, kita sediakan data fallback yang aman agar aplikasi tidak crash.
    return {
      biomes: [{ name: "Rusted Scrapyard", description: "A field of decaying pre-Fall vehicles and machinery." }],
      structures: [{ name: "Makeshift Shack", description: "A crude shelter made from corrugated metal and scavenged planks.", type: 'SHELTER' }],
      creatures: [{ name: "Giant Rad-Roach", description: "A disturbingly large and resilient insect that fears light.", temperament: 'NEUTRAL' }],
    };
  }
}