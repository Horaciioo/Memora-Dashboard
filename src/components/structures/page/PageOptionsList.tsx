'use client'

import { Fragment } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_OPTIONS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PageOptionsListProps {
  options: PageOption[]
  // Called once a gesture ran
  onDone: () => void
}

/**
 * One row of a page options panel
 * @param {PageOption} option - Switch, choice, block, note or gesture
 * @param {() => void} onDone - Called after a gesture
 * @return {JSX.Element}
 */

const OptionRow = ({ option, onDone }: { option: PageOption; onDone: () => void }) => {
  if ('onSelect' in option) {
    const Icon = option.icon ? ICONS[option.icon] : null

    return (
      <button
        type="button"
        className={cn(PAGE_OPTIONS.action, option.danger && PAGE_OPTIONS.actionDanger)}
        onClick={() => {
          option.onSelect()
          onDone()
        }}
      >
        {Icon && <Icon className={PAGE_OPTIONS.actionIcon} aria-hidden="true" />}
        {option.label}
      </button>
    )
  }

  if ('lines' in option) {
    return (
      <div className={PAGE_OPTIONS.profile}>
        <Avatar name={option.name} src={option.image} size="sm" />
        <div className={PAGE_OPTIONS.profileText}>
          <span className={PAGE_OPTIONS.profileName}>{option.name}</span>
          {option.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>
    )
  }

  if ('text' in option) {
    return (
      <div className={PAGE_OPTIONS.note}>
        <span className={PAGE_OPTIONS.contentTitle}>{option.label}</span>
        <p>{option.text}</p>
      </div>
    )
  }

  if ('render' in option) {
    return (
      <div className={PAGE_OPTIONS.content}>
        <span className={PAGE_OPTIONS.contentTitle}>{option.label}</span>
        {option.render()}
      </div>
    )
  }

  return (
    <div
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
}

/**
 * Rows of a page options panel, grouped under their headings
 * @param {PageOption[]} options - Switches, choices, blocks and gestures
 * @param {() => void} onDone - Called after a gesture
 * @return {JSX.Element}
 */

export const PageOptionsList = ({ options, onDone }: PageOptionsListProps) => (
  <>
    {options.map((option, index) => (
      <Fragment key={option.id}>
        {(option.group ?? option.section) !==
          (options[index - 1]?.group ?? options[index - 1]?.section) &&
          index > 0 && <hr className={PAGE_OPTIONS.divider} />}
        {option.section && option.section !== options[index - 1]?.section && (
          <p className={PAGE_OPTIONS.heading}>{option.section}</p>
        )}
        <OptionRow option={option} onDone={onDone} />
      </Fragment>
    ))}
  </>
)
