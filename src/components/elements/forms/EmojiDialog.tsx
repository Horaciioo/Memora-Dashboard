'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { Input } from '@/components/elements/forms/Input'
import { Dialog } from '@/components/structures/Dialog'
import { EMOJI_SETTINGS } from '@/declarations/configurations/settings'
import { EMOJI_COPY } from '@/declarations/ui/copy'
import { EMOJI_DIALOG_STYLES } from '@/declarations/ui/variants'
import type { EmojiEntry, EmojiGroup } from '@/declarations/ui/emojis'
import { cn } from '@/utils/classnames'
import { buildEmojiIndex, findEmoji, searchEmojis } from '@/utils/format/emojis'

export interface EmojiDialogProps {
  open: boolean
  value: string
  onSelect: (glyph: string | null) => void
  onClose: () => void
}

// One glyph of the grid, drawn bare on the panel
const EmojiCell = ({
  entry,
  selected,
  onPick,
}: {
  entry: EmojiEntry
  selected: boolean
  onPick: (glyph: string) => void
}) => (
  <button
    type="button"
    title={`${entry.fr} · ${entry.en}`}
    aria-label={entry.fr}
    aria-pressed={selected}
    className={cn(EMOJI_DIALOG_STYLES.cell, selected && EMOJI_DIALOG_STYLES.cellSelected)}
    onClick={() => onPick(entry.glyph)}
  >
    {entry.glyph}
  </button>
)

/**
 * Catalogue of every glyph the picker offers, searched by its French or English name
 * @param {boolean} open - Overlay is mounted
 * @param {string} value - Glyph already chosen
 * @param {(glyph: string | null) => void} onSelect - Pick handler
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const EmojiDialog = ({ open, value, onSelect, onClose }: EmojiDialogProps) => {
  const [catalogue, setCatalogue] = useState<EmojiGroup[] | null>(null)
  const [session, setSession] = useState({ open, search: '' })

  // Every reopening starts from the whole catalogue
  if (session.open !== open) setSession({ open, search: '' })

  const search = session.search

  // The catalogue weighs more than the form, so it lands only once the panel opens
  useEffect(() => {
    if (!open || catalogue) return

    let mounted = true

    void import('@/declarations/ui/emojis').then((module) => {
      if (mounted) setCatalogue(module.EMOJI_GROUPS)
    })

    return () => {
      mounted = false
    }
  }, [open, catalogue])

  const index = useMemo(() => buildEmojiIndex(catalogue ?? []), [catalogue])

  const matches = useMemo(
    () => searchEmojis(index, search, EMOJI_SETTINGS.searchMax),
    [index, search]
  )

  const suggestions = useMemo(
    () =>
      EMOJI_SETTINGS.suggestions
        .map((glyph) => findEmoji(catalogue ?? [], glyph))
        .filter((entry): entry is EmojiEntry => entry !== null),
    [catalogue]
  )

  const searching = search.trim() !== ''

  const pick = (glyph: string) => {
    onSelect(glyph)
    onClose()
  }

  const clear = () => {
    onSelect(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={EMOJI_COPY.title}
      description={EMOJI_COPY.lead}
      size="lg"
      footer={
        <div className={EMOJI_DIALOG_STYLES.footer}>
          <Input
            type="search"
            value={search}
            aria-label={EMOJI_COPY.search}
            placeholder={EMOJI_COPY.searchPlaceholder}
            className={EMOJI_DIALOG_STYLES.search}
            onChange={(event) => setSession({ open, search: event.target.value })}
          />
          <Button variant="ghost" onClick={clear}>
            {EMOJI_COPY.clear}
          </Button>
        </div>
      }
    >
      {catalogue === null ? (
        <SkeletonList shape="row" rows={4} />
      ) : (
        <div className={EMOJI_DIALOG_STYLES.body}>
          {searching ? (
            <section className={EMOJI_DIALOG_STYLES.family}>
              <p className={EMOJI_DIALOG_STYLES.familyName}>
                {EMOJI_COPY.results} · {matches.length}
              </p>
              {matches.length === 0 ? (
                <p className={EMOJI_DIALOG_STYLES.empty}>{EMOJI_COPY.noMatch}</p>
              ) : (
                <div className={EMOJI_DIALOG_STYLES.grid}>
                  {matches.map((entry) => (
                    <EmojiCell
                      key={entry.glyph}
                      entry={entry}
                      selected={entry.glyph === value}
                      onPick={pick}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {suggestions.length > 0 && (
                <section className={EMOJI_DIALOG_STYLES.family}>
                  <p className={EMOJI_DIALOG_STYLES.familyName}>{EMOJI_COPY.suggestions}</p>
                  <div className={EMOJI_DIALOG_STYLES.grid}>
                    {suggestions.map((entry) => (
                      <EmojiCell
                        key={entry.glyph}
                        entry={entry}
                        selected={entry.glyph === value}
                        onPick={pick}
                      />
                    ))}
                  </div>
                </section>
              )}

              {catalogue.map((group) => (
                <section key={group.key} className={EMOJI_DIALOG_STYLES.family}>
                  <p className={EMOJI_DIALOG_STYLES.familyName}>{group.fr}</p>
                  <div className={EMOJI_DIALOG_STYLES.grid}>
                    {group.emojis.map((entry) => (
                      <EmojiCell
                        key={entry.glyph}
                        entry={entry}
                        selected={entry.glyph === value}
                        onPick={pick}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      )}
    </Dialog>
  )
}
