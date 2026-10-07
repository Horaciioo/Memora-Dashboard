'use client'

import { useEffect, useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { useLevelLook } from '@/composites/academy/course/useLevelLook'
import { SanctionChip } from '@/composites/academy/course/SanctionChip'
import { useInView } from '@/core/hooks/interaction/useInView'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import {
  COURSE_PANELSTACK,
  COURSE_READ,
  LIVECON_TITLE,
  SANCTION_PANEL,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PanelStackBlockProps {
  block: Extract<ReadBlock, { kind: 'panelStack' }>
}

/**
 * The panel as it shows on Discord, its tiers lighting one after the other, with the factors
 * piled behind it that fan out around it once it is reached
 * @param {PanelStackBlockProps} props - Panel and factors declared in code
 * @return {JSX.Element}
 */

export const PanelStackBlock = ({ block }: PanelStackBlockProps) => {
  const [ref, isSeen] = useInView()
  const [lit, setLit] = useState(0)
  const { panel, factors, page } = block
  const PageIcon = ICONS[page.icon]
  const level = useLevelLook()(panel.level)
  const LevelIcon = ICONS[level.icon]

  // The lit tier walks down the panel
  useEffect(() => {
    if (!isSeen) return

    const timer = window.setInterval(
      () => setLit((current) => (current + 1) % panel.tiers.length),
      ACADEMY_SETTINGS.liveconCycleMs / 2
    )

    return () => window.clearInterval(timer)
  }, [isSeen, panel.tiers.length])

  return (
    <section className={COURSE_PANELSTACK.root}>
      <h2 className={COURSE_READ.heading}>{block.title}</h2>
      <div className={cn(COURSE_READ.text, COURSE_PANELSTACK.text, 'flex flex-col gap-4')}>
        <p>
          {block.where}{' '}
          <span className={COURSE_PANELSTACK.where}>
            <PageIcon className={COURSE_PANELSTACK.whereIcon} aria-hidden="true" />
            {page.label}
          </span>
          .
        </p>
        <Markdown source={block.intro} />
      </div>

      <div ref={ref} className={COURSE_PANELSTACK.stage}>
        <div className={COURSE_PANELSTACK.window}>
          <div className={COURSE_PANELSTACK.bar}>
            <PageIcon className={COURSE_PANELSTACK.barIcon} aria-hidden="true" />
            {page.label}
          </div>
          <div className={COURSE_PANELSTACK.page}>
            <div className={LIVECON_TITLE.base} style={accentVars(panel.levelAccent)}>
              <LevelIcon className={COURSE_PANELSTACK.levelIcon} aria-hidden="true" />
              <span className={COURSE_PANELSTACK.levelName}>{level.name}</span>
            </div>
            <div className={COURSE_PANELSTACK.groups}>
              {panel.groups.map((group) => {
                const gravity = SANCTION_GRAVITY_REGISTRY.get(group.gravity)

                return (
                  <section
                    key={group.gravity}
                    className={SANCTION_PANEL.group}
                    style={accentVars(gravity.accent)}
                  >
                    <h3 className={SANCTION_PANEL.groupTitle}>{gravity.label}</h3>
                    <div className={COURSE_PANELSTACK.cards}>
                      {group.offenses.map((name) => (
                        <div
                          key={name}
                          className={cn(
                            SANCTION_PANEL.card,
                            name === panel.offense && COURSE_PANELSTACK.cardOpen
                          )}
                        >
                          <span className={SANCTION_PANEL.cardRule} aria-hidden="true" />
                          <span className={SANCTION_PANEL.cardName}>{name}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
            <div className={COURSE_PANELSTACK.embed}>
              <p className={COURSE_PANELSTACK.offense}>{panel.offense}</p>
              {panel.tiers.map((tier, index) => (
                <div
                  key={tier.condition}
                  className={cn(COURSE_PANELSTACK.tier, index === lit && COURSE_PANELSTACK.tierLit)}
                >
                  <span className={COURSE_PANELSTACK.tierName}>{tier.condition}</span>
                  <span className={COURSE_PANELSTACK.measures}>
                    {tier.measures.map((measure) => (
                      <SanctionChip key={measure} measure={measure} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {factors.map((factor, index) => {
          const Icon = ICONS[factor.icon]

          return (
            <div
              key={factor.label}
              style={{ '--delay': `${index * 110}ms` } as React.CSSProperties}
              className={cn(
                COURSE_PANELSTACK.card,
                COURSE_PANELSTACK.spots[index % COURSE_PANELSTACK.spots.length],
                isSeen ? COURSE_PANELSTACK.cardShown : COURSE_PANELSTACK.cardHidden
              )}
            >
              <span className={COURSE_PANELSTACK.cardChip}>
                <Icon className={COURSE_PANELSTACK.cardIcon} aria-hidden="true" />
              </span>
              <div>
                <p className={COURSE_PANELSTACK.cardLabel}>{factor.label}</p>
                <p className={COURSE_PANELSTACK.cardText}>{factor.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <Markdown source={block.outro} className={cn(COURSE_READ.text, COURSE_PANELSTACK.text)} />
    </section>
  )
}
