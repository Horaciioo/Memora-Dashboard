/**
 * Celebrations of a quest, a trophy and a level: one overlay, three scenes
 * @type {Record<string, string>}
 */

export const PLAY_CELEBRATION_UI = {
  layer:
    'play-cele pointer-events-none fixed inset-0 z-[70] grid place-items-center backdrop-blur-md [background:radial-gradient(ellipse_at_50%_50%,color-mix(in_srgb,var(--play-panel-strong)_80%,transparent),transparent_70%)]',
  scene: 'relative grid place-items-center gap-[clamp(0.75rem,2.4dvh,1.5rem)] text-center',
  kicker:
    'play-cele-text text-[clamp(0.75rem,2dvh,1rem)] leading-none font-black tracking-[0.4em] text-[var(--play-gold)] uppercase',
  name: 'play-cele-text text-[clamp(1.5rem,5dvh,2.5rem)] leading-none font-black text-[var(--play-ink)] [text-shadow:0_0.15rem_0_var(--play-drop)]',
  sub: 'play-cele-text max-w-[min(24rem,80vw)] text-[clamp(0.85rem,2dvh,1.05rem)] leading-snug font-bold text-[var(--play-ink-soft)]',
  stage: 'relative grid size-[clamp(9rem,26dvh,15rem)] place-items-center',
  // Quest: round gold seal with a check, rings and sparks
  seal: 'play-cele-seal relative grid size-[62%] place-items-center rounded-full bg-[var(--play-gold)] text-[var(--play-night)] shadow-[inset_0_-0.5rem_0_rgb(0_0_0/0.16)]',
  sealGlyph: 'size-[55%]',
  ring: 'play-cele-ring absolute inset-[19%] rounded-full border-4 border-[var(--play-gold)]',
  sparkBox: 'absolute inset-0 grid place-items-center',
  spark:
    'play-cele-spark absolute h-[clamp(0.6rem,1.8dvh,1rem)] w-1 rounded-full bg-[var(--play-gold)]',
  // Trophy: rays turning behind a medal that drops in
  rays: 'play-cele-rays absolute inset-[-45%] [background:repeating-conic-gradient(from_0deg,color-mix(in_srgb,var(--rarity)_26%,transparent)_0deg_8deg,transparent_8deg_24deg)] [mask-image:radial-gradient(circle,black_0%,transparent_62%)]',
  medal:
    'play-cele-drop relative grid size-[62%] place-items-center overflow-hidden rounded-[28%] bg-[var(--rarity)] text-[var(--play-night)] shadow-[inset_0_-0.6rem_0_rgb(0_0_0/0.16)]',
  medalGlyph: 'size-[58%]',
  shine:
    'play-cele-shine absolute inset-y-0 -left-1/2 w-1/3 [background:linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)]',
  // Level: shockwaves and a number that lands
  wave: 'play-cele-wave absolute inset-[22%] rounded-full border-[0.35rem] border-[var(--play-key)]',
  number:
    'play-cele-number relative text-[clamp(6rem,30dvh,13rem)] leading-none font-black text-[var(--play-ink)] tabular-nums [text-shadow:0_0.4rem_0_var(--play-drop)]',
} as const
