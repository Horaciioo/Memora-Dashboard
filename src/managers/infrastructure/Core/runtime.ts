import 'server-only'

import { bindSecretCipher } from '@/core/lib/crypto'
import { bindRateLimitStore } from '@/core/lib/http/rateLimit'
import { logger } from '@/core/lib/logger'
import { markRemindersScheduled, runReminderSweep } from '@/core/services/calendar/attendance'
import { runMaintenance } from '@/core/services/system/MaintenanceService'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import Sharding from '@/managers/infrastructure/Core/Sharding'

// Survives dev hot reloads, one container per process
const globalForRuntime = globalThis as unknown as { sharding?: Sharding }

let starting: Promise<Sharding> | null = null

/**
 * Back the rate limiter with Redis so every instance shares one counter
 * @param {Sharding} container - Infrastructure container
 * @return {void}
 */

const wireRateLimiter = (container: Sharding): void => {
  const cache = container.redis.cache
  if (!container.redis.isReady() || !cache) return

  // The declared prefix may already end with its separator
  const namespace = container.redis.prefix.replace(/:+$/, '')

  bindRateLimitStore({
    hit: async (key, windowSeconds) => {
      const namespaced = namespace ? `${namespace}:${key}` : key
      const count = await cache.incr(namespaced)

      // Only the first hit of a window carries its lifetime
      if (count === 1) await cache.expire(namespaced, windowSeconds)

      return count
    },
  })

  logger.info('[runtime] rate limiting is shared through Redis')
}

/**
 * Let stored secrets be encrypted at rest
 * @param {Sharding} container - Infrastructure container
 * @return {void}
 */

const wireCipher = (container: Sharding): void => {
  if (!container.config.isEnabled('encryption')) return

  bindSecretCipher({
    encrypt: (value) => container.encryption.encrypt(value),
    decrypt: (value) => String(container.encryption.decrypt(value)),
  })

  logger.info('[runtime] secrets are encrypted at rest')
}

/**
 * Declare what each queue runs. Handlers are registered before the queues load,
 * so a worker starts with its queue rather than after it
 * @param {Sharding} container - Infrastructure container
 * @return {void} - Registered
 */

const registerJobs = (container: Sharding): void => {
  container.queues.register({
    queueName: 'maintenance',
    process: async () => {
      await runMaintenance()
    },
  })

  container.queues.register({
    queueName: 'reminders',
    process: async () => {
      await runReminderSweep()
    },
  })
}

/**
 * Put every recurring job on its cron, once the queues are actually up
 * @param {Sharding} container - Infrastructure container
 * @return {Promise<void>} - Scheduled
 */

const scheduleJobs = async (container: Sharding): Promise<void> => {
  if (!container.queues.isReady()) return

  for (const name of JOB_REGISTRY.keys) {
    const { schedule } = JOB_REGISTRY.get(name)
    if (schedule) await container.queues.schedule(name, schedule)
  }

  // A worker now owns the sweep, so the calendar stops paying for it
  markRemindersScheduled()

  logger.info('[runtime] scheduled jobs are running on their own')
}

/**
 * Boot the infrastructure once, later calls sharing the same container
 * @return {Promise<Sharding>} - Infrastructure container
 */

export const startRuntime = async (): Promise<Sharding> => {
  const existing = globalForRuntime.sharding
  if (existing?.isLoaded()) return existing

  if (starting) return starting

  const container = existing ?? new Sharding()
  globalForRuntime.sharding = container

  // Handlers exist before the queues open, so none of them loads without one
  registerJobs(container)

  starting = container
    .load()
    .then(async () => {
      wireCipher(container)
      wireRateLimiter(container)
      await scheduleJobs(container)

      return container
    })
    .finally(() => {
      starting = null
    })

  return starting
}

/**
 * Read the container without booting it
 * @return {Sharding | null} - Infrastructure container
 */

export const runtime = (): Sharding | null => globalForRuntime.sharding ?? null
