import { getSchema } from '@tiptap/core'
import type { Schema } from '@tiptap/pm/model'

import { pageSchemaExtensions } from '@/core/lib/pages/schema/extensions'

export {
  BLOCK_ID_ATTRIBUTE,
  BLOCK_NODE_TYPES,
  PAGE_HEADING_LEVELS,
  pageSchemaExtensions,
} from '@/core/lib/pages/schema/extensions'
export { CALLOUT_ICON, Callout } from '@/core/lib/pages/schema/callout'
export { Subpage } from '@/core/lib/pages/schema/subpage'

/**
 * Page document schema
 * @type {Schema}
 */

export const PAGE_SCHEMA: Schema = getSchema(pageSchemaExtensions())

// Yjs fragment holding the page
export const PAGE_DOC_FIELD = 'default'
