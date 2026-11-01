'use client'

import { useRef } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { LevelMatrix } from '@/composites/pages/share/LevelMatrix'
import { LevelSelect } from '@/composites/pages/share/LevelSelect'
import { ShareInvite } from '@/composites/pages/share/ShareInvite'
import { ShareRow } from '@/composites/pages/share/ShareRow'
import { usePageSharing } from '@/core/hooks/data/pages'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { levelAllows } from '@/core/lib/pages'
import { DEFAULT_GRANT_LEVEL, PAGE_LEVELS, PageShareScopes } from '@/declarations/pages/access'
import { PAGE_ACCESS_COPY, PAGE_SHARE_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { SHARE_PANEL_STYLES } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { PageDetail, PageShare } from '@/types/pages'

export interface SharePanelProps {
  page: PageDetail
  onClose: () => void
}

/**
 * Hint under an audience
 * @param {PageShare} share - Share
 * @return {string | null} - Hint
 */

const shareHint = (share: PageShare): string | null =>
  share.fromPage ? PAGE_SHARE_COPY.inheritedFrom.replace('{parent}', share.fromPage.title || PAGES_COPY.untitled) : null

/**
 * Share popover: invite, general access, who has access
 * @param {SharePanelProps} props - Page and close handler
 * @return {JSX.Element}
 */

export const SharePanel = ({ page, onClose }: SharePanelProps) => {
  const boundary = useRef<HTMLDivElement>(null)
  const { session } = useAuthContext()
  const { sharing, share, unshare, setInherit } = usePageSharing(page.id, true)
  useOutsideDismiss(true, boundary, onClose)

  const level = sharing?.level ?? page.level
  const canShare = levelAllows(level, 'share') && !page.trashedAt
  const ceiling = PAGE_LEVELS.get(level).rank
  const own = sharing?.shares.filter((entry) => !entry.fromPage) ?? []
  const inherited = sharing?.shares.filter((entry) => entry.fromPage) ?? []
  const workspace = own.find((entry) => entry.scope === PageShareScopes.Workspace)

  return (
    <div ref={boundary} role="dialog" aria-label={PAGE_SHARE_COPY.title} className={SHARE_PANEL_STYLES.panel}>
      {canShare && (
        <ShareInvite
          excluded={[...own.map((entry) => entry.accountId ?? ''), sharing?.owner.id ?? '']}
          onPick={(target) => void share(target, DEFAULT_GRANT_LEVEL)}
        />
      )}

      <p className={SHARE_PANEL_STYLES.section}>{PAGE_SHARE_COPY.generalAccess}</p>
      <ul className={SHARE_PANEL_STYLES.list}>
        <ShareRow
          name={workspace ? PAGE_SHARE_COPY.workspace : PAGE_SHARE_COPY.restricted}
          icon={workspace ? 'globe' : 'lock'}
          hint={workspace ? PAGE_SHARE_COPY.workspaceHint : PAGE_SHARE_COPY.workspaceOff}
          control={
            canShare &&
            (workspace ? (
              <LevelSelect value={workspace.level} ceiling={ceiling} onChange={(next) => void share({ scope: 'WORKSPACE' }, next)} onRemove={() => void unshare(workspace.id)} />
            ) : (
              <button type="button" className={SHARE_PANEL_STYLES.link} onClick={() => void share({ scope: 'WORKSPACE' }, 'VIEW')}>
                {PAGE_SHARE_COPY.workspaceEnable}
              </button>
            ))
          }
        />
      </ul>

      <p className={SHARE_PANEL_STYLES.section}>{PAGE_SHARE_COPY.peopleWithAccess}</p>
      <ul className={SHARE_PANEL_STYLES.list}>
        {sharing && (
          <ShareRow
            name={`${sharing.owner.name}${sharing.owner.id === session?.id ? ` ${PAGE_SHARE_COPY.you}` : ''}`}
            image={sharing.owner.image}
            control={<span className={SHARE_PANEL_STYLES.fixed}>{PAGE_ACCESS_COPY.owner}</span>}
          />
        )}
        {own
          .filter((entry) => entry.scope !== PageShareScopes.Workspace)
          .map((entry) => (
            <ShareRow
              key={entry.id}
              name={entry.name}
              image={entry.image}
              icon={entry.scope === PageShareScopes.Role ? 'roles' : undefined}
              control={
                canShare ? (
                  <LevelSelect value={entry.level} ceiling={ceiling} onChange={(next) => void share({ scope: entry.scope, accountId: entry.accountId ?? undefined, role: entry.role ?? undefined }, next)} onRemove={() => void unshare(entry.id)} />
                ) : (
                  <span className={SHARE_PANEL_STYLES.fixed}>{PAGE_LEVELS.get(entry.level).label}</span>
                )
              }
            />
          ))}
        {inherited.map((entry) => (
          <ShareRow
            key={entry.id}
            name={entry.name}
            image={entry.image}
            icon={entry.scope === PageShareScopes.Account ? undefined : entry.scope === PageShareScopes.Role ? 'roles' : 'globe'}
            hint={shareHint(entry)}
            control={<span className={SHARE_PANEL_STYLES.fixed}>{PAGE_LEVELS.get(entry.level).label}</span>}
          />
        ))}
      </ul>

      {sharing?.parent && (
        <div className={SHARE_PANEL_STYLES.inherit}>
          <Toggle label={PAGE_SHARE_COPY.inherit} checked={sharing.inheritAccess} disabled={!canShare} onChange={(next) => void setInherit(next)} />
          <p className={SHARE_PANEL_STYLES.hint}>{PAGE_SHARE_COPY.inheritHint.replace('{parent}', sharing.parent.title || PAGES_COPY.untitled)}</p>
        </div>
      )}

      <LevelMatrix />
      <p className={SHARE_PANEL_STYLES.footer}>{PAGE_SHARE_COPY.linkHint}</p>
    </div>
  )
}
