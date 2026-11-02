import { Avatar } from '@/components/elements/display/Avatar'
import { useTypedText } from '@/core/hooks/interaction/useTypedText'
import { SHOWCASE_COPY, SHOWCASE_SETTINGS, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { PAGE_ACCESS_COPY, PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SHARE_PANEL_STYLES, SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseShareProps {
  step: number
}

// Delay between two people
const PERSON_DELAY_MS = 220

/**
 * The share popover as the page opens it: invite, general access, who has access
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseShare = ({ step }: ShowcaseShareProps) => {
  const LockIcon = ICONS.lock
  const isSearching = step === SHOWCASE_STEPS.search
  const typed = useTypedText(SHOWCASE_COPY.search, isSearching, SHOWCASE_SETTINGS.typeMs / 2)
  const isPicked = step >= SHOWCASE_STEPS.pick

  return (
    <div role="dialog" aria-label={PAGE_SHARE_COPY.title} className={SHARE_PANEL_STYLES.panel}>
      <div className={SHARE_PANEL_STYLES.invite}>
        <span className={SHARE_PANEL_STYLES.inviteInput}>
          {typed ? (
            typed
          ) : (
            <span className={SHOWCASE.rowMeta}>{PAGE_SHARE_COPY.invitePlaceholder}</span>
          )}
        </span>
        {typed && (
          <div className={SHARE_PANEL_STYLES.suggestions}>
            <p className={SHARE_PANEL_STYLES.group}>{PAGE_SHARE_COPY.peopleGroup}</p>
            {SHOWCASE_COPY.people.map((person, index) => (
              <span
                key={person.name}
                data-showcase={index === 0 ? 'suggestion' : undefined}
                className={cn(
                  SHARE_PANEL_STYLES.suggestion,
                  index === 0 && 'bg-[var(--color-hover)]'
                )}
              >
                <Avatar name={person.name} src={null} size="xs" />
                <span className={SHARE_PANEL_STYLES.name}>{person.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className={SHARE_PANEL_STYLES.section}>{PAGE_SHARE_COPY.generalAccess}</p>
      <div className={SHARE_PANEL_STYLES.row}>
        <span className={SHARE_PANEL_STYLES.rowTile}>
          <LockIcon className={SHARE_PANEL_STYLES.rowGlyph} aria-hidden="true" />
        </span>
        <span className={SHARE_PANEL_STYLES.rowText}>
          <span className={SHARE_PANEL_STYLES.name}>{PAGE_SHARE_COPY.restricted}</span>
          <span className={SHARE_PANEL_STYLES.hint}>{PAGE_SHARE_COPY.workspaceOff}</span>
        </span>
      </div>

      <p className={SHARE_PANEL_STYLES.section}>{PAGE_SHARE_COPY.peopleWithAccess}</p>
      <ul className={SHARE_PANEL_STYLES.list}>
        <li className={SHARE_PANEL_STYLES.row}>
          <Avatar name={SHOWCASE_COPY.owner} src={null} size="xs" />
          <span className={SHARE_PANEL_STYLES.rowText}>
            <span className={SHARE_PANEL_STYLES.name}>
              {`${SHOWCASE_COPY.owner} ${PAGE_SHARE_COPY.you}`}
            </span>
          </span>
          <span className={SHARE_PANEL_STYLES.fixed}>{PAGE_ACCESS_COPY.owner}</span>
        </li>
        {SHOWCASE_COPY.people.map((person, index) => (
          <li
            key={person.name}
            className={cn(
              SHARE_PANEL_STYLES.row,
              SHOWCASE.reveal,
              isPicked ? SHOWCASE.shown : SHOWCASE.hidden
            )}
            style={{ transitionDelay: isPicked ? `${index * PERSON_DELAY_MS}ms` : undefined }}
          >
            <Avatar name={person.name} src={null} size="xs" />
            <span className={SHARE_PANEL_STYLES.rowText}>
              <span className={SHARE_PANEL_STYLES.name}>{person.name}</span>
            </span>
            <span className={SHARE_PANEL_STYLES.fixed}>{person.level}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
