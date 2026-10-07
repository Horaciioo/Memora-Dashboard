'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConversationFeed } from '@/composites/academy/course/ConversationFeed'
import { ModView } from '@/composites/modview/ModView'
import { useChatReplay } from '@/core/hooks/interaction/useChatReplay'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import type { ModViewScene, SceneStep } from '@/core/lib/modview/scene'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ConversationLine } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_CONVERSATION, COURSE_SCENE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SceneStageProps {
  scene: ModViewScene
  conversation?: ConversationLine[]
  reaction?: SceneStep[]
  actorName: string
}

interface SceneRunProps extends SceneStageProps {
  onReplay: () => void
}

/**
 * One run: the live goes on while the team talks, then updates
 * @param {SceneStageProps} props - Scene
 * @return {JSX.Element}
 */

const SceneRun = ({
  scene,
  conversation = [],
  reaction = [],
  actorName,
  onReplay,
}: SceneRunProps) => {
  const hasTalk = conversation.length > 0
  const talk = useChatReplay(conversation.length, hasTalk, ACADEMY_SETTINGS.conversationLineMs)

  // Updates land once the talk is over
  const played = useMemo(() => {
    const talkMs = conversation.length * ACADEMY_SETTINGS.conversationLineMs
    const late = reaction.map((step) => ({ ...step, at: step.at + talkMs }))

    return { ...scene, steps: [...scene.steps, ...late].sort((a, b) => a.at - b.at) }
  }, [scene, conversation.length, reaction])
  const { driver } = useModViewScene(played, { actorName })

  const replay = (
    <div className={COURSE_SCENE.controls}>
      <Button variant="secondary" icon="refresh" onClick={onReplay}>
        {COURSE_COPY.sceneReplay}
      </Button>
    </div>
  )
  const stage = (
    <div className={cn(COURSE_SCENE.stage, hasTalk && COURSE_CONVERSATION.stage)}>
      <ModView
        driver={driver}
        permissions={previewPermissions('JUNIOR')}
        panel={null}
        levelName={null}
        embedded
      />
    </div>
  )

  // Replay sits under the talk it restarts
  if (hasTalk)
    return (
      <div className={COURSE_CONVERSATION.layout}>
        <div className={COURSE_CONVERSATION.side}>
          <ConversationFeed lines={conversation} shown={talk.shown} />
          {replay}
        </div>
        {stage}
      </div>
    )

  return (
    <div className={COURSE_SCENE.narrow}>
      {stage}
      {replay}
    </div>
  )
}

/**
 * Case study stage with its replay button
 * @param {SceneStageProps} props - Scene
 * @return {JSX.Element}
 */

export const SceneStage = (props: SceneStageProps) => {
  const [run, setRun] = useState(0)

  return <SceneRun key={run} {...props} onReplay={() => setRun(run + 1)} />
}
