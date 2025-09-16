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

export async function generateGenesis(): Promise<GenesisData> {
  try {
    const prompt = `Generate the genesis parameters for a new game of 'Project MANUS', a sci-fi colony simulation about survivors on a lost planet. Provide a unique colony name, a compelling starting event, initial resources, distinct cultural values, and the personalities for the 3 founding colonists. Ensure the personalities are varied.`;

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
    // A simple check to see if the response is valid JSON
    if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        console.error("Received non-JSON response:", jsonStr);
        throw new Error("AI returned an invalid data format.");
    }
    const genesisData = JSON.parse(jsonStr) as GenesisData;

    // Validate the number of agents
    if (!genesisData.agentPersonalities || genesisData.agentPersonalities.length !== 3) {
      throw new Error("AI did not generate the required number of agent personalities.");
    }

    return genesisData;

  } catch (error) {
    console.error("Error generating genesis data from Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The provided API key is invalid. Please check your configuration.");
    }
    throw new Error("The AI storyteller is currently unavailable to create a new world.");
  }
}
