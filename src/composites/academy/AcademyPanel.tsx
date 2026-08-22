'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/Section'
import { useAcademy } from '@/core/hooks/data/useAcademy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import { ROUTES } from '@/declarations/navigation'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { AcademyPeriods } from '@/utils/constants/hierarchy'
import type { JuniorView } from '@/types/academy'
import { formatDay } from '@/utils/format/dates'

export interface AcademyPanelProps {
  initialJuniors: JuniorView[]
  hasTrainings: boolean
  canManage: boolean
}

/**
 * Academy board, one card per junior with their training progression and the gesture
 * that moves them to the next period
 * @param {JuniorView[]} initialJuniors - Juniors resolved server-side
 * @param {boolean} hasTrainings - At least one training is declared
 * @param {boolean} canManage - Member may validate and advance
 * @return {JSX.Element}
 */

export const AcademyPanel = ({ initialJuniors, hasTrainings, canManage }: AcademyPanelProps) => {
  const { juniors, isSaving, setTraining, advance } = useAcademy(initialJuniors)
  const [advancing, setAdvancing] = useState<JuniorView | null>(null)

  if (!hasTrainings) {
    return (
      <EmptyState
        figure="academy"
        title={ACADEMY_COPY.noTrainingsTitle}
        description={ACADEMY_COPY.noTrainingsDescription}
        action={
          <Link href={ROUTES.settingsSection('formations')}>
            <Button variant="primary" icon="settings">
              {ACADEMY_COPY.configure}
            </Button>
          </Link>
        }
      />
    )
  }

  if (juniors.length === 0) {
    return (
      <EmptyState
        figure="academy"
        title={ACADEMY_COPY.emptyTitle}
        description={ACADEMY_COPY.emptyDescription}
        action={
          <Link href={ROUTES.members}>
            <Button variant="primary" icon="members">
              {ACADEMY_COPY.emptyTitle}
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className={LIST_STYLES.grid}>
        {juniors.map((junior) => {
          const period = junior.period ? ACADEMY_PERIOD_REGISTRY.get(junior.period) : null
          const isReady = junior.mandatoryPending === 0

          return (
            <Section key={junior.id} title={junior.displayName} bare>
              <article className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
                <header className="flex items-center gap-3">
                  <Avatar name={junior.displayName} src={junior.avatarUrl} size="md" />
                  <span className="flex min-w-0 flex-col gap-1">
                    <Badge
                      label={period?.label ?? ACADEMY_COPY.periodless}
                      tone="info"
                      icon="academy"
                    />
                    <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                      {[junior.youtuberName, junior.functionName].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </header>
                <p className="text-xs text-[var(--color-ink-subtle)]">
                  {`${junior.completedCount} / ${junior.trainings.length} ${ACADEMY_COPY.progress} · ${formatDay(junior.joinedAt)}`}
                </p>
                <div className="flex flex-1 flex-col gap-0.5">
                  {junior.trainings.map((training) => (
                    <Checkbox
                      key={training.id}
                      checked={training.completedAt !== null}
                      disabled={!canManage || isSaving}
                      onChange={(checked) => void setTraining(junior.id, training.id, checked)}
                      label={training.name}
                      hint={
                        training.completedAt
                          ? [formatDay(training.completedAt), training.validatorName]
                              .filter(Boolean)
                              .join(' · ')
                          : training.mandatory
                            ? ACADEMY_COPY.mandatory
                            : undefined
                      }
                    />
                  ))}
                </div>
                <footer className="flex items-center gap-2">
                  <Badge
                    label={isReady ? ACADEMY_COPY.ready : ACADEMY_COPY.blocked}
                    tone={isReady ? 'success' : 'warning'}
                    dot
                  />
                  <Button
                    variant="primary"
                    icon="forward"
                    className="ml-auto"
                    disabled={!canManage || !isReady || isSaving}
                    onClick={() => setAdvancing(junior)}
                  >
                    {junior.period === AcademyPeriods.Discovery
                      ? ACADEMY_COPY.advance
                      : ACADEMY_COPY.graduate}
                  </Button>
                </footer>
              </article>
            </Section>
          )
        })}
      </div>

      <ConfirmDialog
        open={advancing !== null}
        title={ACADEMY_COPY.advanceTitle}
        description={
          advancing?.period === AcademyPeriods.Discovery
            ? ACADEMY_COPY.advanceDescription
            : ACADEMY_COPY.graduateDescription
        }
        confirmLabel={
          advancing?.period === AcademyPeriods.Discovery
            ? ACADEMY_COPY.advance
            : ACADEMY_COPY.graduate
        }
        pending={isSaving}
        onCancel={() => setAdvancing(null)}
        onConfirm={async () => {
          await advance(advancing!.id)
          setAdvancing(null)
        }}
      />
    </>
  )
}
