import { PrismaClient } from "./generated/prisma/client";

console.log("client exporting...")

export const prisma = new PrismaClient();