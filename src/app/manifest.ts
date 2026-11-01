import type { MetadataRoute } from 'next'

import { INSTALL_PALETTE } from '@/core/lib/pwa/palette'
import { APP_DESCRIPTION } from '@/declarations/app'
import { ROUTES, SEGMENT_LABELS } from '@/declarations/navigation'
import { INSTALL_COPY } from '@/declarations/pwa/copy'
import { DOCK_HOME_PATH } from '@/declarations/pwa/dock'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { PWA_ICONS, PWA_ICON_SIZES, PWA_SHORTCUTS } from '@/declarations/pwa/manifest'

const IS_DEV = APP_ENVIRONMENT === 'dev'

// Square picture of each size
const icon = (src: string, size: number, purpose: 'any' | 'maskable') => ({
  src,
  sizes: `${size}x${size}`,
  type: 'image/png',
  purpose,
})

/**
 * Web application manifest
 * @return {MetadataRoute.Manifest} - Manifest
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: ROUTES.home,
    name: IS_DEV ? INSTALL_COPY.devName : INSTALL_COPY.name,
    short_name: IS_DEV ? INSTALL_COPY.devName : INSTALL_COPY.shortName,
    description: APP_DESCRIPTION,
    lang: 'fr',
    start_url: DOCK_HOME_PATH,
    scope: ROUTES.home,
    display: 'standalone',
    orientation: 'portrait',
    background_color: INSTALL_PALETTE.background,
    theme_color: INSTALL_PALETTE.background,
    icons: [
      icon(PWA_ICONS.small, PWA_ICON_SIZES.small, 'any'),
      icon(PWA_ICONS.large, PWA_ICON_SIZES.large, 'any'),
      icon(PWA_ICONS.large, PWA_ICON_SIZES.large, 'maskable'),
    ],
    // Long press on the home screen icon
    shortcuts: PWA_SHORTCUTS.map((url) => ({
      name: SEGMENT_LABELS[url.slice(1)] ?? url,
      url,
      icons: [icon(PWA_ICONS.small, PWA_ICON_SIZES.small, 'any')],
    })),
  }
}
