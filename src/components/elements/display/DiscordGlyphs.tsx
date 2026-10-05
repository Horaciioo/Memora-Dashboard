import type { ReactNode } from 'react'

import { Frame } from '@/components/elements/display/BrandGlyphs'
import type { GlyphProps } from '@/components/elements/display/BrandGlyphs'

/**
 * Flat Discord interface icon
 * @param {Object} props - Icon props
 * @param {string} [props.className] - Sizing class
 * @param {ReactNode} props.children - Shapes
 * @return {JSX.Element}
 */

const Flat = ({ className, children }: { className?: string; children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    {children}
  </svg>
)

/**
 * Text channel hash
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordHashGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97zM14.15 14l.67-4H9.85l-.67 4z" />
  </Flat>
)

/**
 * Announcement channel megaphone
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordAnnounceGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M19.56 2a3 3 0 0 0-2.46 1.28 3.85 3.85 0 0 1-1.86 1.42L5.2 8.06A3 3 0 0 0 3 10.94v1.12a3 3 0 0 0 2.2 2.88l1.33.37.73 4.41A2.75 2.75 0 0 0 9.97 22h.15a2.4 2.4 0 0 0 2.36-2.8l-.38-2.23 3.14.87a3.85 3.85 0 0 1 1.86 1.42A3 3 0 0 0 22.5 17.5v-12A3.04 3.04 0 0 0 19.56 2" />
  </Flat>
)

/**
 * Rules channel book
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordRulesGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M5 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a1 1 0 0 0 1-1v-2.18A3 3 0 0 0 22 15V4a1 1 0 0 0-1-1zm1 15a1 1 0 1 1 0-2h12v2zM9.7 11.7l-1.4-1.4a1 1 0 1 0-1.4 1.4l2.1 2.1a1 1 0 0 0 1.4 0l5.3-5.3a1 1 0 0 0-1.4-1.4z" />
  </Flat>
)

/**
 * Threads bubble
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordThreadGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M12 2.81a1 1 0 0 1 0-1.41l.36-.36a1 1 0 0 1 1.41 0l9.2 9.2a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 1-1.3.13l-9.54-6.72a1 1 0 0 1-.08-1.58l1-1zM12.2 9.9 4.5 18.68a1 1 0 0 0 .04 1.37l.04.04a1 1 0 0 0 1.37.04L14.7 12.4zM3.5 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
  </Flat>
)

/**
 * Notification bell
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordBellGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M9.7 2.89c.18-.07.32-.24.37-.43a2 2 0 0 1 3.86 0c.05.2.19.36.38.43A7 7 0 0 1 19 9.5v2.09c0 .12.05.24.13.33l1.1 1.22a3 3 0 0 1 .77 2.01v.28c0 .67-.34 1.29-.95 1.56-1.31.6-4 1.51-8.05 1.51s-6.74-.91-8.05-1.5c-.61-.28-.95-.9-.95-1.57v-.28a3 3 0 0 1 .77-2l1.1-1.23a.5.5 0 0 0 .13-.33V9.5a7 7 0 0 1 4.7-6.61M9.18 19.84A.16.16 0 0 0 9 20a3 3 0 1 0 6 0 .16.16 0 0 0-.18-.16 25 25 0 0 1-5.64 0" />
  </Flat>
)

/**
 * Pinned messages pin
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordPinGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11zM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08z" />
  </Flat>
)

/**
 * Member list people
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordMembersGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 2.88c.1.42.48.75.91.6zM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92a5 5 0 0 1-.67 1.66c-.3.47-.11 1.13.4 1.35a8 8 0 0 1 4.31 4.27M12.5 9a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M2 20.5a7 7 0 0 1 14 0c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 2 20.5" />
  </Flat>
)

/**
 * Search lens
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordSearchGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42zM17 10a7 7 0 1 0-14 0 7 7 0 0 0 14 0" />
  </Flat>
)

/**
 * Inbox tray
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordInboxGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-2.65c-.5 0-.85.5-.85 1a3 3 0 1 1-6 0c0-.5-.36-1-.85-1H5.5A1.5 1.5 0 0 1 4 11.5z" />
  </Flat>
)

/**
 * Help question mark
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordHelpGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22m-.28-16c-.98 0-1.81.47-2.27 1.14A1 1 0 1 1 7.8 7.01 4.73 4.73 0 0 1 11.72 5c2.5 0 4.65 1.88 4.65 4.38 0 2.04-1.42 3.65-3.27 4.2-.03.01-.07.04-.1.06v.36a1 1 0 1 1-2 0v-.56c0-1.06.83-1.73 1.53-1.94.97-.29 1.84-1.08 1.84-2.12 0-1.25-1.12-2.38-2.65-2.38M13 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
  </Flat>
)

/**
 * Upload plus disc
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordPlusGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22m0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1" />
  </Flat>
)

/**
 * Nitro gift box
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordGiftGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M4 6a4 4 0 0 1 4-4h.09c1.8 0 3.3 1.04 3.91 2.5A4.28 4.28 0 0 1 15.91 2H16a4 4 0 0 1 3.46 6H20a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h.54A4 4 0 0 1 4 6m7 2v-.91A2.09 2.09 0 0 0 8.91 5H8a1 1 0 0 0-1 1v.5A1.5 1.5 0 0 0 8.5 8zm2 0h2.5A1.5 1.5 0 0 0 17 6.5V6a1 1 0 0 0-1-1h-.91A2.09 2.09 0 0 0 13 7.09zM3 14h8v8H6a3 3 0 0 1-3-3zm10 8h5a3 3 0 0 0 3-3v-5h-8z" />
  </Flat>
)

/**
 * GIF picker tag
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordGifGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm11.5 3a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5zM5 11.15C5 9.4 6.37 8 8.08 8h1.43c.27 0 .49.22.49.5v1c0 .28-.22.5-.5.5H8.08C7.5 10 7 10.5 7 11.15v1.7c0 .64.5 1.15 1.08 1.15h.84c.04 0 .08-.03.08-.08v-.84a.08.08 0 0 0-.08-.08H8.5a.5.5 0 0 1-.5-.5v-.5c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v2.42c0 .6-.48 1.08-1.08 1.08h-.84A3.12 3.12 0 0 1 5 12.85zM17 8.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5v1a.5.5 0 0 1-.5.5H19v1h1.5c.28 0 .5.22.5.5v1a.5.5 0 0 1-.5.5H19v2.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
  </Flat>
)

/**
 * Sticker peel
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordStickerGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M12 23a11 11 0 1 1 11-11v.05c0 .9-.36 1.77-1 2.4l-7.55 7.55c-.63.64-1.5 1-2.4 1zm-4-13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m4.88 5.04a.2.2 0 0 0-.2-.04A9.5 9.5 0 0 0 14.5 21a.2.2 0 0 0 .32.15l6.03-6.03a.4.4 0 0 0 .03-.58" />
  </Flat>
)

/**
 * Emoji smile
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordEmojiGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22M6.5 13a.5.5 0 0 0-.5.5 6 6 0 0 0 12 0 .5.5 0 0 0-.5-.5zm.5-3.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m7 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0" />
  </Flat>
)

/**
 * Category chevron
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordChevronGlyph = ({ className }: GlyphProps) => (
  <Flat className={className}>
    <path d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42" />
  </Flat>
)

/**
 * Ticket stub
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TicketGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.2a2.8 2.8 0 0 0 0 5.6V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.2a2.8 2.8 0 0 0 0-5.6z"
          fill={fill}
        />
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.2H3z" fill={lift} opacity="0.55" />
        <path d="M15 5.5v13" stroke={deep} strokeWidth="1.4" strokeDasharray="1.6 1.8" />
        <path d="M7 10.5h5M7 13.5h3.5" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  />
)
