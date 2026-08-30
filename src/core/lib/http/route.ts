import 'server-only'

import type { NextRequest } from 'next/server'

import { getSession } from '@/core/lib/auth/getSession'
import {
  forbidden,
  invalidInput,
  notAuthenticated,
  rateLimited,
  toAppError,
} from '@/core/lib/errors'
import type { AppError } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { consume, readIdentity } from '@/core/lib/http/rateLimit'
import { fail, succeed } from '@/core/lib/http/response'
import { logger } from '@/core/lib/logger'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { readScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { DEFAULT_METHOD_POLICIES } from '@/declarations/system/rateLimits'
import type { RateLimitName } from '@/declarations/system/rateLimits'
import { MEDIA_HEADERS, MEDIA_VISIBILITIES } from '@/declarations/system/storage'
import type { MediaVisibility } from '@/declarations/system/storage'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { ErrorCodes } from '@/utils/constants/errors'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Route parameters resolved by the App Router
 * @typedef {Object} RouteParams
 * @property {Promise<Record<string, string>>} params - Dynamic segments
 */

export interface RouteParams {
  params: Promise<Record<string, string>>
}

/**
 * Everything a handler receives
 * @typedef {Object} RouteContext
 * @property {NextRequest} request - Incoming request
 * @property {Record<string, string>} params - Dynamic segments
 * @property {URLSearchParams} query - Query string
 * @property {FormValues} body - Parsed body
 * @property {Record<string, unknown>} raw - Untouched body
 */

export interface RouteContext {
  request: NextRequest
  params: Record<string, string>
  query: URLSearchParams
  body: FormValues
  raw: Record<string, unknown>
}

/**
 * Route context of a protected route
 * @typedef {Object} ProtectedRouteContext
 * @property {SessionUser} session - Signed-in member
 * @property {PermissionHelpers} access - Permission helpers
 * @property {() => Promise<AccessScope>} scope - Creator perimeter, resolved on demand
 */

export interface ProtectedRouteContext extends RouteContext {
  session: SessionUser
  access: PermissionHelpers
  scope: () => Promise<AccessScope>
}

/**
 * Documentation attached to a route
 * @typedef {Object} RouteDescriptor
 * @property {string} summary - What the route does
 * @property {string[]} [tags] - Grouping tags
 */

export interface RouteDescriptor {
  summary: string
  tags?: string[]
}

/**
 * Shared route options
 * @typedef {Object} RouteOptions
 * @property {number} [status] - Success status
 * @property {FieldDefinition[]} [fields] - Body declarations
 * @property {boolean} [partial] - Skip required checks
 * @property {RateLimitName | false} [rateLimit] - Policy, false disables it
 * @property {RouteDescriptor} [descriptor] - Route documentation
 */

interface RouteOptions {
  status?: number
  fields?: FieldDefinition[]
  partial?: boolean
  rateLimit?: RateLimitName | false
  descriptor?: RouteDescriptor
}

/**
 * Protected route options
 * @typedef {Object} ProtectedRouteOptions
 * @property {PermissionName | PermissionName[]} [permission] - Permission needed
 * @property {(context: ProtectedRouteContext) => Promise<T>} handler - Route body
 */

interface ProtectedRouteOptions<T> extends RouteOptions {
  permission?: PermissionName | PermissionName[]
  handler: (context: ProtectedRouteContext) => Promise<T>
}

/**
 * Public route options
 * @typedef {Object} PublicRouteOptions
 * @property {(context: RouteContext) => Promise<T>} handler - Route body
 */

interface PublicRouteOptions<T> extends RouteOptions {
  handler: (context: RouteContext) => Promise<T>
}

/**
 * Handler exported from a route file
 * @type {(request: NextRequest, context: RouteParams) => Promise<Response>}
 */

export type RouteHandler = ((request: NextRequest, context: RouteParams) => Promise<Response>) & {
  descriptor?: RouteDescriptor
}

/**
 * Enforce the policy of one request
 * @param {NextRequest} request - Incoming request
 * @param {RateLimitName | false} [declared] - Policy declared by the route
 * @param {string} [accountId] - Signed-in member
 * @return {Promise<void>} - Throws once exhausted
 */

const guard = async (
  request: NextRequest,
  declared?: RateLimitName | false,
  accountId?: string
): Promise<void> => {
  if (declared === false) return

  const name = declared ?? DEFAULT_METHOD_POLICIES[request.method]
  if (!name) return

  const verdict = await consume(name, readIdentity(name, request.headers, accountId))
  if (!verdict.allowed) throw rateLimited(verdict.retryAfterSeconds)
}

/**
 * Read a request body whatever its encoding
 * @param {NextRequest} request - Incoming request
 * @return {Promise<Record<string, unknown>>} - Raw values
 */

const readBody = async (request: NextRequest): Promise<Record<string, unknown>> => {
  if (request.method === 'GET' || request.method === 'HEAD') return {}

  const contentType = request.headers.get('content-type') ?? ''

  // Multipart and urlencoded arrive as form data
  if (contentType.includes('form')) {
    const form = await request.formData()
    return Object.fromEntries(form.entries())
  }

  try {
    const payload: unknown = await request.json()
    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

/**
 * Build the shared part of a route context
 * @param {NextRequest} request - Incoming request
 * @param {RouteParams} context - App Router context
 * @param {RouteOptions} options - Route options
 * @return {Promise<RouteContext>} - Route context
 */

const buildContext = async (
  request: NextRequest,
  context: RouteParams,
  options: RouteOptions
): Promise<RouteContext> => {
  const raw = await readBody(request)
  const params = await context.params

  // Body declarations turn raw values into validated ones
  if (!options.fields) {
    return { request, params, query: request.nextUrl.searchParams, body: {}, raw }
  }

  const parsed = parseFormValues(options.fields, raw, {
    enforceRequired: !options.partial,
    fillMissing: !options.partial,
  })

  if (!parsed.ok) throw invalidInput(parsed.issues)

  return { request, params, query: request.nextUrl.searchParams, body: parsed.values, raw }
}

/**
 * Reject a session that misses the permission
 * @param {PermissionHelpers} access - Permission helpers
 * @param {PermissionName | PermissionName[]} [permission] - Permission needed
 * @return {void} - Throws when missing
 */

const assertPermission = (
  access: PermissionHelpers,
  permission?: PermissionName | PermissionName[]
): void => {
  if (!permission) return

  const allowed = Array.isArray(permission) ? access.canAny(permission) : access.can(permission)
  if (!allowed) throw forbidden()
}

/**
 * Resolve the session behind a guarded route
 * @param {NextRequest} request - Incoming request
 * @param {RouteOptions} options - Route options
 * @param {PermissionName | PermissionName[]} [permission] - Permission needed
 * @return {Promise<{ session: SessionUser, access: PermissionHelpers }>} - Guarded session
 */

const authenticate = async (
  request: NextRequest,
  options: RouteOptions,
  permission?: PermissionName | PermissionName[]
): Promise<{ session: SessionUser; access: PermissionHelpers }> => {
  const session = await getSession()
  if (!session) throw notAuthenticated()

  await guard(request, options.rateLimit, session.id)

  // Permission gate, root bypasses every check
  const access = resolvePermissions(session)
  assertPermission(access, permission)

  return { session, access }
}

/**
 * Build a route open to anyone
 * @param {PublicRouteOptions<T>} options - Route options
 * @return {RouteHandler} - Route handler
 */

export const createPublicRoute = <T>(options: PublicRouteOptions<T>): RouteHandler => {
  const handler: RouteHandler = async (request, context) => {
    try {
      await guard(request, options.rateLimit)

      const routeContext = await buildContext(request, context, options)

      return succeed(await options.handler(routeContext), options.status ?? 200)
    } catch (error) {
      return fail(error)
    }
  }

  handler.descriptor = options.descriptor

  return handler
}

/**
 * Build a route behind session and permission checks
 * @param {ProtectedRouteOptions<T>} options - Route options
 * @return {RouteHandler} - Route handler
 */

export const createProtectedRoute = <T>(options: ProtectedRouteOptions<T>): RouteHandler => {
  const handler: RouteHandler = async (request, context) => {
    try {
      const { session, access } = await authenticate(request, options, options.permission)
      const routeContext = await buildContext(request, context, options)

      return succeed(
        await options.handler({
          ...routeContext,
          session,
          access,
          scope: () => readScope(session, access),
        }),
        options.status ?? 200
      )
    } catch (error) {
      return fail(error)
    }
  }

  handler.descriptor = options.descriptor

  return handler
}

/**
 * Redirect route options
 * @typedef {Object} RedirectRouteOptions
 * @property {(context: RouteContext) => Promise<string>} handler - Resolves the destination
 * @property {(error: AppError) => string} onFailure - Destination of a refused attempt
 */

interface RedirectRouteOptions {
  rateLimit?: RateLimitName | false
  descriptor?: RouteDescriptor
  handler: (context: RouteContext) => Promise<string>
  onFailure: (error: AppError) => string
}

/**
 * Build a route that answers with a redirect rather than a payload
 * @param {RedirectRouteOptions} options - Route options
 * @return {RouteHandler} - Route handler
 */

export const createRedirectRoute = (options: RedirectRouteOptions): RouteHandler => {
  const handler: RouteHandler = async (request, context) => {
    const base = request.nextUrl.origin

    try {
      await guard(request, options.rateLimit)

      const routeContext = await buildContext(request, context, {})

      return Response.redirect(new URL(await options.handler(routeContext), base), 303)
    } catch (error) {
      const appError = toAppError(error)

      // A browser flow never reads an envelope, it only follows a location
      if (appError.code === ErrorCodes.SystemFailure) logger.error('[oauth]', error)

      return Response.redirect(new URL(options.onFailure(appError), base), 303)
    }
  }

  handler.descriptor = options.descriptor

  return handler
}

/**
 * What a media route knows before reading any byte
 * @typedef {Object} MediaDescriptor
 * @property {MediaVisibility} visibility - Reachable without a session
 * @property {string} mimeType - Stored content type
 * @property {string} etag - Validator of the stored bytes
 * @property {PermissionName | PermissionName[]} [permission] - Permission needed when private
 */

export interface MediaDescriptor {
  visibility: MediaVisibility
  mimeType: string
  etag: string
  permission?: PermissionName | PermissionName[]
}

/**
 * Media route options
 * @typedef {Object} MediaRouteOptions
 * @property {(params: Record<string, string>) => Promise<MediaDescriptor>} describe - Metadata only
 * @property {(params: Record<string, string>) => Promise<Uint8Array>} read - Stored bytes
 */

interface MediaRouteOptions {
  describe: (params: Record<string, string>) => Promise<MediaDescriptor>
  read: (params: Record<string, string>) => Promise<Uint8Array>
  rateLimit?: RateLimitName | false
  descriptor?: RouteDescriptor
}

/**
 * Build the cache directive of one visibility
 * @param {MediaVisibility} visibility - Reachable without a session
 * @return {string} - Cache-Control value
 */

const cacheDirective = (visibility: MediaVisibility): string =>
  visibility === MEDIA_VISIBILITIES.Public
    ? MEDIA_HEADERS.publicCacheControl
    : MEDIA_HEADERS.privateCacheControl

/**
 * Build a route answering with stored bytes rather than the response envelope
 * @param {MediaRouteOptions} options - Route options
 * @return {RouteHandler} - Route handler
 */

export const createMediaRoute = (options: MediaRouteOptions): RouteHandler => {
  const handler: RouteHandler = async (request, context) => {
    try {
      const params = await context.params
      const media = await options.describe(params)

      // A private object still costs a session, a public one never does
      if (media.visibility === MEDIA_VISIBILITIES.Private) {
        await authenticate(request, { rateLimit: options.rateLimit }, media.permission)
      } else {
        await guard(request, options.rateLimit)
      }

      const shared = {
        etag: media.etag,
        'content-type': media.mimeType,
        'cache-control': cacheDirective(media.visibility),
        'x-content-type-options': MEDIA_HEADERS.contentTypeOptions,
      }

      // A matching validator answers without ever reading the bytes
      if (request.headers.get('if-none-match') === media.etag) {
        return new Response(null, { status: 304, headers: shared })
      }

      const data = await options.read(params)

      return new Response(data as BodyInit, {
        headers: { ...shared, 'content-length': String(data.byteLength) },
      })
    } catch (error) {
      return fail(error)
    }
  }

  handler.descriptor = options.descriptor

  return handler
}
