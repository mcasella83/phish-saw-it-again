import { PhishShowApiResponse, PhishShowSetlist } from "./types";
import { getShowSetList } from "./phish-api";

const LIMIT_SHOWS = -1;

export interface SongStats {
  name: string;
  playCount: number;
  dates: string[];
}

export interface VenueStats {
  name: string;
  city: string;
  state: string;
  country: string;
  showCount: number;
  dates: string[];
}

export function getUniqueSongsFromSetlists(
  setlists: PhishShowSetlist[],
): SongStats[] {
  const songMap = new Map<string, { count: number; dates: Set<string> }>();

  setlists.forEach((setlist) => {
    setlist.songs.forEach((song) => {
      const existingEntry = songMap.get(song.name);
      if (existingEntry) {
        existingEntry.count++;
        existingEntry.dates.add(song.date);
      } else {
        songMap.set(song.name, {
          count: 1,
          dates: new Set([song.date]),
        });
      }
    });
  });

  return Array.from(songMap.entries())
    .map(([name, stats]) => ({
      name,
      playCount: stats.count,
      dates: Array.from(stats.dates).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => b.playCount - a.playCount);
}

export function getVenueStatsFromSetlists(
  setlists: PhishShowSetlist[],
): VenueStats[] {
  const venueMap = new Map<
    string,
    { city: string; state: string; country: string; count: number; dates: Set<string> }
  >();

  setlists.forEach((setlist) => {
    const venueKey = `${setlist.venue}-${setlist.city}-${setlist.state}`;
    const existingEntry = venueMap.get(venueKey);
    if (existingEntry) {
      existingEntry.count++;
      existingEntry.dates.add(setlist.date);
    } else {
      venueMap.set(venueKey, {
        city: setlist.city,
        state: setlist.state,
        country: setlist.country,
        count: 1,
        dates: new Set([setlist.date]),
      });
    }
  });

  return Array.from(venueMap.entries())
    .map(([venueKey, stats]) => {
      const [name] = venueKey.split('-');
      return {
        name,
        city: stats.city,
        state: stats.state,
        country: stats.country,
        showCount: stats.count,
        dates: Array.from(stats.dates).sort((a, b) => a.localeCompare(b)),
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

  const showPromises = shows.map(async (show) => {
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
  });

  const results = await Promise.all(showPromises);
  return results.filter((setlist): setlist is PhishShowSetlist => setlist !== null);
}