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

      const username = req.query.username;
      if (!username) {
        throw new Error('Username is required');
      }

      const apiUrl = `https://api.phish.net/v5/attendance/user/get?apikey=${apiKey}&username=${username}&orderby=showdate`;
      console.log('Fetching shows from Phish.net API:', apiUrl);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error('Phish.net API error:', response.status, response.statusText);
        throw new Error('Failed to fetch from Phish.net API');
      }

      const data = await response.json();
      console.log('Successfully fetched shows:', data.error === false, 'Show count:', data.data?.length);
      console.log('API Response:', JSON.stringify(data).slice(0, 200));
      res.json(data);
    } catch (error) {
      console.error('Phish.net API error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch shows from Phish.net',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return createServer(app);
}