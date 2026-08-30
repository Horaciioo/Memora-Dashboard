import type { Metadata } from 'next'
import Link from 'next/link'
import { AGE_POLICY, DATA_CONTROLLER, PROCESSING_REGISTRY } from '@/declarations/system/privacy'
import { ROUTES } from '@/declarations/navigation'
import { PRIVACY_COPY } from '@/declarations/ui/copy/privacy'
import { PRIVACY_STYLES, SIGN_IN_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PRIVACY_COPY.title }

/**
 * Public privacy notice, entirely derived from the processing register
 * @return {JSX.Element} - Notice page
 */

export default function PrivacyPage() {
  return (
    <main className={PRIVACY_STYLES.page}>
      <header className={PRIVACY_STYLES.section}>
        <h1 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.title}</h1>
        <p className={PRIVACY_STYLES.lead}>{PRIVACY_COPY.subtitle}</p>
      </header>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.controllerTitle}</h2>
        <p className={PRIVACY_STYLES.card}>
          {DATA_CONTROLLER.name} — {DATA_CONTROLLER.contact}
        </p>
      </section>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.processingTitle}</h2>
        <div className={PRIVACY_STYLES.scroller}>
          <table className={PRIVACY_STYLES.table}>
            <thead>
              <tr>
                <th className={PRIVACY_STYLES.head}>{PRIVACY_COPY.columnPurpose}</th>
                <th className={PRIVACY_STYLES.head}>{PRIVACY_COPY.columnCategories}</th>
                <th className={PRIVACY_STYLES.head}>{PRIVACY_COPY.columnBasis}</th>
                <th className={PRIVACY_STYLES.head}>{PRIVACY_COPY.columnRetention}</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSING_REGISTRY.keys.map((key) => {
                const record = PROCESSING_REGISTRY.get(key)

                return (
                  <tr key={key}>
                    <td className={PRIVACY_STYLES.cell}>{record.label}</td>
                    <td className={PRIVACY_STYLES.cell}>{record.categories}</td>
                    <td className={PRIVACY_STYLES.cell}>{record.legalBasis}</td>
                    <td className={PRIVACY_STYLES.cell}>{record.retention}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.ageTitle}</h2>
        <p className={PRIVACY_STYLES.lead}>
          {PRIVACY_COPY.ageLead
            .replace('{minimum}', String(AGE_POLICY.minimum))
            .replace('{threshold}', String(AGE_POLICY.consentThreshold))}
        </p>
      </section>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.ownershipTitle}</h2>
        <p className={PRIVACY_STYLES.card}>{PRIVACY_COPY.ownershipLead}</p>
      </section>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.publicTitle}</h2>
        <p className={PRIVACY_STYLES.lead}>{PRIVACY_COPY.publicLead}</p>
      </section>

      <section className={PRIVACY_STYLES.section}>
        <h2 className={PRIVACY_STYLES.heading}>{PRIVACY_COPY.rightsTitle}</h2>
        <p className={PRIVACY_STYLES.lead}>{PRIVACY_COPY.rightsLead}</p>
        <p className={PRIVACY_STYLES.lead}>{PRIVACY_COPY.exportLead}</p>
      </section>

      <p className={PRIVACY_STYLES.footer}>
        <Link href={ROUTES.login} className={SIGN_IN_STYLES.link}>
          {PRIVACY_COPY.backToSignIn}
        </Link>
      </p>
    </main>
  )
}
