import { Frame } from '@/components/elements/display/BrandGlyphs'
import type { GlyphProps } from '@/components/elements/display/BrandGlyphs'

/**
 * Red dot of a live
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveDotGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={deep} opacity="0.25" />
        <circle cx="12" cy="12" r="6.4" fill={fill} />
        <circle cx="10.4" cy="10.2" r="2.6" fill={lift} opacity="0.85" />
      </>
    )}
  />
)

/**
 * Twitch speech mark
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TwitchGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="TWITCH"
    render={({ fill, lift, cut }) => (
      <>
        <path d="M4.5 2.5h16v11l-5 5h-4l-3 3v-3h-4z" fill={fill} />
        <path d="M4.5 2.5h16v4h-16z" fill={lift} opacity="0.55" />
        <path d="M11 7.5v4.5M15.5 7.5v4.5" stroke={cut} strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * YouTube play badge
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const YoutubeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="YOUTUBE"
    render={({ fill, lift, cut }) => (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4.5" fill={fill} />
        <path d="M2 9.5a4.5 4.5 0 0 1 4.5-4.5h11A4.5 4.5 0 0 1 22 9.5z" fill={lift} opacity="0.5" />
        <path d="M10 8.8v6.4l5.4-3.2z" fill={cut} />
      </>
    )}
  />
)

/**
 * Deleted message bin
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModDeleteGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M5.5 7.5h13l-1.2 12.2a2 2 0 0 1-2 1.8H8.7a2 2 0 0 1-2-1.8z" fill={fill} />
        <rect x="3.5" y="4.5" width="17" height="3.2" rx="1.6" fill={deep} />
        <path d="M9.5 2.5h5v2h-5z" fill={lift} />
        <path d="M10 11v6.5M14 11v6.5" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Timeout clock
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModTimeoutGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="caution"
    render={({ fill, lift, cut }) => (
      <>
        <circle cx="12" cy="12" r="9.5" fill={fill} />
        <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5H12z" fill={lift} opacity="0.55" />
        <path
          d="M12 6.5V12l3.6 2.4"
          stroke={cut}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    )}
  />
)

/**
 * Ban stop sign
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModBanGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, deep, cut }) => (
      <>
        <circle cx="12" cy="12" r="9.5" fill={fill} />
        <circle cx="12" cy="12" r="6" fill={deep} opacity="0.35" />
        <path d="M6.8 17.2 17.2 6.8" stroke={cut} strokeWidth="2.6" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Unban open ring
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModUnbanGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="success"
    render={({ fill, lift, cut }) => (
      <>
        <circle cx="12" cy="12" r="9.5" fill={fill} />
        <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5H12z" fill={lift} opacity="0.5" />
        <path
          d="M7.6 12.4 10.6 15.4 16.6 8.8"
          stroke={cut}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    )}
  />
)

/**
 * Warning triangle
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModWarnGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="caution"
    render={({ fill, lift, cut }) => (
      <>
        <path d="M12 2.5 22 20.5H2z" fill={fill} strokeLinejoin="round" />
        <path d="M12 2.5 17 11.5H7z" fill={lift} opacity="0.55" />
        <path d="M12 9v5.5" stroke={cut} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="17.6" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * AutoMod held shield
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AutoModGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M12 2 20.5 5.2v6.3c0 5.1-3.6 8.8-8.5 10.5C7.1 20.3 3.5 16.6 3.5 11.5V5.2z"
          fill={fill}
        />
        <path d="M12 2 20.5 5.2v4.3H3.5V5.2z" fill={lift} opacity="0.55" />
        <path d="M8 14.5h8M8 11h8" stroke={cut} strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Shield mode badge
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ShieldModeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M12 2 20.5 5.2v6.3c0 5.1-3.6 8.8-8.5 10.5C7.1 20.3 3.5 16.6 3.5 11.5V5.2z"
          fill={fill}
        />
        <path d="M12 2v20c-4.9-1.7-8.5-5.4-8.5-10.5V5.2z" fill={lift} opacity="0.45" />
        <path d="M12 7v6" stroke={cut} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * Slow mode hourglass
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SlowModeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="caution"
    render={({ fill, lift, deep }) => (
      <>
        <rect x="5" y="2.5" width="14" height="2.6" rx="1.3" fill={deep} />
        <rect x="5" y="18.9" width="14" height="2.6" rx="1.3" fill={deep} />
        <path
          d="M6.8 5.1h10.4c0 3.6-3.4 5.3-3.4 6.9s3.4 3.3 3.4 6.9H6.8c0-3.6 3.4-5.3 3.4-6.9S6.8 8.7 6.8 5.1z"
          fill={fill}
        />
        <path d="M9 16.5h6l-3-3z" fill={lift} />
      </>
    )}
  />
)

/**
 * Emote only smile
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const EmoteModeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="caution"
    render={({ fill, lift, cut }) => (
      <>
        <circle cx="12" cy="12" r="9.5" fill={fill} />
        <path
          d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5H2.5A9.5 9.5 0 0 1 12 2.5z"
          fill={lift}
          opacity="0.45"
        />
        <circle cx="9" cy="10" r="1.4" fill={cut} />
        <circle cx="15" cy="10" r="1.4" fill={cut} />
        <path
          d="M8 14.2c2.2 2.6 5.8 2.6 8 0"
          stroke={cut}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </>
    )}
  />
)

/**
 * Followers only heart
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const FollowerModeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M12 21s-8.5-5.2-8.5-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 3.2C20.5 15.8 12 21 12 21z"
          fill={fill}
        />
        <path
          d="M8.3 5a4.8 4.8 0 0 0-4.8 4.8c0 .7.1 1.4.3 2.1L12 6.6A4.8 4.8 0 0 0 8.3 5z"
          fill={lift}
          opacity="0.7"
        />
      </>
    )}
  />
)

/**
 * Subscribers only star
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SubscriberModeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="TWITCH"
    render={({ fill, lift }) => (
      <>
        <path
          d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z"
          fill={fill}
        />
        <path d="M12 2.5l2.9 6-2.9 3.5-2.9-3.5z" fill={lift} opacity="0.7" />
      </>
    )}
  />
)

/**
 * Blocked terms strike
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const BlockedTermsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, cut }) => (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="3.5" fill={fill} />
        <path d="M2.5 8.5A3.5 3.5 0 0 1 6 5h12a3.5 3.5 0 0 1 3.5 3.5z" fill={lift} opacity="0.55" />
        <path d="M6.5 12h11" stroke={cut} strokeWidth="2" strokeLinecap="round" />
        <path d="M6.5 15.5h6" stroke={cut} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </>
    )}
  />
)

/**
 * Broadcaster camera
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const BroadcasterGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="2" y="6" width="14" height="12" rx="3" fill={fill} />
        <path d="M16 10.5 22 7v10l-6-3.5z" fill={deep} />
        <path d="M2 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3z" fill={lift} opacity="0.55" />
        <circle cx="7" cy="12" r="1.6" fill={cut} />
      </>
    )}
  />
)

/**
 * VIP diamond
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const VipGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M6 3.5h12l4 5.5-10 12-10-12z" fill={fill} />
        <path d="M2 9h20l-10 12z" fill={deep} opacity="0.4" />
        <path d="M6 3.5h12L15 9H9z" fill={lift} />
      </>
    )}
  />
)

/**
 * Chat bot head
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ChatBotGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="LIVE"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M12 2.5v3" stroke={deep} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="2.5" r="1.4" fill={deep} />
        <rect x="3.5" y="6" width="17" height="14" rx="4" fill={fill} />
        <path d="M3.5 10a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" fill={lift} opacity="0.55" />
        <circle cx="9" cy="13" r="1.6" fill={cut} />
        <circle cx="15" cy="13" r="1.6" fill={cut} />
        <path d="M9.5 16.8h5" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Viewer silhouette
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ViewerGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <circle cx="12" cy="8" r="4.5" fill={fill} />
        <path d="M3.5 21c.6-4.6 4-7.5 8.5-7.5s7.9 2.9 8.5 7.5z" fill={fill} />
        <circle cx="10.6" cy="6.6" r="1.8" fill={lift} opacity="0.8" />
      </>
    )}
  />
)

/**
 * Chat bubble
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ChatGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M4 3.5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2z"
          fill={fill}
        />
        <path d="M2 7.5v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2z" fill={lift} opacity="0.55" />
        <path d="M6.5 10.5h11M6.5 13.5h7" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Stream screen
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const StreamGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="2" y="3.5" width="20" height="14" rx="3" fill={fill} />
        <path d="M2 6.5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3z" fill={lift} opacity="0.55" />
        <path d="M8 21h8" stroke={deep} strokeWidth="2" strokeLinecap="round" />
        <path d="M10 7.8v6.4l5.4-3.2z" fill={cut} />
      </>
    )}
  />
)

/**
 * Moderation actions list
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ModActionsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="3" y="2.5" width="18" height="19" rx="3.5" fill={fill} />
        <path d="M3 6a3.5 3.5 0 0 1 3.5-3.5h11A3.5 3.5 0 0 1 21 6z" fill={lift} opacity="0.55" />
        <circle cx="7.5" cy="9.5" r="1.2" fill={cut} />
        <circle cx="7.5" cy="13.5" r="1.2" fill={cut} />
        <circle cx="7.5" cy="17.5" r="1.2" fill={cut} />
        <path
          d="M10.5 9.5h6M10.5 13.5h6M10.5 17.5h4"
          stroke={cut}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Unban request envelope
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const UnbanRequestGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="success"
    render={({ fill, lift, cut }) => (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" fill={fill} />
        <path d="M2.6 6.4 12 13l9.4-6.6A3 3 0 0 0 19 5H5a3 3 0 0 0-2.4 1.4z" fill={lift} />
        <path d="M9.5 15.5h5" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Live coordinator flag
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const CoordinatorGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="COORDINATOR"
    render={({ fill, lift, deep }) => (
      <>
        <path d="M5 2.5v19" stroke={deep} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M6 3.5h13l-3 4.5 3 4.5H6z" fill={fill} />
        <path d="M6 3.5h13l-3 4.5H6z" fill={lift} opacity="0.6" />
      </>
    )}
  />
)

/**
 * Sanctions panel gavel
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SanctionsPanelGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect
          x="9"
          y="2"
          width="11"
          height="6.5"
          rx="2"
          transform="rotate(45 14.5 5.25)"
          fill={fill}
        />
        <path d="M10.5 11.5 3 19" stroke={deep} strokeWidth="2.6" strokeLinecap="round" />
        <rect x="3" y="19.5" width="11" height="2.5" rx="1.25" fill={deep} />
        <rect
          x="11"
          y="3.5"
          width="5"
          height="2.4"
          rx="1.2"
          transform="rotate(45 13.5 4.7)"
          fill={lift}
        />
      </>
    )}
  />
)
