'use client'

import { DatePicker } from '@/components/elements/forms/date/DatePicker'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { LIVE_COORDINATION } from '@/declarations/ui/variants'
import type { HoursInput } from '@/utils/format/hours'

export interface AttendanceHoursFieldsProps {
  value: HoursInput
  onChange: (value: HoursInput) => void
}

/**
 * From and to a Modo expects to be available
 * @param {HoursInput} value - Hours typed
 * @param {(value: HoursInput) => void} onChange - Hours edited
 * @return {JSX.Element}
 */

export const AttendanceHoursFields = ({ value, onChange }: AttendanceHoursFieldsProps) => (
  <div className={LIVE_COORDINATION.times}>
    {(
      [
        { key: 'from', label: CALENDAR_COPY.hoursFrom },
        { key: 'to', label: CALENDAR_COPY.hoursTo },
      ] as const
    ).map((field) => (
      <div key={field.key} className={LIVE_COORDINATION.timeField}>
        <span className={LIVE_COORDINATION.timeLabel}>{field.label}</span>
        <DatePicker
          label={field.label}
          withTime
          value={value[field.key]}
          onChange={(next) =>
            onChange({ ...value, [field.key]: typeof next === 'string' ? next : '' })
          }
        />
      </div>
    ))}
  </div>
)
