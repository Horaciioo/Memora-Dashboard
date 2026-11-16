/**
 * Revision of the installed icon, raised whenever the pictures change
 * @type {string}
 */

export const ICON_REVISION = '2026-11-16-sunset'

/**
 * Where the revision a device last saw is kept
 * @type {string}
 */

export const ICON_REVISION_KEY = 'memora:icon-revision'

/**
 * Copy of the update button
 * @type {Record<string, string>}
 */

export const UPDATE_COPY = {
  label: 'Mettre à jour l’app',
  aria: 'Mettre Memora à jour',
  iconTitle: 'Nouvelle icône',
  iconSteps:
    'Pour voir la nouvelle icône, retire Memora de ton écran d’accueil ou de ton dock, puis réinstalle-la.',
  reinstall: 'Réinstaller',
  done: 'Compris',
} as const
