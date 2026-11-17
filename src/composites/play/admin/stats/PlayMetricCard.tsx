'use client'

import { useState } from 'react'

import { PlayBars, PlayLine } from '@/composites/play/admin/stats/PlayCharts'
import { PlayStatCard } from '@/composites/play/admin/stats/PlayStatCard'
import type { IconName } from '@/declarations/ui/icons'
import { PLAY_HEALTH } from '@/declarations/ui/variants'

export interface PlayMetricCardProps {
  label: string
  icon: IconName
  tone: string
  unit: string
  // One value per day, oldest first
  values: number[]
  // Day of each value, YYYY-MM-DD
  dates: string[]
  kind: 'bars' | 'line'
  // The figure at rest: the sum or the mean of the period
  rest: 'total' | 'average'
  restCaption: string
  className?: string
}

/**
 * Day of a series as the cards read it
 * @param {string} date - YYYY-MM-DD
 * @return {string} - Short French date
 */

export const shortDay = (date: string): string =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

/**
 * Health style card over a daily series: the figure of the period at rest, the day under the pointer while scrubbing
 * @param {PlayMetricCardProps} props - Series and look
 * @return {JSX.Element}
 */

export const PlayMetricCard = ({
  label,
  icon,
  tone,
  unit,
  values,
  dates,
  kind,
  rest,
  restCaption,
  className,
}: PlayMetricCardProps) => {
  const [active, setActive] = useState<number | null>(null)
  const sum = values.reduce((total, value) => total + value, 0)
  const figure = rest === 'total' ? sum : values.length > 0 ? Math.round(sum / values.length) : 0
  const shown = active === null ? figure : values[active]
  const Chart = kind === 'bars' ? PlayBars : PlayLine

  return (
    <PlayStatCard
      label={label}
      icon={icon}
      tone={tone}
      value={shown.toLocaleString('fr-FR')}
      unit={unit}
      caption={active === null ? restCaption : shortDay(dates[active])}
      className={className}
    >
      <Chart
        values={values}
        active={active}
        onActive={setActive}
        labels={values.map((value, index) => `${shortDay(dates[index])} : ${value}`)}
      />
      <div className={PLAY_HEALTH.axis}>
        <span>{shortDay(dates[0])}</span>
        <span>{shortDay(dates[dates.length - 1])}</span>
      </div>
    </PlayStatCard>
  )
}
