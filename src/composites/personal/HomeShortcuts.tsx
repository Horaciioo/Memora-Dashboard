/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { Section } from '@/components/structures/Section'
import { HOME_SHORTCUTS } from '@/declarations/personal/shortcuts'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_CARDS as STYLES } from '@/declarations/ui/variants'
import type { PermissionName } from '@/utils/constants/permissions'

export interface HomeShortcutsProps {
  can: (permission: PermissionName) => boolean
}

/**
 * Three big cards leading to the main areas
 * @param {(permission: PermissionName) => boolean} can - Permission check
 * @return {JSX.Element | null}
 */

export const HomeShortcuts = ({ can }: HomeShortcutsProps) => {
  const cards = HOME_SHORTCUTS.filter((card) => can(card.permission))
  const GoIcon = ICONS.next

  if (cards.length === 0) return null

  return (
    <Section title={PERSONAL_COPY.shortcutsTitle} bare>
      <div className={STYLES.grid}>
        {cards.map((card) => {
          const Icon = ICONS[card.icon]

          return (
            <Link key={card.key} href={card.href} className={STYLES.card}>
              <img
                src={card.image}
                alt=""
                loading="lazy"
                decoding="async"
                className={STYLES.image}
                style={{ objectPosition: card.position }}
              />
              <span className={STYLES.shade} aria-hidden="true" />
              <span className={STYLES.go} aria-hidden="true">
                <GoIcon className={STYLES.goGlyph} />
              </span>
              <span className={STYLES.tile}>
                <Icon className={STYLES.glyph} aria-hidden="true" />
              </span>
              <span className={STYLES.title}>{card.title}</span>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
