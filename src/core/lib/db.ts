import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Survives dev hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Build a client bound to the configured datasource
 * @return {PrismaClient} - Database client
 */

const createClient = (): PrismaClient =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

/**
 * Prisma client
 * @type {PrismaClient}
 */

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
