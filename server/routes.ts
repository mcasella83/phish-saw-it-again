import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { userSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.post("/api/users", async (req, res) => {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const username = result.data.username;
    if (storage.users.has(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    storage.users.set(username, result.data);
    res.status(201).json(result.data);
  });

  app.get("/api/phish/shows", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://api.phish.net/v5/shows/recent?apikey=' + apiKey);
      if (!response.ok) {
        throw new Error('Failed to fetch from Phish.net API');
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Phish.net API error:', error);
      res.status(500).json({ message: 'Failed to fetch shows from Phish.net' });
    }
  });

  return createServer(app);
}