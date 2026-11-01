import { TOP_BAR_CRUMBS_HOST_ID, TOP_BAR_TOOLS_HOST_ID } from '@/declarations/ui/banners'
import { TOP_BAR } from '@/declarations/ui/blocks'

/**
 * Top bar of the mobile shell, the menu lives in the dock
 * @return {JSX.Element}
 */

export const MobileTopBar = () => (
  <header className={TOP_BAR.bar}>
    {/* The page trail lands here, carried by the page banner */}
    <div id={TOP_BAR_CRUMBS_HOST_ID} className={TOP_BAR.crumbsHost} />
    <div id={TOP_BAR_TOOLS_HOST_ID} className={TOP_BAR.toolsHost} />
  </header>
)
