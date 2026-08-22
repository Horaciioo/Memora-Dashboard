import 'server-only'

import type { NextRequest } from 'next/server'

import { getSession } from '@/core/lib/auth/getSession'
import { forbidden, invalidInput, notAuthenticated } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { fail, succeed } from '@/core/lib/http/response'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { FieldDefinition, FormValues } from '@/types/forms'
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
 */

export interface ProtectedRouteContext extends RouteContext {
  session: SessionUser
  access: PermissionHelpers
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
 * @property {RouteDescriptor} [descriptor] - Route documentation
 */

interface RouteOptions {
  status?: number
  fields?: FieldDefinition[]
  partial?: boolean
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
 * Build a route open to anyone
 * @param {PublicRouteOptions<T>} options - Route options
 * @return {RouteHandler} - Route handler
 */

export const createPublicRoute = <T>(options: PublicRouteOptions<T>): RouteHandler => {
  const handler: RouteHandler = async (request, context) => {
    try {
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
      const session = await getSession()
      if (!session) throw notAuthenticated()

      // Permission gate, root bypasses every check
      const access = resolvePermissions(session)
      if (options.permission) {
        const allowed = Array.isArray(options.permission)
          ? access.canAny(options.permission)
          : access.can(options.permission)

        if (!allowed) throw forbidden()
      }

      const routeContext = await buildContext(request, context, options)

      return succeed(
        await options.handler({ ...routeContext, session, access }),
        options.status ?? 200
      )
    } catch (error) {
      return fail(error)
    }
  }

  handler.descriptor = options.descriptor

  return handler
}
