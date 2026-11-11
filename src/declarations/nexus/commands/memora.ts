import { defineCommand } from '@/declarations/nexus/commands/types'

/**
 * Commands on Memora itself
 * @type {NexusCommand[]}
 */

export const MEMORA_COMMANDS = [
  defineCommand({
    id: 'get.memora.inventory',
    syntax: '$get.memora.inventory',
    description: 'Compteurs de l’inventaire et écarts',
    category: 'memora',
    handler: 'memora.inventory',
    output: 'record',
  }),
]

/**
 * Commands on the console itself
 * @type {NexusCommand[]}
 */

export const NEXUS_COMMANDS_ON_SELF = [
  defineCommand({
    id: 'nexus.audit',
    syntax: '$nexus.audit --since=<date> --command=<id> --target=<cible> --page=<n>',
    description: 'Lire l’audit de la console',
    category: 'nexus',
    handler: 'nexus.audit',
    args: [
      { name: 'since', type: 'date' },
      { name: 'command', type: 'string', max: 100 },
      { name: 'target', type: 'string', max: 200 },
      { name: 'page', type: 'integer', min: 1, max: 10000, fallback: 1 },
    ],
    output: 'table',
    audit: 'none',
  }),
  defineCommand({
    id: 'nexus.audit.get',
    syntax: '$nexus.audit.get --id=<ligne>',
    description: 'Lire une ligne d’audit',
    category: 'nexus',
    handler: 'nexus.auditGet',
    args: [{ name: 'id', type: 'id', required: true }],
    output: 'record',
    audit: 'none',
  }),
]
