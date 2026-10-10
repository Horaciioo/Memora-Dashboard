'use client'

import { useMemo, useState } from 'react'

import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { birthYears, daysInMonth, toBirthday } from '@/core/lib/tour/birthday'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { DATE_LOCALE } from '@/declarations/ui/dates'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { capitalizeFirstLetter } from '@/utils/format/strings'

export interface BirthdayPickerProps {
  // ISO day once the three parts are chosen, else ''
  onChange: (day: string) => void
}

/**
 * Day, month and year of a birth date, years going far enough back
 * @param {BirthdayPickerProps} props - Handler
 * @return {JSX.Element}
 */

export const BirthdayPicker = ({ onChange }: BirthdayPickerProps) => {
  const [parts, setParts] = useState({ day: '', month: '', year: '' })

  const options = useMemo(() => {
    const toOption = (value: number, label: string): FieldOption => ({
      value: String(value),
      label,
    })

    return {
      months: Array.from({ length: 12 }, (_, index) =>
        toOption(
          index + 1,
          capitalizeFirstLetter(
            new Date(2000, index, 1).toLocaleDateString(DATE_LOCALE, { month: 'long' })
          )
        )
      ),
      years: birthYears(
        new Date().getFullYear(),
        TOUR_SETTINGS.minAgeYears,
        TOUR_SETTINGS.maxAgeYears
      ).map((year) => toOption(year, String(year))),
    }
  }, [])

  const days = Array.from(
    { length: daysInMonth(Number(parts.year) || null, Number(parts.month) || 12) },
    (_, index) => ({
      value: String(index + 1),
      label: String(index + 1),
    })
  )

  const pick = (name: 'day' | 'month' | 'year', value: string) => {
    const next = { ...parts, [name]: value }
    const read = (part: string) => (part ? Number(part) : null)

    setParts(next)
    onChange(toBirthday({ year: read(next.year), month: read(next.month), day: read(next.day) }))
  }

  return (
    <div className={TOUR_CHAT.birthday}>
      <SelectMenu
        options={days}
        value={parts.day}
        onChange={(value) => pick('day', value)}
        label={PICKER_COPY.wheelDay}
        placeholder={PICKER_COPY.wheelDay}
      />
      <SelectMenu
        options={options.months}
        value={parts.month}
        onChange={(value) => pick('month', value)}
        label={PICKER_COPY.wheelMonth}
        placeholder={PICKER_COPY.wheelMonth}
      />
      <SelectMenu
        options={options.years}
        value={parts.year}
        onChange={(value) => pick('year', value)}
        label={PICKER_COPY.wheelYear}
        placeholder={PICKER_COPY.wheelYear}
      />
    </div>
  )
}
