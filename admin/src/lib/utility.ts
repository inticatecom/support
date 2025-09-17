// Resources
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PrismaClient } from "../generated/prisma";
import { HTTPError } from "ky";

// Variables
const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };

/**
 * Formats Tailwind classes.
 * @param inputs The classes.
 * @returns Thee formatted class.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Prisma client to interact with data stored in the database.
 */
export const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma;

/**
 * Similar to the 'Omit' type, this function omits keys from objects.
 * @param obj The array.
 * @param keys A list of keys to remove from the array.
 * @returns The modified array.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export async function handleError(e: unknown): Promise<string> {
  if (e instanceof HTTPError) {
    return await e.response.text();
  } else {
    return "Internal Server Error.";
  }
}
