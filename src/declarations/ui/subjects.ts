import type { ReferenceSection } from '@/declarations/reference/sections'
import type { FormSubject } from '@/declarations/ui/copy/forms'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Record each drawer form writes
 * @type {Record<string, FormSubject>}
 */

export const FORM_SUBJECTS = {
  absence: { label: 'Absence', gender: 'feminine', icon: 'absences' },
  event: { label: 'Évènement', gender: 'masculine', icon: 'meetings' },
  selection: { label: 'Sélection', gender: 'feminine', icon: 'meetings' },
  comment: { label: 'Commentaire', gender: 'masculine', icon: 'note' },
  review: { label: 'Bilan', gender: 'masculine', icon: 'objective' },
  candidate: { label: 'Candidat', gender: 'masculine', icon: 'recruitment' },
  recruitmentStep: { label: 'Étape', gender: 'feminine', icon: 'clock' },
  instructions: { label: 'Consigne', gender: 'feminine', icon: 'note' },
  recruitment: { label: 'Recrutement', gender: 'masculine', icon: 'recruitment' },
  junior: { label: 'Junior', gender: 'masculine', icon: 'academy' },
  note: { label: 'Note', gender: 'feminine', icon: 'note' },
  objective: { label: 'Objectif', gender: 'masculine', icon: 'objective' },
  academyStep: { label: 'Étape', gender: 'feminine', icon: 'clock' },
  quiz: { label: 'Quiz', gender: 'masculine', icon: 'academy' },
  session: { label: 'Session', gender: 'feminine', icon: 'academy' },
  legacy: { label: 'Parcours', gender: 'masculine', icon: 'crown' },
  chapter: { label: 'Chapitre', gender: 'masculine', icon: 'sheet' },
  block: { label: 'Bloc', gender: 'masculine', icon: 'paragraph' },
  question: { label: 'Question', gender: 'feminine', icon: 'help' },
  choice: { label: 'Réponse', gender: 'feminine', icon: 'checkbox' },
  member: { label: 'Modérateur', gender: 'masculine', icon: 'members' },
  social: { label: 'Réseau', gender: 'masculine', icon: 'link' },
  project: { label: 'Projet', gender: 'masculine', icon: 'projects' },
  task: { label: 'Tâche', gender: 'feminine', icon: 'tasks' },
  meeting: { label: 'Réunion', gender: 'feminine', icon: 'meetings' },
  communication: { label: 'Communication', gender: 'feminine', icon: 'mail' },
  team: { label: 'Équipe', gender: 'feminine', icon: 'teams' },
  workflowState: { label: 'État', gender: 'masculine', icon: 'tasks' },
  topic: { label: 'Sujet', gender: 'masculine', icon: 'note' },
  integrationLink: { label: 'Lien', gender: 'masculine', icon: 'link' },
  livecon: { label: 'Niveau', gender: 'masculine', icon: 'livecon' },
  sanction: { label: 'Fiche', gender: 'feminine', icon: 'sanctions' },
} as const satisfies Record<string, FormSubject>

/**
 * Record of each board
 * @type {Record<WorkflowScopeName, FormSubject>}
 */

export const WORK_SUBJECTS: Record<WorkflowScopeName, FormSubject> = {
  PROJECT: FORM_SUBJECTS.project,
  TASK: FORM_SUBJECTS.task,
  MEETING: FORM_SUBJECTS.meeting,
}

/**
 * Record of a reference collection
 * @param {ReferenceSection} section - Collection metadata
 * @return {FormSubject} - Drawer subject
 */

export const referenceSubject = (section: ReferenceSection): FormSubject => ({
  label: section.singular,
  gender: section.gender,
  icon: section.icon,
})
