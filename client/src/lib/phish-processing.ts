import { PhishShowSetlist, Song } from "./types";

export function getUniqueSongsFromSetlists(setlists: PhishShowSetlist[]) {
  let allMySongs = new Map();

  setlists.forEach((setlist) => {
    let songsFromShow = new Map();

    setlist.forEach((song) => {
      //console.log('processing %s', name)

      let name = song.song;
      let songEntry = { name: song.song, date: song.showdate };

      //first time
      if (allMySongs.has(name) === false) {
        allMySongs.set(name, [songEntry]);
        songsFromShow.set(name, [songEntry]);
      } else {
        let songEntries = allMySongs.get(name);

        //TODO: handle multiple songs at same show
        if (songsFromShow.has(name)) {
          console.log("repeat song %s on %s", songEntry.name, songEntry.date);
        }

        songEntries.push([songEntry]);
      }
    });
  });
  allMySongs = new Map([...allMySongs.entries()].sort());

  return allMySongs;
}
