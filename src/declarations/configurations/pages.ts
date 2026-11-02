import pages from '@/configurations/system/pages.json'
import { readInteger } from '@/declarations/configurations/readers'

/**
 * Private pages settings
 * @type {Record<string, number>}
 */

export const PAGE_SETTINGS = {
  titleMaxLength: readInteger(pages.titleMaxLength, {
    path: 'system/pages.titleMaxLength',
    fallback: 200,
    min: 1,
  }),
  categoryNameMaxLength: readInteger(pages.categoryNameMaxLength, {
    path: 'system/pages.categoryNameMaxLength',
    fallback: 60,
    min: 1,
  }),
  categoriesMax: readInteger(pages.categoriesMax, {
    path: 'system/pages.categoriesMax',
    fallback: 50,
    min: 1,
  }),
  documentMaxBytes: readInteger(pages.documentMaxBytes, {
    path: 'system/pages.documentMaxBytes',
    fallback: 1_048_576,
    min: 1024,
  }),
  documentMaxNodes: readInteger(pages.documentMaxNodes, {
    path: 'system/pages.documentMaxNodes',
    fallback: 20_000,
    min: 10,
  }),
  documentMaxDepth: readInteger(pages.documentMaxDepth, {
    path: 'system/pages.documentMaxDepth',
    fallback: 12,
    min: 3,
  }),
  treeMaxDepth: readInteger(pages.treeMaxDepth, {
    path: 'system/pages.treeMaxDepth',
    fallback: 16,
    min: 1,
  }),
  autosaveMs: readInteger(pages.autosaveMs, {
    path: 'system/pages.autosaveMs',
    fallback: 800,
    min: 100,
  }),
  autosaveMaxWaitMs: readInteger(pages.autosaveMaxWaitMs, {
    path: 'system/pages.autosaveMaxWaitMs',
    fallback: 5000,
    min: 500,
  }),
  revisionEveryMinutes: readInteger(pages.revisionEveryMinutes, {
    path: 'system/pages.revisionEveryMinutes',
    fallback: 10,
    min: 1,
  }),
  revisionsKept: readInteger(pages.revisionsKept, {
    path: 'system/pages.revisionsKept',
    fallback: 50,
    min: 1,
  }),
  searchResults: readInteger(pages.searchResults, {
    path: 'system/pages.searchResults',
    fallback: 20,
    min: 1,
  }),
  commentMaxLength: readInteger(pages.commentMaxLength, {
    path: 'system/pages.commentMaxLength',
    fallback: 2000,
    min: 1,
  }),
  offlinePages: readInteger(pages.offlinePages, {
    path: 'system/pages.offlinePages',
    fallback: 20,
    min: 0,
  }),
  offlineDays: readInteger(pages.offlineDays, {
    path: 'system/pages.offlineDays',
    fallback: 7,
    min: 1,
  }),
} as const
