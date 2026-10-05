'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { Input } from '@/components/elements/forms/Input'
import { MarshaDetail } from '@/composites/moderation/MarshaDetail'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import {
  MARSHA_CATEGORIES,
  MARSHA_RESOURCES,
  MARSHA_RULES,
  type MarshaCommand,
} from '@/declarations/marsha/commands'
import { MARSHA_COPY } from '@/declarations/marsha/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MARSHA_GUIDE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { foldText } from '@/utils/format/strings'

// Section holding the rules of talking to the bot
const START = 'start'

export interface MarshaGuideProps {
  trainingHref: string | null
}

/**
 * Marsha Bot handbook in three columns: the families, the commands of the one open, and the
 * detail of the one picked. A search looks across every family, the rules of talking to the bot
 * take the place of the commands under "Bien démarrer"
 * @param {string | null} trainingHref - The Marsha training
 * @return {JSX.Element}
 */

export const MarshaGuide = ({ trainingHref }: MarshaGuideProps) => {
  const [section, setSection] = useState<string>(MARSHA_CATEGORIES[0]!.key)
  const [picked, setPicked] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const copy = useCopy(MARSHA_COPY.copied)
  const needle = foldText(search.trim())
  const isStart = section === START && !needle

  const category = MARSHA_CATEGORIES.find((entry) => entry.key === section)

  // A search lists matches grouped by family
  const groups = useMemo(
    () =>
      MARSHA_CATEGORIES.filter((entry) => needle || entry.key === section)
        .map((entry) => ({
          ...entry,
          commands: entry.commands.filter(
            (command) => !needle || foldText(`${command.name} ${command.summary}`).includes(needle)
          ),
        }))
        .filter((entry) => entry.commands.length > 0),
    [needle, section]
  )

  const commands: MarshaCommand[] = groups.flatMap((group) => group.commands)
  const command = commands.find((entry) => entry.key === picked) ?? commands[0] ?? null
  const rule = MARSHA_RULES.find((entry) => entry.title === picked) ?? MARSHA_RULES[0]!

  const open = (key: string) => {
    setSection(key)
    setPicked(null)
    setSearch('')
  }

  const Training = ICONS.academy

  return (
    <div className={MARSHA_GUIDE.page}>
      <nav className={MARSHA_GUIDE.nav} aria-label={MARSHA_COPY.indexTitle}>
        <Input
          type="search"
          value={search}
          placeholder={MARSHA_COPY.search}
          aria-label={MARSHA_COPY.search}
          className={MARSHA_GUIDE.search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className={MARSHA_GUIDE.navList}>
          {MARSHA_CATEGORIES.map((entry) => {
            const Icon = ICONS[entry.icon]
            const isOn = !needle && section === entry.key

            return (
              <button
                key={entry.key}
                type="button"
                aria-current={isOn ? 'true' : undefined}
                className={cn(MARSHA_GUIDE.navItem, isOn && MARSHA_GUIDE.navItemOn)}
                onClick={() => open(entry.key)}
              >
                <Icon
                  className={cn(MARSHA_GUIDE.navIcon, isOn && MARSHA_GUIDE.navIconOn)}
                  aria-hidden="true"
                />
                {entry.label}
              </button>
            )
          })}
        </div>

        <div className={MARSHA_GUIDE.navFoot}>
          <button
            type="button"
            aria-current={isStart ? 'true' : undefined}
            className={cn(MARSHA_GUIDE.navItem, isStart && MARSHA_GUIDE.navItemOn)}
            onClick={() => open(START)}
          >
            <Training
              className={cn(MARSHA_GUIDE.navIcon, isStart && MARSHA_GUIDE.navIconOn)}
              aria-hidden="true"
            />
            {MARSHA_COPY.startTitle}
          </button>
          {trainingHref && (
            <Link href={trainingHref}>
              <Button icon="academy">{MARSHA_COPY.training}</Button>
            </Link>
          )}
        </div>
      </nav>

      <div className={MARSHA_GUIDE.column}>
        {isStart ? (
          <>
            <p className={MARSHA_GUIDE.lead}>{MARSHA_COPY.startLead}</p>
            {MARSHA_RULES.map((entry) => (
              <button
                key={entry.title}
                type="button"
                className={cn(MARSHA_GUIDE.item, rule.title === entry.title && MARSHA_GUIDE.itemOn)}
                onClick={() => setPicked(entry.title)}
              >
                <span className={MARSHA_GUIDE.itemText}>{entry.title}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            {!needle && category && <p className={MARSHA_GUIDE.lead}>{category.lead}</p>}
            {commands.length === 0 && (
              <p className={MARSHA_GUIDE.empty}>{MARSHA_COPY.searchEmpty}</p>
            )}
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-0.5">
                {needle && <span className={MARSHA_GUIDE.group}>{group.label}</span>}
                {group.commands.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    aria-current={command?.key === entry.key ? 'true' : undefined}
                    className={cn(
                      MARSHA_GUIDE.item,
                      command?.key === entry.key && MARSHA_GUIDE.itemOn
                    )}
                    onClick={() => setPicked(entry.key)}
                  >
                    <span className={MARSHA_GUIDE.itemName}>{entry.name}</span>
                    <span className={MARSHA_GUIDE.itemText}>{entry.summary}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {isStart ? (
        <article key={rule.title} className={MARSHA_GUIDE.detail}>
          <h2 className={MARSHA_GUIDE.detailTitle}>{rule.title}</h2>
          <Markdown source={rule.body} />
          <div className={MARSHA_GUIDE.resources}>
            {MARSHA_RESOURCES.map((resource) => (
              <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer noopener">
                <Button icon="link">{resource.label}</Button>
              </a>
            ))}
          </div>
        </article>
      ) : (
        command && <MarshaDetail command={command} onCopy={(text) => void copy(text)} />
      )}
    </div>
  )
}
