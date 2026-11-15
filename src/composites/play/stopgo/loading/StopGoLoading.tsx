'use client'

import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { StopGoLoadScene } from '@/composites/play/stopgo/loading/StopGoLoadScene'
import { STOPGO_LOADING_TIPS } from '@/declarations/play/stopgo/loadingTips'

/**
 * Stop & Go loading: the starting grid on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const StopGoLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={StopGoLoadScene} tips={STOPGO_LOADING_TIPS} />
)
