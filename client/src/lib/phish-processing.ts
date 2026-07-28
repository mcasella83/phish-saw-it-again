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

export async function processShowsData(
  showsData: PhishShowApiResponse,
  onProgress?: (current: number, total: number, show?: any) => void,
): Promise<PhishShowSetlist[]> {
  if (!showsData.data) {
    throw new Error("No show data available");
  }

  let shows = showsData.data;
  if (LIMIT_SHOWS && LIMIT_SHOWS >= 0 && LIMIT_SHOWS <= shows.length) {
    shows = shows.slice(0, LIMIT_SHOWS);
  }

  const totalShows = shows.length;
  let completedShows = 0;

  // Limit concurrent requests to avoid triggering phish.net rate limits.
  const CONCURRENCY = 5;
  const results: (PhishShowSetlist | null)[] = [];
  for (let i = 0; i < shows.length; i += CONCURRENCY) {
    const batch = shows.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (show) => {
        try {
          const setlist = await getShowSetList(show.showid);
          completedShows++;
          onProgress?.(completedShows, totalShows, show);
          return setlist;
        } catch (error) {
          console.error(`Failed to fetch setlist for show ${show.showid}:`, error);
          completedShows++;
          onProgress?.(completedShows, totalShows, show);
          return null;
        }
      }),
    );
    results.push(...batchResults);
  }
  return results.filter(
    (setlist): setlist is PhishShowSetlist => setlist !== null,
  );
}
