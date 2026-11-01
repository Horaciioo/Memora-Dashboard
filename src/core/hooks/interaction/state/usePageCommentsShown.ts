'use client'

import { usePersistedFlag } from '@/core/hooks/interaction/state/usePersistedFlag'

/**
 * Comment rail shown beside pages
 * @return {{ isShown: boolean, setShown: (shown: boolean) => void }} - Visibility and setter
 */

export const usePageCommentsShown = () => {
  const [isShown, setShown] = usePersistedFlag('memora:pages:comments:v1', true)

  return { isShown, setShown }
}
