'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import type { ShareTarget } from '@/core/hooks/data/pages'
import { useMentionable } from '@/core/hooks/data/system/useMentionable'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SHARE_PANEL_STYLES } from '@/declarations/ui/variants'

export interface ShareInviteProps {
  // Accounts already reached
  excluded: string[]
  onPick: (target: ShareTarget) => void
}

/**
 * Search field adding a person or a whole role
 * @param {ShareInviteProps} props - Excluded accounts and pick handler
 * @return {JSX.Element}
 */

export const ShareInvite = ({ excluded, onPick }: ShareInviteProps) => {
  const [term, setTerm] = useState('')
  const people = useMentionable(term.trim() ? term : null).filter(
    (person) => !excluded.includes(person.id)
  )
  const needle = term.trim().toLowerCase()
  const roles = ROLE_REGISTRY.keys.filter(
    (role) => needle && ROLE_REGISTRY.get(role).plural.toLowerCase().includes(needle)
  )
  const RolesIcon = ICONS.roles

  const pick = (target: ShareTarget) => {
    onPick(target)
    setTerm('')
  }

  return (
    <div className={SHARE_PANEL_STYLES.invite}>
      <input
        type="search"
        value={term}
        aria-label={PAGE_SHARE_COPY.invitePlaceholder}
        placeholder={PAGE_SHARE_COPY.invitePlaceholder}
        className={SHARE_PANEL_STYLES.inviteInput}
        onChange={(event) => setTerm(event.target.value)}
      />
      {needle && (
        <div
          role="listbox"
          aria-label={PAGE_SHARE_COPY.invitePlaceholder}
          className={SHARE_PANEL_STYLES.suggestions}
        >
          {people.length === 0 && roles.length === 0 && (
            <p className={SHARE_PANEL_STYLES.empty}>{PAGE_SHARE_COPY.inviteEmpty}</p>
          )}
          {people.length > 0 && (
            <p className={SHARE_PANEL_STYLES.group}>{PAGE_SHARE_COPY.peopleGroup}</p>
          )}
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              role="option"
              aria-selected={false}
              className={SHARE_PANEL_STYLES.suggestion}
              onClick={() => pick({ scope: 'ACCOUNT', accountId: person.id })}
            >
              <Avatar name={person.name} src={person.image} size="xs" />
              <span className={SHARE_PANEL_STYLES.name}>{person.name}</span>
              {person.hint && <span className={SHARE_PANEL_STYLES.hint}>{person.hint}</span>}
            </button>
          ))}
          {roles.length > 0 && (
            <p className={SHARE_PANEL_STYLES.group}>{PAGE_SHARE_COPY.rolesGroup}</p>
          )}
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              role="option"
              aria-selected={false}
              className={SHARE_PANEL_STYLES.suggestion}
              onClick={() => pick({ scope: 'ROLE', role })}
            >
              <RolesIcon className={SHARE_PANEL_STYLES.rowGlyph} aria-hidden="true" />
              <span className={SHARE_PANEL_STYLES.name}>
                {PAGE_SHARE_COPY.role.replace('{role}', ROLE_REGISTRY.get(role).plural)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
