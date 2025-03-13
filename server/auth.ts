import { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import type { Express } from "express";

// Simple middleware to store current user in req
export function setUser(req: Request, res: Response, next: NextFunction) {
  const username = req.headers["x-username"];
  if (username && typeof username === "string") {
    req.user = { username };
  }
  next();
}

// Simple auth check
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Simplified auth routes
export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username } = req.body;

      let user = await storage.getUserByUsername(username);

      if (!user) {
        // Auto-create user if they don't exist
        user = await storage.createUser({ username });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}