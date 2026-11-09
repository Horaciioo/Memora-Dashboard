/**
 * Sign-in screen styles
 * @type {Record<string, string>}
 */

export const SIGN_IN_STYLES = {
  stack: 'flex flex-col gap-5',
  alert:
    'rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-danger)]',
  divider: 'flex items-center gap-3 text-micro text-[var(--color-ink-subtle)] uppercase',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  notice: 'text-xs text-[var(--color-ink-subtle)]',
  footer: 'pt-1 text-center text-xs',
  link: 'text-[var(--color-ink-subtle)] underline underline-offset-2 hover:text-[var(--color-ink)]',
} as const

/**
 * Privacy notice styles
 * @type {Record<string, string>}
 */

export const PRIVACY_STYLES = {
  page: 'mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12',
  section: 'flex flex-col gap-3',
  heading: 'text-lg font-bold tracking-tight',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  card: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-sm',
  scroller: 'overflow-x-auto',
  table: 'w-full min-w-[40rem] border-collapse text-left text-sm',
  head: 'border-b border-[var(--color-border)] pb-2 text-xs font-semibold uppercase text-[var(--color-ink-subtle)]',
  cell: 'border-b border-[var(--color-border)] py-3 pr-4 align-top',
  footer: 'text-sm',
} as const

/**
 * History consent screen styles
 * @type {Record<string, string>}
 */

export const CONSENT_STYLES = {
  stack: 'flex flex-col gap-4',
  heading: 'text-base font-bold tracking-tight',
  body: 'flex flex-col gap-3 text-sm text-[var(--color-ink-subtle)]',
  choice: 'flex items-start gap-3 text-sm',
  // Both answers sit centred on one column
  actions: 'mx-auto flex w-full max-w-xs flex-col items-stretch gap-3 pt-2',
  action: 'w-full justify-center',
  divider: 'h-px w-full bg-[var(--color-border)]',
  error: 'text-center text-xs text-[var(--color-danger)]',
} as const

/**
 * Wizard styles — a progress header
 * @type {Record<string, string>}
 */

export const WIZARD_STYLES = {
  frame: 'flex flex-col gap-7',
  header: 'flex flex-col gap-4',
  heading: 'flex flex-col gap-1',
  counter:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  title: 'text-xl font-bold tracking-tight sm:text-2xl',
  body: 'flex min-h-64 flex-col gap-4',
  footer: 'flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6',
} as const

/**
 * Public integration form styles — a standing creator banner
 * @type {Record<string, string>}
 */

export const ONBOARDING_STYLES = {
  // A gutter of its own
  page: 'grid min-h-dvh grid-cols-1 gap-2 p-2 lg:grid-cols-[40fr_60fr]',
  banner:
    'relative isolate flex h-56 flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] p-6 sm:h-72 lg:sticky lg:top-2 lg:h-[calc(100dvh-1rem)] lg:p-8',
  bannerImage: 'absolute inset-0 -z-20 h-full w-full object-cover',
  // The scrim is what makes the title legible whatever the picture underneath
  bannerScrim:
    'absolute inset-0 -z-10 bg-gradient-to-t from-[var(--color-media-shade)]/85 via-[var(--color-media-shade)]/45 to-[var(--color-media-shade)]/20',
  bannerMark: 'w-28 opacity-90 brightness-0 invert lg:w-32',
  bannerFoot: 'flex flex-col gap-2',
  bannerEyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-on-media)]/70 uppercase',
  bannerTitle:
    'text-2xl font-bold tracking-tight text-[var(--color-on-media)] sm:text-3xl lg:text-4xl',
  // No frame
  panel: 'flex min-w-0 flex-col justify-center px-2 py-8 sm:px-6 lg:px-12 lg:py-14',
  form: 'mx-auto flex w-full max-w-xl flex-col gap-8',
  identity:
    'flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]',
  identityName: 'text-base font-semibold',
  // The identifier sits under the name
  identityHandle: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  notice:
    'flex flex-col gap-1 rounded-[var(--radius-md)] border-l-2 border-[var(--color-brand-600)] bg-[var(--color-brand-soft)] px-4 py-3 text-xs text-[var(--color-ink-subtle)]',
  noticeTitle: 'text-xs font-semibold text-[var(--color-ink)]',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  heading: 'font-medium',
  body: 'flex flex-col gap-4',
  intro: 'flex flex-col gap-1',
  actions: 'flex flex-wrap items-center gap-3',
  outcome: 'flex flex-col gap-2 text-center',
  outcomeTitle: 'text-xl font-bold tracking-tight',
  // Admitted candidate
  admission: 'flex flex-col gap-1',
  admissionEyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
} as const

/**
 * Controls of the timeline step that hands out the integration form
 * @type {Record<string, string>}
 */

export const INTEGRATION_STEP_STYLES = {
  frame: 'mt-1 flex w-full flex-col gap-2',
  row: 'flex flex-wrap items-center gap-2',
  meta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
} as const
