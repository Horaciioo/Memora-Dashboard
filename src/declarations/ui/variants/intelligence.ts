/**
 * Memora Intelligence page, the chat on top and the recap below
 * @type {Record<string, string>}
 */

export const INTELLIGENCE_STYLES = {
  // Phone: the greeting sits on top, the composer is pinned above the dock like Claude's app
  page: 'mx-auto flex w-full max-w-3xl has-[[data-talking]]:max-w-6xl flex-col gap-10 pt-4 pb-6 has-[[data-talking]]:md:gap-0 has-[[data-talking]]:md:pt-4 has-[[data-talking]]:md:pb-4 md:gap-12 md:pt-12 md:pb-16',
  // Conversation written on the page itself, scrolls inside so the composer stays in sight
  thread: 'min-h-0 w-full flex-1 overflow-y-auto overscroll-contain lg:col-start-2 lg:row-start-1',
  // Talking: the page keeps the window's height, only the thread scrolls, the chat sits in the middle
  heroChat:
    'h-[calc(100dvh-14rem)] items-stretch gap-4 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)_14rem] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-8',
  // Reading column, same axis for the thread and the composer
  column: 'mx-auto flex w-full max-w-3xl flex-col',
  // Under the composer, set apart by a divider
  notebooks:
    'relative z-10 flex w-full flex-col items-center border-t border-[var(--color-border)] pt-8 max-md:pb-40',
  // Beside the chat, in the space the centred thread leaves empty
  agenda: 'hidden flex-col gap-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:self-start',
  agendaTitle: 'px-3 text-sm font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  agendaList: 'flex flex-col gap-0.5',
  agendaItem:
    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  agendaItemCurrent: 'bg-[var(--color-surface-raised)]',
  agendaItemDone: 'text-[var(--color-ink-subtle)] line-through',
  agendaCheck: 'size-4 shrink-0',
  hero: 'flex w-full flex-col items-center gap-6 max-md:gap-4',
  title:
    'flex items-center gap-3 text-center text-3xl font-semibold tracking-tight max-md:self-start max-md:text-left md:gap-4 md:text-5xl',
  titleMark: 'size-9 shrink-0 md:size-14',
  // Pinned to the bottom of the screen on a phone, in the flow from md up
  dockWrap:
    'max-md:fixed max-md:inset-x-0 max-md:bottom-[calc(var(--shell-dock-clearance,0px)+0.5rem)] max-md:z-30 max-md:flex max-md:flex-col max-md:gap-2 max-md:px-3 md:contents',
  composer:
    'mx-auto flex w-full max-w-3xl items-end lg:col-start-2 lg:row-start-2 gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 pr-2 pl-4 shadow-[var(--shadow-sm)] transition-shadow focus-within:shadow-[var(--shadow-md)]',
  // No border, no ring: the box around it is the field
  input:
    'composer-field field-sizing-content max-h-40 min-h-9 flex-1 resize-none self-center appearance-none border-0 bg-transparent p-0 py-1.5 text-base leading-snug shadow-none ring-0 outline-none placeholder:text-[var(--color-ink-subtle)] focus:border-0 focus:shadow-none focus:ring-0 focus:outline-none focus-visible:outline-none',
  // Room under the content for the pinned composer on a phone
  recap: 'flex flex-col gap-4 max-md:pb-40',
  recapHead: 'flex flex-col gap-1',
  recapTitle: 'text-section font-semibold tracking-tight',
  recapLead: 'text-sm leading-snug text-[var(--color-ink-subtle)]',
  steps: 'flex flex-col gap-2 text-sm leading-snug',
  step: 'flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] px-4 py-3',
  stepNumber:
    'grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-600)] text-xs font-bold text-[var(--color-on-brand)]',
  recapActions: 'flex flex-wrap items-center gap-2',
} as const
