import nexus from '@/configurations/system/nexus.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'

const node = readNode(nexus.observability, 'system/nexus.observability')

// Integer setting
const count = (key: string, fallback: number, min: number, max: number): number =>
  readInteger(node[key], { path: `system/nexus.observability.${key}`, fallback, min, max })

// Share between 0 and 1
const share = (key: string, fallback: number): number => {
  const value = node[key]

  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback
}

// Minutes list
const windows = (): number[] => {
  const value = node.windowsMinutes

  return Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => Number.isInteger(entry) && entry > 0)
    ? (value as number[])
    : [1, 5, 60]
}

/**
 * Error journal, logs and metrics bounds
 * @type {Record<string, number | number[]>}
 */

export const NEXUS_OBSERVABILITY = {
  errorRetentionDays: count('errorRetentionDays', 30, 1, 365),
  maxErrorRows: count('maxErrorRows', 5000, 100, 1000000),
  minIntervalSeconds: count('minIntervalSeconds', 5, 0, 600),
  perMinuteCap: count('perMinuteCap', 120, 1, 10000),
  slowQueryMs: count('slowQueryMs', 300, 10, 60000),
  clientPerMinute: count('clientPerMinute', 20, 1, 1000),
  clientMaxBytes: count('clientMaxBytes', 8192, 512, 65536),
  contextMaxBytes: count('contextMaxBytes', 4000, 200, 100000),
  logBuffer: count('logBuffer', 5000, 100, 100000),
  infoSampleRate: share('infoSampleRate', 0.1),
  infoPerMinute: count('infoPerMinute', 200, 1, 100000),
  windowsMinutes: windows(),
  routeKeysMax: count('routeKeysMax', 300, 10, 10000),
} as const
