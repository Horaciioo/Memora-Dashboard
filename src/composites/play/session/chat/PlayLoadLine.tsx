'use client'

import Image from 'next/image'

import type { PlaySessionLoad } from '@/core/hooks/interaction/state/play/usePlaySessionLoad'
import { APP_ASSETS } from '@/declarations/app'
import { fillPlayMessage, PLAY_SESSION_LOAD } from '@/declarations/play'
import { BAC_SESSION } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/modview'

/**
 * Memora's feed line telling how the table loads, updated at each step
 * @param {Object} props - Loading
 * @param {PlaySessionLoad} props.load - Status and percent
 * @return {JSX.Element}
 */

export const PlayLoadLine = ({ load }: { load: PlaySessionLoad }) => {
  const text =
    load.status === 'done'
      ? PLAY_SESSION_LOAD.done
      : load.status === 'failed'
        ? PLAY_SESSION_LOAD.failed
        : fillPlayMessage(PLAY_SESSION_LOAD.loading, { percent: Math.round(load.percent) })

  return (
    <li className={BAC_SESSION.feedLine} role="status">
      <Image
        src={APP_ASSETS.brain}
        alt=""
        width={24}
        height={24}
        className={BAC_SESSION.feedBrain}
      />
      <span className={BAC_SESSION.feedText}>
        <span className={BAC_SESSION.feedName}>{PLAY_SESSION_LOAD.author} </span>
        <span className={cn(load.status === 'failed' && BAC_SESSION.feedFailed)}>{text}</span>
      </span>
      <span className={BAC_SESSION.feedTime}>{formatClock(new Date(load.at).toISOString())}</span>
    </li>
  )
}
