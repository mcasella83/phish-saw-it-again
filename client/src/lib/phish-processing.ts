import { PhishShowApiResponse, PhishShowSetlist } from "./types";
import { getShowSetList } from "./phish-api";

const LIMIT_SHOWS = -1;

export interface SongStats {
  name: string;
  playCount: number;
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

  // Convert map to array and sort by play count (descending)
  return Array.from(songMap.entries())
    .map(([name, stats]) => ({
      name,
      playCount: stats.count,
      dates: Array.from(stats.dates).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => b.playCount - a.playCount);
}

export async function processShowsData(
  showsData: PhishShowApiResponse,
  onProgress?: (current: number, total: number, show?: any) => void,
): Promise<PhishShowSetlist[]> {
  if (!showsData.data) {
    throw new Error("No show data available");
  }

  const showSetLists: PhishShowSetlist[] = [];

  // const totalShows =
  //   LIMIT_SHOWS && LIMIT_SHOWS >= 0
  //     ? Math.min(showsData.data.length, LIMIT_SHOWS)
  //     : showsData.data.length;

  if (LIMIT_SHOWS && LIMIT_SHOWS >= 0 && LIMIT_SHOWS <= showsData.data.length) {
    showsData.data = showsData.data.slice(0, LIMIT_SHOWS);
  }

  for (let i = 0; i < showsData.data.length; i++) {
    const show = showsData.data[i];
    onProgress?.(i + 1, showsData.data.length, show);

    const showSetList = await getShowSetList(show.showid);
    showSetLists.push(showSetList);
  }

  return showSetLists;
}
