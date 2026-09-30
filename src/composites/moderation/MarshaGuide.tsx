'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { Input } from '@/components/elements/forms/Input'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { MARSHA_COPY } from '@/declarations/marsha/copy'
import { MARSHA_CATEGORIES, MARSHA_RESOURCES, MARSHA_RULES } from '@/declarations/marsha/commands'
import type { MarshaCommand } from '@/declarations/marsha/commands'
import { ICONS } from '@/declarations/ui/icons'
import { MARSHA_GUIDE } from '@/declarations/ui/variants'
import { foldText } from '@/utils/format/strings'

/**
 * Written form of a command, required arguments in angles and optional ones in brackets
 * @param {MarshaCommand} command - Command
 * @return {string} - Syntax
 */

const syntaxOf = (command: MarshaCommand): string =>
  [
    command.name,
    ...command.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)),
  ].join(' ')

/**
 * One command card
 * @param {Object} props - Command and copier
 * @return {JSX.Element}
 */

const CommandCard = ({
  command,
  onCopy,
}: {
  command: MarshaCommand
  onCopy: (text: string) => void
}) => {
  const syntax = syntaxOf(command)

  return (
    <article id={command.key} className={MARSHA_GUIDE.command}>
      <header className={MARSHA_GUIDE.commandHead}>
        <span className={MARSHA_GUIDE.commandName}>{command.name}</span>
        {command.presence && <span className={MARSHA_GUIDE.presence}>{MARSHA_COPY.presence}</span>}
      </header>
      <p className={MARSHA_GUIDE.commandSummary}>{command.summary}</p>

      <span className={MARSHA_GUIDE.syntax}>
        <code>{syntax}</code>
        <Button
          variant="icon"
          icon="copy"
          aria-label={MARSHA_COPY.copy}
          onClick={() => onCopy(syntax)}
        />
      </span>

      {command.args.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.args}</span>
          <dl className={MARSHA_GUIDE.args}>
            {command.args.map((arg) => (
              <div key={arg.name} className="contents">
                <dt className={MARSHA_GUIDE.argName}>
                  {`${arg.name} · ${arg.required ? MARSHA_COPY.required : MARSHA_COPY.optional}`}
                </dt>
                <dd className={MARSHA_GUIDE.argText}>{arg.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {command.examples.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.examples}</span>
          <div className={MARSHA_GUIDE.examples}>
            {command.examples.map((example) => (
              <span key={example} className={MARSHA_GUIDE.syntax}>
                <code className="min-w-0 truncate">{example}</code>
                <Button
                  variant="icon"
                  icon="copy"
                  aria-label={MARSHA_COPY.copy}
                  onClick={() => onCopy(example)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {command.notes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.notes}</span>
          <ul className={MARSHA_GUIDE.notes}>
            {command.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export interface MarshaGuideProps {
  trainingHref: string | null
}

/**
 * Marsha Bots handbook: how to talk to the bot, then every command by family, searchable
 * @param {string | null} trainingHref - The Marsha training, when it exists
 * @return {JSX.Element}
 */

export const MarshaGuide = ({ trainingHref }: MarshaGuideProps) => {
  const [search, setSearch] = useState('')
  const copy = useCopy(MARSHA_COPY.copied)
  const needle = foldText(search.trim())

  // Families narrowed to the commands under the search
  const categories = useMemo(
    () =>
      MARSHA_CATEGORIES.map((category) => ({
        ...category,
        commands: category.commands.filter(
          (command) => !needle || foldText(`${command.name} ${command.summary}`).includes(needle)
        ),
      })).filter((category) => category.commands.length > 0),
    [needle]
  )

  return (
    <div className={MARSHA_GUIDE.layout}>
      <nav className={MARSHA_GUIDE.index} aria-label={MARSHA_COPY.indexTitle}>
        <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.indexTitle}</span>
        <a href="#regles" className={MARSHA_GUIDE.indexLink}>
          {MARSHA_COPY.rulesTitle}
        </a>
        {MARSHA_CATEGORIES.map((category) => {
          const Icon = ICONS[category.icon]

          return (
            <a key={category.key} href={`#${category.key}`} className={MARSHA_GUIDE.indexLink}>
              <Icon className={MARSHA_GUIDE.indexIcon} aria-hidden="true" />
              {category.label}
            </a>
          )
        })}
      </nav>

      <div className={MARSHA_GUIDE.main}>
        <section id="regles" className={MARSHA_GUIDE.category}>
          <h2 className={MARSHA_GUIDE.categoryTitle}>{MARSHA_COPY.rulesTitle}</h2>
          <div className={MARSHA_GUIDE.rules}>
            {MARSHA_RULES.map((rule) => (
              <div key={rule.title} className={MARSHA_GUIDE.rule}>
                <span className={MARSHA_GUIDE.ruleTitle}>{rule.title}</span>
                <Markdown source={rule.body} />
              </div>
            ))}
          </div>
          <div className={MARSHA_GUIDE.resources}>
            {trainingHref && (
              <Link href={trainingHref}>
                <Button variant="primary" icon="academy">
                  {MARSHA_COPY.training}
                </Button>
              </Link>
            )}
            {MARSHA_RESOURCES.map((resource) => (
              <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer noopener">
                <Button icon="link">{resource.label}</Button>
              </a>
            ))}
          </div>
        </section>

        <Input
          type="search"
          value={search}
          placeholder={MARSHA_COPY.search}
          aria-label={MARSHA_COPY.search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {categories.length === 0 && (
          <p className={MARSHA_GUIDE.categoryLead}>{MARSHA_COPY.searchEmpty}</p>
        )}

        {categories.map((category) => {
          const Icon = ICONS[category.icon]

          return (
            <section key={category.key} id={category.key} className={MARSHA_GUIDE.category}>
              <div className={MARSHA_GUIDE.categoryHead}>
                <Icon className={MARSHA_GUIDE.categoryIcon} aria-hidden="true" />
                <h2 className={MARSHA_GUIDE.categoryTitle}>{category.label}</h2>
              </div>
              <p className={MARSHA_GUIDE.categoryLead}>{category.lead}</p>
              {category.commands.map((command) => (
                <CommandCard
                  key={command.key}
                  command={command}
                  onCopy={(text) => void copy(text)}
                />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}
