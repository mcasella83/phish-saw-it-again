import { User } from "@shared/schema";

export interface IStorage {
  users: Map<string, User>;
}

export class MemStorage implements IStorage {
  users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }
}

export const storage = new MemStorage();