'use client'

import type { CSSProperties } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import {
  CONCORDAT_HUD_COPY,
  CONCORDAT_OFFER_ASKS,
  CONCORDAT_OFFER_KINDS,
  CONCORDAT_OFFER_TONES,
} from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { ConcordatIntents } from '@/utils/constants/concordat'

// Ticks an offer lasts, the bar drains over it
const OFFER_TICKS = CONCORDAT.diplomacy.offerSeconds * CONCORDAT_TICKS_PER_SECOND

export interface ConcordatOffersProps {
  client: ConcordatClientState
  names: string[]
  act: (body: Record<string, unknown>) => Promise<boolean>
}

/**
 * Proposals waiting for me, a card each on the right with accept and refuse
 * @param {ConcordatOffersProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatOffers = ({ client, names, act }: ConcordatOffersProps) => {
  const mine = client.offers.filter(
    (offer) => offer.to === client.me && offer.kind in CONCORDAT_OFFER_KINDS
  )
  if (!mine.length) return null

  return (
    <div className={CONCORDAT_HUD.offers} role="status">
      {mine.map((offer) => (
        <div
          key={offer.id}
          className={CONCORDAT_HUD.offer}
          style={{ '--tone': CONCORDAT_OFFER_TONES[offer.kind] } as CSSProperties}
        >
          <span className={CONCORDAT_HUD.offerKind}>{CONCORDAT_OFFER_KINDS[offer.kind]}</span>
          <p className={CONCORDAT_HUD.offerText}>
            <span className={CONCORDAT_HUD.offerName}>{names[offer.from]}</span>{' '}
            {CONCORDAT_OFFER_ASKS[offer.kind]}
          </p>
          <div className={CONCORDAT_HUD.offerActions}>
            <button
              type="button"
              className={CONCORDAT_HUD.accept}
              onClick={() => void act({ type: ConcordatIntents.Accept, offer: offer.id })}
            >
              {CONCORDAT_HUD_COPY.accept}
            </button>
            <button
              type="button"
              className={CONCORDAT_HUD.refuse}
              onClick={() => void act({ type: ConcordatIntents.Refuse, offer: offer.id })}
            >
              {CONCORDAT_HUD_COPY.refuse}
            </button>
          </div>
          <div className={CONCORDAT_HUD.offerBar} aria-hidden>
            <div
              className={CONCORDAT_HUD.offerFill}
              style={{
                width: `${Math.max(0, Math.min(1, (offer.expiresAt - client.tick) / OFFER_TICKS)) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
