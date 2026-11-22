'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { useTabSlide } from '@/core/hooks/interaction/layout/useTabSlide'
import type { TabItem } from '@/components/elements/navigation/Tabs'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PLAY_GAMES, PLAY_HUB_COPY, playKeysOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_STYLES, PLAY_SETUP } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

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
  // Game being set up, dresses the sheet
  game: PlayGameName
  isSaving: boolean
  // Rules of a waiting game, not a new one
  isEditing: boolean
  // Choices hold, the game may open
  canSubmit: boolean
  // Words of the last button when a step follows
  submitLabel?: string
  // Single footer row, save and cancel on every tab
  isCompact?: boolean
  copy: PlaySetupCopy
  tabs: TabItem[]
  onClose: () => void
  onSubmit: () => void
  // Body of the tab on screen
  children: (tab: string) => ReactNode
}

/**
 * Sheet of a game's rules: the game's scene on top, one card per setting, then steps and create
 * @param {PlaySetupDrawerProps} props - Sheet state, tabs and body
 * @return {JSX.Element}
 */

export const PlaySetupDrawer = ({
  open,
  game,
  isSaving,
  isEditing,
  canSubmit,
  submitLabel,
  isCompact = false,
  copy,
  tabs,
  onClose,
  onSubmit,
  children,
}: PlaySetupDrawerProps) => {
  const [tab, setTab] = useState(tabs[0].value)
  const BackIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext
  const SaveIcon = ICONS.playTick
  const meta = PLAY_GAMES.get(game)
  const index = tabs.findIndex((entry) => entry.value === tab)
  const slide = useTabSlide(index)
  const back = tabs[index - 1]
  const next = tabs[index + 1]
  const isSubmit = !next || isCompact
  const saveLabel = submitLabel ?? (isEditing ? PLAY_HUB_COPY.saveRules : copy.create)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      isFullScreen
      title={meta.label}
      icon="play"
      skin={{ className: PLAY_SETUP.panel, style: playKeysOf(game) }}
      hero={({ titleId, onClose: close }) => (
        <div className={PLAY_SETUP.hero}>
          <PlayGameArt game={game} className={PLAY_SETUP.art} />
          <Button
            variant="icon"
            icon="close"
            onClick={close}
            aria-label={copy.cancel}
            className={PLAY_SETUP.close}
          />
          <div className={PLAY_SETUP.head}>
            <PlayGameLogo game={game} className={PLAY_SETUP.logo} />
            <div className={PLAY_SETUP.titles}>
              <span className={PLAY_SETUP.eyebrow}>
                {isEditing ? PLAY_HUB_COPY.setupEditEyebrow : PLAY_HUB_COPY.setupEyebrow}
              </span>
              <h2 id={titleId} className={PLAY_SETUP.title}>
                {meta.label}
              </h2>
              <span className={PLAY_SETUP.note}>{meta.tagline}</span>
            </div>
          </div>
        </div>
      )}
      subheader={
        tabs.length > 1 && (
          <div className={DRAWER_STYLES.subheaderRow}>
            <div className={DRAWER_STYLES.subheaderTabs}>
              <Tabs items={tabs} value={tab} onChange={setTab} label={copy.tabs} emphasis isFull />
            </div>
          </div>
        )
      }
      footer={
        <div className={PLAY_SETUP.footer}>
          {back && (
            <Button variant="arcadeText" onClick={() => setTab(back.value)} aria-label={back.label}>
              <BackIcon className="size-4" aria-hidden="true" />
              {back.label}
            </Button>
          )}
          <span className={PLAY_SETUP.footerGap} />
          {isSubmit && (
            <Button
              variant="arcadeText"
              disabled={isSaving}
              onClick={onClose}
              className={PLAY_SETUP.cancel}
            >
              {copy.cancel}
            </Button>
          )}
          {isSubmit ? (
            <Button
              variant="arcade"
              isLoading={isSaving}
              disabled={!canSubmit}
              onClick={onSubmit}
              className={PLAY_SETUP.main}
            >
              <SaveIcon className="size-5" aria-hidden="true" />
              {saveLabel}
            </Button>
          ) : (
            <Button variant="arcade" onClick={() => setTab(next.value)} className={PLAY_SETUP.main}>
              {next.label}
              <NextIcon className="size-5" aria-hidden="true" />
            </Button>
          )}
        </div>
      }
    >
      <div key={tab} className={slide}>
        {children(tab)}
      </div>
    </Drawer>
  )
}
