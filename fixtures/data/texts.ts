// Private remarks a responsable leaves on a moderator
export const MEMBER_NOTES = [
  'Très réactif sur les raids, garde son calme même quand le chat part en vrille.',
  'A tendance à sanctionner vite. On en a parlé, il lit maintenant le contexte avant le TO.',
  'Présent sur presque tous les lives du soir, fiable.',
  'Moins présent depuis la rentrée, études chargées. Rien d’inquiétant, il prévient.',
  'Bonne plume sur les annonces Discord, à solliciter pour les communications.',
  'Un peu en retrait en vocal mais très efficace à l’écrit.',
  'A géré seul la vague de spam du dernier subathon, bravo.',
  'Deux oublis de passation cette semaine, à surveiller.',
  'Candidat naturel pour Formateur, il explique bien aux juniors.',
  'Conflit léger avec un autre modo réglé en point individuel.',
  'Demande à passer plus de temps sur les lives que sur Discord.',
  'Connaît le lore de la communauté par cœur, précieux pour repérer les trolls récurrents.',
]

// Projects of the corp, their emoji first
export const PROJECTS: [string, string, string][] = [
  [
    '🎉',
    'Subathon de fin d’année',
    'Organiser la couverture modération des 72 heures, relais compris.',
  ],
  [
    '📜',
    'Refonte du règlement Discord',
    'Réécrire le règlement en langage clair et le faire valider.',
  ],
  [
    '🤖',
    'Nouveaux bots de modération',
    'Tester deux bots d’automod et comparer les faux positifs.',
  ],
  ['🏆', 'Tournoi communautaire', 'Encadrer les salons du tournoi et gérer les inscriptions.'],
  ['📣', 'Campagne de recrutement d’automne', 'Recruter six modérateurs lives avant les vacances.'],
  ['🧭', 'Guide d’accueil des juniors', 'Un guide illustré pour les deux premières semaines.'],
  ['🎥', 'Live caritatif', 'Préparer la modération du live caritatif et les messages de dons.'],
  ['🗂️', 'Archivage des salons', 'Faire le tri dans les salons morts et archiver l’historique.'],
  ['🎙️', 'Soirées vocales', 'Lancer une soirée vocale mensuelle animée par les animateurs.'],
  ['🛡️', 'Charte anti-harcèlement', 'Écrire la procédure quand un viewer est ciblé en live.'],
  ['📊', 'Bilan trimestriel', 'Rassembler les chiffres de modération du trimestre.'],
  ['🎮', 'Event Minecraft', 'Serveur éphémère ouvert à la communauté pendant une semaine.'],
  ['🧹', 'Nettoyage des rôles Discord', 'Fusionner les rôles doublons et revoir les permissions.'],
  ['📝', 'FAQ du serveur', 'Une FAQ qui répond aux dix questions posées chaque jour.'],
]

// Tasks, their emoji first
export const TASKS: [string, string][] = [
  ['🔧', 'Configurer l’automod sur les liens'],
  ['📌', 'Épingler le nouveau règlement'],
  ['🗓️', 'Caler le planning des relais'],
  ['✍️', 'Rédiger l’annonce du live'],
  ['🔍', 'Relire la FAQ'],
  ['📥', 'Trier les tickets en attente'],
  ['🎨', 'Préparer les visuels de l’événement'],
  ['🧪', 'Tester le bot sur le serveur de test'],
  ['📞', 'Appeler le créateur pour valider le format'],
  ['🗃️', 'Archiver les salons de l’ancien event'],
  ['📋', 'Mettre à jour la liste des mots bannis'],
  ['👥', 'Répartir les modos par créneau'],
  ['🎤', 'Préparer le déroulé de la soirée vocale'],
  ['📈', 'Sortir les chiffres de la semaine'],
  ['🚨', 'Rédiger la procédure de raid'],
  ['🧾', 'Compléter le compte rendu de réunion'],
  ['💬', 'Répondre aux questions du salon support'],
  ['🔁', 'Faire la passation avec l’équipe du soir'],
]

// Meetings, their emoji first
export const MEETINGS: [string, string][] = [
  ['🗓️', 'Réunion mensuelle'],
  ['🧭', 'Point d’équipe hebdomadaire'],
  ['🎯', 'Préparation du subathon'],
  ['🔎', 'Retour sur le dernier live'],
  ['🤝', 'Point responsables'],
  ['📣', 'Lancement du recrutement'],
  ['🛠️', 'Atelier outils de modération'],
  ['🎓', 'Point Academy'],
]

// Points covered during a meeting
export const MEETING_TOPICS: [string, string, string][] = [
  ['📊', 'Chiffres du mois', 'Les TO ont baissé de 18 % depuis la mise à jour de l’automod.'],
  ['🚨', 'Raid de samedi', 'Retour sur la gestion du raid, ce qui a marché et ce qui a coincé.'],
  ['👋', 'Arrivées et départs', 'Trois juniors validés, un départ pour raisons personnelles.'],
  ['🗓️', 'Planning des lives', 'Le créateur passe à quatre lives par semaine en octobre.'],
  ['🧰', 'Outils', 'On garde le bot actuel, le second génère trop de faux positifs.'],
  ['💡', 'Idées de la communauté', 'Les viewers demandent un salon dédié aux clips.'],
  ['⚖️', 'Harmonisation des sanctions', 'Relire le barème ensemble pour les insultes légères.'],
  ['🎓', 'Academy', 'Deux formateurs volontaires pour la prochaine session.'],
]

// Announcement bodies, written in markdown
export const COMMUNICATIONS = [
  '## Ce qui change\n\nLe règlement passe en version courte. **Trois règles** au lieu de douze, le détail reste dans la FAQ.\n\n- Respect des autres viewers\n- Pas de spam ni de pub\n- Le français sur le chat',
  '## Planning de l’événement\n\nOn ouvre les salons vendredi à 18 h.\n\n1. Vérifier les rôles\n2. Épingler le programme\n3. Lancer le compte à rebours',
  '## Merci à tous\n\nLe live a réuni un record de viewers et **aucun incident** n’a dépassé le simple avertissement. Bravo à l’équipe du soir.',
  '## Recrutement ouvert\n\nOn cherche des modérateurs lives disponibles en soirée. Le formulaire est épinglé dans #annonces.',
]

// Why a moderator is away, in their own words
export const ABSENCE_REASONS_TEXT = [
  'Partiels toute la semaine.',
  'Vacances en famille, peu de réseau.',
  'Déménagement.',
  'Stage à temps plein ce mois-ci.',
  'Besoin de souffler un peu.',
  'Voyage scolaire.',
  'Rendez-vous médicaux.',
  'Mariage d’un proche.',
]

// Answers a reviewer leaves on an absence
export const ABSENCE_REVIEWS = [
  'Bon courage, on te couvre.',
  'Pense à prévenir ton équipe sur Discord.',
  'Trop de monde absent ce week-end, on en reparle.',
  'Validé, profite bien.',
]

// Why a creator's livecon was changed
export const LIVECON_REASONS = [
  'Raid en cours sur le chat.',
  'Live sensible, sujet polémique annoncé.',
  'Retour au calme après le raid.',
  'Invité connu, afflux de nouveaux viewers.',
  'Live détente, on relâche un peu.',
  'Vague de spam de bots.',
  'Fin de l’événement, retour au niveau normal.',
]

// Answers of the voice check-ins
export const REVIEW_FEELINGS = [
  'Serein, a pris ses marques.',
  'Un peu stressé par les lives chargés.',
  'Très motivé, demande plus de créneaux.',
  'Hésitant sur les sanctions, manque de confiance.',
]

export const REVIEW_SUMMARIES = [
  'Bonne progression sur la lecture du chat. Les sanctions sont justes, il doit encore gagner en rapidité.',
  'Très à l’aise à l’écrit, plus timide en vocal. On l’encourage à intervenir pendant les passations.',
  'Quelques TO trop longs au début, corrigés depuis. Comprend bien le barème.',
  'Présence régulière et attitude exemplaire avec la communauté.',
  'A besoin d’un peu plus de temps sur la partie Discord, on prolonge en bonus.',
]

// Traces kept on a junior's FSI
export const JUNIOR_NOTES_POSITIVE = [
  'A désamorcé un conflit entre deux viewers sans sanction.',
  'Passation claire et complète avec l’équipe du soir.',
  'A repéré un compte de contournement avant tout le monde.',
  'Excellente annonce rédigée pour le salon événements.',
]

export const JUNIOR_NOTES_NEGATIVE = [
  'TO de 24 h appliqué sans passer par l’avertissement.',
  'Absent sur un créneau sans prévenir.',
  'A répondu sèchement à un viewer en message privé.',
]

// Personal objectives of a junior
export const JUNIOR_OBJECTIVES: [string, string][] = [
  ['Tenir trois lives complets', 'Rester du début à la fin sur trois lives de soirée.'],
  ['Appliquer le barème sans aide', 'Choisir seul la sanction sur les cas courants.'],
  ['Rédiger une annonce', 'Écrire et publier une annonce relue par un formateur.'],
  ['Mener une passation', 'Faire la passation de fin de live à l’oral.'],
]

// Remarks on a recruitment candidate
export const CANDIDATE_REVIEWS = [
  'Très bon entretien, connaît la communauté depuis longtemps.',
  'Motivé mais peu disponible le soir.',
  'Réponses solides sur les cas pratiques.',
  'Un peu jeune pour le rôle, à revoir l’an prochain.',
  'Expérience de modération sur un autre serveur, rassurant.',
  'Entretien écourté, candidat peu à l’aise en vocal.',
]

export const CANDIDATE_COMMENTS = [
  'D’accord avec le retour, je le vois bien en live.',
  'Attention, il a déjà été TO sur la chaîne il y a un an.',
  'Je peux le prendre en binôme les deux premières semaines.',
  'Plutôt pour, avec une période Academy complète.',
]

// Interview script of the recruitment campaigns
export const RECRUITMENT_QUESTIONS: [string, string][] = [
  ['Pourquoi veux-tu rejoindre l’équipe de modération ?', 'On cherche une motivation concrète.'],
  ['Quelles sont tes disponibilités en soirée ?', 'Au moins deux soirs par semaine.'],
  [
    'Un viewer insulte le créateur, que fais-tu ?',
    'Attendu : suppression puis TO selon le barème.',
  ],
  ['As-tu déjà modéré une communauté ?', 'L’expérience n’est pas obligatoire.'],
  ['Comment réagis-tu face à un raid ?', 'Mode lent, abonnés uniquement, alerte à l’équipe.'],
  [
    'Deux modos ne sont pas d’accord sur une sanction, que fais-tu ?',
    'On attend de la diplomatie.',
  ],
]

// Event templates of the calendar
export const EVENT_TEMPLATES: {
  name: string
  kind: 'ZONE' | 'PERIOD' | 'EVENT'
  summary: string
  accent: string
  visibility: 'EVERYONE' | 'RESPONSABLES' | 'ADMINS'
  defaultMinutes: number | null
  allDay: boolean
}[] = [
  {
    name: 'Live',
    kind: 'EVENT',
    summary: 'Live programmé du créateur.',
    accent: '#7c3aed',
    visibility: 'EVERYONE',
    defaultMinutes: 180,
    allDay: false,
  },
  {
    name: 'Réunion d’équipe',
    kind: 'EVENT',
    summary: 'Réunion en vocal.',
    accent: '#0284c7',
    visibility: 'EVERYONE',
    defaultMinutes: 60,
    allDay: false,
  },
  {
    name: 'Événement communautaire',
    kind: 'PERIOD',
    summary: 'Plusieurs jours d’événement.',
    accent: '#f59e0b',
    visibility: 'EVERYONE',
    defaultMinutes: null,
    allDay: true,
  },
  {
    name: 'Période de recrutement',
    kind: 'ZONE',
    summary: 'Fenêtre de candidatures.',
    accent: '#0d9488',
    visibility: 'RESPONSABLES',
    defaultMinutes: null,
    allDay: true,
  },
  {
    name: 'Point responsables',
    kind: 'EVENT',
    summary: 'Réservé aux responsables.',
    accent: '#ea580c',
    visibility: 'RESPONSABLES',
    defaultMinutes: 45,
    allDay: false,
  },
  {
    name: 'Maintenance Discord',
    kind: 'EVENT',
    summary: 'Serveur en travaux.',
    accent: '#64748b',
    visibility: 'ADMINS',
    defaultMinutes: 120,
    allDay: false,
  },
]

// Social networks a member profile can live on
export const SOCIAL_NETWORKS: [string, string, string][] = [
  ['Twitch', 'https://twitch.tv/', '#9146ff'],
  ['YouTube', 'https://youtube.com/@', '#ff0000'],
  ['X', 'https://x.com/', '#111827'],
  ['Instagram', 'https://instagram.com/', '#e1306c'],
  ['TikTok', 'https://tiktok.com/@', '#010101'],
]

// Surfaces where the work happens
export const PLATFORMS: [string, string][] = [
  ['Twitch', '#9146ff'],
  ['YouTube', '#ff0000'],
  ['Discord', '#5865f2'],
  ['TikTok', '#010101'],
  ['X', '#111827'],
]

// Entry programmes of the academy
export const DISPOSITIFS: [string, string, string][] = [
  ['ATRIA', 'Parcours complet pour les juniors sans expérience.', '#7c3aed'],
  ['PULSE', 'Parcours accéléré pour les profils déjà expérimentés.', '#0ea5e9'],
]

// Skill categories and their skills
export const SKILLS: [string, string, string[]][] = [
  ['Savoir-être', '#16a34a', ['Calme sous pression', 'Communication avec l’équipe', 'Ponctualité']],
  ['Technique', '#2563eb', ['Maîtrise des commandes', 'Lecture du chat', 'Gestion d’un raid']],
  ['Rédaction', '#d97706', ['Annonces claires', 'Messages de sanction']],
]

// PIM trame, per stage
export const PIM_STEPS: {
  title: string
  stage: 'PREPARATION' | 'DISCOVERY' | 'REVIEW_ONE' | 'PRACTICE' | 'REVIEW_FINAL' | 'BONUS'
  anchor: 'DAY' | 'LIVE'
  offset: number
  owner: 'RESPONSABLE' | 'FORMATEURS' | 'BOTH' | 'JUNIOR'
  required: boolean
}[] = [
  {
    title: 'Préparer les accès Discord',
    stage: 'PREPARATION',
    anchor: 'DAY',
    offset: -3,
    owner: 'RESPONSABLE',
    required: true,
  },
  {
    title: 'Briefing des formateurs',
    stage: 'PREPARATION',
    anchor: 'DAY',
    offset: -1,
    owner: 'BOTH',
    required: true,
  },
  {
    title: 'Accueil en vocal',
    stage: 'DISCOVERY',
    anchor: 'DAY',
    offset: 0,
    owner: 'FORMATEURS',
    required: true,
  },
  {
    title: 'Premier live en observation',
    stage: 'DISCOVERY',
    anchor: 'LIVE',
    offset: 1,
    owner: 'JUNIOR',
    required: true,
  },
  {
    title: 'Bilan vocal n°1',
    stage: 'REVIEW_ONE',
    anchor: 'DAY',
    offset: 10,
    owner: 'FORMATEURS',
    required: true,
  },
  {
    title: 'Trois lives en autonomie',
    stage: 'PRACTICE',
    anchor: 'LIVE',
    offset: 4,
    owner: 'JUNIOR',
    required: true,
  },
  {
    title: 'Point avec le responsable',
    stage: 'PRACTICE',
    anchor: 'DAY',
    offset: 18,
    owner: 'RESPONSABLE',
    required: false,
  },
  {
    title: 'Bilan final',
    stage: 'REVIEW_FINAL',
    anchor: 'DAY',
    offset: 28,
    owner: 'BOTH',
    required: true,
  },
  {
    title: 'Période bonus',
    stage: 'BONUS',
    anchor: 'DAY',
    offset: 35,
    owner: 'FORMATEURS',
    required: false,
  },
]

// Trainings of the academy, with their chapters
export const TRAININGS: {
  name: string
  summary: string
  period: 'DISCOVERY' | 'PRACTICE'
  mandatory: boolean
  functionKey: string | null
  chapters: { title: string; text: string; quiz: [string, string[], number][] }[]
}[] = [
  {
    name: 'Les bases de la modération',
    summary: 'Ce que fait un modérateur, et ce qu’il ne fait pas.',
    period: 'DISCOVERY',
    mandatory: true,
    functionKey: null,
    chapters: [
      {
        title: 'Le rôle du modérateur',
        text: '## Ton rôle\n\nTu protèges la communauté et le créateur. Tu **n’es pas** là pour débattre avec les viewers.',
        quiz: [
          [
            'Quel est ton premier réflexe face à un message hors règles ?',
            ['Le supprimer', 'Y répondre', 'L’ignorer'],
            0,
          ],
        ],
      },
      {
        title: 'Le barème des sanctions',
        text: '## Le barème\n\nChaque infraction a son échelle. On monte d’un cran à chaque récidive.',
        quiz: [
          [
            'Que se passe-t-il à la deuxième infraction ?',
            ['On recommence au début', 'On monte d’un cran'],
            1,
          ],
        ],
      },
    ],
  },
  {
    name: 'Modérer un live',
    summary: 'Les commandes, le rythme du chat et la passation.',
    period: 'DISCOVERY',
    mandatory: true,
    functionKey: 'functionLive',
    chapters: [
      {
        title: 'Les commandes essentielles',
        text: '## Commandes\n\n- `/timeout` pour exclure un temps\n- `/ban` pour exclure définitivement\n- `/slow` pour ralentir le chat',
        quiz: [['Quelle commande ralentit le chat ?', ['/ban', '/slow', '/clear'], 1]],
      },
      {
        title: 'La passation',
        text: '## Passation\n\nEn fin de créneau, tu résumes les incidents et les comptes à surveiller.',
        quiz: [
          [
            'Que transmets-tu à la passation ?',
            ['Les incidents et comptes à surveiller', 'Rien'],
            0,
          ],
        ],
      },
    ],
  },
  {
    name: 'Tenir un serveur Discord',
    summary: 'Salons, rôles, tickets et automod.',
    period: 'PRACTICE',
    mandatory: true,
    functionKey: 'functionDiscord',
    chapters: [
      {
        title: 'Les tickets',
        text: '## Tickets\n\nUn ticket se prend, se traite et se ferme avec un message clair.',
        quiz: [['Un ticket traité se…', ['Supprime', 'Ferme avec un message'], 1]],
      },
    ],
  },
  {
    name: 'Gérer un raid',
    summary: 'Réagir vite quand le chat est submergé.',
    period: 'PRACTICE',
    mandatory: false,
    functionKey: null,
    chapters: [
      {
        title: 'Les premières secondes',
        text: '## Réflexes\n\n1. Mode abonnés\n2. Mode lent\n3. Alerte à l’équipe',
        quiz: [['Premier réflexe pendant un raid ?', ['Mode abonnés', 'Couper le live'], 0]],
      },
    ],
  },
  {
    name: 'Animer une soirée',
    summary: 'Préparer et tenir une animation communautaire.',
    period: 'PRACTICE',
    mandatory: false,
    functionKey: 'functionAnimator',
    chapters: [
      {
        title: 'Le déroulé',
        text: '## Déroulé\n\nUne animation réussie tient en trois temps : accroche, jeu, remerciements.',
        quiz: [['Combien de temps dans une animation ?', ['Deux', 'Trois', 'Cinq'], 1]],
      },
    ],
  },
]

// Calendar events that are not meetings
export const CALENDAR_TITLES: [string, string][] = [
  ['🎮', 'Live du soir'],
  ['🎉', 'Live spécial abonnés'],
  ['🎙️', 'Soirée vocale'],
  ['🏆', 'Finale du tournoi'],
  ['🛠️', 'Maintenance du serveur'],
  ['📣', 'Annonce de la saison'],
]
