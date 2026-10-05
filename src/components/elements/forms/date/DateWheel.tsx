'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { DATE_LOCALE } from '@/declarations/ui/dates'
import { DATE_WHEEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { toDayKey } from '@/utils/format/calendar'

interface WheelItem {
  value: number
  label: string
}

interface WheelColumnProps {
  items: WheelItem[]
  value: number
  label: string
  onSelect: (value: number) => void
}

/**
 * One scrolling column that snaps its centre row
 * @param {WheelColumnProps} props - Rows and selection
 * @return {JSX.Element}
 */

const WheelColumn = ({ items, value, label, onSelect }: WheelColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | undefined>(undefined)

  const rowHeight = () => columnRef.current?.querySelector('[role="option"]')?.clientHeight ?? 0

  // Land the current value on the centre row
  useEffect(() => {
    const column = columnRef.current
    const index = items.findIndex((item) => item.value === value)
    if (column && index >= 0) column.scrollTop = index * rowHeight()
  }, [items, value])

  // Read the centre row once the scroll settles
  const settle = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      const index = Math.round((columnRef.current?.scrollTop ?? 0) / (rowHeight() || 1))
      const item = items[Math.min(Math.max(index, 0), items.length - 1)]
      if (item && item.value !== value) onSelect(item.value)
    }, DATE_WHEEL.settleMs)
  }

  return (
    <div
      ref={columnRef}
      role="listbox"
      aria-label={label}
      className={DATE_WHEEL.column}
      onScroll={settle}
    >
      <span className={DATE_WHEEL.spacer} aria-hidden="true" />
      {items.map((item) => (
        <div
          key={item.value}
          role="option"
          aria-selected={item.value === value}
          className={cn(
            DATE_WHEEL.item,
            item.value === value ? DATE_WHEEL.itemOn : DATE_WHEEL.itemOff
          )}
        >
          {item.label}
        </div>
      ))}
      <span className={DATE_WHEEL.spacer} aria-hidden="true" />
    </div>
  )
}

export interface DateWheelProps {
  // ISO day
  value: string
  onChange: (day: string) => void
}

/**
 * iOS-style day, month and year wheels
 * @param {DateWheelProps} props - ISO day and handler
 * @return {JSX.Element}
 */

export const DateWheel = ({ value, onChange }: DateWheelProps) => {
  const [year, month, day] = (value || toDayKey(new Date())).split('-').map(Number) as [
    number,
    number,
    number,
  ]

  const years = useMemo(
    () =>
      Array.from({ length: DATE_WHEEL.yearSpan * 2 + 1 }, (_, index) => {
        const entry = new Date().getFullYear() - DATE_WHEEL.yearSpan + index

        return { value: entry, label: String(entry) }
      }),
    []
  )
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: new Date(2000, index, 1).toLocaleDateString(DATE_LOCALE, { month: 'long' }),
      })),
    []
  )
  const lastDay = new Date(year, month, 0).getDate()
  const days = useMemo(
    () =>
      Array.from({ length: lastDay }, (_, index) => ({
        value: index + 1,
        label: String(index + 1),
      })),
    [lastDay]
  )

  // A shorter month pulls the day back
  const write = (next: { year?: number; month?: number; day?: number }) => {
    const nextYear = next.year ?? year
    const nextMonth = next.month ?? month
    const nextLast = new Date(nextYear, nextMonth, 0).getDate()

    onChange(toDayKey(new Date(nextYear, nextMonth - 1, Math.min(next.day ?? day, nextLast))))
  }

  return (
    <div className={DATE_WHEEL.frame}>
      <span className={DATE_WHEEL.band} aria-hidden="true" />
      <WheelColumn
        items={days}
        value={day}
        label={PICKER_COPY.wheelDay}
        onSelect={(next) => write({ day: next })}
      />
      <WheelColumn
        items={months}
        value={month}
        label={PICKER_COPY.wheelMonth}
        onSelect={(next) => write({ month: next })}
      />
      <WheelColumn
        items={years}
        value={year}
        label={PICKER_COPY.wheelYear}
        onSelect={(next) => write({ year: next })}
      />
    </div>
  )
}
