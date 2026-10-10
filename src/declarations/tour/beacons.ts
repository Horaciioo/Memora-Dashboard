/**
 * Parts of the pages the first visit lights up
 * @type {Record<string, string>}
 */

export const TOUR_BEACONS = {
  rail: 'tour:rail',
  page: 'tour:page',
  homeHeader: 'tour:home-header',
  homeNews: 'tour:home-news',
  homeQueue: 'tour:home-queue',
  homePlanned: 'tour:home-planned',
  homeBirthdays: 'tour:home-birthdays',
  homeShortcuts: 'tour:home-shortcuts',
  absencesDeclare: 'tour:absences-declare',
  absencesWizard: 'tour:absences-wizard',
  calendarRequest: 'tour:calendar-request',
  coursesStage: 'tour:courses-stage',
  coursesList: 'tour:courses-list',
  sanctionsLivecon: 'tour:sanctions-livecon',
  sanctionsOffenses: 'tour:sanctions-offenses',
  marshaFamilies: 'tour:marsha-families',
  marshaList: 'tour:marsha-list',
} as const
