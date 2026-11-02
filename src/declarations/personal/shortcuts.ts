import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Big card of the home leading to one new feature
 * @typedef {Object} HomeFeature
 * @property {string} key - Identifier
 * @property {string} title - Feature name
 * @property {string} href - Destination
 * @property {IconName} icon - Glyph on the card
 * @property {string} image - Photograph in the mood of the course covers
 * @property {string} position - Where the crop sits on the photograph
 * @property {PermissionName} [permission] - Needed to see the card
 */

export interface HomeFeature {
  key: string
  title: string
  href: string
  icon: IconName
  image: string
  position: string
  permission?: PermissionName
}

/**
 * Cards under "Les nouveautés"
 * @type {HomeFeature[]}
 */

export const HOME_FEATURES: HomeFeature[] = [
  {
    key: 'pages',
    title: 'Pages privées',
    href: ROUTES.pages,
    icon: 'page',
    image: '/courses/general.jpg',
    position: '50% 65%',
  },
  {
    key: 'play',
    title: 'Memora Play',
    href: ROUTES.play,
    icon: 'play',
    image: '/courses/twitch.jpg',
    position: '60% 60%',
    permission: Permissions.PlayAccess,
  },
  {
    key: 'recruitments',
    title: 'Recrutement',
    href: ROUTES.recruitments,
    icon: 'recruitment',
    image: '/courses/discord.jpg',
    position: '60% 40%',
    permission: Permissions.RecruitmentRead,
  },
]
