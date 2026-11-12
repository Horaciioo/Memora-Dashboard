import 'server-only'

import { prisma } from '@/core/lib/db'
import { readHubSnapshot } from '@/core/lib/realtime/server'
import { readSocketEvents } from '@/core/lib/realtime/server/journal'
import { resolveAccountPermissions } from '@/core/services/auth/GrantsService/resolve'
import { subjectOf } from '@/core/services/nexus/handlers/client/subject'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { REALTIME_COPY } from '@/declarations/nexus/modulesCopy'
import { MINUTE_MS } from '@/utils/constants/time'

// Sockets of one member
const socketsOf = (accountId: string) =>
  readHubSnapshot().sockets.filter((socket) => socket.accountId === accountId)

const summary: NexusHandler = async (context) => {
  const subject = await subjectOf(context)
  const [functions, sessions] = await Promise.all([
    prisma.accountFunction.findMany({
      where: { accountId: subject.id },
      select: { jobFunction: { select: { name: true } } },
    }),
    prisma.session.findMany({
      where: { accountId: subject.id, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
      select: { createdAt: true, lastUsedAt: true, userAgent: true },
    }),
  ])

  return {
    output: {
      account: subject.displayName,
      role: subject.role,
      status: subject.status,
      functions: functions.map((row) => row.jobFunction.name).join(', ') || 'aucune',
      sessions: sessions.length,
      lastUsedAt: sessions[0]?.lastUsedAt ?? null,
      agent: sessions[0]?.userAgent ?? null,
      nexusSession: context.nexus && !subject.isOther ? context.nexus.id : null,
      sockets: socketsOf(subject.id).length,
    },
    data: { note: REALTIME_COPY.perProcess },
    target: subject.isOther ? `account:${subject.id}` : undefined,
  }
}

const session: NexusHandler = async (context) => {
  const subject = await subjectOf(context)
  const rows = await prisma.session.findMany({
    where: { accountId: subject.id },
    orderBy: { lastUsedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      userAgent: true,
      address: true,
      unsealedAt: true,
    },
  })
  const now = new Date()

  // Tokens are never selected
  return {
    output: rows.map((row) => ({ ...row, active: row.expiresAt > now })),
    data: { simultaneous: rows.filter((row) => row.expiresAt > now).length },
  }
}

const permissions: NexusHandler = async (context) => {
  const subject = await subjectOf(context)
  const functions = await prisma.accountFunction.findMany({
    where: { accountId: subject.id },
    select: { functionId: true },
  })
  const effective = await resolveAccountPermissions({
    id: subject.id,
    role: subject.role,
    functions,
  } as never)
  const [role, byFunction, own] = await Promise.all([
    prisma.rolePermission.findMany({ where: { role: subject.role as never } }),
    prisma.functionPermission.findMany({
      where: { functionId: { in: functions.map((row) => row.functionId) } },
    }),
    prisma.accountPermission.findMany({ where: { accountId: subject.id } }),
  ])
  const originOf = (name: string): string =>
    [
      own.some((row) => row.permission === name) && 'surcharge',
      byFunction.some((row) => row.permission === name) && 'fonction',
      role.some((row) => row.permission === name) && 'rôle',
    ]
      .filter(Boolean)
      .join(' + ') || 'socle'

  return {
    output: [...effective].sort().map((name) => ({ permission: name, origin: originOf(name) })),
  }
}

const connections: NexusHandler = async (context) => {
  const subject = await subjectOf(context)

  return {
    output: socketsOf(subject.id).map(({ id, openedAt, lastSeenAt, topics }) => ({
      socket: id,
      openedAt,
      lastSeenAt,
      topics: topics.length,
    })),
    data: { note: REALTIME_COPY.perProcess },
  }
}

const websocket: NexusHandler = async (context) => {
  const subject = await subjectOf(context)
  const closes = readSocketEvents(subject.id)
    .filter((event) => event.kind === 'close')
    .slice(-5)

  return {
    output: socketsOf(subject.id).map((socket) => ({
      ...socket,
      topics: socket.topics.join(', '),
      lastCloseCodes: closes.map((event) => event.detail).join(', '),
    })),
    data: { note: REALTIME_COPY.perProcess },
  }
}

const events: NexusHandler = async (context) => {
  const subject = await subjectOf(context)
  const since =
    context.args.since instanceof Date ? context.args.since.getTime() : Date.now() - 15 * MINUTE_MS

  return {
    output: readSocketEvents(subject.id, since)
      .reverse()
      .map((event) => ({
        at: new Date(event.at),
        label: `${event.kind} ${event.detail ?? ''}`.trim(),
      })),
  }
}

/**
 * Client reads of the realtime module
 * @type {Record<string, NexusHandler>}
 */

export const CLIENT_HANDLERS: Record<string, NexusHandler> = {
  'client.summary': summary,
  'client.session': session,
  'client.permissions': permissions,
  'client.connections': connections,
  'client.websocket': websocket,
  'client.events': events,
}
