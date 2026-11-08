export {
  PRACTICE_STAGES,
  hasNewSpecialisations,
  syncCurriculum,
} from '@/core/services/academy/training/CurriculumService/sync'
export {
  listCourses,
  juniorCourses,
  courseHrefFor,
  readCourse,
} from '@/core/services/academy/training/CurriculumService/catalog'
export type { CourseSubject } from '@/core/services/academy/training/CurriculumService/catalog'
export {
  submitExercise,
  saveFeedback,
} from '@/core/services/academy/training/CurriculumService/progress'
