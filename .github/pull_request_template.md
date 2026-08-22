## Ce que fait cette PR

<!-- Une phrase. Si elle n'en tient pas une, la PR est trop large. -->

## Circuit de promotion

Cocher l'étape franchie par **chaque** fonctionnalité de cette PR (voir le skill `branches`) :

- [ ] Développée sur `dev`
- [ ] Testée sur `staging`
- [ ] Approuvée par les testeurs sur `release`
- [ ] Prête pour la livraison client sur `main`

Une fonctionnalité qui a sauté une étape ne passe pas. La lister ici plutôt que la faire avancer.

## Vérification

- [ ] `yarn validate` est vert en local
- [ ] Aucune valeur en dur ajoutée (libellé, couleur, borne, chemin d'API)
- [ ] Aucun secret dans `src/configurations/` ni ailleurs dans le diff

## À signaler

<!-- Ce qui reste à optimiser, ce qui est volontairement hors périmètre. -->
