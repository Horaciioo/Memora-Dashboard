import type { Metadata } from 'next'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { PageHeader } from '@/components/structures/PageHeader'
import { ConsoleCard } from '@/composites/system/ConsoleCard'
import { CreatorPicker } from '@/composites/shell/CreatorPicker'
import { readActiveCreator } from '@/core/lib/auth/activeCreator'
import { pickableCreators } from '@/core/services/auth/ViewService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ROUTES } from '@/declarations/navigation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import {
  REFERENCE_GROUPS,
  referenceScreensOfGroup,
  referenceSectionsOfGroup,
} from '@/declarations/reference/sections'
import { GROUP_STYLES, LIST_STYLES, PAGE_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: REFERENCE_COPY.title }

/**
 * Admin console home
 * @return {Promise<JSX.Element>} - Configuration index
 */

export default async function ConfigurationPage() {
  const { session, access } = await requirePermission(Permissions.ReferenceRead)

  // Non-empty groups, in display order
  const groups = REFERENCE_GROUPS.map((group) => ({
    label: group.label,
    sections: referenceSectionsOfGroup(group.key),
    screens: referenceScreensOfGroup(group.key).filter((screen) => access.can(screen.permission)),
  })).filter((group) => group.sections.length > 0 || group.screens.length > 0)

  const canManageAccess = access.can(Permissions.AccessManage)

  // Creator scoping is a stub until the permission rebuild — see the note carried in memory
  const [creators, storedCreatorId] = await Promise.all([
    pickableCreators(session, access),
    readActiveCreator(),
  ])
  const activeCreatorId = creators.some((creator) => creator.id === storedCreatorId)
    ? storedCreatorId
    : null

  return (
    <div className={PAGE_STYLES.wrapper}>
      {creators.length > 1 && (
        <CreatorPicker
          creators={creators}
          activeYoutuberId={activeCreatorId}
          labelled
          labelSlot={<MaturityTag maturity="dev" interactive={false} />}
        />
      )}
      <PageHeader title={REFERENCE_COPY.title} lead={REFERENCE_COPY.lead} />
      <div className={GROUP_STYLES.ruledStack}>
        {groups.map((group) => (
          <section key={group.label} className={GROUP_STYLES.ruledSection}>
            <h2 className={SECTION_STYLES.title}>{group.label}</h2>
            <div className={LIST_STYLES.grid}>
              {group.sections.map((section) => (
                <ConsoleCard
                  key={section.key}
                  href={ROUTES.settingsSection(section.key)}
                  icon={section.icon}
                  label={section.label}
                  description={section.description}
                />
              ))}
              {group.screens.map((screen) => (
                <ConsoleCard
                  key={screen.href}
                  href={screen.href}
                  icon={screen.icon}
                  label={screen.label}
                  description={screen.description}
                />
              ))}
            </div>
          </section>
        ))}

        {canManageAccess && (
          <section className={GROUP_STYLES.ruledSection}>
            <h2 className={SECTION_STYLES.title}>{REFERENCE_COPY.administration}</h2>
            <div className={LIST_STYLES.grid}>
              <ConsoleCard
                href={ROUTES.settingsSection('acces')}
                icon="shield"
                label={ACCESS_COPY.title}
                description={ACCESS_COPY.lead}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
