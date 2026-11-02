import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { canOwnPages } from '@/core/lib/pages'
import type { PageViewer } from '@/core/lib/pages'
import { nextPosition } from '@/core/services/pages/lookups'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_DOCUMENT_COPY } from '@/declarations/pages/copy'
import type { PageCategoryView } from '@/types/pages'

const CATEGORY_SELECT = { id: true, name: true, position: true } as const

/**
 * Category name, trimmed and bounded
 * @param {unknown} value - Raw name
 * @return {string} - Name
 */

const readName = (value: unknown): string => {
  const name = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  if (!name || name.length > PAGE_SETTINGS.categoryNameMaxLength) {
    throw invalidInput([{ field: 'name', message: PAGE_DOCUMENT_COPY.categoryName }])
  }

  return name
}

/**
 * Category of a member
 * @param {unknown} categoryId - Raw id
 * @param {PageViewer} viewer - Member owning it
 * @return {Promise<PageCategoryView>} - Category
 */

export const requireCategory = async (
  categoryId: unknown,
  viewer: PageViewer
): Promise<PageCategoryView> => {
  const row =
    typeof categoryId === 'string'
      ? await prisma.pageCategory.findFirst({
          where: { id: categoryId, ownerId: viewer.id },
          select: CATEGORY_SELECT,
        })
      : null
  if (!row) throw notFound(PAGE_DOCUMENT_COPY.categoryTarget)

  return row
}

/**
 * Categories of a member, in order
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<PageCategoryView[]>} - Categories
 */

export const listCategories = async (viewer: PageViewer): Promise<PageCategoryView[]> =>
  prisma.pageCategory.findMany({
    where: { ownerId: viewer.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    select: CATEGORY_SELECT,
  })

/**
 * Add a category after the others
 * @param {PageViewer} viewer - Member creating
 * @param {Object} input - Category
 * @param {unknown} input.name - Raw name
 * @return {Promise<PageCategoryView>} - New category
 */

export const createCategory = async (
  viewer: PageViewer,
  input: { name: unknown }
): Promise<PageCategoryView> => {
  if (!canOwnPages(viewer)) throw forbidden()

  const name = readName(input.name)
  const count = await prisma.pageCategory.count({ where: { ownerId: viewer.id } })
  if (count >= PAGE_SETTINGS.categoriesMax) {
    throw invalidInput([], PAGE_DOCUMENT_COPY.categoryLimit)
  }

  return prisma.pageCategory.create({
    data: { ownerId: viewer.id, name, position: count },
    select: CATEGORY_SELECT,
  })
}

/**
 * Rename a category, or drop it at a position
 * @param {unknown} categoryId - Category id
 * @param {PageViewer} viewer - Member owning it
 * @param {Record<string, unknown>} raw - Changed fields
 * @return {Promise<PageCategoryView>} - Category
 */

export const updateCategory = async (
  categoryId: unknown,
  viewer: PageViewer,
  raw: Record<string, unknown>
): Promise<PageCategoryView> => {
  const category = await requireCategory(categoryId, viewer)

  if ('name' in raw) {
    await prisma.pageCategory.update({
      where: { id: category.id },
      data: { name: readName(raw.name) },
    })
  }

  // Renumber the row of categories
  if (typeof raw.position === 'number') {
    const others = await prisma.pageCategory.findMany({
      where: { ownerId: viewer.id, id: { not: category.id } },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    })
    const index = Math.max(0, Math.min(others.length, Math.floor(raw.position)))
    const order = [...others.slice(0, index), { id: category.id }, ...others.slice(index)]

    await prisma.$transaction(
      order.map((row, position) =>
        prisma.pageCategory.update({ where: { id: row.id }, data: { position } })
      )
    )
  }

  return requireCategory(category.id, viewer)
}

/**
 * Remove a category, its pages go back to the root
 * @param {unknown} categoryId - Category id
 * @param {PageViewer} viewer - Member owning it
 * @return {Promise<void>} - Removed
 */

export const deleteCategory = async (categoryId: unknown, viewer: PageViewer): Promise<void> => {
  const category = await requireCategory(categoryId, viewer)
  const start = await nextPosition(null, viewer.id)

  // Pages land after the loose ones
  const pages = await prisma.page.findMany({
    where: { categoryId: category.id },
    orderBy: { position: 'asc' },
    select: { id: true },
  })

  await prisma.$transaction([
    ...pages.map((page, index) =>
      prisma.page.update({
        where: { id: page.id },
        data: { categoryId: null, position: start + index },
      })
    ),
    prisma.pageCategory.delete({ where: { id: category.id } }),
  ])
}
