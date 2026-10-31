'use client'

import { useId } from 'react'

import { FILE_SETTINGS } from '@/declarations/configurations/settings'
import { DESIGN_COPY, DesignKinds } from '@/declarations/reference/design'
import type { DesignKindName } from '@/declarations/reference/design'
import { CREATOR_FILE } from '@/declarations/ui/blocks'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

// Frame and picture classes of each kind
const SHAPES = {
  [DesignKinds.Banner]: [CREATOR_FILE.designBanner, CREATOR_FILE.designImage],
  [DesignKinds.Avatar]: [CREATOR_FILE.designAvatar, CREATOR_FILE.designAvatarImage],
  [DesignKinds.Logo]: [CREATOR_FILE.designLogo, CREATOR_FILE.designLogoImage],
}

const ADD_LABELS = {
  [DesignKinds.Banner]: DESIGN_COPY.addBanner,
  [DesignKinds.Avatar]: DESIGN_COPY.addAvatar,
  [DesignKinds.Logo]: DESIGN_COPY.addLogo,
}

export interface DesignCardProps {
  kind: DesignKindName
  url: string | null
  disabled: boolean
  canRemove: boolean
  caption?: string
  slotItems?: MenuItem[]
  onFile: (file: File) => void
  onRemove: () => void
}

/**
 * One picture of the gallery, or the empty slot that takes it
 * @param {DesignKindName} kind - Picture kind
 * @param {string | null} url - Stored picture route
 * @param {boolean} disabled - Blocks the card
 * @param {boolean} canRemove - Right click offers the options
 * @param {string} [caption] - Usage shown below
 * @param {MenuItem[]} [slotItems] - Placement entries, click opens the menu
 * @param {(file: File) => void} onFile - Picked file
 * @param {() => void} onRemove - Drop the picture
 * @return {JSX.Element}
 */

export const DesignCard = ({
  kind,
  url,
  disabled,
  canRemove,
  caption,
  slotItems,
  onFile,
  onRemove,
}: DesignCardProps) => {
  const { contextMenu, openMenu } = useMenu()
  const inputId = useId()
  const onPick = () => document.getElementById(inputId)?.click()
  const [shape, image] = SHAPES[kind]
  const isGallery = kind === DesignKinds.Banner
  const frame = isGallery ? CREATOR_FILE.designBannerTall : shape

  // Entries of the menu
  const items: MenuItem[] = [
    { id: 'replace', label: DESIGN_COPY.replace, icon: 'add', onSelect: onPick },
    ...(slotItems ?? []),
    {
      id: 'remove',
      label: DESIGN_COPY.remove,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      onSelect: onRemove,
    },
  ]
  const hasMenu = canRemove && Boolean(url)

  return (
    <>
      <input
        id={inputId}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept={FILE_SETTINGS.allowedTypes.join(',')}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={disabled}
        className={cn(CREATOR_FILE.designCard, frame, !url && CREATOR_FILE.designEmpty)}
        onClick={(event) =>
          hasMenu && slotItems
            ? openMenu(items, { x: event.clientX, y: event.clientY }, ADD_LABELS[kind])
            : onPick()
        }
        onContextMenu={hasMenu ? contextMenu(items, ADD_LABELS[kind]) : undefined}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" loading="lazy" className={image} />
        ) : (
          ADD_LABELS[kind]
        )}
        {url && caption && <span className={CREATOR_FILE.designCaption}>{caption}</span>}
      </button>
    </>
  )
}
