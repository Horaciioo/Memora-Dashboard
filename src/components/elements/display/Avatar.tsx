import { AVATAR_STYLES, type AvatarSize } from '@/declarations/ui/variants/surfaces'
import { cn } from '@/utils/classnames'

/**
 * Build the fallback initials of a name
 * @param {string} name - Display name
 * @return {string} - Up to two letters
 */

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

// Pixel size per token, reserved so the row never jumps once the picture lands
const PIXEL_SIZES: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 64 }

export interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
}

/**
 * Round portrait falling back to the initials of the name
 * @param {string} name - Display name, also the accessible label
 * @param {string | null} [src] - Portrait URL
 * @param {AvatarSize} [size] - Size token, defaults to sm
 * @param {string} [className] - Extra classes merged onto the portrait
 * @return {JSX.Element}
 */

export const Avatar = ({ name, src, size = 'sm', className }: AvatarProps) => (
  <span className={cn(AVATAR_STYLES.base, AVATAR_STYLES[size], className)} title={name}>
    {src ? (
      /*
       * A portrait is member supplied and usually served by the session guarded file
       * route, which the image optimiser cannot authenticate against — so the browser
       * fetches it directly, cookies and all.
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
}

/**
 * Overlapping portraits with a counter once the list runs past max
 * @param {{ id: string, name: string, src?: string | null }[]} people - People to show
 * @param {AvatarSize} [size] - Size token, defaults to xs
 * @param {number} [max] - Portraits shown before collapsing, defaults to 4
 * @return {JSX.Element}
 */

export const AvatarStack = ({ people, size = 'xs', max = 4 }: AvatarStackProps) => {
  const shown = people.slice(0, max)
  const hidden = people.length - shown.length

  return (
    <span className={AVATAR_STYLES.stack}>
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
