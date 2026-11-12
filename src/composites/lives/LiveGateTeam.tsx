import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import { seatNote } from '@/composites/lives/coordination/LiveCoordinator'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { LIVE_GATE } from '@/declarations/ui/variants'
import type { LiveCoordinatorSeat, LivePerson, LiveView } from '@/types/lives'

type TeamPeople = { person: LivePerson; seat?: LiveCoordinatorSeat }[]

interface TeamGroupProps {
  label: string
  people: TeamPeople
  juniors?: TeamPeople
}

/**
 * Portraits piled, name and hours on hover
 * @param {TeamPeople} people - Members
 * @return {JSX.Element}
 */

const Portraits = ({ people }: { people: TeamPeople }) => (
  <ul className={LIVE_GATE.people}>
    {people.map(({ person, seat }) => (
      <li key={person.id}>
        <Tip label={seat ? `${person.name}, ${seatNote(seat)}` : person.name} floating>
          <Avatar
            name={person.name}
            src={person.avatar}
            size="md"
            title=""
            className={LIVE_GATE.portrait}
          />
        </Tip>
      </li>
    ))}
  </ul>
)

/**
 * One inner box, portraits piled, name and hours on hover
 * @param {string} label - Group title
 * @param {{ person: LivePerson, seat?: LiveCoordinatorSeat }[]} people - Members
 * @return {JSX.Element}
 */

const TeamGroup = ({ label, people, juniors = [] }: TeamGroupProps) => (
  <section className={LIVE_GATE.groupBox}>
    <h4 className={LIVE_GATE.label}>{label}</h4>
    {people.length + juniors.length === 0 ? (
      <p className={LIVE_GATE.lead}>{LIVE_PAGE_COPY.recapNobody}</p>
    ) : (
      <div className={LIVE_GATE.split}>
        {people.length > 0 && <Portraits people={people} />}
        {people.length > 0 && juniors.length > 0 && <span className={LIVE_GATE.splitLine} />}
        {juniors.length > 0 && <Portraits people={juniors} />}
      </div>
    )}
  </section>
)

/**
 * Planned team of the live
 * @param {LiveView} live - Live shown
 * @return {JSX.Element}
 */

export const LiveGateTeam = ({ live }: { live: LiveView }) => {
  const chosen = new Set(
    [...live.responsables, ...live.coordinators.map((seat) => seat.person)].map(({ id }) => id)
  )
  const others = live.members.filter((person) => !chosen.has(person.id))

  return (
    <section className={LIVE_GATE.side}>
      <h3 className={LIVE_GATE.heading}>{LIVE_PAGE_COPY.team}</h3>
      <div className={LIVE_GATE.boxes}>
        <div className={LIVE_GATE.pair}>
          <TeamGroup
            label={LIVE_PAGE_COPY.recapResponsables}
            people={live.responsables.map((person) => ({ person }))}
          />
          <TeamGroup
            label={LIVE_PAGE_COPY.recapCoordinators}
            people={live.coordinators.map((seat) => ({ person: seat.person, seat }))}
          />
        </div>
        <TeamGroup
          label={LIVE_PAGE_COPY.members}
          people={others.filter((person) => person.rank).map((person) => ({ person }))}
          juniors={others.filter((person) => !person.rank).map((person) => ({ person }))}
        />
      </div>
    </section>
  )
}
