/**
 * Photograph behind a page banner, free to use under the Unsplash licence
 * @typedef {Object} BannerScene
 * @property {string} image - Path of the optimised file in public/banners
 * @property {string} author - Photographer
 * @property {string} photo - Identifier of the photo on Unsplash
 * @property {string} [position] - Where the crop sits on the picture
 */

export interface BannerScene {
  image: string
  author: string
  photo: string
  position?: string
}

/**
 * Every scene, by area of the app
 * @type {Record<string, BannerScene>}
 */

export const BANNER_SCENES: Record<string, BannerScene> = {
  home: { image: '/banners/home.jpg', author: 'Dhony Koswara', photo: 'rcJcJ9urV7c' },
  absences: { image: '/banners/absences.jpg', author: 'Allan Lainez', photo: 'EP7jMTbVjG0' },
  calendar: { image: '/banners/calendar.jpg', author: 'Jakub Zerdzicki', photo: 'fQOyF0D0cDU' },
  formations: { image: '/banners/formations.jpg', author: 'Ahmet Yüksek', photo: '4sHPWsDCXHM' },
  academy: { image: '/banners/academy.jpg', author: 'Chris Lynch', photo: 'Gz-bWI5DMKM' },
  legacy: { image: '/banners/legacy.jpg', author: 'Andrew Svk', photo: '150fZ07GQqs' },
  moderation: { image: '/banners/moderation.jpg', author: 'Colin Watts', photo: '2fWZ9jsoIe0' },
  marsha: { image: '/banners/marsha.jpg', author: 'Ellie Eshaghi', photo: 'xQTdN540CFQ' },
  work: { image: '/banners/work.jpg', author: 'Vitaly Gariev', photo: 'K0aM-ztA76Q' },
  people: { image: '/banners/people.jpg', author: 'Tim Marshall', photo: 'Wa-gS5R58gA' },
  comfort: { image: '/banners/comfort.jpg', author: 'Hamdhulla Shakeeb', photo: 'PR8aepE62vE' },
  system: { image: '/banners/system.jpg', author: 'Compare Fibre', photo: 'INNsF0Zz_kQ' },
}

/**
 * Area each route belongs to, the first prefix that matches wins
 * @type {readonly { prefix: string, scene: string }[]}
 */

export const BANNER_ROUTES: readonly { prefix: string; scene: string }[] = [
  { prefix: '/tableau-de-bord', scene: 'home' },
  { prefix: '/absences', scene: 'absences' },
  { prefix: '/calendrier', scene: 'calendar' },
  { prefix: '/formations', scene: 'formations' },
  { prefix: '/academy', scene: 'academy' },
  { prefix: '/legacy', scene: 'legacy' },
  { prefix: '/mon-legacy', scene: 'legacy' },
  { prefix: '/moderation/marsha', scene: 'marsha' },
  { prefix: '/moderation', scene: 'moderation' },
  { prefix: '/lives', scene: 'moderation' },
  { prefix: '/moderateurs', scene: 'people' },
  { prefix: '/recrutements', scene: 'people' },
  { prefix: '/projets', scene: 'work' },
  { prefix: '/taches', scene: 'work' },
  { prefix: '/reunions', scene: 'work' },
  { prefix: '/notifications', scene: 'comfort' },
  { prefix: '/parametres', scene: 'comfort' },
  { prefix: '/nouveautes', scene: 'comfort' },
  { prefix: '/configuration', scene: 'system' },
  { prefix: '/systeme', scene: 'system' },
  { prefix: '/administration', scene: 'system' },
  { prefix: '/maturite', scene: 'system' },
]

/**
 * Scene of a route, the home one when none is declared
 * @param {string} pathname - Route on screen
 * @return {BannerScene} - Scene
 */

export const bannerFor = (pathname: string): BannerScene => {
  const match = BANNER_ROUTES.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  )

  return BANNER_SCENES[match?.scene ?? 'home']!
}

// Slot of the banner the page options are carried into
export const PAGE_OPTIONS_HOST_ID = 'page-options-host'
