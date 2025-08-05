import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { userSchema } from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';

// Cache file for all Phish shows
const SHOWS_CACHE_FILE = path.join(process.cwd(), 'phish-shows-cache.json');

async function getAllPhishShows(apiKey: string) {
  try {
    // Try to read from cache file first
    const cacheExists = await fs.access(SHOWS_CACHE_FILE).then(() => true).catch(() => false);
    
    if (cacheExists) {
      console.log("Loading Phish shows from cache file...");
      const cacheData = await fs.readFile(SHOWS_CACHE_FILE, 'utf-8');
      const cachedShows = JSON.parse(cacheData);
      console.log(`Loaded ${cachedShows.length} shows from cache`);
      return cachedShows;
    }
    
    // If no cache file exists, fetch from API
    console.log("No cache file found. Fetching all Phish shows from API...");
    const apiUrl = `https://api.phish.net/v5/shows/artist/phish.json?order_by=showdate&apikey=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all shows: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error || !data.data || data.data.length === 0) {
      throw new Error("No shows found in API response");
    }
    
    // Save to cache file
    await fs.writeFile(SHOWS_CACHE_FILE, JSON.stringify(data.data, null, 2));
    console.log(`Successfully fetched and cached ${data.data.length} Phish shows`);
    
    return data.data;
    
  } catch (error) {
    console.error("Error loading Phish shows:", error);
    throw error;
  }
}

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

      // Get all Phish shows (uses cache if available)
      const allShows = await getAllPhishShows(apiKey);
      
      if (!allShows || allShows.length === 0) {
        throw new Error("No shows available");
      }
      
      // Pick a random show from all shows
      const randomIndex = Math.floor(Math.random() * allShows.length);
      const randomShow = allShows[randomIndex];
      
      console.log(
        "Selected random show:",
        randomShow.showdate,
        randomShow.venue,
        `(${randomIndex + 1} of ${allShows.length} total shows)`
      );

      // Now fetch the setlist for this show using the setlists/showdate endpoint
      try {
        const setlistUrl = `https://api.phish.net/v5/setlists/showdate/${randomShow.showdate}.json?apikey=${apiKey}`;
        console.log("Fetching setlist for show:", setlistUrl);
        
        const setlistResponse = await fetch(setlistUrl, {
          headers: {
            'Accept': 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8'
          }
        });

        if (setlistResponse.ok) {
          const setlistData = await setlistResponse.json();
          
          if (!setlistData.error && setlistData.data && setlistData.data.length > 0) {
            // Add setlist data to the show
            randomShow.setlist = setlistData.data;
            console.log(`Added setlist with ${setlistData.data.length} songs to random show`);
          } else {
            console.log("No setlist data found for this show");
          }
        } else {
          console.log("Failed to fetch setlist data, continuing without it");
        }
      } catch (setlistError) {
        console.log("Error fetching setlist, continuing without it:", setlistError);
      }

      // Return in the same format as the other endpoints
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        error: false,
        data: [randomShow]
      });
      
    } catch (error) {
      console.error("Random show API error:", error);
      res.status(500).json({
        message: "Failed to fetch random show from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/phish/refresh-shows-cache", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      console.log("Manually refreshing Phish shows cache...");
      
      // Delete existing cache file if it exists
      try {
        await fs.unlink(SHOWS_CACHE_FILE);
        console.log("Deleted existing cache file");
      } catch (error) {
        // File might not exist, that's ok
      }
      
      // Fetch fresh data
      const allShows = await getAllPhishShows(apiKey);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json({
        message: "Shows cache refreshed successfully",
        totalShows: allShows.length,
        cacheFile: SHOWS_CACHE_FILE
      });
      
    } catch (error) {
      console.error("Cache refresh error:", error);
      res.status(500).json({
        message: "Failed to refresh shows cache",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return createServer(app);
}