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
        throw new Error("API key not configured");
      }

      const username = req.query.username;
      if (!username) {
        throw new Error("Username is required");
      }

      const apiUrl = `https://api.phish.net/v5/attendance/username/${username}.json?apikey=${apiKey}&order_by=showdate`;
      console.log("Fetching shows from Phish.net API:", apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (!response.ok) {
        console.error(
          "Phish.net API error:",
          response.status,
          response.statusText,
        );
        throw new Error("Failed to fetch from Phish.net API");
      }

      const data = await response.json();
      console.log(
        "Successfully fetched shows:",
        data.error === false,
        "Show count:",
        data.data?.length,
      );
      console.log("API Response:", JSON.stringify(data).slice(0, 200));

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(data);
    } catch (error) {
      console.error("Phish.net API error:", error);
      res.status(500).json({
        message: "Failed to fetch shows from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/phish/showsetlist/:showId", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const showId = req.params.showId;
      if (!showId) {
        throw new Error("showId is required");
      }

      const apiUrl =
        "https://api.phish.net/v5/" +
        `setlists/setlistid/${showId}.json` +
        `?apikey=${apiKey}&order_by=showdate`;
      console.log("Fetching shows from Phish.net API:", apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (!response.ok) {
        console.error(
          "Phish.net API error:",
          response.status,
          response.statusText,
        );
        throw new Error("Failed to fetch from Phish.net API");
      }

      const data = await response.json();
      
      // Decode special characters in setlist notes
      if (data.data) {
        data.data = data.data.map((item: any) => ({
          ...item,
          setlistnotes: item.setlistnotes 
            ? decodeURIComponent(escape(item.setlistnotes))
            : item.setlistnotes
        }));
      }
      
      console.log(
        "Successfully fetched setlists:",
        data.error === false,
        "Show count:",
        data.data?.length,
      );
      console.log("API Response:", JSON.stringify(data).slice(0, 200));

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(data);
    } catch (error) {
      console.error("Phish.net API error:", error);
      res.status(500).json({
        message: "Failed to fetch shows from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/phish/random-show", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      // Get random shows by fetching a year range and picking randomly
      // Phish played from 1983 to present, let's pick a random year and then a random show from that year
      const currentYear = new Date().getFullYear();
      const startYear = 1983;
      const randomYear = Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
      
      const apiUrl = `https://api.phish.net/v5/shows/query.json?apikey=${apiKey}&year=${randomYear}`;
      console.log("Fetching shows for random year from Phish.net API:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (!response.ok) {
        console.error(
          "Phish.net API error:",
          response.status,
          response.statusText,
        );
        throw new Error("Failed to fetch from Phish.net API");
      }

      const data = await response.json();
      
      if (data.error || !data.data || data.data.length === 0) {
        // If no shows found for that year, try another approach
        throw new Error("No shows found for selected year");
      }
      
      // Pick a random show from the year
      const randomShow = data.data[Math.floor(Math.random() * data.data.length)];
      
      console.log(
        "Successfully fetched random show:",
        randomShow.showdate,
        randomShow.venue
      );

      // Return in the same format as the other endpoints
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        error: false,
        data: [randomShow]
      });
    } catch (error) {
      console.error("Phish.net API error:", error);
      res.status(500).json({
        message: "Failed to fetch random show from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return createServer(app);
}