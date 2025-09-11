// Resources
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PrismaClient } from "../generated/prisma";

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

export async function register(data: unknown) {
  try {
  } catch {}
}
