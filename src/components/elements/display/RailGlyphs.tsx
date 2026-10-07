import { Stroke, type GlyphProps } from '@/components/elements/display/Glyphs'

// Linear-style set of the rail: one thin stroke, no fill, colour from the text

/**
 * Live line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailLiveGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <circle cx="12" cy="12" r="2.4" />
    <path d="M7.6 7.6a6.2 6.2 0 0 0 0 8.8M16.4 7.6a6.2 6.2 0 0 1 0 8.8" />
  </Stroke>
)

/**
 * Search line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailSearchGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Stroke>
)

/**
 * Refresh line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailRefreshGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />
  </Stroke>
)

/**
 * Home line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailHomeGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M4 11l8-7 8 7M6 9.5V19h12V9.5M10 19v-5h4v5" />
  </Stroke>
)

/**
 * Absence line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailAbsenceGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M4 10h16M8 3v4M16 3v4M10.2 13.4l3.6 3.6M13.8 13.4l-3.6 3.6" />
  </Stroke>
)

/**
 * News line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailNewsGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M10 8.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5zM18 4v4M16 6h4" />
  </Stroke>
)

/**
 * Calendar line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailCalendarGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M4 10h16M8 3v4M16 3v4" />
  </Stroke>
)

/**
 * Academy line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailAcademyGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M2.5 9.5L12 5l9.5 4.5L12 14zM6.5 12v4.5c0 1 2.5 2.5 5.5 2.5s5.5-1.5 5.5-2.5V12" />
  </Stroke>
)

/**
 * Crown line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailCrownGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M4 8l4 4 4-6 4 6 4-4-1.5 10h-13z" />
  </Stroke>
)

/**
 * Members line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailMembersGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M16.5 14c2.5 0 4.5 1.7 4.5 4.5" />
  </Stroke>
)

/**
 * Projects line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailProjectsGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M3.5 7.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  </Stroke>
)

/**
 * Tasks line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailTasksGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
  </Stroke>
)

/**
 * Recruitment line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailRecruitmentGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <circle cx="10" cy="8" r="3.2" />
    <path d="M4 19c0-3.2 2.7-5.2 6-5.2M17 12v6M14 15h6" />
  </Stroke>
)

/**
 * Crisis line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailCrisisGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M12 4l9 15.5H3zM12 10v4M12 16.8v.2" />
  </Stroke>
)

/**
 * Discord line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailDiscordGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM9 11.5v.01M15 11.5v.01" />
  </Stroke>
)

/**
 * Settings line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailSettingsGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Stroke>
)

/**
 * System line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailSystemGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <rect x="4" y="4" width="16" height="7" rx="2" />
    <rect x="4" y="13" width="16" height="7" rx="2" />
    <path d="M8 7.5v.01M8 16.5v.01" />
  </Stroke>
)

/**
 * Sheet line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailSheetGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15.5h6" />
  </Stroke>
)

/**
 * Clock line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailClockGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 2" />
  </Stroke>
)

/**
 * Spark line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailSparkGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M12 3.5c.8 4.6 3.9 7.7 8.5 8.5-4.6.8-7.7 3.9-8.5 8.5-.8-4.6-3.9-7.7-8.5-8.5 4.6-.8 7.7-3.9 8.5-8.5z" />
  </Stroke>
)

/**
 * Birthday line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RailBirthdayGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <rect x="4" y="9.5" width="16" height="4" rx="1" />
    <path d="M5.5 13.5V20h13v-6.5M12 9.5V20M12 9.5c-1-3-4.5-3.5-4.5-1.5 0 1.3 2 1.5 4.5 1.5 2.5 0 4.5-.2 4.5-1.5 0-2-3.5-1.5-4.5 1.5z" />
  </Stroke>
)
