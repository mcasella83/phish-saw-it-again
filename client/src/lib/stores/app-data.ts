import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhishShowSetlist } from "@/lib/types";
import type { SongStats, VenueStats } from "@/lib/phish-processing";

interface AppDataState {
  shows: PhishShowSetlist[] | null;
  songs: SongStats[] | null;
  venues: VenueStats[] | null;
  setShows: (shows: PhishShowSetlist[] | null) => void;
  setSongs: (songs: SongStats[] | null) => void;
  setVenues: (venues: VenueStats[] | null) => void;
  clearData: () => void;
}

export const useAppData = create<AppDataState>()(
  persist(
    (set) => ({
      shows: null,
      songs: null,
      venues: null,
      setShows: (shows) => set({ shows }),
      setSongs: (songs) => set({ songs }),
      setVenues: (venues) => set({ venues }),
      clearData: () => set({ shows: null, songs: null, venues: null }),
    }),
    {
      name: "phish-app-data",
    }
  )
);
