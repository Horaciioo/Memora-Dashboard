import { initialsOf } from '@/utils/format/initials'
import { AVATAR_STYLES, type AvatarSize } from '@/declarations/ui/variants/surfaces'
import { cn } from '@/utils/classnames'

// Pixel size per token
const PIXEL_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
  hero: 176,
}

export interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
  // Native hover label, empty for none
  title?: string
}

/**
 * Round portrait falling back to the initials of the name
 * @param {string} name - Display name
 * @param {string | null} [src] - Portrait URL
 * @param {AvatarSize} [size] - Size token
 * @param {string} [className] - Extra classes merged onto the portrait
 * @param {string} [title] - Hover label
 * @return {JSX.Element}
 */

export const Avatar = ({ name, src, size = 'sm', className, title = name }: AvatarProps) => (
  <span
    className={cn(AVATAR_STYLES.base, AVATAR_STYLES[size], className)}
    title={title || undefined}
  >
    {src ? (
      /*
       * A portrait is member supplied and usually served by the session guarded file route
       */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={PIXEL_SIZES[size]}
        height={PIXEL_SIZES[size]}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    ) : (
      initialsOf(name)
    )}
  </span>
)

export interface AvatarStackProps {
  people: { id: string; name: string; src?: string | null }[]
  size?: AvatarSize
  max?: number
  wrap?: boolean
}

/**
 * Overlapping portraits with a counter once the list runs past max
 * @param {{ id: string, name: string, src?: string | null }[]} people - People to show
 * @param {AvatarSize} [size] - Size token
 * @param {number} [max] - Portraits shown before collapsing
 * @param {boolean} [wrap] - Drops to the next line at the edge of the box
 * @return {JSX.Element}
 */

export const AvatarStack = ({ people, size = 'xs', max = 4, wrap }: AvatarStackProps) => {
  const shown = people.slice(0, max)
  const hidden = people.length - shown.length

  return (
    <span className={wrap ? AVATAR_STYLES.stackWrapped : AVATAR_STYLES.stack}>
      {shown.map((person) => (
        <Avatar
          key={person.id}
          name={person.name}
          src={person.src}
          size={size}
          className={AVATAR_STYLES.ring}
        />
      ))}
      {hidden > 0 && (
        <span
          className={cn(
            AVATAR_STYLES.base,
            AVATAR_STYLES[size],
            AVATAR_STYLES.ring,
            'bg-[var(--color-ink-subtle)] text-[var(--color-on-brand)]'
          )}
        >
          {`+${hidden}`}
        </span>
      )}
    </span>
  )
}
