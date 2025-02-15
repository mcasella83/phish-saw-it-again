
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

// Helper function to encode text as UTF-8
export function encodeUTF8(text: string): string {
  return encodeURIComponent(text).replace(/%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    });
}
