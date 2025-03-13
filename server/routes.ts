import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStory, getStoryOptions } from "./lib/story";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get story options
  app.get("/api/story/options", (req, res) => {
    res.json(getStoryOptions());
  });

  // Generate new story
  app.post("/api/story/generate", async (req, res) => {
    try {
      const story = await generateStory(req.body);
      const savedStory = await storage.createStory(story);
      res.json(savedStory);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate story" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const progress = await storage.getUserProgress(userId);
    if (!progress) {
      res.status(404).json({ error: "Progress not found" });
      return;
    }
    res.json(progress);
  });

  // Update user progress
  app.post("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.updateUserProgress(req.body);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get character evolution
  app.get("/api/character/:userId/:characterId", async (req, res) => {
    const { userId, characterId } = req.params;
    const evolution = await storage.getCharacterEvolution(parseInt(userId), characterId);
    if (!evolution) {
      res.status(404).json({ error: "Character not found" });
      return;
    }
    res.json(evolution);
  });

  // Update character evolution
  app.post("/api/character/:userId/:characterId", async (req, res) => {
    try {
      const evolution = await storage.updateCharacterEvolution(req.body);
      res.json(evolution);
    } catch (error) {
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
