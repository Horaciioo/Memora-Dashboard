import { MODVIEW_TEAM_COPY } from '@/declarations/modview/watch'
import type { MenuItem } from '@/managers/front-end'
import type { LivePerson } from '@/types/lives'

/**
 * What the Mod View may do with one teammate
 * @typedef {Object} TeamTools
 * @property {LivePerson[]} members - Convened team, the viewer left out
 * @property {boolean} canInspect - Viewer may inspect
 * @property {boolean} hasFocusRight - Viewer holds the Focus right at all
 * @property {(accountId: string) => boolean} canFocus - Viewer may follow that member
 * @property {string | null} followingId - Member the viewer follows now
 * @property {(accountId: string) => void} onFocus - Follow a member
 * @property {() => void} onStopFocus - Stop following
 * @property {(accountId: string) => void} onInspect - Open Inspect Mod
 */

export interface TeamTools {
  members: LivePerson[]
  canInspect: boolean
  hasFocusRight: boolean
  canFocus: (accountId: string) => boolean
  followingId: string | null
  onFocus: (accountId: string) => void
  onStopFocus: () => void
  onInspect: (accountId: string) => void
}

/**
 * Entries of the menu opened on a teammate
 * @param {LivePerson} member - Teammate
 * @param {TeamTools} tools - Gestures
 * @return {MenuItem[]} - Entries
 */

export const memberMenu = (member: LivePerson, tools: TeamTools): MenuItem[] => {
  const isFollowed = tools.followingId === member.id
  const items: MenuItem[] = []

  if (isFollowed) {
    items.push({
      id: 'leave',
      label: MODVIEW_TEAM_COPY.leaveFocus,
      icon: 'hidden',
      onSelect: tools.onStopFocus,
    })
  } else if (tools.hasFocusRight) {
    // A seat without the right never sees the entry
    items.push({
      id: 'enter',
      label: MODVIEW_TEAM_COPY.enterFocus,
      icon: 'visible',
      disabled: !tools.canFocus(member.id),
      onSelect: () => tools.onFocus(member.id),
    })
  }

  if (tools.canInspect) {
    items.push({
      id: 'inspect',
      label: MODVIEW_TEAM_COPY.inspect,
      icon: 'search',
      onSelect: () => tools.onInspect(member.id),
    })
  }

  return items
}

/**
 * Teammate behind a name seen in the actions window
 * @param {string} name - Moderator name as the log writes it
 * @param {LivePerson[]} members - Convened team
 * @return {LivePerson | null} - Teammate
 */

export const memberNamed = (name: string, members: LivePerson[]): LivePerson | null =>
  members.find((member) => member.name.toLowerCase() === name.toLowerCase()) ?? null
