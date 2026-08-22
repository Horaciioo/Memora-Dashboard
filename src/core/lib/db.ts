import 'server-only'

import { PrismaClient } from '@prisma/client'

// Survives dev hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Prisma client
 * @type {PrismaClient}
 */

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
