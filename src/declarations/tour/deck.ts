/**
 * Task whose assignee is in absence, as the example draws it
 * @type {{ project: string, task: string, assignLabel: string, notify: string, absentTag: string, refusal: string, members: { name: string, isAbsent: boolean }[] }}
 */

export const NOTIFY_DEMO = {
  project: 'Live de ce soir',
  task: 'Préparer le live',
  assignLabel: 'Assigner à',
  notify: 'Notifier',
  absentTag: 'En absence jusqu’à vendredi',
  refusal: 'Modo X est en absence : il ne peut pas être notifié.',
  members: [
    { name: 'Alex', isAbsent: false },
    { name: 'Modo X', isAbsent: true },
  ],
} as const
