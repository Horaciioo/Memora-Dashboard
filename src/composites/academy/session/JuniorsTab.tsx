'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { RowList, type RowListGroup } from '@/components/structures/RowList'
import { Section } from '@/components/structures/Section'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * Juniors of the session, under the outcome each one reached
 * @return {JSX.Element}
 */

export const JuniorsTab = () => {
  const router = useRouter()
  const { session, can, hasCandidates, juniorForm, juniorMenu, openJunior } = useSessionState()

  // One heading per outcome, where the junior stands on the right
  const groups: RowListGroup[] = ACADEMY_JUNIOR_STATUS_REGISTRY.keys
    .map((status) => ({
      id: status,
      label: ACADEMY_JUNIOR_STATUS_REGISTRY.label(status),
      accent: ACADEMY_JUNIOR_STATUS_REGISTRY.get(status).accent,
      items: session.juniors
        .filter((junior) => junior.status === status)
        .map((junior) => ({
          id: junior.id,
          title: junior.displayName,
          lead: <Avatar name={junior.displayName} src={junior.avatarUrl} size="md" />,
          trail: PARKOUR_PHASES[junior.phase].label,
          menu: juniorMenu(junior),
          onOpen: () => openJunior(junior),
        })),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.sessionJuniors }}>
      <Section bare>
        {session.juniors.length === 0 ? (
          <EmptyState
            figure="academy"
            title={hasCandidates ? ACADEMY_COPY.juniorEmptyTitle : ACADEMY_COPY.noMembersTitle}
            description={
              hasCandidates
                ? ACADEMY_COPY.juniorEmptyDescription
                : ACADEMY_COPY.noMembersDescription
            }
            action={
              hasCandidates ? (
                <Button
                  variant="primary"
                  icon="add"
                  disabled={!can.manage}
                  onClick={() => juniorForm(null)}
                >
                  {ACADEMY_COPY.juniorAdd}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon="members"
                  onClick={() => router.push(ROUTES.members)}
                >
                  {ACADEMY_COPY.openMembers}
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            <RowList groups={groups} />
            <AddRow
              label={ACADEMY_COPY.juniorAdd}
              disabled={!can.manage || !hasCandidates}
              onClick={() => juniorForm(null)}
            />
          </div>
        )}
      </Section>
    </div>
  )
}
