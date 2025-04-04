import {
  PhishShowApiResponse,
  PhishShowSetlist,
  PhishSetlistApiResponse,
  PhishSong,
  PhishShow,
  createDefaultPhishSong,
} from "./types";
import { decodeHtmlEntities, encodeUTF8 } from "./utils";

export interface SongStat {
  name: string;
  playCount: number;
  shows: string[]; // Date strings of shows where this song was played
  showIds: string[]; // IDs of shows where this song was played
  venues: string[]; // Venues where this song was played
  dates: string[]; // Formatted dates of shows where this song was played
}

export interface SearchResults {
  shows: PhishShow[];
  songs: SongStat[];
  totalSongs: number;
  uniqueSongs: number;
}

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

export async function searchShows(
  startDate: string,
  endDate: string,
  artist: string
): Promise<PhishShowApiResponse> {
  // Format the query string
  const queryParams = new URLSearchParams({
    startDate,
    endDate,
    artist,
  });

  console.log("Making API request for shows search:", queryParams.toString());
  const response = await fetch(`/api/phish/search?${queryParams.toString()}`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }

  const data = await response.json();
  
  // Convert to our expected PhishShowApiResponse format
  const apiResponse: PhishShowApiResponse = {
    error: data.error || false,
    error_message: data.message,
    data: data.data || []
  };
  
  return apiResponse;
}

// Function to create a new SongStat object with all required fields
function createSongStat(name: string, date: string, showId: string, venue: string): SongStat {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  return {
    name,
    playCount: 1,
    shows: [date],
    showIds: [showId],
    venues: [venue],
    dates: [formattedDate]
  };
}

export async function processShowsForSongStats(
  shows: PhishShow[],
  progressCallback?: (current: number, total: number) => void
): Promise<SearchResults> {
  // Initialize our result structure
  const results: SearchResults = {
    shows: shows,
    songs: [],
    totalSongs: 0,
    uniqueSongs: 0
  };

  if (shows.length === 0) {
    return results;
  }

  // Track song plays
  const songMap = new Map<string, SongStat>();
  let totalSongCount = 0;

  // Process each show to get its setlist
  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    
    // Call progress callback if provided
    if (progressCallback) {
      progressCallback(i, shows.length);
    }
    
    try {
      const setlist = await getShowSetList(show.showid);
      
      for (const song of setlist.songs) {
        totalSongCount++;
        
        // Format the date once
        const formattedDate = new Date(song.date).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'short', day: 'numeric'
        });
        
        if (songMap.has(song.name)) {
          // Increment play count and add show date if not already present
          const stat = songMap.get(song.name)!;
          stat.playCount++;
          
          if (!stat.shows.includes(song.date)) {
            // Add show date
            stat.shows.push(song.date);
            
            // Add show ID 
            stat.showIds.push(show.showid);
            
            // Add venue if not already included
            if (!stat.venues.includes(song.venue)) {
              stat.venues.push(song.venue);
            }
            
            // Add formatted date
            if (!stat.dates.includes(formattedDate)) {
              stat.dates.push(formattedDate);
            }
          }
        } else {
          // Add a new song stat using our helper function
          songMap.set(song.name, createSongStat(song.name, song.date, show.showid, song.venue));
        }
      }
    } catch (error) {
      console.error(`Error fetching setlist for show ${show.showid}:`, error);
      // Continue with next show
    }
    
    // For every 5 shows processed or on the last show, return partial results
    // This allows the UI to update with partial data
    if ((i + 1) % 5 === 0 || i === shows.length - 1) {
      // Create a partial result to return
      const songStats = Array.from(songMap.values()).sort((a, b) => b.playCount - a.playCount);
      
      results.songs = songStats;
      results.totalSongs = totalSongCount;
      results.uniqueSongs = songStats.length;
    }
  }

  // Convert map to array and sort by play count (descending)
  const songStats = Array.from(songMap.values()).sort((a, b) => b.playCount - a.playCount);

  results.songs = songStats;
  results.totalSongs = totalSongCount;
  results.uniqueSongs = songStats.length;

  return results;
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

  const data = await response.json();
  console.log("API response data:", data);

  if (data.error) {
    throw new Error(data.message || "Error fetching setlist");
  }

  if (!data.data || data.data.length === 0) {
    throw new Error("No setlist data found for this show");
  }

  // Map the API response to our PhishShowSetlist type
  const songs: PhishSong[] = data.data.map((songData: any) => {
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

  const firstSong = data.data[0];
  const setlist: PhishShowSetlist = {
    id: firstSong.showid,
    date: firstSong.showdate,
    songs: songs,
    setListNotes: firstSong.setlistnotes ? decodeHtmlEntities(firstSong.setlistnotes) : "",
    venue: firstSong.venue,
    city: firstSong.city,
    state: firstSong.state,
    country: firstSong.country,
    venueid: firstSong.venueid,
  };

  return setlist;
}
