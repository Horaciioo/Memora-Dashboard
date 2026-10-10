import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Big card of the home leading to one area
 * @typedef {Object} HomeShortcut
 * @property {string} key - Identifier
 * @property {string} title - Area name
 * @property {string} href - Destination
 * @property {IconName} icon - Glyph on the card
 * @property {string} image - Photograph in the mood of the course covers
 * @property {string} position - Where the crop sits on the photograph
 * @property {PermissionName} [permission] - Needed to see the card
 */

export interface HomeShortcut {
  key: string
  title: string
  href: string
  icon: IconName
  image: string
  position: string
  permission?: PermissionName
}

/**
 * Cards under "Raccourcis"
 * @type {HomeShortcut[]}
 */

export const HOME_SHORTCUTS: HomeShortcut[] = [
  {
    key: 'lives',
    title: 'Lives',
    href: ROUTES.lives,
    icon: 'liveDot',
    image: '/courses/twitch.jpg',
    position: '60% 60%',
    permission: Permissions.LiveRead,
  },
  {
    key: 'academy',
    title: 'Marsha Academy',
    href: ROUTES.academy,
    icon: 'academy',
    image: '/courses/general.jpg',
    position: '50% 65%',
    permission: Permissions.AcademyRead,
  },
  {
    key: 'recruitments',
    title: 'Recrutements',
    href: ROUTES.recruitments,
    icon: 'recruitment',
    image: '/courses/discord.jpg',
    position: '60% 40%',
    permission: Permissions.RecruitmentRead,
  },
]

const SANCTIONS_CARD: HomeShortcut = {
  key: 'sanctions',
  title: 'Panel de sanctions',
  href: ROUTES.sanctions,
  icon: 'sanctionsPanel',
  image: '/courses/twitch.jpg',
  position: '60% 60%',
  permission: Permissions.SanctionRead,
}

const ABSENCES_CARD: HomeShortcut = {
  key: 'absences',
  title: 'Absences',
  href: ROUTES.absences,
  icon: 'absences',
  image: '/courses/youtube.jpg',
  position: '50% 50%',
  permission: Permissions.AbsenceCreate,
}

const CALENDAR_CARD: HomeShortcut = {
  key: 'calendar',
  title: 'Calendrier',
  href: ROUTES.calendar,
  icon: 'meetings',
  image: '/courses/general.jpg',
  position: '50% 65%',
  permission: Permissions.CalendarRead,
}

const MARSHA_CARD: HomeShortcut = {
  key: 'marsha',
  title: 'Marsha Bots',
  href: ROUTES.marsha,
  icon: 'discord',
  image: '/courses/discord.jpg',
  position: '60% 40%',
}

/**
 * Cards a moderator sees, by trade
 * @type {Record<string, HomeShortcut[]>}
 */

export const TRADE_SHORTCUTS: Record<string, HomeShortcut[]> = {
  Lives: [SANCTIONS_CARD, ABSENCES_CARD, CALENDAR_CARD],
  Discord: [MARSHA_CARD, SANCTIONS_CARD, ABSENCES_CARD],
}
