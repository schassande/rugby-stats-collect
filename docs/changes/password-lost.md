# Réinitialisation de mot de passe.

## Objectif
Ajouter dans l'application un moyen de réinitialiser son mon de passe pour un utilisateur qui s'authentifie par login/password (ne concerne pas l'authentification Google)

## Fonctionnement

La fonctionnalité doit être ajouté dans la page de login ajoutes. 
Comme il y a un lien "creer un compte", juste en dessous, ajoutes un lien "réinitialiser son mot de passe". Cela doit router vers une nouvelle page. Si l'utilisateur avait déjà saisi un email dans le formulaire de la page login alors l'email est récupéré et recopié dans le formulaire de la page de demande réinitialisation de mot de passe.

Dans la page de demande de réinitialisation, il faut saisir l'email. Il y un bouton annuler qui permet de revenir à la page de login. Il y a un bouton "Demander la réinitialisation".

La demande de réinitialisation utilise la fonction de firebase pour effectuer cela. Firebase doit envoyer un email avec un lien pour réinitialiser. 

## Exigences techniques

- Utiliser des composants primeng
- Formatter le code pour qu'il soit lisible
- Ecrire la JS Doc de toutes les méthodes typescript
- Le langage utilisé est le français
