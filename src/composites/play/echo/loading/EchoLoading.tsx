'use client'

import { EchoLoadScene } from '@/composites/play/echo/loading/EchoLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'

/**
 * Echo loading: its scene on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const EchoLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={EchoLoadScene} />
)
