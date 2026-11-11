'use client'

import { PinnedBar } from '@/composites/modview/PinnedBar'
import { PollBar } from '@/composites/modview/PollBar'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { cn } from '@/utils/classnames'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'

export interface MobileInfoTabProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
}

/**
 * What the chat carries apart from its lines: pin, polls and predictions, each in its box
 * @param {MobileInfoTabProps} props - Tab props
 * @return {JSX.Element}
 */

export const MobileInfoTab = ({ state, gate, onAct }: MobileInfoTabProps) => (
  <div className={cn(MODVIEW_MOBILE.scroll, MODVIEW_MOBILE.scrollEven)}>
    <section className={MODVIEW_MOBILE.box}>
      <h2 className={MODVIEW_MOBILE.boxTitle}>{COPY.pinned}</h2>
      {state.pinned ? (
        <PinnedBar key={state.pinned.messageId} pin={state.pinned} gate={gate} onAct={onAct} />
      ) : (
        <p className={MODVIEW_MOBILE.boxEmpty}>{COPY.noPinned}</p>
      )}
    </section>
    <section className={MODVIEW_MOBILE.box}>
      <h2 className={MODVIEW_MOBILE.boxTitle}>{COPY.polls}</h2>
      {state.poll ? (
        <PollBar key={state.poll.id} poll={state.poll} gate={gate} onAct={onAct} />
      ) : (
        <p className={MODVIEW_MOBILE.boxEmpty}>{COPY.noPoll}</p>
      )}
    </section>
    <section className={MODVIEW_MOBILE.box}>
      <h2 className={MODVIEW_MOBILE.boxTitle}>{COPY.predictions}</h2>
      <p className={MODVIEW_MOBILE.boxEmpty}>{COPY.noPrediction}</p>
    </section>
  </div>
)
