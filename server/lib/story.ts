import { OpenAI } from "openai";
import { buildStoryContext, formatMissions, formatCharacterRelationships, formatCurrencies } from "./contextBuilder";
import { type Story } from "@shared/schema";

// the newest OpenAI model is "gpt-4o-mini" 
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
    ["🗼", "Paris Underworld"],
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

  // Set initial time and location for new stories
  const initialTime = "Noon on Day 1";
  const initialLocation = "the bustling main square of Paris";

  // Build the prompt
  const messages = [{
    role: "system" as const,
    content: `You are a creative narrative generator for our spy-themed adventure game. You create engaging interactive narratives in a ${finalMood} tone with a ${finalNarrative} storytelling style.

This game is set in the high-stakes world of international espionage, luxury, and intrigue. ${!storyId ? `At the beginning of the story, it is ${initialTime}. The protagonist is currently located at ${initialLocation}.` : ''} Players take on missions, develop relationships with various characters, and navigate complex scenarios where betrayal, romance, and action are common themes. The game tracks character relationships, currency balances, mission progress, time progression, and character locations.

Your narratives should incorporate time and location consistently, ensuring players understand when and where events are taking place. For instance, travel between locations should take a realistic amount of time, missions should have logical deadlines, and characters should be in plausible locations based on previous events. Always maintain the selected mood and narrative style throughout your storytelling.

For initial story segments:
1. Always introduce a character with the "mission-giver" role who assigns a mission to the player, specifying both a deadline (in days/hours) and a return location
2. Ensure one of the three choices involves meeting/interacting with a random character (to organically introduce potential future mission-givers)
3. Structure the mission with a clear objective, target location, reward, and explicit deadline that considers time of day`,
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

      Generate an engaging story segment with 3 choices. 
      
      ${storyId ? `This is a continuation of an existing story with ID ${storyId}. Maintain narrative consistency.` : 'This is the beginning of a new story. You MUST introduce a character with the "mission-giver" role who assigns a specific mission to the player. Make this interaction a central part of the narrative.'}
      ${protagonistName ? `The protagonist is ${protagonistName} (${protagonistGender}), currently at level ${protagonistLevel}.` : ''}
      
      If this is the beginning of a story, ensure:
      1. One choice advances the mission directly
      2. One choice takes a risky approach to the mission
      3. One choice MUST involve meeting/interacting with a random character who could become important later
      
      Format as JSON with:
      {
        "title": "Story title",
        "text": "Story text",
        "currentTime": "${!storyId ? initialTime : 'Current story time'}",
        "currentLocation": "${!storyId ? initialLocation : 'Current protagonist location'}",
        "choices": [
          {
            "text": "Choice text",
            "consequence": "Brief outcome description",
            "cost": {"currency": "💵", "amount": 500},
            "timeChange": "Time that passes if this choice is selected (e.g., '2 hours')",
            "locationChange": "New location if this choice is selected (or 'same' if unchanged)"
          }
        ],
        "characters": ["List of characters"],
        "mission": {
          "title": "Mission name",
          "description": "Mission details",
          "target_location": "Where the mission objective is located",
          "return_location": "Where to return after mission completion",
          "deadline": "Specific time/day deadline (e.g., 'Evening of Day 2')",
          "reward": {"currency": "💵", "amount": 1000}
        }
      }`
  }];

  try {
    // For existing stories, build rich context from the database
    if (storyId) {
      // Get rich context for ongoing stories
      const storyContext = await buildStoryContext(userId, storyId, previousChoice);
      
      // Add formatted context to messages
      messages.push({
        role: "user" as const,
        content: `
        Previous story context: ${storyContext.previousStoryText}
        ${previousChoice ? `You chose: ${previousChoice}` : ''}
        
        Current missions: ${formatMissions(storyContext.activeMissions)}
        Character relationships: ${formatCharacterRelationships(storyContext.characterRelationships)}
        Currencies: ${formatCurrencies(storyContext.currencyBalances)}
        Player level: ${storyContext.experienceLevel}
        Current time: ${storyContext.currentTime || "Noon on Day 1"}
        Current location: ${storyContext.currentLocation || initialLocation}
        
        IMPORTANT: You must maintain consistency with the current time and location. If the player is choosing an action that would change their location, make sure to account for realistic travel time in your narrative. Also, constantly remind players of mission deadlines and the need to return to specific locations.
        `
      });
    }
    
    // If this is a new story, fetch potential mission givers from the database
    if (!storyId) {
      try {
        // Query the database for characters with the mission-giver role
        const missionGivers = await db.query.characters.findMany({
          where: { role: { contains: "mission-giver" } },
          limit: 3
        });
        
        if (missionGivers && missionGivers.length > 0) {
          // Add mission-giver character info to the messages
          messages.push({
            role: "user" as const,
            content: `Use one of these mission-givers in your story: ${missionGivers.map(mg => 
              `${mg.name} (ID: ${mg.id}) - ${mg.description || 'A mysterious operative'}`
            ).join(', ')}`
          });
          
          // Also provide some random characters for the third choice
          const randomCharacters = await db.query.characters.findMany({
            where: { 
              role: { notContains: "mission-giver" },
              id: { notIn: missionGivers.map(mg => mg.id) }
            },
            limit: 3
          });
          
          if (randomCharacters && randomCharacters.length > 0) {
            messages.push({
              role: "user" as const,
              content: `For the third choice that introduces a random character, please use one of these: ${randomCharacters.map(c => 
                `${c.name} (ID: ${c.id}) - ${c.description || 'An intriguing individual'}`
              ).join(', ')}`
            });
          }
        }
      } catch (error) {
        console.warn("Failed to fetch mission-givers from database:", error);
        // Continue without the character data if there's an error
      }
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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