import { PhishShowSetlist } from "./types";
import { SongStats, VenueStats } from "./phish-processing";

// Cache keys
const CACHE_KEYS = {
  USERNAME: "phish-explorer-username",
  SHOWS: "phish-explorer-shows",
  SONGS: "phish-explorer-songs",
  VENUES: "phish-explorer-venues",
  CACHE_TIMESTAMP: "phish-explorer-cache-timestamp",
} as const;

// Cache will expire after 90 days
const CACHE_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

interface CacheData {
  shows: PhishShowSetlist[] | null;
  songs: SongStats[] | null;
  venues: VenueStats[] | null;
}

function isCacheValid(): boolean {
  const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;

  const cacheTime = parseInt(timestamp, 10);
  const now = Date.now();

  return now - cacheTime < CACHE_EXPIRATION_MS;
}

export function clearShowsCache(): void {
  localStorage.removeItem(CACHE_KEYS.USERNAME);
  localStorage.removeItem(CACHE_KEYS.SHOWS);
  localStorage.removeItem(CACHE_KEYS.SONGS);
  localStorage.removeItem(CACHE_KEYS.VENUES);
  localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
}

export function saveShowsToCache(data: CacheData): void {
  try {
    localStorage.setItem(CACHE_KEYS.SHOWS, JSON.stringify(data.shows));
    localStorage.setItem(CACHE_KEYS.SONGS, JSON.stringify(data.songs));
    localStorage.setItem(CACHE_KEYS.VENUES, JSON.stringify(data.venues));
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error("Failed to save data to cache:", error);
    // If saving fails (e.g., due to quota), clear the cache to prevent inconsistent state
    clearShowsCache();
  }
}

export function loadShowsFromCache(): CacheData | null {
  if (!isCacheValid()) {
    clearShowsCache();
    return null;
  }

  try {
    const shows = JSON.parse(localStorage.getItem(CACHE_KEYS.SHOWS) || "null");
    const songs = JSON.parse(localStorage.getItem(CACHE_KEYS.SONGS) || "null");
    const venues = JSON.parse(
      localStorage.getItem(CACHE_KEYS.VENUES) || "null",
    );

    if (!shows || !songs || !venues) {
      return null;
    }

    return { shows, songs, venues };
  } catch (error) {
    console.error("Failed to load data from cache:", error);
    clearShowsCache();
    return null;
  }
}
