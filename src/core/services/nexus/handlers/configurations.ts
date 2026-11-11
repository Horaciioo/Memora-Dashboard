import 'server-only'

import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { CONFIG_CATEGORIES, categoryOf, readFileLeaves } from '@/core/lib/configuration/files'
import type { ConfigCategory } from '@/core/lib/configuration/files'
import { isMaskedColumn } from '@/core/lib/nexus/redact'
import type { HandlerContext, NexusHandler } from '@/core/services/nexus/handlers/types'
import { specOf } from '@/declarations/configurations/overlay'
import type { ReaderSpec } from '@/declarations/configurations/overlay'
import { EDITABLE_CONFIGURATIONS } from '@/declarations/nexus/inventory/configurations'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'
import { MINUTE_MS } from '@/utils/constants/time'

const isEditable = (category: ConfigCategory): boolean =>
  EDITABLE_CONFIGURATIONS.includes(category.category)

// Typed text to a JSON value
const parseValue = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

// Same JSON shape as the file value
const sameKind = (shipped: unknown, next: unknown): boolean =>
  Array.isArray(shipped) ? Array.isArray(next) : typeof shipped === typeof next

// Bounds the reader declared, when it ran in this process
const withinReader = (spec: ReaderSpec | undefined, next: unknown): boolean => {
  if (!spec) return true
  if (typeof next === 'number') {
    if (spec.kind === 'integer' && !Number.isInteger(next)) return false

    return next >= (spec.min ?? -Infinity) && next <= (spec.max ?? Infinity)
  }
  if (spec.allowed && typeof next === 'string') return spec.allowed.includes(next)
  if (spec.allowed && Array.isArray(next))
    return next.every((entry) => spec.allowed?.includes(entry))

  return true
}

// Category named in the path
const categoryOfContext = (context: HandlerContext): ConfigCategory => {
  const category = categoryOf(context.params.category)
  if (!category) throw notFound(SYSTEM_COPY.unknownCategory)

  return category
}

const summary = async () => {
  const counts = await prisma.configOverride.groupBy({ by: ['category'], _count: { _all: true } })

  return {
    output: CONFIG_CATEGORIES.map((category) => ({
      category: category.id,
      editable: isEditable(category),
      overrides: counts.find((row) => row.category === category.category)?._count._all ?? 0,
      restartRequired: true,
    })),
  }
}

const read: NexusHandler = async (context) => {
  if (context.params.category === 'summary') return summary()

  const category = categoryOfContext(context)
  const leaves = readFileLeaves(category)
  const rows = await prisma.configOverride.findMany({ where: { category: category.category } })
  const overrides = new Map(rows.map((row) => [row.path, row.value]))

  return {
    output: Object.entries(leaves).map(([key, shipped]) => {
      const hidden = isMaskedColumn(key.split('.').at(-1) ?? key)
      const spec = specOf(`${category.category}.${key}`)

      return {
        key,
        file: hidden ? NEXUS_COPY.masked : shipped,
        override: hidden ? NEXUS_COPY.masked : (overrides.get(key) ?? null),
        effective: hidden ? NEXUS_COPY.masked : (overrides.get(key) ?? shipped),
        bounds: spec ? `${spec.min ?? ''}..${spec.max ?? ''}` : '',
      }
    }),
    data: { editable: isEditable(category), restartRequired: true },
  }
}

const update: NexusHandler = async (context) => {
  const category = categoryOfContext(context)
  if (!isEditable(category)) throw forbidden(SYSTEM_COPY.notEditable)

  // Key and value
  const raw = String(context.args.set)
  const comma = raw.indexOf(',')
  const key = comma === -1 ? raw : raw.slice(0, comma)
  const leaves = readFileLeaves(category)
  if (comma === -1 || !(key in leaves)) throw conflict(SYSTEM_COPY.unknownKey)

  const next = parseValue(raw.slice(comma + 1))
  if (!sameKind(leaves[key], next)) throw conflict(SYSTEM_COPY.wrongType)
  if (!withinReader(specOf(`${category.category}.${key}`), next)) {
    throw conflict(SYSTEM_COPY.outOfBounds)
  }

  const client = context.tx ?? prisma
  const current = await client.configOverride.findUnique({
    where: { category_path: { category: category.category, path: key } },
  })
  const before = { [key]: current?.value ?? leaves[key] }
  const after = { [key]: next }
  const target = `configOverride:${category.category}.${key}`
  if (context.dryRun) return { output: { before, after }, target, level: 'info' }

  // Expiry in minutes
  const minutes = Number(context.args.minutes ?? 0)
  const expiresAt = minutes > 0 ? new Date(Date.now() + minutes * MINUTE_MS) : null
  const value = next as never

  await client.configOverride.upsert({
    where: { category_path: { category: category.category, path: key } },
    create: {
      category: category.category,
      path: key,
      value,
      previous: leaves[key] as never,
      updatedById: context.accountId,
      expiresAt,
    },
    update: { value, previous: (current?.value ?? leaves[key]) as never, expiresAt },
  })

  return {
    output: { before, after },
    target,
    before,
    after,
    data: { note: SYSTEM_COPY.restartRequired },
    level: 'warning',
  }
}

const reset: NexusHandler = async (context) => {
  const category = categoryOfContext(context)
  const key = context.args.key ? String(context.args.key) : null
  const client = context.tx ?? prisma
  const where = { category: category.category, ...(key ? { path: key } : {}) }
  const rows = await client.configOverride.findMany({ where })
  if (rows.length === 0) throw conflict(SYSTEM_COPY.noOverride)

  const before = Object.fromEntries(rows.map((row) => [row.path, row.value]))
  const target = `configOverride:${category.category}`
  if (context.dryRun) return { output: { before, after: {} }, target }

  await client.configOverride.deleteMany({ where })

  return {
    output: { before, after: {} },
    target,
    before,
    after: {},
    data: { note: SYSTEM_COPY.restartRequired },
    level: 'warning',
  }
}

/**
 * Handlers of the configuration module
 * @type {Record<string, NexusHandler>}
 */

export const CONFIGURATION_HANDLERS: Record<string, NexusHandler> = {
  'configurations.read': read,
  'configurations.update': update,
  'configurations.reset': reset,
}
