import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  CONFIGURATION_FILES,
  CONFIGURATION_FOLDERS,
} from '@/declarations/nexus/inventory/configurations'
import type { ConfigurationFolder } from '@/declarations/nexus/inventory/configurations'

/**
 * Category of a configuration file
 * @typedef {Object} ConfigCategory
 * @property {string} id - Folder and file joined by a hyphen
 * @property {ConfigurationFolder} folder - Folder
 * @property {string} file - File name
 * @property {string} category - Folder/file, the reader path prefix
 */

export interface ConfigCategory {
  id: string
  folder: ConfigurationFolder
  file: string
  category: string
}

/**
 * Every configuration category
 * @type {ConfigCategory[]}
 */

export const CONFIG_CATEGORIES: ConfigCategory[] = CONFIGURATION_FOLDERS.flatMap((folder) =>
  CONFIGURATION_FILES[folder].map((file) => ({
    id: `${folder}-${file}`,
    folder,
    file,
    category: `${folder}/${file}`,
  }))
)

/**
 * Category from its typed id
 * @param {string} id - Typed segment
 * @return {ConfigCategory | undefined} - Category or undefined
 */

export const categoryOf = (id: string): ConfigCategory | undefined =>
  CONFIG_CATEGORIES.find((entry) => entry.id === id)

/**
 * Leaf values of a file by dotted key
 * @param {unknown} value - Parsed JSON
 * @param {string} [prefix] - Key so far
 * @return {Record<string, unknown>} - Leaves
 */

export const flattenLeaves = (value: unknown, prefix = ''): Record<string, unknown> => {
  const isLeaf =
    value === null ||
    typeof value !== 'object' ||
    (Array.isArray(value) && value.every((entry) => typeof entry !== 'object'))
  if (isLeaf) return prefix ? { [prefix]: value } : {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) =>
      Object.entries(flattenLeaves(entry, prefix ? `${prefix}.${key}` : key))
    )
  )
}

/**
 * Leaves of a file as shipped
 * @param {ConfigCategory} category - Category
 * @return {Record<string, unknown>} - Leaves by dotted key
 */

export const readFileLeaves = (category: ConfigCategory): Record<string, unknown> =>
  flattenLeaves(
    JSON.parse(
      readFileSync(
        join(process.cwd(), 'src', 'configurations', category.folder, `${category.file}.json`),
        'utf8'
      )
    )
  )
