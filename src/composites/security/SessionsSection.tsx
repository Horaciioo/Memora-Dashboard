'use client'

import { Button } from '@/components/elements/actions/Button'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import type { SessionsState } from '@/core/hooks/data/people/useSessions'
import { SECURITY_COPY } from '@/declarations/preferences/settings'
import { ICONS } from '@/declarations/ui/icons'
import { SESSION_LIST } from '@/declarations/ui/variants'
import { deviceLabel, readDevice } from '@/utils/format/device'
import { formatSince } from '@/utils/format/dates'

export interface SessionsSectionProps {
  state: SessionsState
}

/**
 * Devices signed in to the account, each one closable
 * @param {SessionsState} state - Sessions and their mutations
 * @return {JSX.Element}
 */

export const SessionsSection = ({ state }: SessionsSectionProps) => {
  const { sessions, isSaving, close, closeOthers } = state
  const others = sessions.filter((session) => !session.isCurrent)

  return (
    <SettingsGroup title={SECURITY_COPY.sessionsSectionTitle}>
      <ul className={SESSION_LIST.list}>
        {sessions.map((session) => {
          const Glyph = ICONS[readDevice(session.userAgent).icon]

          return (
            <li key={session.id} className={SESSION_LIST.row}>
              <Glyph className={SESSION_LIST.glyph} aria-hidden="true" />
              <div className={SESSION_LIST.body}>
                <p className={SESSION_LIST.title}>
                  {deviceLabel(session.userAgent, SECURITY_COPY.unknownDevice)}
                  {session.isCurrent && (
                    <span className={SESSION_LIST.current}>{SECURITY_COPY.thisDevice}</span>
                  )}
                </p>
                <p className={SESSION_LIST.meta}>
                  {SECURITY_COPY.lastUsed} {formatSince(session.lastUsedAt).toLowerCase()}
                </p>
              </div>
              {!session.isCurrent && (
                <Button variant="ghost" disabled={isSaving} onClick={() => void close(session.id)}>
                  {SECURITY_COPY.closeOne}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      <div className={SESSION_LIST.footer}>
        <span className={SESSION_LIST.meta}>
          {others.length === 0 ? SECURITY_COPY.onlySession : ''}
        </span>
        {others.length > 0 && (
          <Button variant="secondary" disabled={isSaving} onClick={() => void closeOthers()}>
            {SECURITY_COPY.closeOthers}
          </Button>
        )}
      </div>
    </SettingsGroup>
  )
}
