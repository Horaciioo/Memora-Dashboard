/**
 * Device store of offline pages
 * @type {{ database: string, version: number, table: string }}
 */

export const PAGE_OFFLINE_STORE = {
  database: 'memora-pages',
  version: 1,
  table: 'pages',
} as const

