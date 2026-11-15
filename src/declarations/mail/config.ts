import { readSecret } from '@/declarations/platforms/credentials'

/**
 * Mail provider settings, read from the environment
 * @typedef {Object} MailConfig
 * @property {string | null} apiKey - Resend key, server only
 * @property {string | null} from - Sender, "Name <address>"
 * @property {string | null} replyTo - Address answers go to
 * @property {string | null} origin - Public address of the application
 */

export interface MailConfig {
  apiKey: string | null
  from: string | null
  replyTo: string | null
  origin: string | null
}

// Origin of the sign-in callback, the fallback when no public address is set
const callbackOrigin = (): string | null => {
  const callback = readSecret(process.env.DISCORD_REDIRECT_URI)
  if (!callback) return null

  try {
    return new URL(callback).origin
  } catch {
    return null
  }
}

/**
 * Mail provider settings
 * @type {MailConfig}
 */

export const MAIL_CONFIG: MailConfig = {
  apiKey: readSecret(process.env.RESEND_API_KEY),
  from: readSecret(process.env.MAIL_FROM),
  replyTo: readSecret(process.env.MAIL_REPLY_TO),
  origin: readSecret(process.env.APP_PUBLIC_URL) ?? callbackOrigin(),
}

/**
 * Whether mails can leave the server
 * @return {boolean} - Key and sender are set
 */

export const isMailConfigured = (): boolean => Boolean(MAIL_CONFIG.apiKey && MAIL_CONFIG.from)

/**
 * Provider endpoint
 * @type {string}
 */

export const MAIL_ENDPOINT = 'https://api.resend.com/emails'

/**
 * Colours of a mail, literal because a mail client knows no token
 * @type {Record<string, string>}
 */

export const MAIL_THEME = {
  page: '#faf6f1',
  card: '#ffffff',
  ink: '#2b2326',
  subtle: '#7b6e72',
  line: '#eadfdb',
  brand: '#ef8aa8',
  brandInk: '#ffffff',
  note: '#fbeff3',
} as const
