import { NavalDecks } from '@/declarations/play/naval/fleets'
import type { NavalDeck } from '@/declarations/play/naval/fleets'
import type { NavalSkin } from '@/declarations/play/naval/skins'

type Pen = CanvasRenderingContext2D

// Deck texture, clipped to the deck, in squares
type DeckPainter = (ctx: Pen, skin: NavalSkin, length: number, half: number) => void

// Squares between two plates or facets
const PLATE = 0.5
const FACET = 0.6

// Deck textures by kind
const DECKS: Record<NavalDeck, DeckPainter | null> = {
  [NavalDecks.Plain]: null,
  [NavalDecks.Seams]: (ctx, _skin, length, half) => {
    for (const row of [-0.66, -0.22, 0.22, 0.66]) {
      ctx.moveTo(0, half * row)
      ctx.lineTo(length, half * row)
    }
  },
  [NavalDecks.Facets]: (ctx, _skin, length, half) => {
    ctx.moveTo(0, 0)
    ctx.lineTo(length, 0)
    for (let x = FACET; x < length; x += FACET) {
      ctx.moveTo(x - FACET * 0.5, -half)
      ctx.lineTo(x, 0)
      ctx.lineTo(x - FACET * 0.5, half)
    }
  },
  [NavalDecks.Plates]: (ctx, _skin, length, half) => {
    ctx.moveTo(0, 0)
    ctx.lineTo(length, 0)
    for (let x = PLATE; x < length; x += PLATE) {
      ctx.moveTo(x, -half)
      ctx.lineTo(x, half)
    }
  },
  [NavalDecks.Flight]: (ctx, skin, length, half) => {
    // Edge lines then the runway
    ctx.moveTo(0, -half * 0.8)
    ctx.lineTo(length, -half * 0.8)
    ctx.moveTo(0, half * 0.8)
    ctx.lineTo(length, half * 0.8)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = skin.top
    ctx.setLineDash([0.22, 0.2])
    ctx.moveTo(length * 0.08, half * 0.2)
    ctx.lineTo(length * 0.92, -half * 0.3)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.strokeStyle = skin.stripe
    ctx.moveTo(length * 0.03, -half * 0.5)
    ctx.lineTo(length * 0.03, half * 0.5)
  },
}

/**
 * Texture of a deck, already clipped
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {NavalDeck} deck - Texture
 * @param {number[]} size - Length and half beam
 * @return {void}
 */

export const paintDeckTexture = (
  ctx: Pen,
  skin: NavalSkin,
  deck: NavalDeck,
  [length, half]: number[]
) => {
  const painter = DECKS[deck]
  if (!painter) return
  ctx.beginPath()
  ctx.strokeStyle = skin.seam
  painter(ctx, skin, length, half)
  ctx.stroke()
}
