'use client'

import { usePageActions } from '@/core/hooks/data/pages'
import { PAGE_TEMPLATES } from '@/declarations/pages/templates'
import { PAGES_HOME_STYLES } from '@/declarations/ui/variants'

/**
 * Template cards starting a new page
 * @return {JSX.Element}
 */

export const PageTemplates = () => {
  const { create } = usePageActions()

  return (
    <ul className={PAGES_HOME_STYLES.templates}>
      {PAGE_TEMPLATES.keys.map((name) => {
        const template = PAGE_TEMPLATES.get(name)

        return (
          <li key={name}>
            <button
              type="button"
              className={PAGES_HOME_STYLES.template}
              onClick={() => void create({ template: name })}
            >
              <span className={PAGES_HOME_STYLES.templateIcon} aria-hidden="true">
                {template.icon}
              </span>
              <span className={PAGES_HOME_STYLES.templateLabel}>{template.label}</span>
              <span className={PAGES_HOME_STYLES.templateHint}>{template.description}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
