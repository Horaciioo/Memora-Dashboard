/**
 * Media query of an installed application window
 * @type {string}
 */

export const STANDALONE_QUERY = '(display-mode: standalone)'

/**
 * Apple handhelds, an iPad passing for a Mac included through its touch points
 * @type {{ agent: RegExp, desktopPlatform: string }}
 */

export const APPLE_MOBILE = { agent: /iPad|iPhone|iPod/, desktopPlatform: 'MacIntel' } as const

/**
 * Browsers on Apple handhelds that cannot install, Safari alone can
 * @type {RegExp}
 */

export const APPLE_OTHER_BROWSERS = /CriOS|FxiOS|EdgiOS|OPiOS/
