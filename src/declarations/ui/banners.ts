/**
 * Photograph behind a page banner
 * @typedef {Object} BannerScene
 * @property {string} image - Path of the optimised file in public/banners
 * @property {string} author - Photographer
 * @property {string} photo - Identifier of the photo on Unsplash
 * @property {string} hero - Two to six words laid under the title
 * @property {string} [position] - Where the crop sits on the picture
 */

export interface BannerScene {
  image: string
  author: string
  photo: string
  hero: string
  position?: string
}

/**
 * Every scene
 * @type {Record<string, BannerScene>}
 */

export const BANNER_SCENES: Record<string, BannerScene> = {
  home: {
    image: '/banners/home.jpg',
    author: 'Dhony Koswara',
    photo: 'rcJcJ9urV7c',
    hero: 'Le point du jour',
  },
  absences: {
    image: '/banners/absences.jpg',
    author: 'Allan Lainez',
    photo: 'EP7jMTbVjG0',
    hero: "Gère ton temps comme tu l'entends",
  },
  calendar: {
    image: '/banners/calendar.jpg',
    author: 'Jakub Zerdzicki',
    photo: 'fQOyF0D0cDU',
    hero: 'Lives et rendez-vous à venir',
  },
  formations: {
    image: '/banners/formations.jpg',
    author: 'Ahmet Yüksek',
    photo: '4sHPWsDCXHM',
    hero: 'Tes cours et ta progression',
  },
  academy: {
    image: '/banners/academy.jpg',
    author: 'Chris Lynch',
    photo: 'Gz-bWI5DMKM',
    hero: 'Les cours de l’équipe',
  },
  legacy: {
    image: '/banners/legacy.jpg',
    author: 'Andrew Svk',
    photo: '150fZ07GQqs',
    hero: 'Les paliers à franchir',
  },
  moderation: {
    image: '/banners/moderation.jpg',
    author: 'Colin Watts',
    photo: '2fWZ9jsoIe0',
    hero: 'Les outils de modération',
  },
  marsha: {
    image: '/banners/marsha.jpg',
    author: 'Ellie Eshaghi',
    photo: 'xQTdN540CFQ',
    hero: 'L’équipe de Marsha',
  },
  work: {
    image: '/banners/work.jpg',
    author: 'Vitaly Gariev',
    photo: 'K0aM-ztA76Q',
    hero: 'Projets, tâches et réunions',
  },
  people: {
    image: '/banners/people.jpg',
    author: 'Tim Marshall',
    photo: 'Wa-gS5R58gA',
    hero: 'La liste de toute ton équipe',
  },
  comfort: {
    image: '/banners/comfort.jpg',
    author: 'Hamdhulla Shakeeb',
    photo: 'PR8aepE62vE',
    hero: 'Tes alertes et tes réglages',
  },
  system: {
    image: '/banners/system.jpg',
    author: 'Compare Fibre',
    photo: 'INNsF0Zz_kQ',
    hero: 'État et réglages de l’app',
  },
}

/**
 * Area each route belongs to
 * @type {readonly { prefix: string, scene: string }[]}
 */

export const BANNER_ROUTES: readonly { prefix: string; scene: string }[] = [
  { prefix: '/tableau-de-bord', scene: 'home' },
  { prefix: '/absences', scene: 'absences' },
  { prefix: '/calendrier', scene: 'calendar' },
  { prefix: '/formations', scene: 'formations' },
  { prefix: '/academy', scene: 'academy' },
  { prefix: '/legacy', scene: 'legacy' },
  { prefix: '/moderation/marsha', scene: 'marsha' },
  { prefix: '/moderation', scene: 'moderation' },
  { prefix: '/lives', scene: 'moderation' },
  { prefix: '/moderateurs', scene: 'people' },
  { prefix: '/recrutements', scene: 'people' },
  { prefix: '/projets', scene: 'work' },
  { prefix: '/taches', scene: 'work' },
  { prefix: '/reunions', scene: 'work' },
  { prefix: '/communications', scene: 'work' },
  { prefix: '/notifications', scene: 'comfort' },
  { prefix: '/parametres', scene: 'comfort' },
  { prefix: '/nouveautes', scene: 'comfort' },
  { prefix: '/play', scene: 'comfort' },
  { prefix: '/configuration', scene: 'system' },
  { prefix: '/systeme', scene: 'system' },
  { prefix: '/administration', scene: 'system' },
  { prefix: '/maturite', scene: 'system' },
]

/**
 * Scene of a route
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

// Slot of the mobile top bar the page trail is carried into
export const TOP_BAR_CRUMBS_HOST_ID = 'top-bar-crumbs-host'

// Slot of the mobile top bar the page options and star are carried into
export const TOP_BAR_TOOLS_HOST_ID = 'top-bar-tools-host'

// Slot under the banner the tab strip is carried into
export const PAGE_TABS_HOST_ID = 'page-tabs-host'
