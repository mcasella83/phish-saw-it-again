
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

export interface PhishSetlist {
  showid: string;
  set: string;
  song: string;
  position: number;
}

export interface PhishSetlistResponse {
  error: boolean;
  error_message?: string;
  data: PhishSetlist[];
}

export interface Song{
  name: string;
  showDate: Date;
}

