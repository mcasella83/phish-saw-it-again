export interface PhishShow {
  showid: string;
  showdate: string;
  venue: string;
  location: string;
  rating: number;
}

export interface PhishApiResponse {
  error: boolean;
  error_message?: string;
  data: PhishShow[];
}

export interface SetlistSong {
  uniqueid: string;
  showid: string;
  showdate: string;
  set: string;
  position: number;
  song: string;
  transition?: number;
  isjam?: boolean;
  notes?: string;
}

export interface SetlistData {
  showid: string;
  showdate: string;
  venue: string;
  location: string;
  setlistnotes?: string;
}

export interface PhishSetlistResponse {
  error: boolean;
  error_message?: string;
  data: SetlistData & { setlist: SetlistSong[] };
}

export interface Song {
  name: string;
  displayDate: string;
  showDate: Date;
}