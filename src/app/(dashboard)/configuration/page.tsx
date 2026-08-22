import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/structures/PageHeader'
import { requirePermission } from '@/core/wrappers/requireUser'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { REFERENCE_SECTIONS } from '@/declarations/reference/sections'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIST_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: REFERENCE_COPY.title }

/**
 * Admin console home, one card per reference collection
 * @return {Promise<JSX.Element>} - Configuration index
 */

export default async function ConfigurationPage() {
  await requirePermission(Permissions.ReferenceRead)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={REFERENCE_COPY.title} lead={REFERENCE_COPY.lead} />
      <div className={LIST_STYLES.grid}>
        {REFERENCE_SECTIONS.map((section) => {
          const Icon = ICONS[section.icon]

          return (
            <Link
              key={section.key}
              href={ROUTES.settingsSection(section.key)}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-colors hover:border-[var(--color-brand-400)]"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[var(--color-brand-600)]" aria-hidden="true" />
                <span className="font-bold">{section.label}</span>
              </span>
              <span className="text-sm text-[var(--color-ink-subtle)]">{section.description}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
