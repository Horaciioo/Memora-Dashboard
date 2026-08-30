const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('theme')
    var theme = raw ? JSON.parse(raw).state.theme : 'SYSTEM'
    var isDark = theme === 'DARK' || (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  } catch (error) {}
})()
`

export interface ThemeScriptProps {
  nonce?: string
}

/**
 * Applies the persisted theme before paint, the nonce letting the policy admit it
 * @param {string} [nonce] - Per-request nonce
 * @return {JSX.Element} - Script tag
 */

export const ThemeScript = ({ nonce }: ThemeScriptProps) => (
  <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
)
