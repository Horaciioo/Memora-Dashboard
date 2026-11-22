import { OriginMark } from '@/composites/lives/bilan/OriginMark'
import { Avatar } from '@/components/elements/display/Avatar'
import { Dotted } from '@/components/elements/display/Dotted'
import { Section } from '@/components/structures/page/Section'
import type { ModeratorOption } from '@/composites/lives/bilan/moderation/ModeratorPicker'
import type { ModStat } from '@/core/lib/lives/modStats'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface SanctionRankingProps {
  options: ModeratorOption[]
  stats: Map<string, ModStat>
}

// Actions that sanction a viewer
const SANCTIONS = ['TIMEOUT', 'BAN', 'WARN']

/**
 * Who sanctioned the most, one box each with what they sanctioned with
 * @param {ModeratorOption[]} options - Moderators
 * @param {Map<string, ModStat>} stats - Figures per moderator
 * @return {JSX.Element}
 */

export const SanctionRanking = ({ options, stats }: SanctionRankingProps) => {
  const rows = options
    .map((option) => {
      const stat = stats.get(option.key)
      const kinds = (stat?.kinds ?? []).filter(
        (row) => SANCTIONS.includes(row.kind) || row.kind === 'DELETE'
      )

      return {
        option,
        kinds,
        total: kinds
          .filter((row) => SANCTIONS.includes(row.kind))
          .reduce((sum, row) => sum + row.count, 0),
      }
    })
    .filter((row) => row.total > 0)
    .sort((left, right) => right.total - left.total)

  return (
    <Section
      title={BILAN_COPY.whoSanctionedTitle}
      description={BILAN_COPY.whoSanctionedLead}
      padded
    >
      {rows.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{BILAN_COPY.whoSanctionedEmpty}</p>
      ) : (
        <ol className={LIVE_REPORT.rankList}>
          {rows.map((row, index) => (
            <li key={row.option.key} className={LIVE_REPORT.rankRow}>
              <span className={LIVE_REPORT.rankPlace}>{index + 1}</span>
              <span className={LIVE_REPORT.rankWho}>
                <Avatar name={row.option.name} src={row.option.avatar} size="md" />
                {row.option.name}
                <OriginMark onMemora={row.option.isMember} />
              </span>
              <Dotted
                className={LIVE_REPORT.rankKinds}
                items={row.kinds.map(
                  (kind) => `${MODERATION_KINDS[kind.kind].label} ${kind.count}`
                )}
              />
              <span className={LIVE_REPORT.rankCount}>{row.total}</span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
