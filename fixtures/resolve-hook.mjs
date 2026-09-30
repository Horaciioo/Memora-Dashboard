import { existsSync } from 'node:fs'

const SOURCE = new URL('../src/', import.meta.url)
const EXTENSIONS = ['.ts', '/index.ts']

/**
 * First file a bare module path points at, extension added
 * @param {URL} base - Path without extension
 * @return {string | null} - File URL
 */

const withExtension = (base) => {
  if (/\.[cm]?[jt]sx?$/.test(base.pathname) && existsSync(base)) return base.href

  for (const extension of EXTENSIONS) {
    const candidate = new URL(`${base.href}${extension}`)
    if (existsSync(candidate)) return candidate.href
  }

  return null
}

/**
 * Resolve @/ aliases and extensionless relative imports inside src
 * @param {string} specifier - Imported path
 * @param {object} context - Resolution context
 * @param {Function} next - Default resolver
 * @return {Promise<object>} - Resolution
 */

export const resolve = async (specifier, context, next) => {
  if (specifier.startsWith('@/')) {
    const url = withExtension(new URL(specifier.slice(2), SOURCE))
    if (url) return next(url, context)
  }

  const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
  if (isRelative && context.parentURL?.startsWith(SOURCE.href)) {
    const url = withExtension(new URL(specifier, context.parentURL))
    if (url) return next(url, context)
  }

  return next(specifier, context)
}
