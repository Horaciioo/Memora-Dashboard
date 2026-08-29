/**
 * Application name
 * @type {string}
 */

export const APP_NAME = 'Memora'

/**
 * Publishing company
 * @type {string}
 */

export const APP_COMPANY = 'Marsha'

/**
 * Application description
 * @type {string}
 */

export const APP_DESCRIPTION =
  'Le dashboard de Marsha : équipes, projets, tâches, réunions et modération au même endroit.'

/**
 * Brand assets
 * @type {Record<string, string>}
 */

export const APP_ASSETS = {
  wordmark: '/marsha-logo.png',
  loader: '/Loader.gif',
} as const

/**
 * Web font delivery, the families themselves named in src/styles/fonts.css
 * @type {{ preconnect: string[], stylesheet: string }}
 */

export const APP_FONTS = {
  preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  stylesheet:
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap',
} as const
