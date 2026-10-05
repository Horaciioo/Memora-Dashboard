import { COURSE_POSTERS } from '@/declarations/academy/posters'
import type { CourseSurface } from '@/declarations/academy/curriculum/types'
import { COURSE_CATALOG } from '@/declarations/ui/variants'

export interface CoursePosterProps {
  surface: CourseSurface
}

/**
 * Poster of a course: one flat scene of the place it takes place in, three colours and no
 * detail, so the subject is read before the title is
 * @param {CourseSurface} surface - Place the course happens
 * @return {JSX.Element}
 */

export const CoursePoster = ({ surface }: CoursePosterProps) => {
  const c = COURSE_POSTERS[surface]

  // Streams and live shows share the screen and its chat
  const isScreen = surface === 'twitch' || surface === 'youtube' || surface === 'lives'

  return (
    <svg
      viewBox="0 0 340 200"
      className={COURSE_CATALOG.poster}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="340" height="200" fill={c.ground} />
      <circle cx="300" cy="30" r="46" fill={c.blob} />
      <circle cx="26" cy="190" r="56" fill={c.blobSoft} />

      {isScreen && (
        <>
          <rect x="40" y="38" width="176" height="112" rx="16" fill={c.ink} />
          <rect x="40" y="38" width="176" height="20" rx="16" fill={c.chrome} />
          {surface === 'youtube' ? (
            <rect x="100" y="80" width="56" height="40" rx="12" fill={c.alert} />
          ) : null}
          <path
            d={surface === 'youtube' ? 'M120 90v20l18-10z' : 'M112 78v52l46-26z'}
            fill={surface === 'youtube' ? c.paper : c.accent}
          />
          <rect x="230" y="38" width="72" height="112" rx="14" fill={c.paper} />
          <rect x="240" y="52" width="40" height="7" rx="3.5" fill={c.rule} />
          <rect x="240" y="68" width="52" height="7" rx="3.5" fill={c.rule} />
          <rect x="236" y="84" width="60" height="16" rx="5" fill={c.alertSoft} />
          <rect x="242" y="89" width="46" height="6" rx="3" fill={c.alert} />
          <rect x="240" y="110" width="34" height="7" rx="3.5" fill={c.rule} />
          <rect x="240" y="126" width="48" height="7" rx="3.5" fill={c.rule} />
          <rect x="76" y="160" width="100" height="10" rx="5" fill={c.ink} />
        </>
      )}

      {surface === 'discord' && (
        <>
          <rect x="46" y="42" width="170" height="74" rx="22" fill={c.paper} />
          <path d="M78 116l-6 26 30-26z" fill={c.paper} />
          <circle cx="95" cy="79" r="8" fill={c.ink} />
          <circle cx="131" cy="79" r="8" fill={c.ink} />
          <circle cx="167" cy="79" r="8" fill={c.ink} />
          <rect x="176" y="104" width="118" height="62" rx="20" fill={c.ink} />
          <path d="M262 166l8 22-28-22z" fill={c.ink} />
          <rect x="194" y="123" width="82" height="9" rx="4.5" fill={c.accent} />
          <rect x="194" y="141" width="52" height="9" rx="4.5" fill={c.muted} />
        </>
      )}

      {surface === 'general' && (
        <>
          <path d="M170 44 82 84l88 40 88-40z" fill={c.ink} />
          <path d="M118 104v34c0 14 24 24 52 24s52-10 52-24v-34l-52 24z" fill={c.deep} />
          <path d="M258 84v54" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
          <circle cx="258" cy="144" r="9" fill={c.accent} />
        </>
      )}
    </svg>
  )
}
