import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { userSchema } from "@shared/schema";
import { logUserLogin } from "./db";

/**
 * Server-side rate-limited fetch for the Phish.net API.
 *
 * All calls are serialised through a single queue so we never fire more than
 * one request at a time to phish.net, with a minimum gap of MIN_GAP_MS between
 * requests.  This is the only reliable way to stay under their rate limit
 * regardless of how many concurrent browser requests come in.
 */
const MIN_GAP_MS = 250; // max 4 req/s
let lastRequestTime = 0;
let phishQueue: Promise<void> = Promise.resolve();

async function phishFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Chain onto the shared queue so requests are serialised.
  const result = phishQueue.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestTime + MIN_GAP_MS - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestTime = Date.now();

    // Single retry on 429 — if we hit it despite the queue, back off 10 s.
    let response = await fetch(url, options);
    if (response.status === 429) {
      console.warn("Phish.net rate-limited (429) despite queue — backing off 10 s");
      await new Promise((r) => setTimeout(r, 10_000));
      lastRequestTime = Date.now();
      response = await fetch(url, options);
    }
    return response;
  });
  // Keep the queue moving even if this request throws.
  phishQueue = result.then(() => {}, () => {});
  return result;
}

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
      const response = await phishFetch(apiUrl, {
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
      const response = await phishFetch(apiUrl, {
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
        if (response.status === 429) {
          throw new Error("Phish.net is rate-limiting requests. Please wait a minute and try again.");
        }
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
      const response = await phishFetch(apiUrl, {
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

      // Decode special characters in setlist notes (safely — some older notes contain
      // characters that cause decodeURIComponent/escape to throw a URIError)
      if (data.data) {
        data.data = data.data.map((item: any) => {
          let notes = item.setlistnotes;
          if (notes) {
            try {
              notes = decodeURIComponent(escape(notes));
            } catch {
              // Leave notes as-is if decoding fails
            }
          }
          return { ...item, setlistnotes: notes };
        });
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
