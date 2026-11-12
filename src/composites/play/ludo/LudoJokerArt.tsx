/**
 * Jester hat in the four board colours, the face of the Joker card
 * @param {Object} props - Art
 * @param {string} [props.className] - Extra classes
 * @return {JSX.Element}
 */

export const LudoJokerArt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    {/* Three points */}
    <path d="M10 34C8 24 6 17 5 10c6 3 11 10 13 24z" fill="var(--play-ludo-red)" />
    <path d="M17 34C18 22 21 12 24 4c3 8 6 18 7 30z" fill="var(--play-ludo-blue)" />
    <path d="M30 34C32 20 37 13 43 10c-1 7-3 14-5 24z" fill="var(--play-ludo-yellow)" />
    {/* Band */}
    <rect x="8" y="33" width="32" height="8" rx="3" fill="var(--play-ludo-green)" />
    {/* Bells */}
    <circle cx="5" cy="9" r="3.2" fill="var(--play-ludo-yellow)" />
    <circle cx="24" cy="4" r="3.2" fill="var(--play-ludo-red)" />
    <circle cx="43" cy="9" r="3.2" fill="var(--play-ludo-blue)" />
  </svg>
)
