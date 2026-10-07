import { Section } from '@/components/structures/Section'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { groupByPage } from '@/declarations/changelog/helpers'
import type { ChangelogCategory as CategoryLines } from '@/declarations/changelog/helpers'
import { CHANGELOG_TAGS } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { TONES } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'

/**
 * One note category: its title over a card, pages apart by a hairline, one line per change
 * behind a dot of the category's colour
 * @param {CategoryLines} props - Category lines
 * @return {JSX.Element}
 */

export const ChangelogCategory = ({ tag, items, comments }: CategoryLines) => {
  const meta = CHANGELOG_TAGS[tag]

  return (
    <div id={`categorie-${tag}`} className="scroll-mt-24">
      <Section title={meta.heading} padded>
        <div className={CHANGELOG_BOARD.groups}>
          {groupByPage(items, comments).map((group) => (
            <article key={group.key} className={CHANGELOG_BOARD.group}>
              <h3 className={CHANGELOG_BOARD.groupTitle}>{group.page.label}</h3>
              {group.comment && (
                <p className={CHANGELOG_BOARD.comment}>
                  <span className={CHANGELOG_BOARD.commentLabel}>
                    {CHANGELOG_COPY.commentLabel}
                  </span>
                  {group.comment}
                </p>
              )}
              <ul className={CHANGELOG_BOARD.lines}>
                {group.items.map((item) => (
                  <li key={item.text} className={CHANGELOG_BOARD.line}>
                    <span
                      className={cn(CHANGELOG_BOARD.lineDot, TONES[meta.tone].solid)}
                      aria-hidden="true"
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
