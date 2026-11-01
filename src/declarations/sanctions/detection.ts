/**
 * Copy of the detection tab
 * @type {Record<string, string>}
 */

export const SANCTION_DETECTION_COPY = {
  tabs: 'Sections de la fiche',
  profile: 'Fiche',
  ladder: 'Barème',
  detection: 'Détection',
  lead: 'Quand un message contient un de ces mots, la suggestion de la Mod View propose cette infraction.',
  wordsHint: 'Les accents, les majuscules et le pluriel sont ignorés.',
  wordsPlaceholder: 'Ajouter un mot ou une expression',
  wordsEmpty: 'Aucun mot : la suggestion se fie alors au nom et aux exemples.',
  removeWord: 'Retirer « {word} »',
  add: 'Ajouter',
  moderateHint: 'Des messages réels : ils aident à reconnaître l’infraction.',
  tolerateHint:
    'Des cas proches qui ne méritent rien : un message qui en contient un n’est jamais suggéré.',
  moderatePlaceholder: 'Ajouter un message à modérer',
  toleratePlaceholder: 'Ajouter un cas à laisser passer',
  tolerateBlank: 'Aucun cas toléré',
  moderateBlank: 'Aucun exemple',
  testerTitle: 'Tester un message',
  testerPlaceholder: 'Colle un message du chat',
  testerIdle: 'Écris un message pour voir ce que la suggestion ferait.',
  testerHere: 'Cette infraction serait suggérée',
  testerOther: 'Une autre infraction serait suggérée : {offense}',
  testerNone: 'Aucune infraction ne serait suggérée',
  testerWords: 'Mots reconnus',
  testerText: 'Ressemblance avec le nom et les exemples',
  testerSpared: 'Laissé passer à cause de « {phrase} » ({offense})',
  testerFirst: 'Premier palier',
  testerNoRung: 'Aucun palier à ce niveau',
  noDetection: 'Sans détection',
  noRung: 'Aucun palier',
} as const
