/**
 * Copy of the management area
 * @type {Record<string, string>}
 */

export const MANAGEMENT_COPY = {
  filterTitle: 'Rien ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  allYoutubers: 'Tous les YouTubeurs',
  youtuber: 'YouTubeur',
} as const

/**
 * Copy of each board, keyed by sub-page
 * @type {Record<string, Record<string, string>>}
 */

export const MANAGEMENT_BOARD_COPY = {
  absences: {
    heroDescription: 'Les demandes de l’équipe',
    search: 'Nom du membre ou motif',
    status: 'Statut',
    allStatuses: 'Tous les statuts',
    emptyTitle: 'Aucune absence à suivre',
    emptyDescription: 'Les demandes de ton équipe arrivent ici.',
    groupPending: 'À traiter',
    groupActive: 'En cours et à venir',
    groupFinished: 'Terminées',
    groupClosed: 'Refusées et annulées',
  },
  networks: {
    heroDescription: 'Les profils déclarés par l’équipe',
    search: 'Nom, pseudo ou lien',
    network: 'Réseau',
    allNetworks: 'Tous les réseaux',
    emptyTitle: 'Aucun réseau déclaré',
    emptyDescription: 'Les profils que les membres ajoutent à leur fiche apparaissent ici.',
    groupOther: 'Autres profils',
    openProfile: 'Ouvrir le profil',
  },
  notes: {
    heroDescription: 'Les remarques sur l’équipe',
    search: 'Membre, auteur ou contenu',
    author: 'Auteur',
    allAuthors: 'Tous les auteurs',
    emptyTitle: 'Aucune note',
    emptyDescription: 'Les notes posées sur les fiches des membres arrivent ici.',
    groupPinned: 'Épinglées',
    groupRecent: 'Récentes',
    groupOlder: 'Plus anciennes',
    unsigned: 'Sans auteur',
  },
  birthdays: {
    heroDescription: 'Les dates à souhaiter',
    search: 'Nom du membre',
    month: 'Mois',
    allMonths: 'Tous les mois',
    emptyTitle: 'Aucun anniversaire',
    emptyDescription: 'Les dates de naissance renseignées sur les fiches apparaissent ici.',
    groupThisMonth: 'Ce mois-ci',
    groupNextMonth: 'Le mois prochain',
    groupLater: 'Plus tard dans l’année',
    today: 'Aujourd’hui',
    tomorrow: 'Demain',
    inDays: 'Dans {days} jours',
  },
  arrivals: {
    heroDescription: 'Qui est arrivé et depuis quand',
    search: 'Nom ou identifiant',
    role: 'Rôle',
    allRoles: 'Tous les rôles',
    status: 'Statut',
    allStatuses: 'Tous les statuts',
    emptyTitle: 'Aucun membre',
    emptyDescription:
      'Les membres de ton équipe apparaissent ici, des plus récents aux plus anciens.',
    groupNewcomers: 'Nouveaux',
    groupYear: 'Moins d’un an',
    groupVeterans: 'Plus d’un an',
    sinceDays: 'Depuis {count} jours',
    sinceMonths: 'Depuis {count} mois',
    sinceYears: 'Depuis {count} an(s)',
  },
  functions: {
    heroDescription: 'Qui porte quoi dans l’équipe',
    search: 'Nom du membre',
    kind: 'Type',
    allKinds: 'Tous les types',
    emptyTitle: 'Aucun membre',
    emptyDescription: 'Les fonctions tenues par ton équipe apparaissent ici.',
    groupNone: 'Sans fonction',
  },
} as const
