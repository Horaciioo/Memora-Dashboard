'use client'

import { Button } from '@/components/elements/actions/Button'
import { MARSHA_COPY } from '@/declarations/marsha/copy'
import type { MarshaCommand } from '@/declarations/marsha/commands'
import { ICONS } from '@/declarations/ui/icons'
import { MARSHA_GUIDE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MarshaDetailProps {
  command: MarshaCommand
  onCopy: (text: string) => void
}

/**
 * Written form of a command
 * @param {MarshaCommand} command - Command
 * @return {string} - Syntax
 */

const syntaxOf = (command: MarshaCommand): string =>
  [
    command.name,
    ...command.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)),
  ].join(' ')

/**
 * Example as it looks once typed in Discord: the command
 * @param {string} example - Text of the example
 * @return {JSX.Element}
 */

const TypedLine = ({ example }: { example: string }) => {
  const [word = '', ...rest] = example.split(' ')

  return (
    <>
      {word}{' '}
      {rest
        .join(' ')
        .split(/(@\w+)/)
        .map((part, index) =>
          part.startsWith('@') ? (
            <span key={index} className={MARSHA_GUIDE.mention}>
              {part}
            </span>
          ) : (
            part
          )
        )}
    </>
  )
}

/**
 * Everything about one command: what it does, how it is written, what each part takes, what
 * it looks like typed, and what to know before using it
 * @param {MarshaDetailProps} props - Command and the copy handler
 * @return {JSX.Element}
 */

export const MarshaDetail = ({ command, onCopy }: MarshaDetailProps) => {
  const syntax = syntaxOf(command)
  const [word = '', ...rest] = syntax.split(' ')
  const notes = command.presence ? [MARSHA_COPY.presence, ...command.notes] : command.notes

  return (
    // The key restarts the entrance each time another command is picked
    <article key={command.key} className={MARSHA_GUIDE.detail}>
      <div className={MARSHA_GUIDE.detailHead}>
        <h2 className={MARSHA_GUIDE.detailName}>{command.name}</h2>
        <Button icon="copy" onClick={() => onCopy(command.name)}>
          {MARSHA_COPY.copy}
        </Button>
      </div>

      <p className={MARSHA_GUIDE.summary}>{command.summary}</p>

      <div className={MARSHA_GUIDE.block}>
        <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.syntax}</span>
        <div className={MARSHA_GUIDE.code}>
          <span className={MARSHA_GUIDE.codeText}>
            <span className={MARSHA_GUIDE.codeWord}>{word}</span> {rest.join(' ')}
          </span>
          <Button
            variant="icon"
            icon="copy"
            aria-label={MARSHA_COPY.copy}
            onClick={() => onCopy(syntax)}
          />
        </div>
      </div>

      {command.args.length > 0 && (
        <div className={MARSHA_GUIDE.block}>
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.args}</span>
          <dl className={MARSHA_GUIDE.args}>
            {command.args.map((arg) => (
              <div key={arg.name} className="contents">
                <dt className={MARSHA_GUIDE.argName}>
                  {arg.name}
                  <span
                    className={cn(
                      MARSHA_GUIDE.argKind,
                      arg.required ? MARSHA_GUIDE.argRequired : MARSHA_GUIDE.argOptional
                    )}
                  >
                    {arg.required ? MARSHA_COPY.required : MARSHA_COPY.optional}
                  </span>
                </dt>
                <dd className={MARSHA_GUIDE.argText}>{arg.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {command.examples.length > 0 && (
        <div className={MARSHA_GUIDE.block}>
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.examples}</span>
          {command.examples.map((example) => (
            <div key={example} className={MARSHA_GUIDE.example}>
              <div className={MARSHA_GUIDE.exampleBody}>
                <span className={MARSHA_GUIDE.exampleAuthor}>{MARSHA_COPY.typedBy}</span>
                <span className={MARSHA_GUIDE.exampleTime}>{MARSHA_COPY.typedAt}</span>
                <div className={MARSHA_GUIDE.exampleLine}>
                  <TypedLine example={example} />
                </div>
              </div>
              <Button
                variant="icon"
                icon={'copy' satisfies keyof typeof ICONS}
                aria-label={MARSHA_COPY.copy}
                className={MARSHA_GUIDE.exampleCopy}
                onClick={() => onCopy(example)}
              />
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className={MARSHA_GUIDE.block}>
          <span className={MARSHA_GUIDE.label}>{MARSHA_COPY.notes}</span>
          <ul className={MARSHA_GUIDE.notes}>
            {notes.map((note) => (
              <li key={note} className={MARSHA_GUIDE.note}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
