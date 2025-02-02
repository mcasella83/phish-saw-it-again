import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { userSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.post("/api/users", async (req, res) => {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const username = result.data.username;
    if (storage.users.has(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    storage.users.set(username, result.data);
    res.status(201).json(result.data);
  });

  return createServer(app);
}