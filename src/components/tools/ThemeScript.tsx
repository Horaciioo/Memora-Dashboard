import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { COLOR_VISION_REGISTRY } from '@/declarations/access/preferences'
import { SPLASH_FLAGS, SPLASH_STORAGE_KEY } from '@/declarations/ui/splash'

// Dev replays the splash on every refresh
const SPLASH_GATE =
  APP_ENVIRONMENT === 'dev' ? 'true' : `!sessionStorage.getItem('${SPLASH_STORAGE_KEY}')`

// Mode key to page attribute
const VISION_ATTRIBUTES = JSON.stringify(
  Object.fromEntries(
    COLOR_VISION_REGISTRY.keys.map((key) => [key, COLOR_VISION_REGISTRY.get(key).attribute])
  )
)

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('theme')
    var theme = raw ? JSON.parse(raw).state.theme : 'SYSTEM'
    var isDark = theme === 'DARK' || (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  } catch (error) {}
  try {
    var rawVision = localStorage.getItem('color-vision')
    var mode = rawVision ? JSON.parse(rawVision).state.colorVisionMode : 'NONE'
    var attribute = ${VISION_ATTRIBUTES}[mode]
    if (attribute) document.documentElement.dataset.colorVision = attribute
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

export const ThemeScript = ({ nonce }: ThemeScriptProps) => {
  // Client renders skip it, React 19 warns on a script it would never run
  if (typeof window !== 'undefined') return null

  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
}
