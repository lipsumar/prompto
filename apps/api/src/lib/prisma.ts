//import { PrismaClient } from '@prisma/client';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
export const prisma = new PrismaClient();
