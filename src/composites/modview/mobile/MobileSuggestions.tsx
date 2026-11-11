'use client'

import { useState } from 'react'

import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { SuggestionList } from '@/composites/modview/SuggestionList'
import type { SuggestionListProps } from '@/composites/modview/SuggestionList'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { measureTag } from '@/declarations/modview/suggestions'
import { MODVIEW_MOBILE, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Suggestions as small tags above the chat, a touch opens the one it stands for
 * @param {SuggestionListProps} props - Same props as the desktop list
 * @return {JSX.Element | null}
 */

export const MobileSuggestions = (props: SuggestionListProps) => {
  const { suggestions, onUse, onDismiss, onAct } = props
  const [openId, setOpenId] = useState<string | null>(null)
  const opened = suggestions.find((suggestion) => suggestion.source.id === openId)
  const close = () => setOpenId(null)

  if (suggestions.length === 0) return null

  return (
    <>
      <div className={MODVIEW_MOBILE.tags}>
        {suggestions.slice(0, LIVE_SETTINGS.mobileSuggestionTags).map((suggestion) => {
          const { measure, offense, source } = suggestion
          const verdict = MODVIEW_VERDICT[measure?.kind ?? 'DELETE'] ?? MODVIEW_VERDICT.DELETE

          return (
            <button
              key={source.id}
              type="button"
              className={cn(MODVIEW_MOBILE.tag, verdict.text)}
              onClick={() => setOpenId(source.id)}
            >
              {measure ? measureTag(measure) : (offense?.name ?? COPY.suggestion)}
            </button>
          )
        })}
      </div>
      <BottomSheet open={opened !== undefined} onClose={close} title={COPY.suggestion}>
        {opened && (
          <SuggestionList
            {...props}
            suggestions={[opened]}
            onUse={(suggestion) => {
              onUse(suggestion)
              close()
            }}
            onAct={(...args) => {
              onAct(...args)
              close()
            }}
            onDismiss={(id) => {
              onDismiss(id)
              close()
            }}
          />
        )}
      </BottomSheet>
    </>
  )
}
