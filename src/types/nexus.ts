import type { RegistryView } from '@/core/lib/nexus/terminal/complete'

export type { RegistryView }

/**
 * Forms a reply is drawn in
 * @type {readonly string[]}
 */

export type NexusForm = 'table' | 'record' | 'tree' | 'diff' | 'timeline' | 'metrics' | 'text'

export type NexusTone = 'info' | 'warning' | 'error' | 'success'

/**
 * Reply of the server for one command
 * @typedef {Object} NexusReply
 */

export interface NexusReply {
  status: 'ok' | 'previewed'
  level: NexusTone
  output: { form: NexusForm; value: unknown }
  data: unknown
  pagination?: { page: number; total: number }
  confirmToken?: string
  confirmKind?: 'preview' | 'double'
  durationMs: number
  requestId: string
}

/**
 * Console session as the screen reads it
 * @typedef {Object} NexusSessionView
 */

export interface NexusSessionView {
  unlocked: boolean
  reauthRequired?: boolean
  csrf?: string
  expiresAt?: string
  writeUntil?: string | null
  dangerUntil?: string | null
}

export type NexusStage = 'loading' | 'locked' | 'read' | 'write' | 'danger'

/**
 * What the prompt asks for
 * @type {readonly string[]}
 */

export type NexusPromptMode = 'command' | 'password' | 'reauth' | 'discord'

/**
 * One entry of the scrollback
 * @typedef {Object} NexusBlock
 */

export interface NexusBlock {
  id: number
  input: string
  at: number
  state: 'running' | 'done' | 'failed' | 'previewed'
  reply?: NexusReply
  error?: string
  // Progress lines written while a step runs
  trace?: string[]
}

/**
 * Command handed to the prompt from outside
 * @typedef {Object} NexusPreset
 * @property {string} text - Command
 * @property {number} id - Changes with each handover
 */

export interface NexusPreset {
  text: string
  id: number
}
