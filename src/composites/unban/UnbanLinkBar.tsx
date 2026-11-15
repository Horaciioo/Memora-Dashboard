'use client'

import { useSyncExternalStore } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { contestPath } from '@/core/lib/unban/slug'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'

export interface UnbanLinkBarProps {
  // Creator the view is on
  creatorName: string
}

// Origin is only known in the browser, nothing to watch
const noWatch = () => () => {}
const browserOrigin = () => window.location.origin
const serverOrigin = () => ''

/**
 * Permanent public link of the creator in view, written out in full and copied in one tap
 * @param {string} creatorName - Creator named by the link
 * @return {JSX.Element | null}
 */

export const UnbanLinkBar = ({ creatorName }: UnbanLinkBarProps) => {
  const copyLink = useCopy(UNBAN_SCREEN_COPY.linkCopied)
  const origin = useSyncExternalStore(noWatch, browserOrigin, serverOrigin)

  if (!creatorName) return null

  const url = `${origin}${contestPath(creatorName)}`

  return (
    <div className={UNBAN_DESK_STYLES.linkBox}>
      <p className={UNBAN_DESK_STYLES.linkUrl}>
        <span className={UNBAN_DESK_STYLES.sectionTitle}>{UNBAN_SCREEN_COPY.linkLabel}</span> {url}
      </p>
      <Button
        variant="icon"
        icon="copy"
        aria-label={UNBAN_SCREEN_COPY.linkCopy}
        title={UNBAN_SCREEN_COPY.linkCopy}
        onClick={() => void copyLink(url)}
      />
    </div>
  )
}
