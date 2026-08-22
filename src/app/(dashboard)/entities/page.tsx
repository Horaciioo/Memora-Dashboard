import { EntitiesPanel } from '@/composites/entities/EntitiesPanel'
import { MOCK_ENTITIES } from '@/composites/entities/mockEntities'

export const dynamic = 'force-dynamic'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Demo entities page, delayed on purpose to exercise the route-level entities/loading.tsx
 * @return {Promise<JSX.Element>}
 */

export default async function EntitiesPage() {
  await wait(700)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Entities</h1>
        <p className="text-sm text-[var(--color-ink-subtle)] italic">
          This page was delayed on purpose so navigating here shows entities/loading.tsx. Use
          &quot;Simulate reload&quot; below to see the component-level pattern instead.
        </p>
      </div>
      <EntitiesPanel entities={MOCK_ENTITIES} />
    </div>
  )
}
