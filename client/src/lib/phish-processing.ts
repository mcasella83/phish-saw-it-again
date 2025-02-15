import { PhishShowApiResponse, PhishShowSetlist } from "./types";

export function getUniqueSongsFromSetlists(setlists: PhishShowSetlist[]) {
  const allMySongs = new Map<string, Array<{name: string, date: string}>>();

  setlists.forEach((setlist) => {
    const songsFromShow = new Map<string, Array<{name: string, date: string}>>();

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

export function processShowsData(
  showsData: PhishShowSetlist[],
  limit?: number,
): PhishShowSetlist[] {
  if (!showsData || showsData.length === 0) {
    return [];
  }

  // Only apply limit if it's greater than 0
  if (limit && limit > 0) {
    return showsData.slice(0, limit);
  }

  return showsData;
}