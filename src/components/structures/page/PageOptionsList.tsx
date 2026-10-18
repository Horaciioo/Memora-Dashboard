'use client'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { PAGE_OPTIONS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PageOptionsListProps {
  options: PageOption[]
  // Called once a gesture ran
  onDone: () => void
}

/**
 * Rows of a page options panel
 * @param {PageOption[]} options - Switches, choices, blocks and gestures
 * @param {() => void} onDone - Called after a gesture
 * @return {JSX.Element}
 */

export const PageOptionsList = ({ options, onDone }: PageOptionsListProps) => (
  <>
    {options.map((option) =>
      'onSelect' in option ? (
        <button
          key={option.id}
          type="button"
          className={PAGE_OPTIONS.action}
          onClick={() => {
            option.onSelect()
            onDone()
          }}
        >
          {option.label}
        </button>
      ) : 'render' in option ? (
        <div key={option.id} className={PAGE_OPTIONS.content}>
          <span className={PAGE_OPTIONS.contentTitle}>{option.label}</span>
          {option.render()}
        </div>
      ) : (
        <div
          key={option.id}
          className={cn(
            PAGE_OPTIONS.row,
            'choices' in option && option.choices.length > 2 && PAGE_OPTIONS.rowStacked
          )}
        >
          <span>{option.label}</span>
          {'choices' in option ? (
            <SegmentedControl
              options={option.choices}
              value={option.value}
              onChange={option.onChange}
              label={option.label}
            />
          ) : (
            <Toggle bare label={option.label} checked={option.checked} onChange={option.onChange} />
          )}
        </div>
      )
    )}
  </>
)
