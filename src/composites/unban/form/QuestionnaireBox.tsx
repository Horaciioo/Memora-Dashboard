'use client'

import { useState } from 'react'

import { AddRow } from '@/components/structures/inline/AddRow'
import { PageSection } from '@/composites/unban/form/PageSection'
import { QuestionCard } from '@/composites/unban/form/QuestionCard'
import {
  addPage,
  blankQuestion,
  duplicateQuestion,
  moveItem,
  moveToPage,
  pagesOf,
  questionsOfPage,
  removePage,
  renamePage,
  replaceQuestion,
  withPageQuestions,
} from '@/core/lib/unban/formEdit'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'

export interface QuestionnaireBoxProps {
  snapshot: UnbanFormSnapshot
  onEdit: (next: UnbanFormSnapshot) => void
}

/**
 * Box of the questions, cut into pages
 * @param {QuestionnaireBoxProps} props - Form and the edits it can ask for
 * @return {JSX.Element}
 */

export const QuestionnaireBox = ({ snapshot, onEdit }: QuestionnaireBoxProps) => {
  const [openId, setOpenId] = useState<string | null>(null)
  const pages = pagesOf(snapshot)
  const isPaged = pages.length > 1
  const total = snapshot.questions.length
  const choices = pages.map((page, position) => ({
    value: page.id,
    label: page.title ?? UNBAN_SCREEN_COPY.formPageName.replace('{n}', String(position + 1)),
  }))

  return (
    <section className={UNBAN_DESK_STYLES.box} aria-labelledby="unban-form-questionnaire">
      <h2 id="unban-form-questionnaire" className={UNBAN_DESK_STYLES.sectionTitle}>
        {UNBAN_SCREEN_COPY.formQuestionnaire}
      </h2>

      {pages.map((page, position) => {
        const questions = questionsOfPage(snapshot, page.id)

        return (
          <PageSection
            key={page.id}
            page={page}
            number={position + 1}
            isNamed={isPaged}
            isEmpty={questions.length === 0}
            canAdd={total < UNBAN_SETTINGS.maxQuestions}
            onRename={(title) => onEdit(renamePage(snapshot, page.id, title))}
            onRemove={() => onEdit(removePage(snapshot, page.id))}
            onAdd={() => {
              const created = blankQuestion()
              onEdit(withPageQuestions(snapshot, page.id, [...questions, created]))
              setOpenId(created.id)
            }}
          >
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                total={questions.length}
                canRemove={total > 1}
                pages={choices}
                pageId={page.id}
                isOpen={openId === question.id}
                onOpen={() => setOpenId(question.id)}
                onChange={(next) => onEdit(replaceQuestion(snapshot, question.id, next))}
                onMove={(delta) =>
                  onEdit(withPageQuestions(snapshot, page.id, moveItem(questions, index, delta)))
                }
                onDuplicate={() => onEdit(duplicateQuestion(snapshot, question.id))}
                onRemove={() =>
                  onEdit(
                    withPageQuestions(
                      snapshot,
                      page.id,
                      questions.filter((entry) => entry.id !== question.id)
                    )
                  )
                }
                onPage={(pageId) => onEdit(moveToPage(snapshot, question.id, pageId))}
              />
            ))}
          </PageSection>
        )
      })}

      <AddRow
        label={UNBAN_SCREEN_COPY.formAddPage}
        disabled={pages.length >= UNBAN_SETTINGS.maxPages}
        onClick={() => onEdit(addPage(snapshot))}
      />
    </section>
  )
}
