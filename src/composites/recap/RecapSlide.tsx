import { RecapLine } from '@/composites/recap/RecapLine'
import type { RecapChapter } from '@/core/lib/recap/compose'
import { dayTitle, lineLength } from '@/core/lib/recap/lines'
import { RECAP_SECTIONS } from '@/declarations/recap/chapters'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { RECAP_STYLES } from '@/declarations/ui/variants'

export interface RecapSlideProps {
  chapter: RecapChapter
  onNavigate: () => void
}

/**
 * One chapter as a bulleted list
 * @param {RecapChapter} chapter - Chapter to tell
 * @param {() => void} onNavigate - Called when a line is followed
 * @return {JSX.Element}
 */

export const RecapSlide = ({ chapter, onNavigate }: RecapSlideProps) => {
  // Lines are written one after the other, each waits for the letters before it
  const offsets = new Map<string, number>()
  let before = 0
  for (const group of chapter.groups) {
    for (const thread of group.threads) {
      offsets.set(thread.key, before)
      before += lineLength(thread)
    }
  }

  // One list under Memora's line, one bullet per sentence
  return (
    <div className={RECAP_STYLES.slide}>
      {chapter.groups.map((group) => {
        const title = group.day
          ? dayTitle(group.day)
          : group.section && chapter.groups.length > 1
            ? RECAP_SECTIONS[group.section]
            : null

        return (
          <div key={group.day ?? group.section ?? 'plain'} className={RECAP_STYLES.group}>
            {title && <h4 className={RECAP_STYLES.groupTitle}>{title}</h4>}
            <ul className={RECAP_STYLES.list}>
              {group.threads.map((thread) => (
                <li key={thread.key}>
                  <RecapLine
                    thread={thread}
                    showDay={!group.day}
                    after={offsets.get(thread.key)}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      {chapter.hidden > 0 && (
        <p className={RECAP_STYLES.hidden}>
          {RECAP_COPY.hidden.replace('{count}', String(chapter.hidden))}
        </p>
      )}
    </div>
  )
}
