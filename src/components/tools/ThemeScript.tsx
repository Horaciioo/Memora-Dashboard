import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { SPLASH_FLAGS, SPLASH_STORAGE_KEY } from '@/declarations/ui/splash'

// Dev replays the splash on every refresh
const SPLASH_GATE =
  APP_ENVIRONMENT === 'dev' ? 'true' : `!sessionStorage.getItem('${SPLASH_STORAGE_KEY}')`

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('theme')
    var theme = raw ? JSON.parse(raw).state.theme : 'SYSTEM'
    var isDark = theme === 'DARK' || (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  } catch (error) {}
  try {
    if (${SPLASH_GATE}) document.documentElement.dataset.splash = '${SPLASH_FLAGS.pending}'
  } catch (error) {}
})()
`

export interface ThemeScriptProps {
  nonce?: string
}

/**
 * Applies the persisted theme before paint
 * @param {string} [nonce] - Per-request nonce
 * @return {JSX.Element} - Script tag
 */

export const ThemeScript = ({ nonce }: ThemeScriptProps) => (
  <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
)
