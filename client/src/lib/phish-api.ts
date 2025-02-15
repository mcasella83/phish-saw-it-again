import {
  PhishShowApiResponse,
  PhishShowSetlist,
  PhishSetlistApiResponse,
  PhishSong,
} from "./types";
import { encodeUTF8 } from "./utils";

export async function getShowsByUsername(
  username: string,
): Promise<PhishShowApiResponse> {
  console.log("Making API request for username:", username);
  const response = await fetch(`/api/phish/shows?username=${username}`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }
  const data: PhishShowApiResponse = await response.json();
  console.log("API response data:", data);

  if (data.error && data.error_message) {
    throw new Error(data.error_message);
  }

  return data;
}

export async function getShowSetList(id: string): Promise<PhishShowSetlist> {
  console.log("Making API request for id:", id);
  const response = await fetch(`/api/phish/showsetlist/${id}`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch show setlists");
  }
  const apiResponse: PhishSetlistApiResponse = await response.json();
  console.log("API response data:", apiResponse);

  if (apiResponse.error && apiResponse.error_message) {
    throw new Error(apiResponse.error_message);
  }

  if (!apiResponse.data || apiResponse.data.length === 0) {
    throw new Error("No setlist data found for this show");
  }

  // Map the API response to our PhishShowSetlist type
  const songs: PhishSong[] = apiResponse.data.map(song => ({
    name: song.song,
    date: song.showdate,
    position: song.position,
    set: song.set,
    transition: song.transition,
    isjam: song.isjam === 1,
    gap: song.gap,
    nickname: song.nickname,
    uniqueid: song.uniqueid
  }));

  // Sort songs by set and position
  songs.sort((a, b) => {
    if (a.set === b.set) {
      return a.position - b.position;
    }
    return a.set.localeCompare(b.set);
  });

  const firstSong = apiResponse.data[0];
  const setlist: PhishShowSetlist = {
    id: firstSong.showid,
    date: firstSong.showdate,
    songs: songs,
    setListNotes: encodeUTF8(firstSong.setlistnotes),
    venue: firstSong.venue,
    city: firstSong.city,
    state: firstSong.state,
    country: firstSong.country,
  };

  return setlist;
}