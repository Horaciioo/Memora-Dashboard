'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { queueRefresh } from '@/core/lib/realtime/refresh'

/**
 * Save the trophies pinned on the profile
 * @return {Object} - Saver and pending flag
 */

export const usePlayPins = () => {
  const router = useRouter()
  const client = useQueryClient()
  const { isSaving, run } = useMutation()

  const save = async (pins: string[]): Promise<boolean> => {
    const result = await run(() => apiPost(API_ROUTES.playPins, { pins }))
    if (result === null) return false
    await client.invalidateQueries({ queryKey: ['play'] })
    queueRefresh(() => router.refresh())

    return true
  }

  return { isSaving, save }
}
