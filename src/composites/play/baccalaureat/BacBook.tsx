import type { ReactNode } from 'react'

export interface BacBookProps {
  // Line on the cover, above the pages
  title?: ReactNode
  // Line or button on the cover, under the pages
  foot?: ReactNode
  left: ReactNode
  right: ReactNode
}

/**
 * Open book: the phase's content spread over two pages, a cover frame around them
 * @param {BacBookProps} props - Cover lines and pages
 * @return {JSX.Element}
 */

export const BacBook = ({ title, foot, left, right }: BacBookProps) => (
  <div className="bac-book">
    <div className="bac-book-title">{title}</div>
    <div className="bac-pages">
      <section className="bac-page bac-page-left">{left}</section>
      <section className="bac-page bac-page-right">{right}</section>
    </div>
    <div className="bac-book-foot">{foot}</div>
  </div>
)
