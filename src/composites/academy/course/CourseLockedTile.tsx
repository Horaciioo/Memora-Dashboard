import { CourseTileInfo } from '@/composites/academy/course/CourseTileInfo'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_PERIODS } from '@/declarations/academy/registries'
import type { CourseTrack } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'

// Question marks on the banner
const MARKS = [0, 1, 2]

/**
 * A specialisation still hidden: nothing but question marks
 * @param {Object} props - Track of the course
 * @return {JSX.Element}
 */

export const CourseLockedTile = ({ track }: { track: CourseTrack }) => {
  const Mark = ICONS.help

  return (
    <div role="img" aria-label={COURSE_COPY.lockedLabel} className={COURSE_CATALOG.tileLocked}>
      <span className={COURSE_CATALOG.lockedBanner}>
        {MARKS.map((mark) => (
          <Mark key={mark} className={COURSE_CATALOG.lockedGlyph} />
        ))}
      </span>
      <span className={COURSE_CATALOG.lockedBody}>
        <span className={COURSE_CATALOG.lockedName}>{COURSE_COPY.lockedName}</span>
        <CourseTileInfo lines={[COURSE_COPY.periodFrom(COURSE_PERIODS[track])]} />
      </span>
    </div>
  )
}
