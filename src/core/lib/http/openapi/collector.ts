import 'server-only'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { fieldsSchema, isMultipart } from '@/core/lib/http/openapi/schema'
import type { JsonSchema } from '@/core/lib/http/openapi/schema'
import type { RouteHandler } from '@/core/lib/http/route'
import { OPENAPI_DEFAULT_TAG, OPENAPI_INFO, OPENAPI_RESPONSES } from '@/declarations/system/openapi'
import { OPENAPI_MANIFEST } from '@/generated/openapi/manifest'

// Shared envelopes
const COMPONENTS = {
  schemas: {
    ApiSuccess: {
      type: 'object',
      required: ['success', 'data'],
      properties: { success: { const: true }, data: {} },
    },
    ApiFailure: {
      type: 'object',
      required: ['success', 'code', 'error', 'issues'],
      properties: {
        success: { const: false },
        code: { type: 'string' },
        error: { type: 'string' },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: { field: { type: 'string' }, message: { type: 'string' } },
          },
        },
      },
    },
  },
}

// Failure reference
const failure = (description: string): JsonSchema => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiFailure' } } },
})

/**
 * One operation
 * @param {string} method - HTTP verb
 * @param {string} path - OpenAPI path
 * @param {RouteHandler} handler - Route handler
 * @return {JsonSchema} - Operation object
 */

const operationOf = (method: string, path: string, handler: RouteHandler): JsonSchema => {
  const meta = handler.meta
  const descriptor = meta?.descriptor ?? handler.descriptor
  const responses: JsonSchema = {}

  // Success shape per factory
  if (meta?.access === 'redirect') responses['307'] = { description: OPENAPI_RESPONSES.redirect }
  else if (meta?.access === 'media') responses['200'] = { description: OPENAPI_RESPONSES.media }
  else if (meta?.access === 'stream') responses['200'] = { description: OPENAPI_RESPONSES.stream }
  else {
    responses[String(meta?.status ?? 200)] = {
      description: OPENAPI_RESPONSES.success,
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } },
    }
  }

  // Guard chain outcomes
  if (meta?.access === 'protected' || meta?.access === 'stream') {
    responses['401'] = failure(OPENAPI_RESPONSES.unauthenticated)
    if (meta.permission) responses['403'] = failure(OPENAPI_RESPONSES.forbidden)
  }
  if (meta?.fields) responses['422'] = failure(OPENAPI_RESPONSES.invalid)
  responses['429'] = failure(OPENAPI_RESPONSES.limited)
  responses['500'] = failure(OPENAPI_RESPONSES.failure)

  const parameters = [...path.matchAll(/\{(\w+)\}/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }))

  const permissions = meta?.permission ? [meta.permission].flat() : []

  return {
    summary: descriptor?.summary ?? `${method} ${path}`,
    tags: descriptor?.tags ?? [OPENAPI_DEFAULT_TAG],
    ...(permissions.length > 0 ? { 'x-permissions': permissions } : {}),
    ...(meta?.access === 'protected' ? { security: [{ session: [] }] } : {}),
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(meta?.fields
      ? {
          requestBody: {
            required: !meta.partial,
            content: {
              [isMultipart(meta.fields) ? 'multipart/form-data' : 'application/json']: {
                schema: fieldsSchema(meta.fields, meta.partial),
              },
            },
          },
        }
      : {}),
    responses,
  }
}

/**
 * Full OpenAPI document
 * @return {JsonSchema} - OpenAPI 3.1
 */

export const buildOpenApiDocument = (): JsonSchema => ({
  openapi: '3.1.0',
  info: OPENAPI_INFO,
  components: {
    ...COMPONENTS,
    securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: SESSION_COOKIE } },
  },
  paths: Object.fromEntries(
    OPENAPI_MANIFEST.map(({ path, handlers }) => [
      path,
      Object.fromEntries(
        Object.entries(handlers).map(([method, handler]) => [
          method.toLowerCase(),
          operationOf(method, path, handler),
        ])
      ),
    ])
  ),
})
