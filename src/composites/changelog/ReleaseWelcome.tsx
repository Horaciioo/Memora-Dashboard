'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { ReleaseShowcase } from '@/composites/changelog/showcase/ReleaseShowcase'
import { useSplashDone } from '@/core/hooks/interaction/layout/useSplashDone'
import { useFreshRelease } from '@/core/hooks/data/system/useFreshRelease'
import { SHOWCASE_COPY } from '@/declarations/changelog/showcase'
import { ROUTES } from '@/declarations/navigation'
import { SHOWCASE } from '@/declarations/ui/variants'

export interface ReleaseWelcomeProps {
  // Dev shows it on every load
  isAlways?: boolean
}

/**
 * Box over the page after an update
 * @param {boolean} [isAlways] - Ignores the read mark
 * @return {JSX.Element | null}
 */

export const ReleaseWelcome = ({ isAlways = false }: ReleaseWelcomeProps) => {
  const router = useRouter()
  const { release, isFresh, markSeen } = useFreshRelease()
  const [isClosed, setIsClosed] = useState(false)
  const isSplashDone = useSplashDone()

  if (!release?.hasShowcase || !(isFresh || isAlways)) return null

  const close = () => {
    setIsClosed(true)
    markSeen()
  }

  const read = () => {
    close()
    router.push(ROUTES.changelog)
  }

  return (
    <Dialog
      open={!isClosed && isSplashDone}
      onClose={close}
      title={release.title}
      description={release.intro}
      size="xl"
      footer={
        <div className={SHOWCASE.actions}>
          <Button variant="secondary" onClick={close}>
            {SHOWCASE_COPY.later}
          </Button>
          <Button variant="primary" onClick={read}>
            {SHOWCASE_COPY.read}
          </Button>
        </div>
      }
    >
      <ReleaseShowcase />
    </Dialog>
  )
}
