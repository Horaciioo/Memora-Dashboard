'use client'

import { useState } from 'react'

import type { SessionUser } from '@/types/auth'

/**
 * Session user result
 * @typedef {Object} SessionUserResult
 * @property {SessionUser | null} data - Session
 * @property {boolean} isLoading - Loading
 */

interface SessionUserResult {
  data: SessionUser | null
  isLoading: boolean
}

/**
 * Use session user
 * @param {SessionUser | null} [initialSession] - Initial
 * @return {SessionUserResult} - Result
 */

export const useSessionUser = (initialSession?: SessionUser | null): SessionUserResult => {
  const [data] = useState(initialSession ?? null)

  return { data, isLoading: false }
}
