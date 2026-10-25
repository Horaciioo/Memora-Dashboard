'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Tabs } from '@/components/elements/navigation/Tabs'
import type { TabItem } from '@/components/elements/navigation/Tabs'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_ACTIONS, DRAWER_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Words of a setup drawer
 * @typedef {Object} PlaySetupCopy
 */

export interface PlaySetupCopy {
  title: string
  tabs: string
  create: string
  cancel: string
}

export interface PlaySetupDrawerProps {
  open: boolean
  isSaving: boolean
  // Choices hold, the game may open
  canCreate: boolean
  copy: PlaySetupCopy
  tabs: TabItem[]
  onClose: () => void
  onCreate: () => void
  // Body of the tab on screen
  children: (tab: string) => ReactNode
}

/**
 * Footer button of the last tab
 * @param {Object} props - Button
 * @return {JSX.Element}
 */

const FooterLine = ({
  label,
  disabled,
  tone,
  onClick,
  icon,
}: {
  label: string
  disabled: boolean
  tone: string
  onClick: () => void
  icon: ReactNode
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    aria-label={label}
    className={cn(DRAWER_ACTIONS.line, tone)}
  >
    {icon}
    <span className={DRAWER_ACTIONS.lineLabel}>{label}</span>
  </button>
)

/**
 * Drawer of a new game: tabs on top, ‹ › steps, then create and cancel on the last tab
 * @param {PlaySetupDrawerProps} props - Drawer state, tabs and body
 * @return {JSX.Element}
 */

export const PlaySetupDrawer = ({
  open,
  isSaving,
  canCreate,
  copy,
  tabs,
  onClose,
  onCreate,
  children,
}: PlaySetupDrawerProps) => {
  const [tab, setTab] = useState(tabs[0].value)
  const BackIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext
  const SaveIcon = ICONS.playTick
  const CancelIcon = ICONS.playClose
  const index = tabs.findIndex((entry) => entry.value === tab)
  const steps = [
    { entry: tabs[index - 1], tone: DRAWER_ACTIONS.stepBack, Icon: BackIcon },
    { entry: tabs[index + 1], tone: DRAWER_ACTIONS.stepNext, Icon: NextIcon },
  ]
  const isLast = !tabs[index + 1]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={copy.title}
      icon="play"
      subheader={
        <div className={DRAWER_STYLES.subheaderRow}>
          <div className={DRAWER_STYLES.subheaderTabs}>
            <Tabs items={tabs} value={tab} onChange={setTab} label={copy.tabs} emphasis />
          </div>
        </div>
      }
      footer={
        <div className={DRAWER_ACTIONS.stack}>
          {tabs.length > 1 && (
            <div className={DRAWER_ACTIONS.steps}>
              {steps.map(
                ({ entry, tone, Icon }) =>
                  entry && (
                    <button
                      key={entry.value}
                      type="button"
                      onClick={() => setTab(entry.value)}
                      aria-label={entry.label}
                      className={cn(DRAWER_ACTIONS.step, tone)}
                    >
                      {tone === DRAWER_ACTIONS.stepBack && (
                        <Icon className={DRAWER_ACTIONS.stepIcon} aria-hidden="true" />
                      )}
                      <span className={DRAWER_ACTIONS.stepLabel}>{entry.label}</span>
                      {tone === DRAWER_ACTIONS.stepNext && (
                        <Icon className={DRAWER_ACTIONS.stepIcon} aria-hidden="true" />
                      )}
                    </button>
                  )
              )}
            </div>
          )}
          {isLast && (
            <>
              <FooterLine
                label={copy.create}
                disabled={isSaving || !canCreate}
                tone={DRAWER_ACTIONS.save}
                onClick={onCreate}
                icon={
                  isSaving ? (
                    <BrandLoader variant="inline" />
                  ) : (
                    <SaveIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />
                  )
                }
              />
              <span className={DRAWER_ACTIONS.divider} aria-hidden="true" />
              <FooterLine
                label={copy.cancel}
                disabled={isSaving}
                tone={DRAWER_ACTIONS.cancel}
                onClick={onClose}
                icon={<CancelIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />}
              />
            </>
          )}
        </div>
      }
    >
      {children(tab)}
    </Drawer>
  )
}
