import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import utf8 from 'utf8';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to decode HTML entities and ensure UTF-8
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  const decodedText = utf8.decode(text);
  const doc = new DOMParser().parseFromString(decodedText, "text/html");
  return doc.body.textContent || "";
}