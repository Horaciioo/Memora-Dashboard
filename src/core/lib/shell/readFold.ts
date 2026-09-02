import 'server-only'

import { cookies } from 'next/headers'

import { SIDEBAR_FOLD_COOKIE, SIDEBAR_FOLDED } from '@/core/lib/shell/fold'

/**
 * Read the fold the browser last remembered
 * @return {Promise<boolean>} - Rail folded to glyphs
 */

export const readSidebarFold = async (): Promise<boolean> => {
  const store = await cookies()

  return store.get(SIDEBAR_FOLD_COOKIE)?.value === SIDEBAR_FOLDED
}
