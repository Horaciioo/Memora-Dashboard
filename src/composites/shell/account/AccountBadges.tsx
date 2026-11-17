'use client'

import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { ROLE_EMBLEMS, functionGlyph, roleTone } from '@/declarations/members/profiles'
import { MENU_SHELF } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Role glyph then one glyph per function the member holds
 * @return {JSX.Element | null}
 */

export const AccountBadges = () => {
  const { session } = useAuthContext()
  if (!session) return null

  const RoleGlyph = ROLE_EMBLEMS[session.role].glyph
  const roleLabel = ROLE_REGISTRY.label(session.role)

  return (
    <section className={MENU_SHELF.shelf} aria-label={NAV_COPY.badges}>
      <h3 className={MENU_SHELF.title}>{NAV_COPY.badges}</h3>
      <ul className={MENU_SHELF.list}>
        <li className={MENU_SHELF.item}>
          <RoleGlyph className={MENU_SHELF.glyph} tone={roleTone(session)} />
          <span className={MENU_SHELF.name}>{roleLabel}</span>
        </li>
        {session.functions.map((entry) => {
          const Glyph = functionGlyph(entry)

          return (
            <li key={entry.id} className={MENU_SHELF.item}>
              {Glyph && <Glyph className={MENU_SHELF.glyph} aria-hidden="true" />}
              <span className={MENU_SHELF.name}>{entry.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
