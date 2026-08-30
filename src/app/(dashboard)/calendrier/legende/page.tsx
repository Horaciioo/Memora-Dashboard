import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { requirePermission } from '@/core/wrappers/requireUser'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import {
  CALENDAR_KIND_REGISTRY,
  CALENDAR_SOURCE_REGISTRY,
} from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentColour, toTone } from '@/declarations/ui/theme'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: CALENDAR_COPY.legendTitle }

// One row of the legend, a swatch or glyph then a label and its meaning
const ROW = 'flex items-start gap-3 text-sm'
const SWATCH = 'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full'
const MEANING = 'text-[var(--color-ink-subtle)]'

/**
 * Full calendar legend — colours, zones and visibility levels, on its own page
 * @return {Promise<JSX.Element>} - Legend page
 */

export default async function CalendarLegendPage() {
  await requirePermission(Permissions.CalendarRead)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={CALENDAR_COPY.legendTitle} lead={CALENDAR_COPY.legendLead} />

      <Section title={CALENDAR_COPY.legendKindsTitle} padded>
        <ul className="flex flex-col gap-2.5">
          {CALENDAR_KIND_REGISTRY.keys.map((key) => {
            const kind = CALENDAR_KIND_REGISTRY.get(key)

            return (
              <li key={key} className={ROW}>
                <span
                  className={SWATCH}
                  style={{ backgroundColor: accentColour(kind.accent, 'brand') }}
                  aria-hidden="true"
                />
                <span>
                  <strong>{kind.label}</strong> — <span className={MEANING}>{kind.summary}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={CALENDAR_COPY.legendSourcesTitle} padded>
        <ul className="flex flex-col gap-2.5">
          {CALENDAR_SOURCE_REGISTRY.keys.map((key) => {
            const source = CALENDAR_SOURCE_REGISTRY.get(key)
            const Icon = ICONS[source.icon]

            return (
              <li key={key} className={ROW}>
                <span
                  className={SWATCH}
                  style={{ backgroundColor: accentColour(source.accent, 'neutral') }}
                  aria-hidden="true"
                />
                <span className="flex flex-wrap items-center gap-1.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <strong>{source.label}</strong> —{' '}
                  <span className={MEANING}>{source.summary}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={CALENDAR_COPY.legendZonesTitle} padded>
        <p className="text-sm">{CALENDAR_COPY.legendZonesText}</p>
      </Section>

      <Section title={CALENDAR_COPY.legendVisibilityTitle} padded>
        <div className="flex flex-col gap-3">
          <span className="flex flex-wrap gap-1.5">
            {EVENT_VISIBILITY_REGISTRY.keys.map((key) => {
              const level = EVENT_VISIBILITY_REGISTRY.get(key)

              return (
                <Badge
                  key={key}
                  label={level.label}
                  tone={toTone(level.accent, 'neutral')}
                  icon="visible"
                  dot
                />
              )
            })}
          </span>
          <p className={`text-sm ${MEANING}`}>{CALENDAR_COPY.legendVisibilityText}</p>
        </div>
      </Section>

      <div className="flex justify-end">
        <Link href={ROUTES.calendar}>
          <Button variant="primary" icon="confirm">
            {CALENDAR_COPY.legendUnderstood}
          </Button>
        </Link>
      </div>
    </div>
  )
}
