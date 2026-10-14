'use client'

import { useMemo } from 'react'

import { TwitchStage } from '@/composites/recruitment/exercise/TwitchStage'
import { DiscordReplica } from '@/composites/replicas/discord/DiscordReplica'
import { useDiscordScene } from '@/core/hooks/interaction/useDiscordScene'
import { discordScene, twitchLines } from '@/core/lib/recruitment/contextScene'
import type { WrittenContext } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_PUBLIC_COPY } from '@/declarations/recruitment/exerciseCopy'
import { RecruitmentPlatforms } from '@/utils/constants/recruitment'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'

export interface ContextStageProps {
  context: WrittenContext
  platform: RecruitmentPlatformName
}

/**
 * Discord channel playing the situation
 * @param {Omit<ContextStageProps, 'platform'>} props - Component props
 * @return {JSX.Element}
 */

const DiscordStage = ({ context }: Omit<ContextStageProps, 'platform'>) => {
  const scene = useMemo(() => discordScene(context, EXERCISE_PUBLIC_COPY.serverName), [context])
  const { state } = useDiscordScene(scene.initial, scene.steps)

  return <DiscordReplica state={state} />
}

/**
 * The situation drawn like the platform of the campaign, played once from the start
 * @param {ContextStageProps} props - Component props
 * @return {JSX.Element}
 */

export const ContextStage = ({ context, platform }: ContextStageProps) =>
  platform === RecruitmentPlatforms.Twitch ? (
    <TwitchStage lines={twitchLines(context)} />
  ) : (
    <DiscordStage context={context} />
  )
