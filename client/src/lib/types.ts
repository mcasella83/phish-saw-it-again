export interface PhishShow {
  showid: string;
  showdate: string;
  venue: string;
  location: string;
  rating: number;
}

export interface PhishShowApiResponse {
  error: boolean;
  error_message?: string;
  data: PhishShow[];
}

export interface PhishSetlistApiResponse {
  error: boolean;
  error_message?: string;
  data: PhishShowSetlist;
}

export interface PhishShowSetlist {
  id: string;
  date: string;
  song: PhishSong[];
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
}
