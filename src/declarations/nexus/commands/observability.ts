import type { ArgSpec } from '@/core/lib/nexus/args'
import { defineCommand } from '@/declarations/nexus/commands/types'

// Moment filters shared by the journals
const WHEN: ArgSpec[] = [
  { name: 'since', type: 'date' },
  { name: 'last', type: 'duration', max: 30 * 86400 },
]

const SEVERITIES = ['fatal', 'error', 'warning'] as const
const SOURCES = [
  'server',
  'client',
  'api',
  'prisma',
  'websocket',
  'job',
  'play',
  'feature',
] as const

/**
 * Commands on health, errors, logs and features
 * @type {NexusCommand[]}
 */

export const OBSERVABILITY_COMMANDS = [
  defineCommand({
    id: 'get.memora.health',
    syntax: '$get.memora.health',
    description: 'Santé du processus, de la base et des services',
    category: 'memora',
    handler: 'memora.health',
    output: 'record',
  }),
  defineCommand({
    id: 'get.memora.errors',
    syntax:
      '$get.memora.errors --since=<date> --last=<durée> --severity= --source= --route= --user=<id> --open --page=<n>',
    description: 'Erreurs regroupées, les plus récentes d’abord',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.errors',
    args: [
      ...WHEN,
      { name: 'severity', type: 'enum', values: SEVERITIES },
      { name: 'source', type: 'enum', values: SOURCES },
      { name: 'route', type: 'string', max: 200 },
      { name: 'user', type: 'id' },
      { name: 'open', type: 'boolean' },
      { name: 'page', type: 'integer', min: 1, max: 10000, fallback: 1 },
    ],
    output: 'table',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.error',
    syntax: '$get.memora.error --id=<erreur> | --code=<code>',
    description: 'Fiche d’une erreur et ce qui l’entoure',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.error',
    args: [
      { name: 'id', type: 'id' },
      { name: 'code', type: 'string', min: 8, max: 8 },
    ],
    output: 'record',
  }),
  defineCommand({
    id: 'get.memora.error.resolve',
    syntax: '$get.memora.error.resolve --id=<erreur>',
    description: 'Marquer une erreur comme résolue',
    category: 'memora',
    level: 'write',
    handler: 'memora.errorResolve',
    args: [{ name: 'id', type: 'id', required: true }],
    output: 'diff',
    audit: 'full',
    confirm: 'preview',
  }),
  defineCommand({
    id: 'get.memora.logs',
    syntax: '$get.memora.logs --level= --last=<durée> --grep=<texte> --request=<id>',
    description: 'Journal technique récent du processus',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.logs',
    args: [
      ...WHEN,
      { name: 'level', type: 'enum', values: ['info', 'warn', 'error'] },
      { name: 'grep', type: 'string', max: 100 },
      { name: 'request', type: 'id' },
    ],
    output: 'timeline',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.metrics',
    syntax: '$get.memora.metrics --window=<minutes>',
    description: 'Mémoire, boucle d’évènements, sockets et volumes',
    category: 'memora',
    handler: 'memora.metrics',
    args: [{ name: 'window', type: 'integer', min: 1, max: 60 }],
    output: 'metrics',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.performance',
    syntax: '$get.memora.performance --route=<texte> --model=<texte> --window=<minutes>',
    description: 'Durées p50 et p95 par route ou par modèle',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.performance',
    args: [
      { name: 'route', type: 'string', max: 200 },
      { name: 'model', type: 'string', max: 100 },
      { name: 'window', type: 'integer', min: 1, max: 60 },
    ],
    output: 'table',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.services',
    syntax: '$get.memora.services',
    description: 'Services d’infrastructure et de fond',
    category: 'memora',
    handler: 'memora.services',
    output: 'table',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.dependencies',
    syntax: '$get.memora.dependencies',
    description: 'Versions de Node, Postgres et des paquets',
    category: 'memora',
    handler: 'memora.dependencies',
    output: 'record',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.features',
    syntax: '$get.memora.features',
    description: 'Fonctionnalités et position de leurs interrupteurs',
    category: 'memora',
    handler: 'memora.features',
    output: 'table',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.feature',
    syntax: '$get.memora.feature --key=<fonctionnalité>',
    description: 'Une fonctionnalité, ses pages et ses erreurs',
    category: 'memora',
    handler: 'memora.feature',
    args: [{ name: 'key', type: 'string', required: true, max: 100 }],
    output: 'record',
    audit: 'none',
  }),
  defineCommand({
    id: 'get.memora.trace',
    syntax: '$get.memora.trace --request=<id>',
    description: 'Tout ce qui porte cet identifiant de requête',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.trace',
    args: [{ name: 'request', type: 'id', required: true }],
    output: 'tree',
  }),
  defineCommand({
    id: 'get.memora.user.errors',
    syntax: '$get.memora.user.errors --user=<id|discord>',
    description: 'Erreurs vécues par un membre',
    category: 'memora',
    level: 'diagnostic',
    handler: 'memora.userErrors',
    args: [{ name: 'user', type: 'id', required: true }],
    output: 'table',
  }),
]
