import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const genesisSchema = {
  type: Type.OBJECT,
  properties: {
    colonyName: { type: Type.STRING, description: "A unique, evocative name for a new colony on a lost planet." },
    startingEvent: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A title for the colony's founding event." },
        description: { type: Type.STRING, description: "A short, 2-sentence narrative description of how the colony started." }
      },
      required: ["title", "description"]
    },
    initialResources: {
      type: Type.OBJECT,
      properties: {
        food: { type: Type.INTEGER, description: "Starting food amount, between 40 and 80." },
        wood: { type: Type.INTEGER, description: "Starting wood amount, between 80 and 150." }
      },
      required: ["food", "wood"]
    },
    culturalValues: {
      type: Type.OBJECT,
      properties: {
        collectivism: { type: Type.INTEGER, description: "A value from 30 to 90 representing the colony's starting collectivism." },
        pragmatism: { type: Type.INTEGER, description: "A value from 30 to 90 representing the colony's starting pragmatism." },
        spirituality: { type: Type.INTEGER, description: "A value from 10 to 70 representing the colony's starting spirituality." }
      },
      required: ["collectivism", "pragmatism", "spirituality"]
    },
    agentPersonalities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "A unique name for the colonist." },
          creativity: { type: Type.INTEGER, description: "A creativity score between 10-100." },
          pragmatism: { type: Type.INTEGER, description: "A pragmatism score between 10-100." },
          social: { type: Type.INTEGER, description: "A social score between 10-100." }
        },
        required: ["name", "creativity", "pragmatism", "social"]
      }
    }
  },
  required: ["colonyName", "startingEvent", "initialResources", "culturalValues", "agentPersonalities"]
};


export interface GenesisData {
  colonyName: string;
  startingEvent: {
    title: string;
    description: string;
  };
  initialResources: {
    food: number;
    wood: number;
  };
  culturalValues: {
    collectivism: number;
    pragmatism: number;
    spirituality: number;
  };
  agentPersonalities: {
    name: string;
    creativity: number;
    pragmatism: number;
    social: number;
  }[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateGenesis(): Promise<GenesisData> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = `Generate the genesis parameters for a new sci-fi colony simulation called 'Project MANUS'. Create a unique colony name, a starting event (title and 2-sentence description), initial resources (food and wood), cultural values (collectivism, pragmatism, spirituality), and unique personalities for 3 founding colonists.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: genesisSchema,
          temperature: 1.0,
        }
      });
      
      const jsonStr = response.text.trim();
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
          console.error(`Attempt ${attempt}: Received non-JSON response:`, jsonStr);
          throw new Error("AI returned an invalid data format.");
      }
      const genesisData = JSON.parse(jsonStr) as GenesisData;

      if (!genesisData.agentPersonalities || genesisData.agentPersonalities.length !== 3) {
        throw new Error("AI did not generate the required number of agent personalities.");
      }

      return genesisData; // Success!

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (lastError.message.includes('API key not valid')) {
          throw new Error("The provided API key is invalid. Please check your configuration.");
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY);
      }
    }
  }
  
  // If all retries failed
  console.error("All attempts to generate genesis data failed.");
  
  if (lastError && (lastError.message.includes('500') || lastError.message.includes('INTERNAL'))) {
      throw new Error("The AI's creative engine is experiencing a temporary issue. Please try again in a moment.");
  }

  throw new Error("The AI storyteller is currently unavailable after multiple attempts.");
}