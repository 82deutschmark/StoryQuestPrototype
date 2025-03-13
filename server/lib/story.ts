import { OpenAI } from "openai";
import { buildStoryContext, formatMissions, formatCharacterRelationships, formatCurrencies } from "./contextBuilder";
import { type Story } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STORY_OPTIONS = {
  conflicts: [
    ["🤵", "Double agent exposed"],
    ["💼", "Corporate espionage"],
    ["🧪", "Bioweapon heist"],
    ["💰", "Trillion-dollar ransom"],
    ["🔍", "Assassination conspiracy"],
    ["🕵️", "Government overthrow"],
    ["🌌", "Space station takeover"],
    ["🧠", "Mind control experiment"]
  ],
  settings: [
    ["🗼", "Paris Office"],
    ["🏝️", "Private Luxury Island"],
    ["🏙️", "Dubai Mega-Skyscraper"],
    ["🚢", "Orbital Cruise Liner"],
    ["❄️", "Arctic Research Base"],
    ["🏰", "Monaco Casino"],
    ["🏜️", "Sahara Desert Compound"],
    ["🌋", "Volcanic Lair"]
  ],
  narrativeStyles: [
    ["😎", "Gen Z Teenage Drama"],
    ["🔥", "Steamy romance novel"],
    ["🤪", "Absurdist comedy"],
    ["🎭", "Melodramatic soap opera"],
    ["🎬", "High-budget action movie"],
    ["🤵", "Classic Bond film"]
  ],
  moods: [
    ["🍸", "Sexy and seductive"],
    ["💥", "Explosive and chaotic"],
    ["😂", "Ridiculously over-the-top"],
    ["😱", "Suspenseful and betrayal-filled"],
    ["🌟", "Glamorous and extravagant"],
    ["🥂", "Party-focused hedonism"],
    ["🔫", "Action-packed gunfights"],
    ["🕶️", "Cool and stylish"]
  ]
};

export interface GenerateStoryParams {
  conflict: string;
  setting: string;
  narrativeStyle: string;
  mood: string;
  characterInfo?: any;
  customConflict?: string;
  customSetting?: string;
  customNarrative?: string;
  customMood?: string;
  previousChoice?: string;
  storyContext?: string;
  additionalCharacters?: any[];
  protagonistName?: string;
  protagonistGender?: string;
  protagonistLevel?: number;
  userId: string;
  storyId?: string;
}

export async function generateStory({
  conflict,
  setting,
  narrativeStyle,
  mood,
  characterInfo,
  customConflict,
  customSetting,
  customNarrative,
  customMood,
  previousChoice,
  storyContext,
  additionalCharacters,
  protagonistName,
  protagonistGender,
  protagonistLevel = 1,
  userId,
  storyId
}: GenerateStoryParams): Promise<Story> {
  const finalConflict = customConflict || conflict;
  const finalSetting = customSetting || setting;
  const finalNarrative = customNarrative || narrativeStyle;
  const finalMood = customMood || mood;

  // Build the prompt
  const messages = [{
    role: "system" as const,
    content: "You are a creative story generator that creates engaging interactive narratives.",
  }, {
    role: "user" as const,
    content: `Create a story with:
      Conflict: ${finalConflict}
      Setting: ${finalSetting}
      Narrative Style: ${finalNarrative}
      Mood: ${finalMood}
      ${protagonistName ? `Protagonist: ${protagonistName} (${protagonistGender})` : ''}
      ${storyContext ? `Previous Context: ${storyContext}` : ''}
      ${previousChoice ? `Previous Choice: ${previousChoice}` : ''}

      Generate an engaging story segment with 3 choices. Format as JSON with:
      {
        "title": "Story title",
        "text": "Story text",
        "choices": [
          {
            "text": "Choice text",
            "consequence": "Brief outcome description",
            "cost": {"currency": "💵", "amount": 500}
          }
        ],
        "characters": ["List of characters"],
        "mission": {
          "title": "Mission name",
          "description": "Mission details",
          "reward": {"currency": "💵", "amount": 1000}
        }
      }`
  }];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Changed to gpt-4o-mini
      messages,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");

    const storyData = JSON.parse(content);

    return {
      id: storyId ? parseInt(storyId) : 0, // Use storyId if available
      userId: parseInt(userId), //Added userId
      conflict: finalConflict,
      setting: finalSetting,
      narrativeStyle: finalNarrative,
      mood: finalMood,
      generatedStory: storyData,
      createdAt: new Date()
    };
  } catch (error) {
    console.error("Story generation failed:", error);
    throw new Error("Failed to generate story");
  }
}

export function getStoryOptions() {
  return STORY_OPTIONS;
}