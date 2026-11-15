import { PageHeader } from '@/components/structures/page/PageHeader'
import { FormPreviewPage } from '@/composites/unban/form/FormPreviewPage'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import { Permissions } from '@/utils/constants/permissions'

export interface UnbanEditScreenProps {
  // Creator the preview is drawn for, the first one otherwise
  creatorId?: string
}

/**
 * Preview of the Déban. form, for the ones who may edit it
 * @param {string} [creatorId] - Creator chosen on the form tab
 * @return {Promise<JSX.Element>} - Screen
 */

export const UnbanEditScreen = async ({ creatorId }: UnbanEditScreenProps) => {
  const { scope } = await requirePermission(Permissions.UnbanManage)
  const creators = await youtuberOptions(await scope())
  const creator = creators.find((entry) => entry.value === creatorId) ?? creators[0]

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={UNBAN_SCREEN_COPY.formPreviewTitle} />
      <FormPreviewPage creator={creator} backQuery={creatorId} />
    </div>
  )
}
