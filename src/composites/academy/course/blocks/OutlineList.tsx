import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_READ } from '@/declarations/ui/variants'

export interface OutlineListProps {
  chapters: { key: string; title: string }[]
}

/**
 * Chapters of the course, one after the other
 * @param {OutlineListProps} props - Chapters
 * @return {JSX.Element}
 */

export const OutlineList = ({ chapters }: OutlineListProps) => (
  <section className={COURSE_READ.plan}>
    <h3 className={COURSE_READ.planTitle}>{COURSE_COPY.planTitle}</h3>
    <ol className={COURSE_READ.planList}>
      {chapters.map((chapter, index) => (
        <li key={chapter.key} className={COURSE_READ.planItem}>
          <span className={COURSE_READ.planIndex}>{index + 1}</span>
          {chapter.title}
        </li>
      ))}
    </ol>
  </section>
)
