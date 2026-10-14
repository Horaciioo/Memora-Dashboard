/**
 * Copy of the timelines cut into periods
 * @type {Record<string, string>}
 */

export const PERIOD_TIMELINE_COPY = {
  done: 'Terminée',
  current: 'En cours',
  late: 'En retard',
  upcoming: 'À venir',
  open: 'Déplier',
  close: 'Replier',
  since: (date: string) => `Depuis le ${date}`,
  steps: (done: number, total: number) => `${done} sur ${total} étapes`,
} as const
