'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

import { PageOptions } from '@/components/structures/page/PageOptions'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { usePageActions, usePageMeta } from '@/core/hooks/data/pages'
import { usePageWidth } from '@/core/hooks/interaction/state/usePageWidth'
import { usePageCommentsShown } from '@/core/hooks/interaction/state/usePageCommentsShown'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { levelAllows } from '@/core/lib/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_LEVELS } from '@/declarations/pages/access'
import { PAGE_MENU_COPY, PAGES_COPY, PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import type { PageDetail } from '@/types/pages'
import { formatDay } from '@/utils/format/dates'

export interface PageMenuProps {
  page: PageDetail
}

/**
 * Page options behind the three dots
 * @param {PageDetail} page - Page
 * @return {JSX.Element}
 */

export const PageMenu = ({ page }: PageMenuProps) => {
  const router = useRouter()
  const { trash } = usePageActions()
  const { setCover, upload } = usePageMeta(page.id)
  const copy = useCopy(PAGE_SHARE_COPY.linkCopied)
  const coverInput = useRef<HTMLInputElement>(null)
  const { isWide, setWide } = usePageWidth()
  const { isShown, setShown } = usePageCommentsShown()
  const canWrite = levelAllows(page.level, 'write') && !page.trashedAt

  const options: PageOption[] = [
    {
      id: 'privacy',
      label: PAGE_MENU_COPY.privacyTitle,
      group: 'privacy',
      text: PAGE_MENU_COPY.privacyNote,
    },
    {
      id: 'owner',
      group: 'owner',
      name: page.ownerName,
      image: page.ownerImage,
      lines: [
        PAGE_MENU_COPY.createdLine.replace('{date}', formatDay(page.createdAt)),
        PAGE_MENU_COPY.editedLine.replace('{date}', formatDay(page.updatedAt)),
        ...(page.isOwn ? [] : [PAGE_LEVELS.get(page.level).label]),
      ],
    },
    {
      id: 'wide',
      label: PAGE_MENU_COPY.wide,
      group: 'display',
      checked: isWide,
      onChange: setWide,
    },
    {
      id: 'comments',
      label: PAGE_MENU_COPY.showComments,
      group: 'display',
      checked: isShown,
      onChange: setShown,
    },
    {
      id: 'link',
      label: PAGE_MENU_COPY.copyLink,
      icon: 'link',
      group: 'actions',
      onSelect: () => void copy(`${window.location.origin}${ROUTES.page(page.id)}`),
    },
    ...(canWrite
      ? [
          {
            id: 'cover',
            label: page.coverUrl ? PAGES_COPY.coverChange : PAGES_COPY.coverAdd,
            icon: 'image' as const,
            group: 'actions',
            onSelect: () => coverInput.current?.click(),
          },
          ...(page.coverUrl
            ? [
                {
                  id: 'uncover',
                  label: PAGES_COPY.coverRemove,
                  icon: 'remove' as const,
                  group: 'actions',
                  onSelect: () => void setCover(null),
                },
              ]
            : []),
        ]
      : []),
    ...(levelAllows(page.level, 'trash') && !page.trashedAt
      ? [
          {
            id: 'trash',
            label: PAGE_MENU_COPY.trash,
            icon: 'remove' as const,
            danger: true,
            group: 'trash',
            onSelect: () =>
              void trash(page.id).then(() =>
                router.push(page.trail.at(-1) ? ROUTES.page(page.trail.at(-1)!.id) : ROUTES.pages)
              ),
          },
        ]
      : []),
  ]

  return (
    <>
      <PageOptions options={options} title={PAGE_MENU_COPY.panelTitle} />
      <input
        ref={coverInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          const url = file ? await upload(file) : null
          if (url) await setCover(url)
        }}
      />
    </>
  )
}
