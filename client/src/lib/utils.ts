
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to decode HTML entities with safe UTF-8 handling
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  try {
    const doc = new DOMParser().parseFromString(
      text.replace(/[\u00A0-\u9999<>&]/g, (i) => `&#${i.charCodeAt(0)};`),
      "text/html"
    );
    return doc.body.textContent || "";
  } catch (error) {
    console.error("Error decoding HTML entities:", error);
    return text;
  }
}
