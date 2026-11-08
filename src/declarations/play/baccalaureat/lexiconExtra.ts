import type { BaccalaureatCategoryKey } from '@/declarations/play/baccalaureat/categories'

/**
 * Second words per category
 * @type {Partial<Record<BaccalaureatCategoryKey, string[]>>}
 */

export const BACCALAUREAT_BOT_EXTRA: Partial<Record<BaccalaureatCategoryKey, string[]>> = {
  firstName:
    'Adrien|Alexandre|Brice|Baptiste|Clara|Clément|Cédric|David|Dylan|Élise|Enzo|Florian|Flora|Guillaume|Gaëlle|Héloïse|Hélène|Ibrahim|Isabelle|Jade|Julie|Jérémy|Kévin|Katia|Laura|Louis|Mathis|Mélanie|Nicolas|Noémie|Olivier|Octave|Pierre|Priscilla|Rémi|Rose|Samuel|Stéphane|Tom|Tiffany|Valentin|Vanessa|Yann|Yasmine|Zacharie'.split(
      '|'
    ),
  country:
    'Afghanistan|Argentine|Autriche|Bolivie|Bulgarie|Cambodge|Chili|Colombie|Croatie|Cuba|Égypte|Équateur|Estonie|Finlande|Ghana|Géorgie|Haïti|Honduras|Irlande|Islande|Israël|Jamaïque|Jordanie|Kazakhstan|Liban|Lituanie|Madagascar|Malte|Mongolie|Népal|Nigeria|Ouganda|Pakistan|Pologne|Roumanie|Serbie|Suède|Thaïlande|Turquie|Uruguay|Venezuela|Zimbabwe'.split(
      '|'
    ),
  city: 'Albi|Angers|Avignon|Besançon|Bruxelles|Barcelone|Caen|Calais|Cardiff|Dakar|Dunkerque|Edimbourg|Épinal|Fès|Genève|Gênes|Helsinki|Hanoï|Inverness|Johannesburg|Kiev|Le Havre|Limoges|Londres|Madrid|Metz|Naples|Nancy|Orléans|Oran|Perpignan|Poitiers|Quimper|Reims|Rome|Saint-Étienne|Tours|Tunis|Vienne|Varsovie|Zagreb'.split(
    '|'
  ),
  animal:
    'Abeille|Autruche|Blaireau|Buffle|Canard|Cheval|Cerf|Dinde|Dromadaire|Écureuil|Escargot|Faucon|Fourmi|Gazelle|Gorille|Hamster|Hibou|Hippopotame|Isard|Jument|Kangourou|Lézard|Loup|Mouette|Mouche|Otarie|Oie|Pingouin|Perroquet|Raton laveur|Rhinocéros|Singe|Souris|Taupe|Tortue|Truite|Vautour|Vipère|Zébu'.split(
      '|'
    ),
  job: 'Architecte|Astronaute|Berger|Boucher|Chauffeur|Cuisinier|Chirurgien|Danseur|Douanier|Éboueur|Éleveur|Facteur|Forgeron|Gendarme|Guide|Hôtesse|Huissier|Ingénieur|Jardinier|Juge|Lutteur|Mécanicien|Médecin|Menuisier|Peintre|Pharmacien|Pilote|Plombier|Professeur|Photographe|Secrétaire|Soudeur|Tailleur|Vétérinaire|Vendeur'.split(
    '|'
  ),
  fruitVegetable:
    'Aubergine|Avocat|Artichaut|Betterave|Brocoli|Cassis|Céleri|Champignon|Concombre|Dattier|Endive|Échalote|Figue|Framboise|Grenade|Goyave|Haricot vert|Laitue|Mandarine|Mûre|Myrtille|Noix|Olive|Oignon|Pamplemousse|Pastèque|Pêche|Poireau|Prune|Raisin|Rhubarbe|Tomate cerise|Topinambour|Vigne'.split(
      '|'
    ),
  object:
    'Aspirateur|Balai|Bougie|Brosse|Cadre|Casserole|Ciseaux|Clé|Coussin|Dé|Drap|Écran|Enveloppe|Étagère|Fauteuil|Ficelle|Gant|Guitare|Hamac|Hélice|Interrupteur|Jouet|Lunettes|Livre|Miroir|Montre|Ordinateur|Ouvre-boîte|Panier|Peigne|Radio|Rideau|Sac|Seau|Téléphone|Tapis|Tournevis|Vase'.split(
      '|'
    ),
  color:
    'Abricot|Amande|Anthracite|Aubergine|Bleu nuit|Blond|Caramel|Chocolat|Citron|Crème|Écarlate|Émeraude|Fauve|Framboise|Grenat|Havane|Jade|Lavande|Menthe|Moutarde|Nacre|Olive|Pervenche|Prune|Rubis|Safran|Sépia|Topaze|Vermillon|Violine'.split(
      '|'
    ),
  sport:
    'Aviron|Alpinisme|Aïkido|Biathlon|Bowling|Canoë|Curling|Cricket|Course à pied|Équitation|Escalade|Fléchettes|Golf|Gymnastique|Haltérophilie|Handisport|Kayak|Kitesurf|Luge|Marche|Motocross|Padel|Parapente|Patinage|Pelote basque|Polo|Skateboard|Snowboard|Squash|Surf|Tir à l’arc|Triathlon|Voile|Water-polo'.split(
      '|'
    ),
  plant:
    'Aloe vera|Anémone|Basilic|Bleuet|Bruyère|Capucine|Coquelicot|Cyprès|Dentelle|Églantine|Érable|Fuchsia|Gentiane|Glycine|Hêtre|Hibiscus|Jonquille|Laurier|Lotus|Magnolia|Menthe|Mimosa|Myosotis|Nénuphar|Olivier|Palmier|Pâquerette|Pissenlit|Romarin|Sauge|Tournesol|Thym|Vigne vierge'.split(
      '|'
    ),
  bodyPart:
    'Abdomen|Aisselle|Bassin|Bouche|Cerveau|Cils|Clavicule|Cœur|Côte|Crâne|Dent|Dos|Estomac|Foie|Fesse|Gorge|Gencive|Hanche|Intestin|Jarret|Langue|Mâchoire|Mollet|Muscle|Narine|Nombril|Orteil|Paupière|Poumon|Rotule|Sein|Tibia|Tempe|Thorax|Veine'.split(
      '|'
    ),
  clothing:
    'Anorak|Baskets|Béret|Botte|Bretelles|Casquette|Chapeau|Ceinture|Collants|Combinaison|Costume|Doudoune|Écharpe|Espadrille|Gants|Jogging|Jupe|Kilt|Lunettes|Mitaines|Pantalon|Pyjama|Poncho|Salopette|Sandale|Sweat|Survêtement|Tablier|Tunique|Toge|Veston|Voile'.split(
      '|'
    ),
  hobby:
    'Aquariophilie|Astronomie|Basket|Broderie|Cinéma|Collection|Couture|Danse|Dessin|Escalade|Fléchettes|Généalogie|Guitare|Jeux de société|Jonglage|Lego|Macramé|Modélisme|Observation des oiseaux|Pâtisserie|Pêche|Peinture|Poterie|Puzzle|Skate|Théâtre|Voyage|Yoga'.split(
      '|'
    ),
  adjective:
    'Absurde|Aimable|Amer|Brillant|Bavard|Chaud|Courageux|Cruel|Discret|Dur|Énorme|Étrange|Fier|Faible|Franc|Génial|Gai|Honnête|Humble|Inquiet|Jaloux|Joyeux|Laid|Lourd|Mou|Mignon|Nerveux|Net|Paisible|Pauvre|Propre|Riche|Rond|Sombre|Têtu|Triste|Vaste|Vieux'.split(
      '|'
    ),
  verb: 'Acheter|Apprendre|Attendre|Bâtir|Bouger|Chercher|Choisir|Cuisiner|Dessiner|Dire|Écouter|Entrer|Essayer|Frapper|Fuir|Gonfler|Grimper|Hésiter|Inventer|Jeter|Laver|Lancer|Montrer|Mentir|Nettoyer|Offrir|Ouvrir|Partir|Peindre|Réfléchir|Savoir|Sortir|Tenir|Trouver|Vivre|Vouloir'.split(
    '|'
  ),
}
