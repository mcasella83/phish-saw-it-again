export interface PhishShow {
  showid: string;
  showdate: string;
  venue: string;
  location: string;
  rating: number;
  setlist?: ApiSong[]; // Optional setlist data added by the random show endpoint
}

export interface PhishShowApiResponse {
  error: boolean;
  error_message?: string;
  data: PhishShow[];
}

export interface PhishSetlistApiResponse {
  error: boolean;
  error_message?: string;
  data: ApiSong[];
}

export interface ApiSong {
  showid: number;
  showdate: string;
  permalink: string;
  showyear: string;
  uniqueid: number;
  meta: string;
  reviews: number;
  exclude: number;
  setlistnotes: string;
  soundcheck: string;
  songid: number;
  position: number;
  transition: number;
  footnote: string;
  set: string;
  isjam: number;
  isreprise: number;
  isjamchart: number;
  jamchart_description: string;
  tracktime: string;
  gap: number;
  tourid: number;
  tourname: string;
  tourwhen: string;
  song: string;
  nickname: string;
  slug: string;
  is_original: number;
  venueid: number;
  venue: string;
  city: string;
  state: string;
  country: string;
  trans_mark: string;
  artistid: number;
  artist_slug: string;
  artist_name: string;
}

export interface PhishShowSetlist {
  id: number;
  date: string;
  songs: PhishSong[];
  setListNotes: string;
  venue: string;
  city: string;
  state: string;
  country: string;
}

export interface PhishSong {
  name: string;
  date: string;
  position: number;
  set: string;
  transition?: number;
  isjam?: boolean;
  gap?: number;
  nickname?: string;
  uniqueid: number;
}