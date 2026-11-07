'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_BOX, PLAY_GROUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { foldText } from '@/utils/format/strings'

export interface PlayGroupInviteProps {
  groupId: string
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
}

/**
 * Search field: nobody listed until something is typed, tick several, one send
 * @param {PlayGroupInviteProps} props - Group and people who can be called
 * @return {JSX.Element}
 */

export const PlayGroupInvite = ({ groupId, candidates }: PlayGroupInviteProps) => {
  const actions = usePlayGroup()
  const SearchIcon = ICONS.search
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const needle = foldText(query)

  const shown = useMemo(
    () =>
      needle
        ? candidates
            .filter((person) => foldText(person.displayName).includes(needle))
            .sort((a, b) => Number(onlineIds.has(b.id)) - Number(onlineIds.has(a.id)))
        : [],
    // Online ids change with the room
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [candidates, needle, onlineIds.size]
  )

  return (
    <div className={PLAY_GROUP.section}>
      <div className={PLAY_BOX.search}>
        <SearchIcon className={PLAY_BOX.searchIcon} aria-hidden="true" />
        <input
          autoFocus
          value={query}
          placeholder={PLAY_GROUP_COPY.inviteSearch}
          aria-label={PLAY_GROUP_COPY.inviteSearch}
          className={PLAY_BOX.searchInput}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {needle && shown.length === 0 && (
        <p className={PLAY_BOX.hint}>{PLAY_GROUP_COPY.inviteEmpty}</p>
      )}
      {shown.length > 0 && (
        <div className={PLAY_GROUP.pick}>
          {shown.map((person) => {
            const isOn = picked.includes(person.id)

            return (
              <button
                key={person.id}
                type="button"
                aria-pressed={isOn}
                className={cn(PLAY_GROUP.pickRow, isOn && PLAY_GROUP.pickRowOn)}
                onClick={() =>
                  setPicked(isOn ? picked.filter((id) => id !== person.id) : [...picked, person.id])
                }
              >
                <Avatar name={person.displayName} src={person.avatarUrl} size="sm" />
                <span className={PLAY_GROUP.rowText}>{person.displayName}</span>
                {onlineIds.has(person.id) && (
                  <span className={PLAY_GROUP.rowOnline} aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
      {picked.length > 0 && (
        <Button
          variant="arcade"
          isLoading={actions.isSaving}
          onClick={async () => {
            if (await actions.invite(groupId, picked)) setPicked([])
          }}
        >
          {fillPlayMessage(PLAY_GROUP_COPY.inviteSend, { count: picked.length })}
        </Button>
      )}
    </div>
  )
}
