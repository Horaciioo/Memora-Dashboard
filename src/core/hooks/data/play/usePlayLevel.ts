'use client'

import { usePlayProfile } from '@/core/hooks/data/play/usePlayProfile'

/**
 * Global Play level of the signed-in member, none without Play access
 * @return {number | null} - Level
 */

export const usePlayLevel = (): number | null => usePlayProfile()?.global.level.level ?? null
