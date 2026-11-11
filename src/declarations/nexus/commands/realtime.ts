import type { ArgSpec } from '@/core/lib/nexus/args'
import { defineCommand } from '@/declarations/nexus/commands/types'
import type { CommandInput, NexusCommand } from '@/declarations/nexus/commands/types'

const USER_ARG: ArgSpec = { name: 'user', type: 'id' }

// Client read, audited as a diagnostic
const client = (input: Omit<CommandInput, 'category' | 'level'>): NexusCommand =>
  defineCommand({ category: 'client', level: 'diagnostic', args: [USER_ARG], ...input })

/**
 * Client and realtime commands
 * @type {NexusCommand[]}
 */

export const REALTIME_COMMANDS: NexusCommand[] = [
  client({
    id: 'get.this.client.summary',
    syntax: '$get.this.client.summary --user=<id|discordId>',
    description: 'Compte, session et connexions',
    handler: 'client.summary',
    output: 'record',
  }),
  client({
    id: 'get.this.client.session',
    syntax: '$get.this.client.session --user=<id|discordId>',
    description: 'Sessions et fenêtre 2FA, sans jeton',
    handler: 'client.session',
    output: 'table',
  }),
  client({
    id: 'get.this.client.permissions',
    syntax: '$get.this.client.permissions --user=<id|discordId>',
    description: 'Permissions effectives et leur origine',
    handler: 'client.permissions',
    output: 'table',
  }),
  client({
    id: 'get.this.client.connections',
    syntax: '$get.this.client.connections --user=<id|discordId>',
    description: 'Sockets ouvertes',
    handler: 'client.connections',
    output: 'table',
  }),
  client({
    id: 'get.this.client.websocket',
    syntax: '$get.this.client.websocket --user=<id|discordId>',
    description: 'Sujets, débit et retard des sockets',
    handler: 'client.websocket',
    output: 'table',
  }),
  client({
    id: 'get.this.client.events',
    syntax: '$get.this.client.events --user=<id|discordId> --since=<date>',
    description: 'Journal des évènements temps réel',
    handler: 'client.events',
    args: [USER_ARG, { name: 'since', type: 'date' }],
    output: 'timeline',
  }),
  defineCommand({
    id: 'realtime.topics',
    syntax: '$realtime.topics',
    description: 'Sujets suivis et abonnés',
    category: 'client',
    level: 'diagnostic',
    handler: 'realtime.topics',
    output: 'table',
  }),
  defineCommand({
    id: 'realtime.topic',
    syntax: '$realtime.topic --name=<sujet>',
    description: 'Abonnés et débit d’un sujet',
    category: 'client',
    level: 'diagnostic',
    handler: 'realtime.topic',
    args: [{ name: 'name', type: 'string', required: true, max: 200 }],
    output: 'record',
  }),
  defineCommand({
    id: 'realtime.disconnect',
    syntax: '$realtime.disconnect --socket=<id>',
    description: 'Fermer une socket, le client se reconnecte',
    category: 'client',
    level: 'dangerous',
    handler: 'realtime.disconnect',
    args: [{ name: 'socket', type: 'id', required: true }],
    confirm: 'preview',
    audit: 'full',
    risk: 'high',
    reauth: 'recent',
    output: 'record',
  }),
]
