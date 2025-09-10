// Resources
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Formats Tailwind classes.
 * @param inputs The classes.
 * @returns Thee formatted class.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
