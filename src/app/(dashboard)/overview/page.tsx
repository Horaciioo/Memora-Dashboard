export const dynamic = 'force-dynamic'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
    <p className="text-sm text-[var(--color-ink-subtle)]">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
)

/**
 * Demo overview page
 * @return {Promise<JSX.Element>} - Overview page component
 */

export default async function OverviewPage() {
  await wait(700)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--color-ink-subtle)] italic">
          This page was delayed on purpose so navigating here shows overview/loading.tsx.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total entities" value="128" />
        <StatTile label="Active" value="94" />
        <StatTile label="Pending" value="12" />
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
        <p className="text-sm">Summary card placeholder — replace with real content.</p>
      </div>
    </div>
  )
}
