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

/**
 * Applies the persisted theme before paint
 * @return {JSX.Element} - Script tag
 */

export const ThemeScript = () => <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
