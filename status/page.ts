import { COMPONENTS, COPY, HEALTH_LEVELS, SETTINGS } from './declarations.ts'
import type { Health } from './declarations.ts'
import { dayHealth, uptimePercent } from './store.ts'
import type { Incident, StatusState } from './store.ts'
import { STYLES } from './styles.ts'

// Date in the display zone
const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone: SETTINGS.timeZone,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))

// Compact duration
const formatDuration = (from: string, to: string | null): string => {
  const minutes = Math.max(
    1,
    Math.round(((to ? Date.parse(to) : Date.now()) - Date.parse(from)) / 60_000)
  )
  if (minutes < 60) return `${minutes} min`

  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}

/**
 * Worst level of all
 * @param {StatusState} state - Saved state
 * @return {Health | null} - Overall level
 */

export const overallHealth = (state: StatusState): Health | null => {
  const levels = COMPONENTS.map((item) => state.components[item.id]?.health)
  if (levels.some((level) => !level)) return null

  return HEALTH_LEVELS.toReversed().find((level) => levels.includes(level)) ?? 'up'
}

// One bar per day, oldest first
const renderBars = (id: string, state: StatusState): string => {
  const days = state.components[id]?.days ?? {}
  const today = new Date()

  return Array.from({ length: SETTINGS.historyDays }, (_, index) => {
    const date = new Date(today.getTime() - (SETTINGS.historyDays - 1 - index) * 86_400_000)
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: SETTINGS.timeZone }).format(date)
    const health = dayHealth(days[key])
    const label = `${key} : ${health ? COPY.health[health] : COPY.noData}`

    return `<i class="bar ${health ?? 'none'}" title="${label}"></i>`
  }).join('')
}

// One service row
const renderComponent = (item: (typeof COMPONENTS)[number], state: StatusState): string => {
  const current = state.components[item.id]
  const health = current?.health ?? null
  const percent = current ? uptimePercent(current) : null

  return `<section class="service">
    <header>
      <div><h3>${item.label}</h3><p>${item.lead}</p></div>
      <span class="tag ${health ?? 'none'}">${health ? COPY.health[health] : '…'}</span>
    </header>
    <div class="bars">${renderBars(item.id, state)}</div>
    <footer><span>${COPY.daysAgo(SETTINGS.historyDays)}</span>
      <span>${percent === null ? '' : `${percent.toFixed(2)} % ${COPY.uptime}`}</span>
      <span>${COPY.today}</span></footer>
  </section>`
}

// One incident row
const renderIncident = (incident: Incident): string => {
  const label =
    COMPONENTS.find((item) => item.id === incident.component)?.label ?? incident.component
  const state = incident.resolvedAt ? COPY.resolved : COPY.ongoing

  return `<article class="incident">
    <h4>${COPY.incidentTitle(label, incident.worst)}</h4>
    <p><b class="${incident.resolvedAt ? 'up' : incident.worst}">${state}</b>
    · ${formatDate(incident.startedAt)} · ${COPY.duration} ${formatDuration(incident.startedAt, incident.resolvedAt)}</p>
  </article>`
}

/**
 * Render the status page
 * @param {StatusState} state - Saved state
 * @return {string} - HTML document
 */

export const renderPage = (state: StatusState): string => {
  const overall = overallHealth(state)
  const incidents = state.incidents.slice(0, SETTINGS.incidentsShown)

  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="60">
<title>${COPY.title}</title>
<style>${STYLES}</style>
</head><body><main>
  <h1>${COPY.title}</h1>
  <p class="lead">${COPY.lead}</p>
  <div class="banner ${overall ?? 'none'}">${overall ? COPY.overall[overall] : COPY.waiting}</div>
  <h2>${COPY.components}</h2>
  ${COMPONENTS.map((item) => renderComponent(item, state)).join('')}
  <h2>${COPY.incidents}</h2>
  ${incidents.length ? incidents.map(renderIncident).join('') : `<p class="empty">${COPY.noIncident}</p>`}
  <p class="stamp">${COPY.refreshed} ${state.checkedAt ? formatDate(state.checkedAt) : '…'}</p>
</main></body></html>`
}
