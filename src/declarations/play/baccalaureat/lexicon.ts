import type { BaccalaureatCategoryKey } from '@/declarations/play/baccalaureat/categories'

/**
 * Words a bot knows per category
 * @type {Record<BaccalaureatCategoryKey, string[]>}
 */

export const BACCALAUREAT_BOT_LEXICON: Record<BaccalaureatCategoryKey, string[]> = {
  firstName:
    'Antoine|Bastien|Camille|Damien|Emma|Fanny|Gabriel|Hugo|Inès|Jules|Karim|Léa|Manon|Nathan|Océane|Paul|Quentin|Romain|Sarah|Thomas|Ulysse|Victor|William|Xavier|Yanis|Zoé|Alice|Chloé|Lucas|Maxime|Nina|Pauline|Raphaël|Sophie|Théo'.split(
      '|'
    ),
  country:
    'Allemagne|Belgique|Canada|Danemark|Espagne|France|Grèce|Hongrie|Italie|Japon|Kenya|Luxembourg|Maroc|Norvège|Oman|Portugal|Qatar|Russie|Suisse|Tunisie|Ukraine|Vietnam|Yémen|Zambie|Brésil|Chine|Inde|Mexique|Pérou|Sénégal'.split(
      '|'
    ),
  city: 'Amsterdam|Bordeaux|Cannes|Dijon|Évry|Florence|Grenoble|Hambourg|Istanbul|Jérusalem|Kyoto|Lyon|Marseille|Nantes|Oslo|Paris|Québec|Rennes|Strasbourg|Toulouse|Utrecht|Valence|Washington|Yokohama|Zurich|Lille|Nice|Berlin|Montréal|Tokyo'.split(
    '|'
  ),
  animal:
    'Antilope|Baleine|Chat|Dauphin|Éléphant|Furet|Girafe|Hérisson|Iguane|Jaguar|Koala|Lion|Marmotte|Nandou|Ours|Panthère|Quetzal|Renard|Serpent|Tigre|Urubu|Vache|Wapiti|Yack|Zèbre|Chien|Lapin|Mouton|Poule|Requin'.split(
      '|'
    ),
  job: 'Avocat|Boulanger|Coiffeur|Dentiste|Électricien|Fleuriste|Garagiste|Horloger|Infirmier|Journaliste|Kinésithérapeute|Libraire|Maçon|Notaire|Opticien|Pompier|Quincaillier|Restaurateur|Serveur|Taxi|Urbaniste|Vétérinaire|Webdesigner|Zoologiste|Cuisinier|Médecin|Plombier|Pilote|Graphiste|Banquier'.split(
    '|'
  ),
  fruitVegetable:
    'Abricot|Banane|Cerise|Datte|Épinard|Fraise|Groseille|Haricot|Igname|Jujube|Kiwi|Litchi|Mangue|Navet|Orange|Poire|Quetsche|Radis|Salade|Tomate|Ugli|Yuzu|Courgette|Melon|Pomme|Citron|Carotte|Ananas|Brocoli'.split(
      '|'
    ),
  object:
    'Assiette|Bouteille|Chaise|Domino|Éventail|Fourchette|Gomme|Horloge|Imprimante|Jumelles|Klaxon|Lampe|Marteau|Nappe|Oreiller|Parapluie|Quille|Règle|Stylo|Table|Ustensile|Valise|Wok|Yoyo|Zip|Crayon|Miroir|Téléphone|Ciseaux|Bougie'.split(
      '|'
    ),
  brand:
    'Adidas|Bic|Chanel|Danone|Evian|Ferrari|Google|Hermès|Ikea|Jeep|Kinder|Lego|Michelin|Nike|Orangina|Peugeot|Quick|Renault|Samsung|Tesla|Uber|Volvo|Whirlpool|Xbox|Yamaha|Zara|Apple|Nintendo|Sony|Puma'.split(
      '|'
    ),
  celebrity:
    'Aya Nakamura|Beyoncé|Coluche|Dalida|Eminem|Florent Pagny|Gad Elmaleh|Hugh Jackman|Ilona Smet|Johnny Hallyday|Kylian Mbappé|Lady Gaga|Madonna|Nekfeu|Omar Sy|Pierre Niney|Queen Latifah|Rihanna|Shakira|Teddy Riner|Usher|Vianney|Will Smith|Yannick Noah|Zinédine Zidane|Céline Dion|Mylène Farmer|Orelsan|Stromae|Jul'.split(
      '|'
    ),
  movieSeries:
    'Avatar|Breaking Bad|Casablanca|Dune|Elite|Friends|Gladiator|House|Inception|Jumanji|Kaamelott|Lupin|Matrix|Narcos|Oppenheimer|Peaky Blinders|Quantico|Rocky|Stranger Things|Titanic|Up|Vikings|Westworld|X-Men|You|Zodiac|Dexter|Shrek|Sherlock|Interstellar'.split(
      '|'
    ),
  sport:
    'Athlétisme|Basket|Cyclisme|Danse|Escrime|Football|Golf|Handball|Hockey|Judo|Karaté|Lutte|Marathon|Natation|Rugby|Ski|Tennis|Ultimate|Volley|Water-polo|Yoga|Zumba|Boxe|Badminton|Pétanque|Plongée|Surf|Escalade|Aviron|Baseball'.split(
      '|'
    ),
  dish: 'Aligot|Bouillabaisse|Cassoulet|Dahl|Escalope|Fondue|Gratin|Hachis parmentier|Irish stew|Jambalaya|Kebab|Lasagnes|Moussaka|Nems|Omelette|Paella|Quiche|Raclette|Spaghetti|Tartiflette|Udon|Velouté|Waterzoï|Yakitori|Zarzuela|Couscous|Pizza|Ratatouille|Burger|Crêpe'.split(
    '|'
  ),
  plant:
    'Acacia|Bambou|Cactus|Dahlia|Edelweiss|Fougère|Géranium|Hortensia|Iris|Jasmin|Lavande|Lilas|Marguerite|Narcisse|Orchidée|Pivoine|Rose|Sapin|Tulipe|Violette|Yucca|Zinnia|Bégonia|Chêne|Muguet|Tournesol|Lierre|Olivier|Coquelicot|Menthe'.split(
      '|'
    ),
  color:
    'Argent|Bleu|Cyan|Doré|Émeraude|Fuchsia|Gris|Indigo|Jaune|Kaki|Lavande|Marron|Noir|Orange|Pourpre|Rouge|Saumon|Turquoise|Violet|Blanc|Beige|Corail|Magenta|Rose|Vert|Ocre|Bordeaux|Lilas|Ivoire|Sable'.split(
      '|'
    ),
  instrument:
    'Accordéon|Batterie|Clarinette|Djembé|Euphonium|Flûte|Guitare|Harpe|Harmonica|Jembé|Kazoo|Luth|Mandoline|Orgue|Piano|Saxophone|Trompette|Ukulélé|Violon|Xylophone|Banjo|Contrebasse|Triangle|Tambour|Hautbois|Basson|Cor|Synthétiseur|Maracas|Cymbale'.split(
      '|'
    ),
  bodyPart:
    'Avant-bras|Bouche|Cheville|Doigt|Épaule|Front|Genou|Hanche|Index|Jambe|Lèvre|Main|Nez|Oreille|Pied|Rein|Sourcil|Tête|Ventre|Visage|Bras|Cou|Coude|Dos|Œil|Poignet|Talon|Joue|Menton|Nuque'.split(
      '|'
    ),
  clothing:
    'Anorak|Blouson|Chemise|Débardeur|Écharpe|Foulard|Gilet|Hoodie|Imperméable|Jean|Kimono|Legging|Manteau|Nœud papillon|Overall|Pull|Robe|Short|Tee-shirt|Uniforme|Veste|Jupe|Chaussette|Bonnet|Cravate|Casquette|Pantalon|Polo|Sweat|Survêtement'.split(
      '|'
    ),
  videoGame:
    'Among Us|Brawl Stars|Call of Duty|Dofus|Elden Ring|Fortnite|GTA|Halo|Inside|Just Dance|Kirby|League of Legends|Minecraft|Need for Speed|Overwatch|Pokémon|Quake|Rocket League|Sonic|Tetris|Uncharted|Valorant|Warcraft|Xenoblade|Yoshi|Zelda|Fifa|Mario Kart|Animal Crossing|Hades'.split(
      '|'
    ),
  streamer:
    'Amixem|Billy|Cyprien|Domingo|Etoiles|Furious Jumper|Gotaga|Hugo Décrypte|Inoxtag|Joyca|Kameto|Locklear|Michou|Norman|Ponce|Squeezie|Tiboinshape|Ultia|Vodk|Wankil|ZeratoR|Doigby|Mister V|Lebouseuh|Aminematue|Rivenzi|Gom4rt|Sardoche|Baghera|Antoine Daniel'.split(
      '|'
    ),
  emote:
    'AYAYA|BibleThump|Clap|DansGame|EZ|FeelsGoodMan|GG|HeyGuys|Imagine|Jebaited|Kappa|LUL|Monka|NotLikeThis|OMEGALUL|PogChamp|Que pasa|ResidentSleeper|Sadge|TriHard|Uwu|VoHiYo|WutFace|Yikes|Zzz|Copium|Pepega|KEKW|Hype|Sheesh'.split(
      '|'
    ),
  hobby:
    'Aquarelle|Bricolage|Cuisine|Dessin|Échecs|Football|Jardinage|Haltérophilie|Improvisation|Jeux vidéo|Karaoké|Lecture|Musique|Natation|Origami|Photographie|Quiz|Randonnée|Sculpture|Tricot|Ukulélé|Voyage|Yoga|Zumba|Couture|Peinture|Pêche|Poterie|Bowling|Cinéma'.split(
      '|'
    ),
  adjective:
    'Agréable|Beau|Calme|Drôle|Élégant|Fort|Gentil|Heureux|Intelligent|Joli|Kitsch|Léger|Malin|Naïf|Optimiste|Poli|Rapide|Sage|Timide|Unique|Vif|Zen|Brave|Curieux|Doux|Grand|Lent|Petit|Rigolo|Sympa'.split(
      '|'
    ),
  verb: 'Aimer|Boire|Chanter|Danser|Écrire|Finir|Gagner|Habiter|Imaginer|Jouer|Klaxonner|Lire|Manger|Nager|Oublier|Parler|Quitter|Rire|Sauter|Tomber|Unir|Voler|Zapper|Courir|Dormir|Marcher|Penser|Rêver|Sourire|Voyager'.split(
    '|'
  ),
  fictionalCharacter:
    'Astérix|Batman|Cendrillon|Dark Vador|Elsa|Frodon|Gandalf|Harry Potter|Iron Man|Joker|Kirikou|Luke Skywalker|Mickey|Naruto|Obélix|Pikachu|Quasimodo|Rémy|Shrek|Tintin|Ulysse|Vegeta|Wolverine|Xena|Yoda|Zorro|Goku|Hermione|Simba|Lucky Luke'.split(
      '|'
    ),
  drink:
    'Armagnac|Bière|Cidre|Diabolo|Eau|Fanta|Grenadine|Hydromel|Infusion|Jus d’orange|Kéfir|Limonade|Milkshake|Nectar|Orangina|Perrier|Quinquina|Rhum|Sirop|Thé|Vin|Whisky|Cola|Café|Chocolat chaud|Sprite|Tequila|Vodka|Lait|Mojito'.split(
      '|'
    ),
  transport:
    'Avion|Bus|Camion|Dirigeable|Fusée|Gondole|Hélicoptère|Jet ski|Kayak|Limousine|Métro|Navette|Orient Express|Péniche|Quad|Roller|Scooter|Train|Tramway|Vélo|Voiture|Bateau|Trottinette|Moto|Taxi|Ferry|Sous-marin|Planche|Pirogue|Calèche'.split(
      '|'
    ),
  medicine:
    'Antibiotique|Bandage|Cardiologie|Dentiste|Échographie|Fièvre|Greffe|Hôpital|Infirmier|Kiné|Laboratoire|Médecin|Neurologie|Ordonnance|Pédiatrie|Radio|Scanner|Thermomètre|Urgences|Vaccin|Chirurgien|Paracétamol|Pansement|Ambulance|Stéthoscope|Seringue|Dermatologie|Orthopédie|Pharmacie|Ibuprofène'.split(
      '|'
    ),
  language:
    'Allemand|Breton|Chinois|Danois|Espagnol|Français|Grec|Hindi|Italien|Japonais|Coréen|Latin|Maori|Norvégien|Occitan|Portugais|Quechua|Russe|Suédois|Turc|Ukrainien|Vietnamien|Arabe|Basque|Catalan|Hébreu|Polonais|Roumain|Swahili|Tamoul'.split(
      '|'
    ),
  uselessPower:
    'Aimanter les chaussettes|Briller dans le noir|Changer la couleur du pain|Deviner la météo d’hier|Écouter les plantes|Faire fondre les glaçons|Gonfler les ballons|Hypnotiser les poissons|Invisibilité le mardi|Jongler avec des pâtes|Klaxonner à volonté|Lire les étiquettes|Mâcher du vent|Nager sur terre|Parler aux pigeons|Retrouver une chaussette|Sentir la pluie|Téléporter son stylo|Voler à dix centimètres|Zoomer les yeux'.split(
      '|'
    ),
  lateExcuse:
    'Ma chaussette a disparu|Mon chat a pris le volant|Le réveil boude|Un pigeon m’a suivi|Ma voiture dort encore|Le métro était timide|J’ai raté ma planète|Un canard bloquait la route|Mon GPS est parti en vacances|La pluie était en retard|Un dragon traversait|Ma sieste a duré|Mon lit m’a retenu|J’ai suivi un nuage|Le café était long|Une tortue m’a doublé|Mon ombre traînait|Le soleil s’est levé trop tard|Mon vélo a fait grève|Un chien m’a adopté'.split(
      '|'
    ),
  islandItem:
    'Un allume-feu|Une boussole|Du chocolat|Une hache|Un hamac|Une guitare|Un livre|Un miroir|Une corde|Un parasol|Des allumettes|Un couteau|Une canne à pêche|Une tente|Un téléphone|Un seau|Des lunettes|Un filet|Une radio|Un sac de riz'.split(
      '|'
    ),
  spaceshipItem:
    'Un astronaute|Un bouton rouge|Un casque|Un détecteur|Un écran|Une fusée|Un hublot|Un hologramme|Une horloge|Un laser|Un module|Un propulseur|Un radar|Un robot|Un scaphandre|Une sonde|Un tableau de bord|Un télescope|Une trappe|Un vaisseau'.split(
      '|'
    ),
  imaginaryJob:
    'Accordeur de nuages|Brosseur de licornes|Chasseur de rêves|Dompteur de dragons|Éleveur d’étoiles|Fabricant d’arcs-en-ciel|Gardien de fantômes|Horloger du temps|Inspecteur de sirènes|Jardinier de lune|Livreur de magie|Mécano de fusée|Nettoyeur de volcans|Peintre de vent|Pilote de balai|Réparateur de portails|Sculpteur de brume|Testeur de potions|Veilleur de comètes|Zoologue de monstres'.split(
      '|'
    ),
  alienPuzzle:
    'L’argent|Les bouchons|La cravate|Le dimanche|Les embouteillages|La fête des voisins|Le gazon|L’horoscope|Les jeux vidéo|Le karaoké|La lessive|Le maquillage|La neige|Les ongles|Le pourboire|Les queues|Le réveillon|Les selfies|Le tennis|Les vacances'.split(
      '|'
    ),
  oddGreeting:
    'Agiter les oreilles|Battre des cils|Chanter une note|Danser sur place|Envoyer un hibou|Faire la roue|Glousser|Hurler au loup|Imiter un chat|Jongler|Klaxonner|Lancer un confetti|Miauler|Nager dans l’air|Offrir une banane|Pirouetter|Quémander un câlin|Révérence|Siffler|Taper du pied'.split(
      '|'
    ),
  uselessInvention:
    'Un parapluie percé|Une brosse à dents carrée|Un chapeau pour poisson|Une chaise sans pieds|Un dentifrice salé|Un écran en papier|Une fourchette à soupe|Un gant pour pieds|Une horloge muette|Un imperméable en sucre|Un jeu sans règles|Un klaxon silencieux|Une lampe sombre|Un miroir flou|Un nez de rechange|Une ombrelle de nuit|Un peigne pour chauve|Un radiateur glacé|Un stylo sans encre|Un tapis volant à pile'.split(
      '|'
    ),
  absurdMovie:
    'L’Attaque des pantoufles|Batman contre le frigo|La Chaussette maudite|Le Dîner des cactus|L’Envol du grille-pain|Fast et Fourchette|Le Grand Bleu du placard|Harry Potiron|Indiana Jones et la tartine|Jurassic Sieste|Le Kebab de l’espace|La Légende du radiateur|Mission Impossible Lundi|Nemo au désert|L’Odyssée du canapé|Pirates des Pyrénées|Les Quatre Fantasques du balai|Retour vers le sandwich|Star Wash|Le Tour du monde en pédalo'.split(
      '|'
    ),
}
