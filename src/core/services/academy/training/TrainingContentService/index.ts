export {
  readTrainingContent,
  createChapter,
  updateChapter,
  removeChapter,
  reorderChapters,
} from '@/core/services/academy/training/TrainingContentService/chapters'
export {
  createBlock,
  updateBlock,
  removeBlock,
  reorderBlocks,
} from '@/core/services/academy/training/TrainingContentService/blocks'
export {
  createQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
} from '@/core/services/academy/training/TrainingContentService/questions'
export {
  createChoice,
  updateChoice,
  removeChoice,
  reorderChoices,
} from '@/core/services/academy/training/TrainingContentService/choices'
export {
  assertQuizOpenToJunior,
  readTrainingContentForJunior,
  quizFields,
  submitQuiz,
} from '@/core/services/academy/training/TrainingContentService/quiz'
