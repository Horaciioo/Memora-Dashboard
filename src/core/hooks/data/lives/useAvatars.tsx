'use client'

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { createAvatarBook } from '@/core/lib/modview/avatarBook'
import type { AvatarBook } from '@/core/lib/modview/avatarBook'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'

// No book off a real live
const AvatarContext = createContext<AvatarBook | null>(null)

/**
 * Pictures of one live's chatters
 * @param {string} liveId - Live
 * @param {ReactNode} children - Mod View
 * @return {JSX.Element}
 */

export const AvatarProvider = ({ liveId, children }: { liveId: string; children: ReactNode }) => {
  const book = useMemo(
    () =>
      createAvatarBook(async (ids) => {
        // One request per batch the server accepts
        const size = LIVE_SETTINGS.avatarBatchMax
        const parts = await Promise.all(
          Array.from({ length: Math.ceil(ids.length / size) }, (_, index) =>
            apiGet<Record<string, string | null>>(
              API_ROUTES.liveAvatars(liveId, ids.slice(index * size, (index + 1) * size))
            )
          )
        )

        return Object.assign({}, ...parts)
      }),
    [liveId]
  )

  return <AvatarContext.Provider value={book}>{children}</AvatarContext.Provider>
}

/**
 * Picture of a chatter, none until learned
 * @param {string} id - Platform account
 * @return {string | null} - Picture address
 */

export const useAvatar = (id: string): string | null => {
  const book = useContext(AvatarContext)
  useEffect(() => book?.ask(id), [book, id])

  return useSyncExternalStore(
    (listener) => book?.subscribe(listener) ?? (() => undefined),
    () => book?.read(id) ?? null,
    () => null
  )
}
