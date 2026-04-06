import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { userSchema } from "@shared/schema";
import { logUserLogin } from "./db";

export function registerRoutes(app: Express) {
  app.get("/api/phish/search", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const artist = req.query.artist as string;

      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }

      // Construct API URL for show search with date range
      // Use the date range endpoint if available, otherwise we'll filter the results
      let artistId = "2"; // Default is all
      if (artist === "phish") {
        artistId = "1";
      } else if (artist === "trey") {
        artistId = "2";
      }
      
      // The API endpoint for shows in a date range
      let apiUrl = `https://api.phish.net/v5/shows-on-date-range.json?apikey=${apiKey}&showdatestart=${startDate}&showdateend=${endDate}`;
      if (artist && artist !== "all") {
        apiUrl += `&artistid=${artistId}`;
      }
      
      console.log("Fetching shows from Phish.net API:", apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8",
        },
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
      
      // Additional filtering if needed
      if (data.data) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Ensure all shows are within the date range and not excluded from stats
        data.data = data.data.filter((show: any) => {
          const showDate = new Date(show.showdate);
          return showDate >= startDateObj && showDate <= endDateObj && !show.exclude_from_stats;
        });
        
        // Additional artist filtering if the API doesn't handle it well
        if (artist && artist !== "all") {
          data.data = data.data.filter((show: any) => {
            if (artist === "phish") {
              return show.artist_name === "Phish";
            } else if (artist === "trey") {
              return show.artist_name === "Trey Anastasio" || 
                    show.artist_name === "Trey Anastasio Band" || 
                    show.artist_name === "TAB";
            }
            return true;
          });
        }
      }

      console.log(
        "Successfully fetched shows:",
        data.error === false,
        "Show count:",
        data.data?.length,
      );

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.json(data);
    } catch (error) {
      console.error("Phish.net API error:", error);
      res.status(500).json({
        message: "Failed to fetch shows from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  app.get("/api/phish/shows", async (req, res) => {
    try {
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const username = req.query.username as string;
      if (!username) {
        throw new Error("Username is required");
      }

      const apiUrl = `https://api.phish.net/v5/attendance/username/${username}.json?apikey=${apiKey}&order_by=showdate`;
      console.log("Fetching shows from Phish.net API:", apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8",
        },
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

      if (data.data) {
        data.data = data.data.filter((show: any) => !show.exclude_from_stats);
      }

      console.log(
        "Successfully fetched shows:",
        data.error === false,
        "Show count:",
        data.data?.length,
      );

      const showCount = data.data?.length || 0;
      console.log("logging username");
      await logUserLogin(username, showCount);

      console.log("API Response:", JSON.stringify(data).slice(0, 200));

      res.setHeader("Content-Type", "application/json; charset=utf-8");
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
          Accept: "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8",
        },
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
            : item.setlistnotes,
        }));
      }

      console.log(
        "Successfully fetched setlists:",
        data.error === false,
        "Show count:",
        data.data?.length,
      );
      console.log("API Response:", JSON.stringify(data).slice(0, 200));

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.json(data);
    } catch (error) {
      console.error("Phish.net API error:", error);
      res.status(500).json({
        message: "Failed to fetch shows from Phish.net",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return createServer(app);
}
