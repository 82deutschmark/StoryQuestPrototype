
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";

interface PromptContext {
  previousStoryText: string;
  userChoice: string | null;
  characterRelationships: Record<string, any>;
  activeMissions: any[];
  currencyBalances: Record<string, number>;
  experienceLevel: number;
}

/**
 * Builds a comprehensive context object for story generation prompts
 */
export async function buildStoryContext(
  userId: string, 
  storyId?: string, 
  previousChoice?: string
): Promise<PromptContext> {
  // Default context if we can't retrieve data
  const defaultContext: PromptContext = {
    previousStoryText: "",
    userChoice: previousChoice || null,
    characterRelationships: {},
    activeMissions: [],
    currencyBalances: { "💵": 5000, "💷": 5000, "💶": 5000, "💴": 5000, "💎": 500 },
    experienceLevel: 1
  };

  try {
    // 1. Retrieve user progress data
    const userProgress = await db.query.userProgress.findFirst({
      where: eq(schema.userProgress.userId, parseInt(userId))
    });
    
    if (!userProgress) return defaultContext;

    // 2. Get story data if storyId is provided
    let storyData = null;
    if (storyId) {
      storyData = await db.query.stories.findFirst({
        where: eq(schema.stories.id, parseInt(storyId)),
      });
    } else if (userProgress.currentStoryId) {
      // Get the current story if no specific ID is provided
      storyData = await db.query.stories.findFirst({
        where: eq(schema.stories.id, userProgress.currentStoryId),
      });
    }

    // 3. Get active missions
    const activeMissions = await db.query.missions.findMany({
      where: and(
        eq(schema.missions.userId, parseInt(userId)),
        eq(schema.missions.status, 'active')
      )
    });

    // 4. Format the data for context
    const missionContext = activeMissions.map(mission => ({
      title: mission.title,
      description: mission.description,
      progress: mission.progress,
      objective: mission.objective
    }));

    // 5. Build and return the context object
    return {
      previousStoryText: storyData?.generatedStory?.text || defaultContext.previousStoryText,
      userChoice: previousChoice || defaultContext.userChoice,
      characterRelationships: userProgress.relationshipNetwork || {},
      activeMissions: missionContext,
      currencyBalances: userProgress.currencyBalances,
      experienceLevel: userProgress.level
    };
  } catch (error) {
    console.error("Error building story context:", error);
    return defaultContext;
  }
}

/**
 * Format missions into readable text for the prompt
 */
export function formatMissions(missions: any[]): string {
  if (!missions.length) return "No active missions.";
  
  return missions.map(mission => 
    `Mission: ${mission.title}\nObjective: ${mission.objective}\nProgress: ${mission.progress}%`
  ).join("\n\n");
}

/**
 * Format character relationships into readable text for the prompt
 */
export function formatCharacterRelationships(relationships: Record<string, any>): string {
  if (!Object.keys(relationships).length) return "No established relationships.";
  
  return Object.entries(relationships)
    .map(([characterId, data]) => 
      `${data.name}: ${getRelationshipDescription(data.strength)}`
    )
    .join("\n");
}

/**
 * Get a description of relationship based on strength value
 */
function getRelationshipDescription(strength: number): string {
  if (strength >= 8) return "Extremely close ally";
  if (strength >= 5) return "Trusted ally";
  if (strength >= 2) return "Friendly";
  if (strength >= -1) return "Neutral";
  if (strength >= -4) return "Unfriendly";
  if (strength >= -7) return "Hostile";
  return "Sworn enemy";
}

/**
 * Format currencies into readable text for the prompt
 */
export function formatCurrencies(balances: Record<string, number>): string {
  return Object.entries(balances)
    .map(([currency, amount]) => `${currency}: ${amount}`)
    .join(", ");
}
