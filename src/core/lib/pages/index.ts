// Light helpers only, the schema modules stay out of the rail bundle
export {
  canHandOut,
  grantReaches,
  levelAllows,
  reachesOthers,
  resolvePageLevel,
  shareTargetKey,
  strongerLevel,
} from '@/core/lib/pages/access'
export type { AccessNode, GrantRule, PageViewer } from '@/core/lib/pages/access'
export { canOwnPages } from '@/core/lib/pages/ownership'
export { isSafeHref, normalizeHref } from '@/core/lib/pages/links'
export { buildPageTree, descendantIds } from '@/core/lib/pages/tree'
export type { PageTreeNode } from '@/core/lib/pages/tree'
