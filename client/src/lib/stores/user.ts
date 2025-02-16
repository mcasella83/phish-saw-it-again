import { create } from "zustand";
import type { User } from "@shared/schema";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
