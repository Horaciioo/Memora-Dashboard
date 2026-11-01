'use client'

import { useEffect } from 'react'

import { wipeOfflinePages } from '@/core/lib/pages/offline/store'

/**
 * Erase offline pages once nobody is signed in
 * @return {null}
 */

export const OfflineWipe = () => {
  useEffect(() => {
    void wipeOfflinePages()
  }, [])

  return null
}
