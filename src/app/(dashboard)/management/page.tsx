import { redirect } from 'next/navigation'
import { requireManagement } from '@/core/wrappers/requireManagement'
import { MANAGEMENT_PAGES, managementHref } from '@/declarations/management/pages'

/**
 * Not a page of its own, opens the first board the viewer may read
 * @return {Promise<never>} - Redirect
 */

export default async function ManagementPage() {
  const { access } = await requireManagement(MANAGEMENT_PAGES.map((page) => page.permission))
  const first = MANAGEMENT_PAGES.find((page) => access.can(page.permission))!

  redirect(managementHref(first.key))
}
