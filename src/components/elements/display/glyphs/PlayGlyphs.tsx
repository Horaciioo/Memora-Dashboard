import type { ReactNode } from 'react'

import type { GlyphProps } from '@/components/elements/display/glyphs/Glyphs'

// Duotone set of Memora Play: a soft tint under one rounded stroke, colour from the text

/**
 * Wraps a duotone drawing in a 24 square
 * @param {Object} props - Sizing class and layers
 * @param {ReactNode} [props.tint] - Soft layer under the stroke
 * @param {ReactNode} props.children - Stroke layer
 * @return {JSX.Element}
 */

const Duo = ({
  className,
  tint,
  children,
}: GlyphProps & { tint?: ReactNode; children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    {tint && (
      <g fill="currentColor" opacity="0.18">
        {tint}
      </g>
    )}
    <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
)

/**
 * Play mark
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayArcadeGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
      </>
    }
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="5.5" />
    <path d="M10.2 8.6v6.8l5.4-3.4z" />
  </Duo>
)

/**
 * Back to the hub
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayBackGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="M9.5 6.5 4 12l5.5 5.5" />
    <path d="M4.5 12H15a5 5 0 0 1 5 5v1" />
  </Duo>
)

/**
 * Fold the side panel
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayFoldGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M14.5 3.5h2a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-2z" />
      </>
    }
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M14.5 3.5v17M7.5 9l3 3-3 3" />
  </Duo>
)

/**
 * Unfold the side panel
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayUnfoldGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M14.5 3.5h2a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-2z" />
      </>
    }
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M14.5 3.5v17M10.5 9l-3 3 3 3" />
  </Duo>
)

/**
 * Game chat
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayChatGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M6.5 4.5h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5.2L8 19.8V16.5H6.5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z" />
      </>
    }
  >
    <path d="M6.5 4.5h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5.2L8 19.8V16.5H6.5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z" />
    <path d="M8 9.2h8M8 12h5" />
  </Duo>
)

/**
 * Round clock
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayClockGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="12" cy="12" r="8.5" />
      </>
    }
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.6V12l3 1.8" />
  </Duo>
)

/**
 * Round done
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayDoneGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="12" cy="12" r="8.5" />
      </>
    }
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.4 12.2 2.5 2.5 4.8-5.1" />
  </Duo>
)

/**
 * Tick
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayTickGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="m5.5 12.5 4.2 4.2 8.8-9.2" />
  </Duo>
)

/**
 * Still writing
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayWritingGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="m4.5 19.5.9-4 9.6-9.6a2.1 2.1 0 0 1 3 0l.1.1a2.1 2.1 0 0 1 0 3l-9.6 9.6z" />
      </>
    }
  >
    <path d="m4.5 19.5.9-4 9.6-9.6a2.1 2.1 0 0 1 3 0l.1.1a2.1 2.1 0 0 1 0 3l-9.6 9.6z" />
    <path d="m13.4 7.6 3 3" />
  </Duo>
)

/**
 * Players at the table
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayPlayersGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="9" cy="8.5" r="3.2" />
      </>
    }
  >
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
    <circle cx="17.2" cy="9.6" r="2.4" />
    <path d="M16.8 14.4a4.3 4.3 0 0 1 4.7 4.2" />
  </Duo>
)

/**
 * Spectators
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlaySpectatorsGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M2.8 12S6.2 5.8 12 5.8s9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12z" />
      </>
    }
  >
    <path d="M2.8 12S6.2 5.8 12 5.8s9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Duo>
)

/**
 * Player profile
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayProfileGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="12" cy="8.8" r="3.4" />
      </>
    }
  >
    <circle cx="12" cy="8.8" r="3.4" />
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
  </Duo>
)

/**
 * Game stats
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayStatsGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <rect x="4" y="12" width="3.6" height="8" rx="1.2" />
        <rect x="10.2" y="5" width="3.6" height="15" rx="1.2" />
        <rect x="16.4" y="9" width="3.6" height="11" rx="1.2" />
      </>
    }
  >
    <rect x="4" y="12" width="3.6" height="8" rx="1.2" />
    <rect x="10.2" y="5" width="3.6" height="15" rx="1.2" />
    <rect x="16.4" y="9" width="3.6" height="11" rx="1.2" />
  </Duo>
)

/**
 * Trophy cup
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayTrophyGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M8 4.5h8v5.2a4 4 0 0 1-8 0z" />
      </>
    }
  >
    <path d="M8 4.5h8v5.2a4 4 0 0 1-8 0z" />
    <path d="M8 6H5.5v1.6A2.6 2.6 0 0 0 8 10.2M16 6h2.5v1.6a2.6 2.6 0 0 1-2.5 2.6M12 13.7V17M9.5 17h5M8.5 20h7" />
  </Duo>
)

/**
 * Remove a player
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayKickGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="9.5" cy="8.5" r="3.2" />
      </>
    }
  >
    <circle cx="9.5" cy="8.5" r="3.2" />
    <path d="M3.5 19.5a6 6 0 0 1 12 0M16.8 8l4 4M20.8 8l-4 4" />
  </Duo>
)

/**
 * Take a seat
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayPawnGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M12 9.1c3 1.4 3.4 4.4 4 7.4H8c.6-3 1-6 4-7.4z" />
      </>
    }
  >
    <circle cx="12" cy="6.4" r="2.6" />
    <path d="M12 9.1c3 1.4 3.4 4.4 4 7.4H8c.6-3 1-6 4-7.4zM6.5 20h11" />
  </Duo>
)

/**
 * Game rules
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayRulesGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M7 3.5h7l4.5 4.5v11a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" />
      </>
    }
  >
    <path d="M7 3.5h7l4.5 4.5v11a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5z" />
    <path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h5" />
  </Duo>
)

/**
 * Cancel the game
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayCancelGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="12" cy="12" r="8.5" />
      </>
    }
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Duo>
)

/**
 * Leave the game
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayLeaveGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M4.5 7A2.5 2.5 0 0 1 7 4.5h3v15H7A2.5 2.5 0 0 1 4.5 17z" />
      </>
    }
  >
    <path d="M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h3M14.5 8l4 4-4 4M18.5 12h-9" />
  </Duo>
)

/**
 * Invite a player
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayInviteGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="9.5" cy="8.5" r="3.2" />
      </>
    }
  >
    <circle cx="9.5" cy="8.5" r="3.2" />
    <path d="M3.5 19.5a6 6 0 0 1 12 0M18.5 8.5v5M16 11h5" />
  </Duo>
)

/**
 * Call everyone
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayCallGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M4.5 10v4a1 1 0 0 0 1 1H8l6 4V5L8 9H5.5a1 1 0 0 0-1 1z" />
      </>
    }
  >
    <path d="M4.5 10v4a1 1 0 0 0 1 1H8l6 4V5L8 9H5.5a1 1 0 0 0-1 1z" />
    <path d="M17.5 9.5a3.5 3.5 0 0 1 0 5" />
  </Duo>
)

/**
 * Letters of the game
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayLettersGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <rect x="13" y="5" width="8.5" height="13.5" rx="3" />
      </>
    }
  >
    <path d="M3.5 18.5 7.6 6.5l4.1 12M5.2 14h4.8M15 6.5v10.2M15 6.5h3a2.4 2.4 0 0 1 0 4.8h-3M15 11.3h3.5a2.7 2.7 0 0 1 0 5.4H15" />
  </Duo>
)

/**
 * Rounds played
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayRoundsGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <circle cx="12" cy="12" r="7.5" />
      </>
    }
  >
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.6 4.6v3.9h-3.9M12 8.8v3.5l2.2 1.3" />
  </Duo>
)

/**
 * Tournament bracket
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayBracketGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <rect x="15" y="9.5" width="6" height="5" rx="1.8" />
      </>
    }
  >
    <path d="M3.5 5.5h5a2 2 0 0 1 2 2V10M3.5 18.5h5a2 2 0 0 0 2-2V14M10.5 12h4.5" />
    <rect x="15" y="9.5" width="6" height="5" rx="1.8" />
  </Duo>
)

/**
 * Add
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayAddGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Duo>
)

/**
 * Remove one
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayLessGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="M5.5 12h13" />
  </Duo>
)

/**
 * Close
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayCloseGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </Duo>
)

/**
 * Previous step
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayPreviousGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="m14.5 6-6 6 6 6" />
  </Duo>
)

/**
 * Next step
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayNextGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="m9.5 6 6 6-6 6" />
  </Duo>
)

/**
 * Star
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayStarGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8 6.9 19.5l1-5.7-4.1-4 5.7-.8z" />
      </>
    }
  >
    <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8 6.9 19.5l1-5.7-4.1-4 5.7-.8z" />
  </Duo>
)

/**
 * Streak flame
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayFlameGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M12.2 3.5c.4 3-1.6 4.4-3 6.2C7.6 11.7 7 13.2 7 14.6a5 5 0 0 0 10 0c0-2.2-1.2-3.6-2.2-4.8-.4 1-1 1.6-1.8 2 .4-2.8-.2-5.6-.8-8.3z" />
      </>
    }
  >
    <path d="M12.2 3.5c.4 3-1.6 4.4-3 6.2C7.6 11.7 7 13.2 7 14.6a5 5 0 0 0 10 0c0-2.2-1.2-3.6-2.2-4.8-.4 1-1 1.6-1.8 2 .4-2.8-.2-5.6-.8-8.3z" />
    <path d="M12 19a2.3 2.3 0 0 1-2.3-2.3c0-1.3 1-2 2.3-3.2 1.3 1.2 2.3 1.9 2.3 3.2A2.3 2.3 0 0 1 12 19z" />
  </Duo>
)

/**
 * Crown
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayCrownGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="m4 8.5 4.2 4 3.8-6.5 3.8 6.5 4.2-4-1.6 10H5.6z" />
      </>
    }
  >
    <path d="m4 8.5 4.2 4 3.8-6.5 3.8 6.5 4.2-4-1.6 10H5.6zM6.5 21h11" />
  </Duo>
)

/**
 * Table feed
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayFeedGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={
      <>
        <path d="M12 4.2a5 5 0 0 0-5 5v3.2c0 1.1-.5 2.1-1.3 3h12.6c-.8-.9-1.3-1.9-1.3-3V9.2a5 5 0 0 0-5-5z" />
      </>
    }
  >
    <path d="M12 4.2a5 5 0 0 0-5 5v3.2c0 1.1-.5 2.1-1.3 3h12.6c-.8-.9-1.3-1.9-1.3-3V9.2a5 5 0 0 0-5-5zM10 18.5a2 2 0 0 0 4 0" />
  </Duo>
)

/**
 * Open the page
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayOpenGlyph = ({ className }: GlyphProps) => (
  <Duo className={className}>
    <path d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Duo>
)

/**
 * Heart, solid
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PlayHeartGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 20.6S3.8 15.7 3.8 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.2 2.4c0 6.1-8.2 11-8.2 11z" />
  </svg>
)
