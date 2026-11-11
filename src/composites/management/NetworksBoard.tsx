'use client'

import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import {
  ManagementBoard,
  type BoardGroup,
  type BoardRow,
} from '@/composites/management/ManagementBoard'
import { memberFacets } from '@/core/lib/management/board'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MANAGEMENT_BOARD } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ManagedSocials } from '@/types/management'

const COPY = MANAGEMENT_BOARD_COPY.networks

// Profiles whose network was never declared
const OTHER = 'other'

export interface NetworksBoardProps {
  data: ManagedSocials
  youtubers: FieldOption[]
}

/**
 * Profiles of the whole team, one box per network
 * @param {ManagedSocials} data - Profiles and networks read server-side
 * @param {FieldOption[]} youtubers - Creator filter options
 * @return {JSX.Element}
 */

export const NetworksBoard = ({ data, youtubers }: NetworksBoardProps) => {
  const OpenIcon = ICONS.link

  const groups: BoardGroup[] = [
    ...data.networks.map((network) => ({ key: network.id, label: network.label })),
    { key: OTHER, label: COPY.groupOther },
  ]

  const filters: FilterDefinition[] = [
    {
      name: 'network',
      label: COPY.network,
      allLabel: COPY.allNetworks,
      options: data.networks.map((network) => ({
        value: network.id,
        label: network.label,
        accent: network.accent ?? undefined,
      })),
      mark: 'dot',
    },
  ]

  const rows: BoardRow[] = data.socials.map((social) => {
    const group = social.networkId ?? OTHER

    return {
      id: social.id,
      member: social.member,
      group,
      haystack: [social.label, social.handle, social.url ?? ''],
      facets: { ...memberFacets(social.member), network: [group] },
      body: (
        <>
          <span className={MANAGEMENT_BOARD.title}>{social.handle}</span>
          <span className={MANAGEMENT_BOARD.detail}>{social.label}</span>
        </>
      ),
      aside: social.url ? (
        <a
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={MANAGEMENT_BOARD.link}
        >
          <OpenIcon className="size-4" aria-hidden="true" />
          {COPY.openProfile}
        </a>
      ) : undefined,
    }
  })

  return (
    <ManagementBoard
      rows={rows}
      groups={groups}
      youtubers={youtubers}
      filters={filters}
      searchLabel={COPY.search}
      figure="members"
      emptyTitle={COPY.emptyTitle}
      emptyDescription={COPY.emptyDescription}
    />
  )
}
