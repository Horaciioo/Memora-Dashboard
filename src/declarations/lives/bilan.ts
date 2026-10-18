/**
 * Copy of the Bilan charts and exports
 * @type {Record<string, string>}
 */

export const BILAN_COPY = {
  gestures: 'gestes',
  perHour: 'Gestes par heure',
  gap: 'Écart médian entre deux gestes',
  gapValue: '{seconds} s',
  viewersPeak: 'Pic de viewers',
  viewersAverage: 'Viewers en moyenne',
  per1000: 'Gestes pour 1 000 viewers',
  failureRate: 'Taux de refus',
  busiest: 'Part du plus actif',
  none: '–',
  activityTitle: 'Activité au fil du live',
  activityLead: 'Gestes par famille, tranche de {minutes} minutes.',
  cumulativeTitle: 'Gestes cumulés',
  cumulativeLead: 'Total depuis le début du live.',
  viewersTitle: 'Audience',
  viewersLead: 'Viewers relevés sur Twitch chaque minute pendant le live.',
  viewersEmpty:
    'Aucun relevé d’audience sur ce live : la courbe se remplit dès les prochains lives Twitch.',
  viewersUnit: 'viewers',
  viewersPeakAt: 'Pic d’audience à {time}',
  familiesTitle: 'Répartition des gestes',
  kindsTitle: 'Détail par geste',
  originTitle: 'Origine des gestes',
  originMemora: 'Depuis Memora',
  originPlatform: 'Depuis la plateforme',
  originCentre: 'gestes',
  reasonsTitle: 'Motifs les plus utilisés',
  reasonsEmpty: 'Aucun motif renseigné.',
  repeatTitle: 'Viewers sanctionnés plusieurs fois',
  repeatLead: 'Les récidivistes du live.',
  repeatEmpty: 'Personne n’a été sanctionné deux fois.',
  heatTitle: 'Qui a agi, et quand',
  heatHint: 'Jusqu’à {count} gestes par tranche',
  heatLead: 'Une ligne par modérateur, plus la case est foncée, plus il a agi.',
  levelsTitle: 'Niveaux Livecon',
  levelsLead: 'Gestes et rythme sous chaque niveau.',
  levelRow: '{minutes} min · {actions} gestes · {rate} par heure',
  versusTitle: 'Par rapport aux lives précédents',
  versusLead: 'Moyenne des {count} derniers lives terminés de ce créateur.',
  versusEmpty: 'Aucun live terminé avant celui-ci : la comparaison démarre au prochain.',
  versusActions: 'Gestes de modération',
  versusPerHour: 'Gestes par heure',
  versusDuration: 'Durée du live',
  versusViewers: 'Viewers en moyenne',
  versusPeak: 'Pic de viewers',
  versusAverage: 'moyenne {value}',
  versusMix: 'Répartition habituelle',
  exportTitle: 'Télécharger',
  exportLead: 'Les chiffres de ce bilan, prêts à ouvrir dans un tableur ou à rejouer.',
  exportSummary: 'Chiffres clés (CSV)',
  exportTimeline: 'Courbe du live (CSV)',
  exportLog: 'Logs complets (CSV)',
  exportData: 'Données (JSON)',
  exportFile: 'bilan',
  creatorTeamTitle: 'L’équipe',
  creatorTeamLead: 'Ce que chaque tranche du live a demandé à l’équipe.',
  creatorFileLead: 'Le fichier pour ton équipe ou ton manager.',
} as const

/**
 * Column titles of the CSV exports
 * @type {Record<string, string[]>}
 */

export const BILAN_CSV_HEADERS = {
  timeline: [
    'Heure',
    'Suppressions',
    'Timeouts et avertissements',
    'Bannissements',
    'Autres',
    'Total',
    'Viewers',
  ],
  log: [
    'Heure',
    'Modérateur',
    'Geste',
    'Cible',
    'Durée (s)',
    'Motif',
    'Extrait',
    'Origine',
    'Livecon',
    'Statut',
  ],
  summary: ['Chiffre', 'Valeur'],
} as const
