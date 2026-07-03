import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageUrl(url: string | undefined): string {
  if (!url) return "";
  
  // Convert standard Google Drive view URLs to direct image URLs
  // This uses the alternate lh3.googleusercontent.com approach which often works better for Drive images
  const gdriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(gdriveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  
  const gdriveIdRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const match2 = url.match(gdriveIdRegex);
  if (match2 && match2[1]) {
    return `https://lh3.googleusercontent.com/d/${match2[1]}`;
  }
  
  // Handle uc?id= format just in case they paste that directly
  const ucRegex = /drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/;
  const match3 = url.match(ucRegex);
  if (match3 && match3[1]) {
    return `https://lh3.googleusercontent.com/d/${match3[1]}`;
  }
  
  return url;
}
