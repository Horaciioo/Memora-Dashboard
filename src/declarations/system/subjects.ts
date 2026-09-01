import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import type { ConfigSubject, ProbeStatus } from '@/types/infrastructure'
import type { Tone } from '@/declarations/ui/theme'

/**
 * Infrastructure subject metadata
 * @typedef {Object} SubjectOption
 * @property {string} label - Display name
 * @property {IconName} icon - Icon key
 */

interface SubjectOption {
  label: string
  icon: IconName
}

const SUBJECT_MAP: Record<ConfigSubject, SubjectOption> = {
  database: { label: 'Base de données', icon: 'database' },
  redis: { label: 'Cache', icon: 'refresh' },
  queues: { label: 'Files de jobs', icon: 'queue' },
  storage: { label: 'Stockage', icon: 'storage' },
  encryption: { label: 'Chiffrement', icon: 'key' },
  telemetry: { label: 'Télémétrie', icon: 'metrics' },
  logger: { label: 'Journaux', icon: 'sheet' },
  uptime: { label: 'Sondes', icon: 'scan' },
}

export const SUBJECT_REGISTRY = createRegistry(SUBJECT_MAP)

/**
 * Probe status metadata
 * @typedef {Object} ProbeStatusOption
 * @property {string} label - Display name
 * @property {Tone} tone - Badge tone
 */

interface ProbeStatusOption {
  label: string
  tone: Tone
}

const PROBE_STATUS_MAP: Record<ProbeStatus, ProbeStatusOption> = {
  up: { label: 'En ligne', tone: 'success' },
  degraded: { label: 'Dégradé', tone: 'warning' },
  down: { label: 'Hors ligne', tone: 'danger' },
}

export const PROBE_STATUS_REGISTRY = createRegistry(PROBE_STATUS_MAP)
