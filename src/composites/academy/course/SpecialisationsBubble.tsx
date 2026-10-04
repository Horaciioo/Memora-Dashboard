'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import { ICONS } from '@/declarations/ui/icons'
import { PARKOUR_BUBBLE } from '@/declarations/ui/variants'

/**
 * Second period bubble, shown once: the specialisation courses are open
 * @return {JSX.Element | null}
 */

export const SpecialisationsBubble = () => {
  const { isSaving, run } = useMutation()
  const [isClosed, setClosed] = useState(false)
  const Glyph = ICONS.spark

  if (isClosed) return null

  const dismiss = async () => {
    const saved = await run(() =>
      apiPost(API_ROUTES.seenGuide, { key: GUIDE_KEYS.specialisations })
    )
    if (saved) setClosed(true)
  }

  return (
    <section className={PARKOUR_BUBBLE.root} aria-label={PARKOUR_COPY.specialisationsTitle}>
      <Glyph className={PARKOUR_BUBBLE.glyph} aria-hidden="true" />
      <div className={PARKOUR_BUBBLE.body}>
        <h2 className={PARKOUR_BUBBLE.title}>{PARKOUR_COPY.specialisationsTitle}</h2>
        <p className={PARKOUR_BUBBLE.text}>{PARKOUR_COPY.specialisationsBody}</p>
      </div>
      <Button variant="primary" isLoading={isSaving} onClick={() => void dismiss()}>
        {PARKOUR_COPY.specialisationsDismiss}
      </Button>
    </section>
  )
}
