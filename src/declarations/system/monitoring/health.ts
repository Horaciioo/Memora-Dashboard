/**
 * Health page settings
 * @type {{ autoRefreshSeconds: number, shown: number }}
 */

export const HEALTH_SETTINGS = {
  // Pace of the live mode
  autoRefreshSeconds: 5,
  // Rows listed in each ranking
  shown: 8,
} as const

/**
 * Copy of the health page
 * @type {Record<string, string>}
 */

export const HEALTH_COPY = {
  refresh: 'Actualiser',
  live: 'Temps réel',
  measuredAt: 'Mesuré à',
  memory: 'Mémoire',
  memoryLead: 'Ce que Memora occupe sur le serveur, et ce qu’il reste.',
  memoryUsed: 'Mémoire de Memora',
  memoryUsedHint: 'Occupée sur le serveur',
  heap: 'Tas JavaScript',
  offHeap: 'Hors tas',
  offHeapHint: 'Tampons et données natives',
  host: 'Mémoire du serveur',
  hostHint: 'disponibles',
  heaviestLead: 'Les plus gros postes, du plus lourd au plus léger.',
  rankHeap: 'Dans la mémoire',
  rankTables: 'Dans la base de données',
  rankBuckets: 'Dans les fichiers',
  processor: 'Processeur et réactivité',
  processorLead: 'Le temps de calcul que Memora prend, et sa disponibilité.',
  cpu: 'Processeur de Memora',
  cpuHint: 'Depuis la dernière mesure',
  loop: 'Boucle occupée',
  loopHint: 'Part du temps passée à travailler',
  load: 'Charge du serveur',
  loadHint: 'Moyenne sur une minute, par cœur',
  uptime: 'En marche depuis',
  uptimeHint: 'Memora',
  database: 'Base de données',
  databaseLead: 'Sa taille, ses connexions et la part des lectures servies par le cache.',
  databaseSize: 'Taille',
  connections: 'Connexions',
  cacheHit: 'Lectures en cache',
  cacheHitHint: 'Plus c’est haut, mieux c’est',
  now: 'En ce moment',
  nowLead: 'Ce qui est ouvert à cet instant.',
  sessions: 'Sessions ouvertes',
  readers: 'Écrans en direct',
  readersHint: 'Pages qui reçoivent des mises à jour',
  files: 'Fichiers stockés',
  filesHint: 'Tous dossiers confondus',
  rows: 'lignes',
  none: 'Aucune donnée',
} as const
