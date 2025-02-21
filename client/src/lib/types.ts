export interface PhishShow {
  showid: string;
  showdate: string;
  venue: string;
  location: string;
  rating: number;
  artist_name: string;
}

export const createDefaultPhishShow = (): PhishShow => ({
  showid: "",
  showdate: "",
  venue: "",
  location: "",
  rating: 0,
  artist_name: "Phish",
});

export interface PhishShowApiResponse {
  error: boolean;
  error_message?: string;
  data: PhishShow[];
}

export const createDefaultPhishShowApiResponse = (): PhishShowApiResponse => ({
  error: false,
  error_message: undefined,
  data: [],
});

export interface PhishSetlistApiResponse {
  error: boolean;
  error_message?: string;
  data: ApiSong[];
}

export const createDefaultPhishSetlistApiResponse =
  (): PhishSetlistApiResponse => ({
    error: false,
    error_message: undefined,
    data: [],
  });

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

export const createDefaultApiSong = (): ApiSong => ({
  showid: 0,
  showdate: "",
  permalink: "",
  showyear: "",
  uniqueid: 0,
  meta: "",
  reviews: 0,
  exclude: 0,
  setlistnotes: "",
  soundcheck: "",
  songid: 0,
  position: 0,
  transition: 0,
  footnote: "",
  set: "",
  isjam: 0,
  isreprise: 0,
  isjamchart: 0,
  jamchart_description: "",
  tracktime: "",
  gap: 0,
  tourid: 0,
  tourname: "",
  tourwhen: "",
  song: "",
  nickname: "",
  slug: "",
  is_original: 0,
  venueid: 0,
  venue: "",
  city: "",
  state: "",
  country: "",
  trans_mark: "",
  artistid: 0,
  artist_slug: "",
  artist_name: "",
});

export interface PhishShowSetlist {
  id: number;
  date: string;
  songs: PhishSong[];
  setListNotes: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  venueid: number;
}

export const createDefaultPhishShowSetlist = (): PhishShowSetlist => ({
  id: 0,
  date: "",
  songs: [],
  setListNotes: "",
  venue: "",
  city: "",
  state: "",
  country: "",
  venueid: 0,
});

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
  isBustout: boolean;
  isFirstTimeHeard: boolean;
  isLastTimeHeard: boolean;
  isFirstTimeHeardOpener: boolean;
  isFirstTimeHeardCloser: boolean;
  isFirstTimeHeardEncore: boolean;
  venue: string;
  city: string;
  state: string;
  country: string;
}

export const createDefaultPhishSong = (): PhishSong => ({
  name: "",
  date: "",
  position: 0,
  set: "",
  uniqueid: 0,
  isBustout: false,
  isFirstTimeHeard: false,
  isLastTimeHeard: false,
  isFirstTimeHeardOpener: false,
  isFirstTimeHeardCloser: false,
  isFirstTimeHeardEncore: false,
  venue: "",
  city: "",
  state: "",
  country: "",
});
