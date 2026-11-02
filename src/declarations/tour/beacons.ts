/**
 * Parts of the pages the first visit lights up
 * @type {Record<string, string>}
 */

export const TOUR_BEACONS = {
  rail: 'tour:rail',
  page: 'tour:page',
  homeNews: 'tour:home-news',
  homeQueue: 'tour:home-queue',
  homePlanned: 'tour:home-planned',
  homeBirthdays: 'tour:home-birthdays',
  homeFeatures: 'tour:home-features',
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
