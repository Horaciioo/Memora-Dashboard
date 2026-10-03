import { invalidInput } from '@/core/lib/errors'
import { SANCTION_PARAMS } from '@/declarations/sanctions/params'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { SanctionPanelName } from '@/utils/constants/moderation'

/**
 * Read the creator and the surface a request is about
 * @param {URLSearchParams} query - Request query
 * @return {{ youtuberId: string, panel: SanctionPanelName }} - Creator and surface
 */

export const readTarget = (query: URLSearchParams) => {
  const youtuberId = query.get(SANCTION_PARAMS.creator)
  if (!youtuberId) {
    throw invalidInput([{ field: SANCTION_PARAMS.creator, message: FORM_COPY.required }])
  }

  const panel = query.get(SANCTION_PARAMS.panel)
  if (!panel || !SANCTION_PANEL_REGISTRY.has(panel)) {
    throw invalidInput([{ field: SANCTION_PARAMS.panel, message: FORM_COPY.required }])
  }

  return { youtuberId, panel: panel as SanctionPanelName }
}
