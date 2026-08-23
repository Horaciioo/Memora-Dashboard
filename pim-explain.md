```md
# Marsha Academy – Spécifications fonctionnelles & techniques

## Contexte

Nous allons essentiellement nous concentrer sur la **Marsha Academy**, donc la **PIM**, les **sessions**, les **FSI**, les **formations**, ainsi que tout l'écosystème qui gravite autour.

Avant de commencer le développement, voici le fonctionnement de la Marsha Academy.

---

# Présentation de la Marsha Academy

La **Marsha Academy** est le pôle de formation de Marsha.

C'est l'endroit où toute nouvelle personne :

- apprend son rôle ;
- observe les équipes ;
- est accompagnée ;
- est évaluée ;
- progresse jusqu'à être autonome.

Une personne présente dans la Marsha Academy est appelée un **Junior**.

Exemples :

- Junior Discord
- Junior Live
- Junior Responsable
- etc.

Dans cette première version, nous allons uniquement nous concentrer sur :

- Junior Modérateur Twitch
- Junior Modérateur Discord

---

# Recrutement

Dans la majorité des cas, un Junior rejoint l'Academy après une session de recrutement.

Le recrutement est composé de deux étapes :

1. Entretien écrit
2. Entretien oral

Une fois ces deux étapes validées, le candidat devient officiellement **Junior** dans la fonction pour laquelle il a postulé.

À partir de ce moment :

- un Formateur lui est attribué ;
- une PIM lui est créée ;
- une FSI lui est associée ;
- il rejoint une Session.

---

# PIM (Période d'Intégration de Modération)

La PIM est composée de deux grandes étapes.

## Première étape : Découverte

Le Junior :

- découvre son rôle ;
- réalise ses formations ;
- observe les équipes ;
- participe progressivement aux actions de modération ;
- prend ses marques.

---

## Deuxième étape : Action

Le Junior :

- pratique davantage ;
- travaille sur ses objectifs ;
- développe les compétences restantes ;
- améliore ses faiblesses ;
- devient progressivement autonome.

---

# Dispositifs de PIM

Chaque Junior est intégré dans un dispositif.

## ATRIA

Public concerné :

- découvre totalement sa fonction ;
- découvre parfois même le monde de l'influence.

Objectif :

- apprendre ;
- observer ;
- vérifier que la fonction lui plaît.

---

## PULSE

Public concerné :

- possède déjà les bases.

Objectif :

- s'adapter aux méthodes Marsha ;
- monter rapidement en compétence.

Le travail est davantage orienté sur l'adaptation que sur l'apprentissage.

---

# Compétences

Les compétences dépendent :

- de la fonction ;
- du dispositif.

---

# Twitch – ATRIA

Compétences :

- Travail en équipe
- Communication
- Réactivité
- Investissement
- Assiduité et présence
- Respect de la hiérarchie
- Connaissance du panel
- Capacité rédactionnelle
- Vitesse de modération

---

# Twitch – PULSE

Les compétences restent proches d'ATRIA mais sont davantage orientées vers la montée en autonomie.

Compétences proposées :

- Collaboration avancée
- Communication professionnelle
- Réactivité opérationnelle
- Prise d'initiative
- Fiabilité et engagement
- Respect des procédures
- Maîtrise complète du panel
- Qualité rédactionnelle
- Efficacité de modération

---

# Discord – ATRIA

Compétences :

- Maîtrise de Discord
- Maîtrise de Marsha
- Capacité rédactionnelle
- Travail en équipe
- Communication
- Graduation des sanctions
- Gestion des tickets
- Gestion des preuves
- Rédaction professionnelle des sanctions
- Sang-froid et impartialité
- Diplomatie
- Prise de décision rapide

---

# Discord – PULSE

Compétences proposées :

- Expertise Discord
- Maîtrise de l'écosystème Marsha
- Communication professionnelle
- Collaboration avancée
- Gestion autonome des tickets
- Justification professionnelle des sanctions
- Gestion rigoureuse des preuves
- Graduation pertinente des sanctions
- Prise de décision rapide
- Diplomatie avancée
- Impartialité
- Gestion des situations complexes

---

# Formateurs

Chaque Junior possède un **Formateur référent**.

Tous les Formateurs peuvent aider un Junior.

En revanche, lorsqu'un Responsable attribue officiellement un Junior à un Formateur, celui-ci devient son référent principal.

Il est alors chargé de :

- réaliser les vocaux ;
- accompagner le Junior ;
- répondre à ses questions ;
- suivre sa progression ;
- fixer les objectifs ;
- rédiger les bilans ;
- effectuer les évaluations.

---

# Bilans

À la fin de chaque étape de PIM, le Formateur réalise :

- un bilan oral ;
- un bilan écrit.

Le bilan écrit est enregistré dans la **FSI (Fiche de Suivi Individualisée)**.

Les Responsables prennent ensuite la décision finale concernant le passage ou non à l'étape suivante.

---

# Développements à réaliser

## Modérateurs

Dans la page **Modérateurs** :

Supprimer complètement la section **PIM** présente dans **Fiches**.

Dans **Academy** :

- afficher un lien vers la FSI du Junior ;
- si aucune FSI n'existe :

> Ce Modérateur n'a pas de FSI associée.

Créer ensuite une nouvelle section :

### Parcours

Contenu :

> En cours de développement

---

# Comportement du rôle Junior

Lorsqu'un utilisateur possède le statut **Junior**, une nouvelle page apparaît automatiquement dans le menu **Personnel**.

Nom de la page :

**Formations**

Cette page n'est visible que pour les Juniors.

---

# Page Formations

Le système doit permettre au Junior de démarrer ses formations.

Les contenus des formations sont communs à tous les Juniors d'une même spécialité.

Exemple :

Tous les Juniors Twitch voient exactement les mêmes formations Twitch.

En revanche, leur progression est personnelle.

Chaque Junior possède donc :

- son avancement ;
- ses formations commencées ;
- ses formations terminées.

Lorsqu'une formation est terminée et que le Junior clique sur le bouton de validation :

- la session est mise à jour ;
- la FSI est mise à jour ;
- la formation est marquée comme réalisée.

Le contenu des formations sera développé ultérieurement.

Pour le moment, afficher :

> En cours de développement

---

# Sessions

Une partie du système existe déjà.

Une Session doit contenir :

- date de commencement ;
- YouTubeur concerné ;
- équipe concernée ;
- liste des Formateurs.

Important :

Un Formateur ne peut voir et gérer que les Sessions correspondant à sa fonction.

Exemple :

- un Formateur Discord ne peut pas intervenir sur une PIM Twitch ;
- un Formateur Twitch ne peut pas intervenir sur une PIM Discord.

---

# Pages d'une Session

## Calendrier

Réutiliser le calendrier existant.

En revanche, il ne doit afficher que les événements liés à la Session.

Exemples :

- période des formations ;
- période des bilans ;
- entretien avec Responsable ;
- entretien avec Formateur ;
- lives Twitch ;
- lives YouTube ;
- événements Discord.

---

## Missions

Afficher simplement :

> En cours de développement

---

## Timeline

La Timeline est le cœur d'une Session.

C'est elle qui pilote :

- les périodes ;
- les objectifs ;
- les échéances ;
- les responsabilités.

Elle représente le fil conducteur complet de la PIM.

### États visuels

#### À venir

- grisé ;
- légèrement transparent.

#### En cours

- rose ;
- entièrement visible.

#### Terminé

- grisé ;
- barré ;
- coche verte.

#### En retard

- rouge.

Une étape rouge bloque automatiquement la progression vers la suivante.

---

# Contenu de la Timeline

## Préparation avant PIM

### J-4 à J-1

**RESPONSABLE**

- Création de la Session.

---

**RESPONSABLE**

- Briefing avec les Formateurs.

---

**RESPONSABLE**

- Revue des attentes.

---

**RESPONSABLE + FORMATEURS**

- Répartition des Juniors.
- Création des rôles.
- Création des salons d'équipe.

---

### J-0

**RESPONSABLE**

- Partage du formulaire d'admission.

---

# Première période (Twitch)

### J-0

**RESPONSABLE**

- Vocal individuel.
- Présentation.
- Vérification des informations.
- Attribution de la Team.

---

### J-0

**FORMATEURS**

- Message de bienvenue.
- Organisation d'un vocal.

---

### J-0

**RESPONSABLE + FORMATEURS**

- Vérification des présents.
- Vérification des Teams.

---

### J+3 à J+5

**RESPONSABLE**

- Ouverture des formations autonomes sur Memora.

---

### J+3 à J+17

**PÉRIODE FORMATION**

Les Juniors :

- commencent leurs formations.

Les Formateurs :

- répondent aux questions ;
- suivent l'avancement.

---

### J+17 jusqu'au 6ᵉ live

Découverte.

Observation.

Accompagnement.

Mise en pratique.

---

### Après le 6ᵉ live

**PÉRIODE BILAN**

Les Formateurs :

- réalisent le bilan vocal ;
- remplissent le bilan Memora ;
- proposent un avis.

Les Responsables :

- prennent la décision finale.

---

### Après les décisions

**RESPONSABLE**

Annonce les refus en vocal ou à l'écrit.

---

# Deuxième période (Twitch)

Si le Junior est validé.

---

### Avant le 7ᵉ live

**FORMATEURS**

- bilan intermédiaire ;
- rappel des objectifs ;
- identification des difficultés.

---

### Du 7ᵉ au 13ᵉ live

Travail sur :

- les objectifs ;
- les compétences restantes ;
- l'observation renforcée.

---

### Après le 13ᵉ live

**PÉRIODE DES BILANS**

Les Formateurs :

- réalisent le vocal final ;
- rédigent les bilans ;
- échangent avec le Responsable.

---

# Période Bonus

Si Responsable et Formateur le décident.

Maximum :

**4 lives supplémentaires**

Conditions :

- objectifs positifs ;
- compétences clairement identifiées ;
- justification documentée ;
- validation du Responsable.

---

# FSI (Fiche de Suivi Individualisée)

Chaque Junior possède une FSI.

Elle contient plusieurs onglets.

---

## Informations

Contient notamment :

- statistiques ;
- progression ;
- formations réalisées.

---

## Notes

Chaque note possède :

- auteur ;
- date de création ;
- périodicité (1ʳᵉ ou 2ᵉ étape) ;
- type :
  - Positive
  - Négative

---

## Objectifs

Onglet déverrouillé uniquement à partir de la deuxième étape.

---

## Bilans

À compléter avant chaque passage d'étape.

Les bilans sont :

- rédigés par les Formateurs ;
- validés par les Responsables.

---

## Compétences

Afficher :

- les catégories ;
- les compétences ;
- leur description ;
- leur état d'avancement ;
- leur validation.
```

## Notes supplémentaires, suie à un envoi à une IA qui m'a posé ces questions là :

Globalement, c'est très cohérent. On comprend la vision métier, le parcours d'un Junior et les fonctionnalités attendues. En revanche, si je me mets dans la peau d'un développeur qui découvre le projet, il reste plusieurs zones d'ombre qui vont forcément amener des questions. Je les classerais en trois catégories.

## 1. Les incohérences métier

### Session vs PIM

Tu utilises parfois "Session", parfois "PIM", parfois les deux.

On ne sait pas si :

- une Session = une PIM ;
- une Session contient plusieurs PIM ;
- une PIM appartient à une Session.

Je formaliserais quelque chose comme :

> Une Session représente une promotion de Juniors. Chaque Junior possède une PIM individuelle qui appartient à cette Session.

Ou, si c'est le cas :

> Une Session est une PIM collective.

Il faut une définition unique.

---

### Formateur référent

Tu dis :

> Tous les formateurs peuvent aider un Junior.

Puis :

> Un Responsable peut donner un Junior à charge.

Mais ensuite tu écris :

> Il possède un Formateur.

On ne sait donc pas si :

- un Junior possède toujours un référent ;
- ou uniquement lorsque le Responsable l'assigne.

---

### Les compétences

Tu présentes :

- Twitch ATRIA
- Twitch PULSE
- Discord ATRIA
- Discord PULSE

Mais tu ne précises jamais :

> Qui valide ces compétences ?

Le Formateur ?

Le Responsable ?

Automatiquement ?

Les deux ?

---

### Les bilans

Tu dis :

> Les formateurs rédigent.

Puis :

> Les responsables prennent la décision.

Mais ensuite :

> Les bilans sont validés par les Responsables.

Il faudrait distinguer :

- rédaction ;
- validation ;
- décision finale.

---

## 2. Les points techniques flous

Ce sont ceux qui vont faire perdre énormément de temps à Claude.

### Une Formation

Tu dis :

> Le Junior clique sur Terminer.

Mais :

Est-ce qu'il peut :

- recommencer ?
- modifier ?
- reprendre ?
- abandonner ?
- combien de temps dure-t-elle ?

---

### Les Sessions

Tu dis :

Une session possède :

- date
- youtubeur
- équipe
- formateurs

Mais pas :

- Juniors

Pourtant c'est l'élément principal.

---

### Timeline

Tu expliques très bien les couleurs.

Mais pas :

Comment passe-t-on d'un état à un autre ?

Automatiquement ?

Manuellement ?

Par une validation ?

Par une date ?

---

### Les bilans

Tu parles :

- bilan oral
- bilan écrit

Mais :

Le vocal est-il simplement informatif ?

Ou faut-il pouvoir enregistrer :

- date
- durée
- résumé
- compte-rendu

---

### Compétences

Tu dis :

Afficher :

- description
- validation

Mais :

Validation :

- booléen ?
- note /20 ?
- niveau ?
- En cours ?
- Validé ?
- Refusé ?

---

## 3. Ce qu'il manque complètement

Là je pense que ce sont les plus gros oublis.

### Les rôles

Tu cites :

- Junior
- Formateur
- Responsable

Mais jamais leurs permissions.

Par exemple :

Qui peut :

- créer une Session ?
- modifier une FSI ?
- supprimer une note ?
- changer un Formateur ?
- clôturer une PIM ?

Aujourd'hui ce n'est écrit nulle part.

---

### Les états d'une PIM

Il manque quelque chose comme :

```
Créée

↓

En attente

↓

Première étape

↓

Bilan 1

↓

Deuxième étape

↓

Bilan final

↓

Bonus (facultatif)

↓

Terminée
```

Ça évite énormément de logique implicite.

---

### Les états d'une Session

Même chose.

Aujourd'hui on ne sait pas si une Session est :

- préparée
- ouverte
- active
- clôturée
- archivée

---

### Les formations

Tu ne définis pas leur structure.

Une formation est-elle composée de :

- chapitres ?
- vidéos ?
- textes ?
- quiz ?

Ou juste une page ?

---

### Les notes

Tu parles des Notes.

Mais une note représente quoi ?

- une remarque rapide ?
- une observation ?
- un avertissement ?
- un compliment ?
- un compte-rendu ?

---

## Ce que j'ajouterais

Personnellement, j'ajouterais un chapitre au début intitulé **"Glossaire"**, qui définit chaque terme métier utilisé. Par exemple :

| Terme              | Définition                                                     |
| ------------------ | -------------------------------------------------------------- |
| Session            | Promotion regroupant plusieurs Juniors intégrés simultanément. |
| PIM                | Parcours individuel d'un Junior au sein d'une Session.         |
| FSI                | Fiche de Suivi Individualisée d'un Junior.                     |
| Junior             | Modérateur en période d'intégration.                           |
| Formateur référent | Formateur responsable du suivi principal d'un Junior.          |
| Responsable        | Encadrant validant les bilans et les décisions finales.        |
| ATRIA              | Dispositif d'apprentissage destiné aux débutants.              |
| PULSE              | Dispositif destiné aux profils ayant déjà une expérience.      |

Ce simple glossaire élimine une grande partie des ambiguïtés et facilite énormément la compréhension du document.

En l'état, j'estimerais que le document est **compréhensible à environ 85–90 %**. Avec ces précisions, il deviendrait un véritable cahier des charges fonctionnel, suffisamment précis pour qu'un développeur puisse implémenter les fonctionnalités avec très peu de questions complémentaires.

### Ma réponse

Une session = Chaque Junior possède une PIM individuelle qui appartient à cette session oui

Un formateur peut être référent d'une personne, on appelle cela un Référent.

Celui qui valide les compétences : Tous, en fonction de ce qui a été vu par la personne. principalement le référent.

Les formateurs rédigent leur bilan, les responsables évaluent le bilan & leurs connaissances, ensuite ils valident, ou non le passage.

Est-ce qu'il peut :

- recommencer ? <= Oui
- modifier ? <= Non
- reprendre ? <= Oui
- abandonner ? <= Oui
- combien de temps dure-t-elle ? <= 20 à 50 minutes

### Les Sessions

Lorsqu'un Junior reçoit le formulaire d'admission, ça lui crée un compte sur Memora, donc dans "Modérateurs" et l'affecte directement à la session en cours, donc devient immédiatement un Junior de cette session.

### Timeline

On passe par une validation.

Les bilans

Le vocal est un point avec le Junior et le Référent, pas qu'informatif.

Compétences

Validation avec un %, une barre qui doit se remplir manuellement.

### Les états d'une Session

Même chose.

Aujourd'hui on ne sait pas si une Session est :

- préparée
- ouverte
- active
- clôturée
- archivée

Tout.

Les formations

- Quiz,
- Textes,
- Chapitres

### Les notes

Tu parles des Notes.

Mais une note représente quoi ?

- une remarque rapide ? <= oui
- une observation ? <= oui
- un avertissement ? <= oui
- un compliment ? <= oui
- un compte-rendu ? <= non

Va pour le lexique.

C'est à rajouter en page aussi
