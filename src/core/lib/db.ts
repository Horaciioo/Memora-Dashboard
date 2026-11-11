import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { nexusQueryExtension } from '@/core/lib/nexus/observe/queryExtension'
import { botFilterExtension } from '@/core/lib/play/botFilter'
import { changeSignalExtension } from '@/core/lib/system/changeSignal'

// Same as the driver's default
const DEFAULT_POOL_SIZE = 10

/**
 * Connections the app may hold
 * @return {number} - Pool size
 */

const poolSize = (): number => {
  const size = Number(process.env.DATABASE_POOL_SIZE)

  return Number.isInteger(size) && size > 0 ? size : DEFAULT_POOL_SIZE
}

// Survives dev hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Build a client bound to the configured datasource
 * @return {PrismaClient} - Database client
 */

const createClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: poolSize() }),
  })
    .$extends(nexusQueryExtension)
    .$extends(changeSignalExtension)
    .$extends(botFilterExtension) as unknown as PrismaClient

/**
 * Prisma client
 * @type {PrismaClient}
 */

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
