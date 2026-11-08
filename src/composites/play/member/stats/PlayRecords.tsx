import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { PLAY_PROFILE_COPY } from '@/declarations/play'
import { PLAY_PROFILE } from '@/declarations/ui/variants'
import type { PlayRecordView } from '@/types/play'

/**
 * Best series, best scores and what each game counts
 * @param {Object} props - Records
 * @param {PlayRecordView[]} props.records - Records of the player
 * @return {JSX.Element}
 */

export const PlayRecords = ({ records }: { records: PlayRecordView[] }) => (
  <PlayFold title={PLAY_PROFILE_COPY.records}>
    {records.length === 0 ? (
      <p className={PLAY_PROFILE.empty}>{PLAY_PROFILE_COPY.recordsEmpty}</p>
    ) : (
      <dl className={PLAY_PROFILE.records}>
        {records.map((record) => (
          <div key={record.key} className={PLAY_PROFILE.record}>
            <dd className={PLAY_PROFILE.recordValue}>{record.value}</dd>
            <dt className={PLAY_PROFILE.recordLabel}>{record.label}</dt>
          </div>
        ))}
      </dl>
    )}
  </PlayFold>
)
