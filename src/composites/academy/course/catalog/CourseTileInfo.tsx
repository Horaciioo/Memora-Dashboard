import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'

export interface CourseTileInfoProps {
  lines: string[]
}

/**
 * Facts of a course, one per line
 * @param {CourseTileInfoProps} props - One line per fact
 * @return {JSX.Element}
 */

export const CourseTileInfo = ({ lines }: CourseTileInfoProps) => {
  const Bullet = ICONS.bullet

  return (
    <span className={COURSE_CATALOG.infoList}>
      {lines.map((line) => (
        <span key={line} className={COURSE_CATALOG.infoLine}>
          <Bullet className={COURSE_CATALOG.infoBullet} aria-hidden="true" />
          {line}
        </span>
      ))}
    </span>
  )
}
