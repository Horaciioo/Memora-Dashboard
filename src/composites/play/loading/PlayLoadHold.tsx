'use client'

import { useEffect } from 'react'

import { usePlaySessionLoadStore } from '@/core/store/play/playSessionLoad'

/**
 * Keeps the session "loading" while it is mounted
 * @param {Object} props - Part
 * @param {string} props.name - Part being loaded
 * @return {null}
 */

export const PlayLoadHold = ({ name }: { name: string }) => {
  const hold = usePlaySessionLoadStore((state) => state.hold)
  useEffect(() => hold(name), [hold, name])

  return null
}
