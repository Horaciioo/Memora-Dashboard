import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Dashboard Template</h1>
      <p className="text-[var(--color-ink-subtle)] italic">
        A generic, reusable starting point for dashboard projects. The skeleton loader system is the
        only feature implemented so far — everything else is convention, documented in
        .claude/skills.
      </p>
      <Link
        href="/overview"
        className="rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        View the demo dashboard
      </Link>
    </main>
  )
}
