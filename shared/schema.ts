import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
});

// Story generation table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  conflict: text("conflict").notNull(),
  setting: text("setting").notNull(),
  narrativeStyle: text("narrative_style").notNull(),
  mood: text("mood").notNull(),
  generatedStory: jsonb("generated_story").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currentNodeId: text("current_node_id"),
  currentStoryId: integer("current_story_id").references(() => stories.id),
  level: integer("level").default(1),
  experiencePoints: integer("experience_points").default(0),
  currencyBalances: jsonb("currency_balances").default({
    "💎": 500,
    "💷": 5000,
    "💶": 5000,
    "💴": 5000,
    "💵": 5000,
  }),
  choiceHistory: jsonb("choice_history").default([]),
  achievementsEarned: jsonb("achievements_earned").default([]),
  activeMissions: jsonb("active_missions").default([]),
  completedMissions: jsonb("completed_missions").default([]),
  encounteredCharacters: jsonb("encountered_characters").default({}),
});

// Character evolution table
export const characterEvolutions = pgTable("character_evolutions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  characterId: text("character_id").notNull(),
  status: text("status").default("active"),
  role: text("role"),
  evolvedTraits: jsonb("evolved_traits").default([]),
  relationshipNetwork: jsonb("relationship_network").default({}),
  plotContributions: jsonb("plot_contributions").default([]),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertStorySchema = createInsertSchema(stories);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export const insertCharacterEvolutionSchema = createInsertSchema(characterEvolutions);

// Types
export type User = typeof users.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type CharacterEvolution = typeof characterEvolutions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertCharacterEvolution = z.infer<typeof insertCharacterEvolutionSchema>;