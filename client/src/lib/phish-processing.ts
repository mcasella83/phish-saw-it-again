import { PhishShowApiResponse, PhishShowSetlist } from "./types";
import { getShowSetList } from "./phish-api";

const LIMIT_SHOWS = -1;

export function getUniqueSongsFromSetlists(setlists: PhishShowSetlist[]) {
  const allMySongs = new Map<string, Array<{ name: string; date: string }>>();

  setlists.forEach((setlist) => {
    const songsFromShow = new Map<
      string,
      Array<{ name: string; date: string }>
    >();

    setlist.songs.forEach((song) => {
      const name = song.name;
      const songEntry = { name: song.name, date: song.date };

      if (!allMySongs.has(name)) {
        allMySongs.set(name, [songEntry]);
        songsFromShow.set(name, [songEntry]);
      } else {
        const songEntries = allMySongs.get(name);
        if (songEntries && !songsFromShow.has(name)) {
          songEntries.push(songEntry);
        } else {
          console.log("repeat song %s on %s", songEntry.name, songEntry.date);
        }
      }
    });
  });

  return new Map([...allMySongs.entries()].sort());
}

export async function processShowsData(
  showsData: PhishShowApiResponse,
  onProgress?: (current: number, total: number) => void,
): Promise<PhishShowSetlist[]> {
  if (!showsData.data) {
    throw new Error("No show data available");
  }

  const showSetLists: PhishShowSetlist[] = [];

  //optional limit for the number of shows for debugging
  const totalShows =
    LIMIT_SHOWS && LIMIT_SHOWS >= 0
      ? Math.min(showsData.data.length, LIMIT_SHOWS)
      : showsData.data.length;

  console.log("processing %d shows", totalShows);

  for (let i = 0; i < totalShows; i++) {
    const show = showsData.data[i];
    onProgress?.(i + 1, totalShows);

    const showSetList = await getShowSetList(show.showid);
    showSetLists.push(showSetList);
  }

  return showSetLists;
}
