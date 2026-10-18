'use client'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type {
  Course,
  CourseIntro as CourseIntroData,
} from '@/declarations/academy/curriculum/types'
import { COURSE_PAGES } from '@/declarations/ui/variants'

export interface CourseIntroProps {
  course: Course
  intro: CourseIntroData
  onStart: () => void
}

/**
 * Opening page of a course
 * @param {Course} course - Course
 * @param {CourseIntroData} intro - Opening text
 * @param {() => void} onStart - Open the first chapter
 * @return {JSX.Element}
 */

export const CourseIntro = ({ course, intro, onStart }: CourseIntroProps) => (
  <article className={COURSE_PAGES.page}>
    <header className={COURSE_PAGES.section}>
      <span className={COURSE_PAGES.kicker}>{COURSE_COPY.introKicker}</span>
      <h2 className={COURSE_PAGES.title}>{COURSE_COPY.introTitle(course.name)}</h2>
    </header>

    <section className={COURSE_PAGES.section}>
      <h3 className={COURSE_PAGES.heading}>{COURSE_COPY.objective}</h3>
      <div className={COURSE_PAGES.text}>
        <Markdown source={intro.objective} />
      </div>
    </section>

    <section className={COURSE_PAGES.section}>
      <h3 className={COURSE_PAGES.heading}>{COURSE_COPY.outlineTitle}</h3>
      <p className={COURSE_PAGES.text}>{COURSE_COPY.outlineCount(course.chapters.length)}</p>
      <ol className={COURSE_PAGES.outline}>
        {course.chapters.map((chapter, index) => (
          <li key={chapter.key} className={COURSE_PAGES.outlineItem}>
            <span className={COURSE_PAGES.outlineIndex}>{index + 1}</span>
            {chapter.title}
          </li>
        ))}
      </ol>
      <div className={COURSE_PAGES.text}>
        <Markdown source={intro.outline} />
      </div>
    </section>

    {intro.caseStudy && (
      <section className={COURSE_PAGES.section}>
        <h3 className={COURSE_PAGES.heading}>{COURSE_COPY.caseStudy}</h3>
        <div className={COURSE_PAGES.text}>
          <Markdown source={intro.caseStudy.body} />
        </div>
      </section>
    )}

    <div className={COURSE_PAGES.text}>
      <Markdown source={intro.feedback} />
    </div>

    <section className={COURSE_PAGES.section}>
      <p className={COURSE_PAGES.heading}>{intro.start}</p>
      <Button variant="primary" className={COURSE_PAGES.start} onClick={onStart}>
        {COURSE_COPY.startChapter(course.chapters[0]?.title ?? '')}
      </Button>
    </section>
  </article>
)
