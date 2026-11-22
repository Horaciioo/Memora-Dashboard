'use client'

import { Button } from '@/components/elements/actions/Button'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage } from '@/declarations/play'
import {
  PLAY_GROUP_QUEST_BOOST,
  PLAY_GROUP_QUEST_COPY,
  PLAY_GROUP_QUESTS,
} from '@/declarations/play/groupQuests'
import { PLAY_CREW, PLAY_GROUP_QUEST } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'

/**
 * Quests box: the running quest with each member's feats, or the choice of the next one
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @return {JSX.Element}
 */

export const PlayGroupQuests = ({ group }: { group: PlayGroupView }) => {
  const actions = usePlayGroup()
  const { quest } = group
  const isRunning = Boolean(quest && !quest.isDone)
  const shown = quest ? (quest.isDone ? quest.target : quest.done) : 0
  const names = new Map(group.members.map((member) => [member.accountId, member]))

  return (
    <section className={PLAY_CREW.box} aria-label={PLAY_GROUP_QUEST_COPY.title}>
      <h2 className={PLAY_CREW.boxTitle}>{PLAY_GROUP_QUEST_COPY.title}</h2>
      {quest && (
        <div className={PLAY_GROUP_QUEST.card}>
          <span className={PLAY_GROUP_QUEST.name}>{quest.title}</span>
          <span className={PLAY_GROUP_QUEST.hint}>{quest.hint}</span>
          <div className={PLAY_GROUP_QUEST.barRow}>
            <div
              className={PLAY_GROUP_QUEST.bar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={quest.target}
              aria-valuenow={shown}
            >
              <div
                className={PLAY_GROUP_QUEST.barFill}
                style={{
                  width: `${(shown / quest.target) * 100}%`,
                }}
              />
            </div>
            <span className={PLAY_GROUP_QUEST.count}>
              {fillPlayMessage(PLAY_GROUP_QUEST_COPY.progress, {
                done: shown,
                target: quest.target,
              })}
            </span>
          </div>
          <span className={PLAY_GROUP_QUEST.reward}>
            {quest.isDone
              ? PLAY_GROUP_QUEST_COPY.done
              : `${fillPlayMessage(PLAY_GROUP_QUEST_COPY.reward, { xp: quest.xp })} · ${fillPlayMessage(PLAY_GROUP_QUEST_COPY.boostReward, PLAY_GROUP_QUEST_BOOST)}`}
          </span>
          {isRunning && (
            <ul className={PLAY_GROUP_QUEST.feats} aria-label={PLAY_GROUP_QUEST_COPY.members}>
              {quest.feats.map((feat) => {
                const member = names.get(feat.accountId)

                return member ? (
                  <li key={feat.accountId} className={PLAY_GROUP_QUEST.feat}>
                    <PlayAvatar
                      accountId={member.accountId}
                      name={member.name}
                      src={member.avatarUrl}
                      size="xs"
                    />
                    <span className={PLAY_GROUP_QUEST.featName}>{member.name}</span>
                    <span className={PLAY_GROUP_QUEST.featCount}>{feat.count}</span>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      )}
      {quest && isRunning && (
        <p className={PLAY_GROUP_QUEST.note}>
          {quest.isEligible ? PLAY_GROUP_QUEST_COPY.rule : PLAY_GROUP_QUEST_COPY.late}
        </p>
      )}
      {!isRunning && group.isHost && (
        <>
          <h3 className={PLAY_CREW.boxTitle}>
            {quest ? PLAY_GROUP_QUEST_COPY.next : PLAY_GROUP_QUEST_COPY.pick}
          </h3>
          <ul className={PLAY_GROUP_QUEST.pick}>
            {PLAY_GROUP_QUESTS.map((template) => (
              <li key={template.key} className={PLAY_GROUP_QUEST.option}>
                <span className={PLAY_GROUP_QUEST.optionText}>
                  <span className={PLAY_GROUP_QUEST.optionName}>{template.title}</span>
                  <span className={PLAY_GROUP_QUEST.optionXp}>
                    {fillPlayMessage(PLAY_GROUP_QUEST_COPY.reward, { xp: template.xp })}
                  </span>
                </span>
                <Button
                  variant="arcadeSmall"
                  disabled={actions.isSaving}
                  onClick={() => void actions.startQuest(group.id, template.key)}
                >
                  {PLAY_GROUP_QUEST_COPY.start}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!isRunning && !group.isHost && (
        <p className={PLAY_GROUP_QUEST.note}>
          {quest ? PLAY_GROUP_QUEST_COPY.waitHost : PLAY_GROUP_QUEST_COPY.none}
        </p>
      )}
    </section>
  )
}
