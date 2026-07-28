import { PhishShowSetlist } from "./types";
import { SongStats, VenueStats } from "./phish-processing";

// Bump this version any time the data shape or filtering logic changes.
// It forces all existing local caches to be discarded (both the output cache
// and the per-setlist cache, since the key prefix embeds the version).
const CACHE_VERSION = "6";

// Cache keys for the computed output cache (shows/songs/venues)
const CACHE_KEYS = {
  USERNAME: "phish-explorer-username",
  SHOWS: "phish-explorer-shows",
  SONGS: "phish-explorer-songs",
  VENUES: "phish-explorer-venues",
  CACHE_TIMESTAMP: "phish-explorer-cache-timestamp",
  CACHE_VERSION: "phish-explorer-cache-version",
} as const;

// Output cache TTL: 90 days
const CACHE_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

interface CacheData {
  shows: PhishShowSetlist[] | null;
  songs: SongStats[] | null;
  venues: VenueStats[] | null;
}

// ─── Per-setlist cache ────────────────────────────────────────────────────────
// Each individual show setlist is cached under a versioned key so stale entries
// are automatically ignored after a CACHE_VERSION bump.

function setlistCacheKey(showid: string | number): string {
  return `phish-setlist-v${CACHE_VERSION}-${showid}`;
}

export function getCachedSetlist(showid: string | number): PhishShowSetlist | null {
  try {
    const raw = localStorage.getItem(setlistCacheKey(showid));
    if (!raw) return null;
    return JSON.parse(raw) as PhishShowSetlist;
  } catch {
    return null;
  }
}

export function setCachedSetlist(showid: string | number, setlist: PhishShowSetlist): void {
  try {
    localStorage.setItem(setlistCacheKey(showid), JSON.stringify(setlist));
  } catch (error) {
    // Quota exceeded or private mode — silently skip; data will just be re-fetched next time
    console.warn("Failed to cache setlist for show", showid, error);
  }
}

// ─── Computed output cache (shows / songs / venues) ──────────────────────────
// Stores the fully-processed output so a returning user with an unchanged show
// list sees their data instantly without any API calls.
// The username is stored alongside so a different user on the same browser gets
// a cache miss rather than seeing someone else's data.

function isCacheValid(username: string): boolean {
  const version = localStorage.getItem(CACHE_KEYS.CACHE_VERSION);
  if (version !== CACHE_VERSION) return false;

  const cachedUsername = localStorage.getItem(CACHE_KEYS.USERNAME);
  if (cachedUsername !== username) return false;

  const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;

  return Date.now() - parseInt(timestamp, 10) < CACHE_EXPIRATION_MS;
}

export function clearShowsCache(): void {
  localStorage.removeItem(CACHE_KEYS.USERNAME);
  localStorage.removeItem(CACHE_KEYS.SHOWS);
  localStorage.removeItem(CACHE_KEYS.SONGS);
  localStorage.removeItem(CACHE_KEYS.VENUES);
  localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
  localStorage.removeItem(CACHE_KEYS.CACHE_VERSION);
}

export function saveShowsToCache(data: CacheData, username: string): void {
  try {
    localStorage.setItem(CACHE_KEYS.USERNAME, username);
    localStorage.setItem(CACHE_KEYS.SHOWS, JSON.stringify(data.shows));
    localStorage.setItem(CACHE_KEYS.SONGS, JSON.stringify(data.songs));
    localStorage.setItem(CACHE_KEYS.VENUES, JSON.stringify(data.venues));
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    localStorage.setItem(CACHE_KEYS.CACHE_VERSION, CACHE_VERSION);
  } catch (error) {
    console.error("Failed to save data to cache:", error);
    clearShowsCache();
  }
}

export function loadShowsFromCache(username: string): CacheData | null {
  if (!isCacheValid(username)) {
    clearShowsCache();
    return null;
  }

  try {
    const shows = JSON.parse(localStorage.getItem(CACHE_KEYS.SHOWS) || "null");
    const songs = JSON.parse(localStorage.getItem(CACHE_KEYS.SONGS) || "null");
    const venues = JSON.parse(localStorage.getItem(CACHE_KEYS.VENUES) || "null");

    if (!shows || !songs || !venues) return null;

    return { shows, songs, venues };
  } catch (error) {
    console.error("Failed to load data from cache:", error);
    clearShowsCache();
    return null;
  }
}
