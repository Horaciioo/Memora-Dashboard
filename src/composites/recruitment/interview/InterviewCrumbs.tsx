import Link from '@/components/elements/navigation/AppLink'

import { INTERVIEW } from '@/declarations/ui/variants'

/**
 * One step of the trail
 * @typedef {Object} Crumb
 * @property {string} label - Text shown
 * @property {string} [href] - Page it leads to
 * @property {() => void} [onSelect] - Action instead of a page
 */

export interface Crumb {
  label: string
  href?: string
  onSelect?: () => void
}

/**
 * Trail above the title, the last step being where the recruiter stands
 * @param {Object} props - Component props
 * @param {Crumb[]} props.crumbs - Steps in order
 * @return {JSX.Element}
 */

export const InterviewCrumbs = ({ crumbs }: { crumbs: Crumb[] }) => (
  <nav aria-label="Fil d’Ariane" className={INTERVIEW.crumbs}>
    {crumbs.map((crumb, index) => {
      const isCurrent = index === crumbs.length - 1

      return (
        <span key={crumb.label} className="flex min-w-0 items-center gap-1.5">
          {index > 0 && (
            <span className={INTERVIEW.crumbSeparator} aria-hidden="true">
              ›
            </span>
          )}
          {isCurrent ? (
            <span className={INTERVIEW.crumbCurrent} aria-current="page">
              {crumb.label}
            </span>
          ) : crumb.onSelect ? (
            <button type="button" className={INTERVIEW.crumb} onClick={crumb.onSelect}>
              {crumb.label}
            </button>
          ) : (
            <Link href={crumb.href ?? ''} className={INTERVIEW.crumb}>
              {crumb.label}
            </Link>
          )}
        </span>
      )
    })}
  </nav>
)
