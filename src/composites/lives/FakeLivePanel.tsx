'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useFakeLive } from '@/core/hooks/data/dev/useFakeLive'
import { FAKE_LIVE_COPY, FAKE_LIVE_KEYS, FAKE_LIVE_PACES } from '@/declarations/dev/fakeLive'
import { FAKE_LIVE } from '@/declarations/ui/variants'

/**
 * Dev only: launch a simulated Twitch live and drive it without a terminal
 * @return {JSX.Element}
 */

export const FakeLivePanel = () => {
  const { status, isBusy, start, stop, press, clear } = useFakeLive()
  const [pace, setPace] = useState<string>('chaos')

  return (
    <section className={FAKE_LIVE.root}>
      <header className={FAKE_LIVE.head}>
        <h2 className={FAKE_LIVE.title}>{FAKE_LIVE_COPY.title}</h2>
        <p className={FAKE_LIVE.lead}>
          {status.running
            ? `${FAKE_LIVE_COPY.running.replace('{pace}', status.pace ?? '')} ${
                status.streaming ? FAKE_LIVE_COPY.onAir : FAKE_LIVE_COPY.offAir
              }`
            : `${FAKE_LIVE_COPY.lead} ${FAKE_LIVE_COPY.idle}`}
        </p>
      </header>

      {status.running ? (
        <div className={FAKE_LIVE.row}>
          {FAKE_LIVE_KEYS.map((entry) => (
            <Button key={entry.key} disabled={isBusy} onClick={() => void press(entry.key)}>
              {entry.label}
            </Button>
          ))}
          <Button variant="danger" disabled={isBusy} onClick={() => void stop()}>
            {FAKE_LIVE_COPY.stop}
          </Button>
        </div>
      ) : (
        <div className={FAKE_LIVE.row}>
          <span className={FAKE_LIVE.label}>{FAKE_LIVE_COPY.paceLabel}</span>
          {FAKE_LIVE_PACES.map((entry) => (
            <Button
              key={entry.id}
              variant={pace === entry.id ? 'primary' : 'ghost'}
              onClick={() => setPace(entry.id)}
            >
              {entry.label}
            </Button>
          ))}
          <Button variant="success" isLoading={isBusy} onClick={() => void start(pace)}>
            {isBusy ? FAKE_LIVE_COPY.starting : FAKE_LIVE_COPY.start}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={() => void clear()}>
            {FAKE_LIVE_COPY.clear}
          </Button>
        </div>
      )}
    </section>
  )
}
