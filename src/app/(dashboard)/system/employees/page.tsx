import type { Metadata } from 'next'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import AppLink from '@/components/elements/navigation/AppLink'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { PrivilegedMembers } from '@/composites/system/PrivilegedMembers'
import { listMembers } from '@/core/services/members/MemberService'
import { requireSystem } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { GLOBAL_ROLES } from '@/utils/constants/hierarchy'

export const metadata: Metadata = { title: SYSTEM_COPY.privilegedTitle }

/**
 * Admins and Employés, listed apart from the moderators and editable in full
 * @return {Promise<JSX.Element>} - Privileged accounts page
 */

export default async function PrivilegedPage() {
  const { access, scope } = await requireSystem()
  const members = await listMembers(await scope(), access.isAdmin, GLOBAL_ROLES)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.privilegedTitle} />

      <Section bare>
        {members.length === 0 ? (
          <EmptyState
            figure="notes"
            title={SYSTEM_COPY.privilegedEmptyTitle}
            description={SYSTEM_COPY.privilegedEmptyLead}
            action={
              <AppLink href={ROUTES.members}>
                <Button>{SYSTEM_COPY.privilegedEmptyAction}</Button>
              </AppLink>
            }
            compact
          />
        ) : (
          <PrivilegedMembers members={members} />
        )}
      </Section>
    </div>
  )
}
