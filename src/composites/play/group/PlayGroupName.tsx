'use client'

import { useState } from 'react'

import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { PLAY_GROUP_COPY, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_GROUP } from '@/declarations/ui/variants'

/**
 * Group name, a click on it edits it in place for the host
 * @param {Object} props - Name
 * @param {string} props.groupId - Group
 * @param {string} props.name - Current name
 * @param {boolean} props.isHost - May rename
 * @return {JSX.Element}
 */

export const PlayGroupName = ({
  groupId,
  name,
  isHost,
}: {
  groupId: string
  name: string
  isHost: boolean
}) => {
  const group = usePlayGroup()
  const [draft, setDraft] = useState<string | null>(null)

  const save = async () => {
    const next = draft?.trim()
    setDraft(null)
    if (next && next !== name) await group.rename(groupId, next)
  }

  if (!isHost) return <h1 className={PLAY_GROUP.name}>{name}</h1>
  if (draft === null) {
    return (
      <button
        type="button"
        title={PLAY_GROUP_COPY.rename}
        className={PLAY_GROUP.name}
        onClick={() => setDraft(name)}
      >
        {name}
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={draft}
      maxLength={PLAY_SETTINGS.group.nameMax}
      aria-label={PLAY_GROUP_COPY.rename}
      className={PLAY_GROUP.nameInput}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void save()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') void save()
        if (event.key === 'Escape') setDraft(null)
      }}
    />
  )
}
