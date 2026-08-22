import pagination from '@/configurations/system/pagination.json'
import { readInteger } from '@/declarations/configurations/readers'

const maxPerPage = readInteger(pagination.maxPerPage, {
  path: 'system/pagination.maxPerPage',
  fallback: 100,
  min: 1,
})

const defaultPerPage = readInteger(pagination.defaultPerPage, {
  path: 'system/pagination.defaultPerPage',
  fallback: 25,
  min: 1,
  max: maxPerPage,
})

/**
 * Pagination settings
 * @type {{ defaultPerPage: number, maxPerPage: number }}
 */

export const PAGINATION_SETTINGS = { defaultPerPage, maxPerPage }
