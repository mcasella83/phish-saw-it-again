import {
  PhishShowApiResponse,
  PhishShowSetlist,
  PhishSetlistApiResponse,
  PhishSong,
  createDefaultPhishSong,
} from "./types";
import { decodeHtmlEntities, encodeUTF8 } from "./utils";

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
  console.log("retrieved %d shows", data.data.length);

  data.data = data.data.filter((show) => {
    return show.artist_name === "Phish";
  });
  console.log("filtered %d Phish shows", data.data.length);

  //need to reverse the list later, only when we display
  //data.data = data.data.reverse();

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
    throw new Error("Failed to fetch setlist");
  }

  const apiResponse: PhishSetlistApiResponse = await response.json();
  console.log("API response data:", apiResponse);

  if (apiResponse.error && apiResponse.error_message) {
    throw new Error(apiResponse.error_message);
  }

  if (!apiResponse.data || apiResponse.data.length === 0) {
    throw new Error("No setlist data found for this show");
  }

  // Map the API response to our PhishShowSetlist type using the createDefaultPhishSong
  const songs: PhishSong[] = apiResponse.data.map((songData) => {
    const song = createDefaultPhishSong(); // This includes all required boolean fields
    song.name = songData.song;
    song.date = songData.showdate;
    song.position = songData.position;
    song.set = songData.set;
    song.transition = songData.transition;
    song.isjam = !!songData.isjam;
    song.gap = songData.gap;
    song.nickname = songData.nickname;
    song.uniqueid = songData.uniqueid;
    song.venue = songData.venue;
    song.city = songData.city;
    song.state = songData.state;
    song.country = songData.country;

    // These are set to their default values from createDefaultPhishSong
    // but could be updated based on API data if available
    return song;
  });

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
    setListNotes: decodeHtmlEntities(firstSong.setlistnotes),
    venue: firstSong.venue,
    city: firstSong.city,
    state: firstSong.state,
    country: firstSong.country,
    venueid: firstSong.venueid,
  };

  return setlist;
}
