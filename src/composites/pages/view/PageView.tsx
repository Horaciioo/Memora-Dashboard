'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Editor } from '@tiptap/core'

import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PageEditor } from '@/composites/pages/editor/PageEditor'
import { PageComments } from '@/composites/pages/view/PageComments'
import { PageHeading } from '@/composites/pages/view/PageHeading'
import { PageHistory } from '@/composites/pages/view/PageHistory'
import { PageMenu } from '@/composites/pages/view/PageMenu'
import { PageTopBar } from '@/composites/pages/view/PageTopBar'
import { TrashedBanner } from '@/composites/pages/view/TrashedBanner'
import { usePageWidth } from '@/core/hooks/interaction/state/usePageWidth'
import {
  usePageActions,
  usePageDoc,
  usePageLive,
  usePageMeta,
  usePagePresence,
} from '@/core/hooks/data/pages'
import { levelAllows } from '@/core/lib/pages'
import { tintOf } from '@/core/lib/realtime/tint'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageDetail, PageDocument } from '@/types/pages'
import { cn } from '@/utils/classnames'

export interface PageViewProps {
  page: PageDetail
  accountId: string
  accountName: string
  accountImage: string | null
}

/**
 * Page edited together: heading, shared block editor, presence and discussion
 * @param {PageViewProps} props - Page and signed-in member
 * @return {JSX.Element}
 */

export const PageView = ({ page, accountId, accountName, accountImage }: PageViewProps) => {
  const router = useRouter()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [contentAt, setContentAt] = useState(page.contentAt)
  const [isHistoryOpen, setHistoryOpen] = useState(false)
  const { create } = usePageActions()
  const { upload } = usePageMeta(page.id)
  const { isWide } = usePageWidth()
  const canWrite = levelAllows(page.level, 'write') && !page.trashedAt
  const { shared, status } = usePageDoc(page, accountId, canWrite)
  usePageLive(page.id, setContentAt)
  const presence = usePagePresence(page.id, editor)
  const user = useMemo(
    () => ({ name: accountName, image: accountImage, tint: tintOf(accountId) }),
    [accountId, accountImage, accountName]
  )

  const createSubpage = useCallback(
    async () => (await create({ parentId: page.id, open: false }))?.id ?? null,
    [create, page.id]
  )

  return (
    <div className={cn(PAGE_VIEW_STYLES.column, isWide && PAGE_VIEW_STYLES.columnWide)}>
      <BreadcrumbLabel label={page.title || PAGES_COPY.untitled} />
      <PageTopBar
        page={page}
        status={status}
        contentAt={contentAt}
        presence={presence}
        onRetry={() => router.refresh()}
      />
      <PageMenu page={page} onHistory={() => setHistoryOpen(true)} />

      <PageHeading page={page} />

      {page.trashedAt && <TrashedBanner pageId={page.id} />}
      {!canWrite && !page.trashedAt && (
        <p className={PAGE_VIEW_STYLES.readOnly}>{PAGES_COPY.readOnlyHint}</p>
      )}

      <PageEditor
        pageId={page.id}
        shared={shared}
        user={user}
        editable={canWrite}
        onReady={setEditor}
        uploadImage={upload}
        createSubpage={createSubpage}
      />

      {isHistoryOpen && (
        <PageHistory
          pageId={page.id}
          canRestore={canWrite}
          current={() => (editor?.getJSON() as PageDocument | undefined) ?? null}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {!page.trashedAt && (
        <PageComments
          pageId={page.id}
          canComment={levelAllows(page.level, 'comment')}
          canModerate={levelAllows(page.level, 'share')}
        />
      )}
    </div>
  )
}
