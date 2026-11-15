'use client'

import { GlitchLoadScene } from '@/composites/play/glitch/loading/GlitchLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'

/**
 * Glitch loading: its scene on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const GlitchLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={GlitchLoadScene} />
)
