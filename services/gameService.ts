import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, SceneResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "The next part of the story in a suspenseful, second-person perspective. Describe the environment and events. Should be one to two paragraphs long."
    },
    choices: {
      type: Type.ARRAY,
      description: "A list of 2 to 4 choices the player can make. These should include narrative choices, scavenging for specific materials (scrap, wood, food), crafting items, and fortifying the base.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The text displayed on the choice button for the player. E.g., 'Search for scrap metal', 'Barricade the windows with wood', 'Craft a shiv from scrap'."
          },
          prompt: {
            type: Type.STRING,
            description: "The prompt to send back to the AI if this choice is selected. E.g., 'I search the garage for scrap metal.'"
          }
        },
        required: ["text", "prompt"],
      }
    },
    inventoryChanges: {
      type: Type.OBJECT,
      description: "Optional. An object representing changes to the player's inventory. Positive numbers for items gained, negative for items used/lost. E.g., { 'scrap': 5, 'food': -1 }. Only include items that have changed.",
      properties: {
        scrap: { type: Type.INTEGER },
        wood: { type: Type.INTEGER },
        food: { type: Type.INTEGER },
        meds: { type: Type.INTEGER },
        shiv: { type: Type.INTEGER },
        spear: { type: Type.INTEGER },
      }
    },
    baseChanges: {
        type: Type.OBJECT,
        description: "Optional. An object representing changes to the player's base. E.g., { 'fortification': 1 }.",
        properties: {
            location: { type: Type.STRING },
            fortification: { type: Type.INTEGER },
        }
    },
    isGameOver: {
      type: Type.BOOLEAN,
      description: "Set to true if the player's action has resulted in their death or the end of this particular story arc."
    },
    gameOverText: {
      type: Type.STRING,
      description: "If isGameOver is true, this text describes the player's final moments or the outcome of their story."
    }
  },
  required: ["story", "choices", "isGameOver", "gameOverText"]
};

const systemInstruction = `You are the game master for a gritty, text-based zombie survival game with crafting and base-building. Your goal is to create a suspenseful, challenging story.

**Game Mechanics:**
1.  **State Management:** You will be given the player's last action and their current state (inventory and base status).
2.  **Resource Management:** The world is bleak. Resources like scrap, wood, food, and meds are scarce. Your scenarios should reflect this.
3.  **Crafting:** Simple crafting is possible. A 'shiv' can be made from 'scrap'. A 'spear' from 'wood' and 'scrap'. Present crafting choices only when the player might have the resources.
4.  **Base Building:** Players can fortify their base location using materials like 'wood' or 'scrap'. This fortification level should provide defense in relevant scenarios.
5.  **Story Generation:** Based on the player's action and state, generate the next story segment, a set of choices, and any resulting changes to their inventory or base.
6.  **JSON Output:** Always respond in the JSON format defined by the response schema. The story should be immersive and the choices distinct and meaningful.`;


const generateScene = async (prompt: string): Promise<SceneResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonString = response.text.trim();
    const parsedResult: SceneResult = JSON.parse(jsonString);
    return parsedResult;
  } catch (error) {
    console.error("Error generating scene:", error);
    return {
      story: "An unexpected silence falls. The connection to your instincts has been severed by a strange, otherworldly force. The path ahead is unclear.",
      choices: [{ text: "Try to reconnect...", prompt: "Try to start the game again." }],
      isGameOver: true,
      gameOverText: "The system failed. You are lost in the static.",
    };
  }
};

export const getInitialScene = async (): Promise<SceneResult> => {
  const prompt = "Start a new game. I've just woken up in an abandoned warehouse with no memory of how I got here. The city outside is eerily quiet. This warehouse will be my initial base.";
  return generateScene(prompt);
};

export const getNextScene = async (choicePrompt: string, currentState: GameState): Promise<SceneResult> => {
  const { inventory, base } = currentState;
  const inventoryString = Object.entries(inventory).map(([key, value]) => `${key}: ${value}`).join(', ');
  const baseString = `Location: ${base.location}, Fortification: ${base.fortification}`;

  const prompt = `
    CURRENT STATE:
    - Inventory: {${inventoryString || 'empty'}}
    - Base: {${baseString}}

    PLAYER ACTION:
    "${choicePrompt}"
  `;
  return generateScene(prompt);
};
