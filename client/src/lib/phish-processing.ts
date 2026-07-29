import { PhishShowApiResponse, PhishShowSetlist, PhishSong } from "./types";
import { getShowSetList } from "./phish-api";

const LIMIT_SHOWS = -1; //2;

export interface SongStats {
  name: string;
  playCount: number;
  occurrences: string[];
}

export interface VenueStats {
  names: string[];
  id: number;
  city: string;
  state: string;
  country: string;
  showCount: number;
  occurrences: any[];
}

export function getUniqueSongsFromSetlists(
  setlists: PhishShowSetlist[],
): SongStats[] {
  const songMap = new Map<
    string,
    { count: number; occurrences: string[]; lastTime: PhishSong }
  >();

  setlists.forEach((setlist) => {
    setlist.songs.forEach((song) => {
      const existingEntry = songMap.get(song.name);
      const songDisplay = song.date + ", " + song.venue;
      if (existingEntry) {
        if (existingEntry.lastTime.date === song.date) {
          console.log("found repeat song %s in setlist", song.name);
          return;
        }

        existingEntry.count++;
        existingEntry.occurrences.push(songDisplay);
        existingEntry.lastTime.isLastTimeHeard = false;
        existingEntry.lastTime = song;
        song.isLastTimeHeard = true;
      } else {
        song.isFirstTimeHeard = true;
        song.isLastTimeHeard = true;
        songMap.set(song.name, {
          count: 1,
          occurrences: [songDisplay],
          lastTime: song,
        });
      }
    });
  });

  return Array.from(songMap.entries())
    .map(([name, stats]) => ({
      name,
      playCount: stats.count,
      occurrences: stats.occurrences,
      //occurrences: Array.from(stats.occurrences).sort((a, b) =>
      //  b.localeCompare(a),
      //),
      // // For testing, set some songs to have these flags
      // isBustout: stats.count === 1,
      // isFirstTime: stats.count === 1,
      // isLastTime: name.startsWith("A"), // Just for testing
      // isFirstTimeOpener: name.length > 10, // Just for testing
      // isFirstTimeCloser: stats.count < 3, // Just for testing
    }))
    .sort((a, b) => b.playCount - a.playCount);
}

export function getVenueStatsFromSetlists(
  setlists: PhishShowSetlist[],
): VenueStats[] {
  const venueMap = new Map<
    string,
    {
      id: number;
      names: string[];
      city: string;
      state: string;
      country: string;
      count: number;
      occurrences: any[];
    }
  >();

  // Venues that are iconic enough to get their own entry instead of being
  // collapsed into the city bucket.
  const STANDALONE_VENUES = [
    "Madison Square Garden",
  ];

  const getVenueKey = (setlist: PhishShowSetlist): string => {
    const isStandalone = STANDALONE_VENUES.some((v) =>
      setlist.venue.toLowerCase().includes(v.toLowerCase())
    );
    return isStandalone
      ? `venue::${setlist.venue}`
      : `${setlist.city}-${setlist.state}--${setlist.country}`;
  };

  setlists.forEach((setlist) => {
    const venueKey = getVenueKey(setlist);
    const existingEntry = venueMap.get(venueKey);
    if (existingEntry) {
      existingEntry.count++;
      existingEntry.occurrences.push({
        date: setlist.date,
        name: setlist.venue,
      });

      //save the most recent venue name
      if (existingEntry.names.includes(setlist.venue) === false) {
        existingEntry.names.unshift(setlist.venue);
      }
    } else {
      venueMap.set(venueKey, {
        id: setlist.venueid,
        names: [setlist.venue],
        city: setlist.city,
        state: setlist.state,
        country: setlist.country,
        count: 1,
        occurrences: [{ date: setlist.date, name: setlist.venue }],
      });
    }
  });

  return Array.from(venueMap.entries())
    .map(([venueKey, stats]) => {
      return {
        id: stats.id,
        names: stats.names,
        city: stats.city,
        state: stats.state,
        country: stats.country,
        showCount: stats.count,
        occurrences: Array.from(stats.occurrences).sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      };
    })
    .sort((a, b) => b.showCount - a.showCount);
}

export interface ProcessShowsOptions {
  /** Called after each show is resolved (from cache or API). */
  onProgress?: (current: number, total: number, show?: any) => void;
  /** Return a cached setlist for a showid, or null on a cache miss. */
  getCached?: (showid: string | number) => PhishShowSetlist | null;
  /** Persist a freshly-fetched setlist so future visits can skip the API. */
  setCache?: (showid: string | number, setlist: PhishShowSetlist) => void;
  /**
   * The showid that should always be fetched fresh from the API — typically
   * the most recent show, which may still be in progress or have notes updated.
   */
  latestShowId?: string | number;
}

export async function processShowsData(
  showsData: PhishShowApiResponse,
  options: ProcessShowsOptions = {},
): Promise<PhishShowSetlist[]> {
  if (!showsData.data) {
    throw new Error("No show data available");
  }

  const { onProgress, getCached, setCache, latestShowId } = options;

  let shows = showsData.data;
  if (LIMIT_SHOWS && LIMIT_SHOWS >= 0 && LIMIT_SHOWS <= shows.length) {
    shows = shows.slice(0, LIMIT_SHOWS);
  }

  const totalShows = shows.length;
  let completedShows = 0;

  // Limit concurrent requests to avoid triggering phish.net rate limits.
  // 10 requests per batch, 600 ms between batches → ~16 req/s, within phish.net limits.
  // Shows that are served from cache are resolved immediately and don't count
  // against the batch; only API fetches go through the throttled queue.
  const CONCURRENCY = 10;
  const BATCH_DELAY_MS = 600;

  const results: (PhishShowSetlist | null)[] = [];

  // Separate cached shows (instant) from shows that need an API call.
  const cachedResults: { index: number; setlist: PhishShowSetlist }[] = [];
  const toFetch: { index: number; show: (typeof shows)[number] }[] = [];

  shows.forEach((show, index) => {
    const isLatest = latestShowId !== undefined &&
      String(show.showid) === String(latestShowId);

    if (!isLatest && getCached) {
      const cached = getCached(show.showid);
      if (cached) {
        cachedResults.push({ index, setlist: cached });
        return;
      }
    }
    toFetch.push({ index, show });
  });

  // Pre-fill results array so we can place by original index.
  results.length = shows.length;

  // Immediately resolve cached entries and report progress.
  for (const { index, setlist } of cachedResults) {
    results[index] = setlist;
    completedShows++;
    onProgress?.(completedShows, totalShows, shows[index]);
  }

  // Fetch the remaining shows in rate-limited batches.
  for (let i = 0; i < toFetch.length; i += CONCURRENCY) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
    const batch = toFetch.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ index, show }) => {
        try {
          const setlist = await getShowSetList(show.showid);
          setCache?.(show.showid, setlist);
          results[index] = setlist;
        } catch (error) {
          console.error(`Failed to fetch setlist for show ${show.showid}:`, error);
          results[index] = null;
        }
        completedShows++;
        onProgress?.(completedShows, totalShows, show);
      }),
    );
  }

  return (results as (PhishShowSetlist | null)[]).filter(
    (setlist): setlist is PhishShowSetlist => setlist !== null,
  );
}
