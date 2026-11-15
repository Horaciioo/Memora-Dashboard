'use client'

import { Tabs } from '@/components/elements/navigation/Tabs'
import type { TabItem } from '@/components/elements/navigation/Tabs'
import { FormTab } from '@/composites/unban/form/FormTab'
import { UnbanLinkBar } from '@/composites/unban/UnbanLinkBar'
import { RequestDetail } from '@/composites/unban/requests/RequestDetail'
import { RequestsTab } from '@/composites/unban/requests/RequestsTab'
import { useUnbanSignal } from '@/core/hooks/data/unban/useUnbanSignal'
import { useUrlParams } from '@/core/hooks/interaction/state/useUrlParams'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { FieldOption } from '@/types/forms'

export interface UnbanBoardProps {
  creators: FieldOption[]
  initialRequestId: string | null
  canManage: boolean
}

// Parameters the board owns
const TAB_PARAM = ['tab', 'youtuber'] as const

const TABS = { requests: 'requests', form: 'form' } as const

/**
 * Tabs of the Déban. page, the open one lives in the address
 * @param {UnbanBoardProps} props - Perimeter, rights and the switch of the public side
 * @return {JSX.Element}
 */

export const UnbanBoard = ({ creators, initialRequestId, canManage }: UnbanBoardProps) => {
  const { values, set } = useUrlParams(TAB_PARAM)
  useUnbanSignal()

  // Link follows the creator filter of the list, the first one otherwise
  const linked = creators.find((creator) => creator.value === values.youtuber) ?? creators[0]

  const items: TabItem[] = [
    { value: TABS.requests, label: UNBAN_COPY.requestsTab, icon: 'unbanRequest' },
    ...(canManage ? [{ value: TABS.form, label: UNBAN_COPY.formTab, icon: 'sheet' as const }] : []),
  ]
  const tab = items.find((item) => item.value === values.tab)?.value ?? TABS.requests

  // The page of one person replaces the tabs
  if (initialRequestId) {
    return <RequestDetail id={initialRequestId} creators={creators} />
  }

  return (
    <>
      <Tabs
        inBanner
        items={items}
        value={tab}
        label={UNBAN_SCREEN_COPY.tabsLabel}
        onChange={(value) => set({ tab: value === TABS.requests ? '' : value })}
      />
      <UnbanLinkBar creatorName={linked?.label ?? ''} />
      {tab === TABS.requests && <RequestsTab creators={creators} />}
      {tab === TABS.form && <FormTab creator={linked} />}
    </>
  )
}
