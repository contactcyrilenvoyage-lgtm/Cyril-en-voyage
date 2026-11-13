# Cyril en voyage

Site personnel de Cyril consacré aux carnets de voyage, aux aventures en plein air et à son projet de voyage à moto au Maroc. Le site est écrit en HTML, CSS et JavaScript et peut être servi directement, sans installation de paquets ni compilation.

## Architecture du site

L’[accueil](index.html) présente Cyril en voyage, la carte interactive des destinations, les aperçus des voyages et des aventures, et le projet en cours.

| Rubrique | Pages et contenu |
| --- | --- |
| [Voyages](voyages.html) | Le carnet donne accès à une page par destination. Les fiches actuelles sont les [États-Unis](voyage-usa.html), le [Brésil](voyage-bresil.html) et la [Thaïlande](voyage-thailande.html). Chaque fiche accueille le récit du voyage, les motivations et les liens vers les vidéos associées. |
| [Aventures](aventures.html) | Le carnet donne accès à une page par aventure, dont [24 h de rando](aventure-rando.html) et [La Loire en kayak](aventure-loire.html). Chaque fiche accueille le récit et les motivations. |
| [Projet en cours](projet.html) | Le Maroc à moto, avec la présentation du projet, les motivations, les préparatifs et les aperçus de la dernière vidéo YouTube et de la dernière publication Instagram. |
| [Qui suis-je ?](qui-suis-je.html) | Le récit personnel de Cyril sur son choix de partir et la création du blog et de la chaîne YouTube. Trois petites illustrations sont regroupées sous le récit. |
| [Me suivre](me-suivre.html) | Les liens vers les comptes YouTube, Instagram et Facebook. |
| [Contact](contact.js) | Le lien du menu ouvre un formulaire qui prépare un courriel dans la messagerie du visiteur. Le visiteur l’envoie depuis sa messagerie. |

Les blocs « Les dernières publications » sont dans les fiches individuelles et sur la page du projet en cours. Pour afficher les aperçus, renseigne l’identifiant de la vidéo YouTube et le lien public de la publication Instagram dans [`social-updates.js`](social-updates.js). Chaque valeur s’applique à toutes les pages qui utilisent ce script. Une valeur vide laisse le lien vers la chaîne ou le profil correspondant.

## Aperçu local

Avec Python 3, lance cette commande depuis la racine du dépôt :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvre [http://127.0.0.1:8000/](http://127.0.0.1:8000/) dans ton navigateur. Arrête le serveur avec `Ctrl+C`.

## Où modifier le site

| Fichier | Contenu |
| --- | --- |
| [`site.css`](site.css) | Styles du site. |
| [`qui-suis-je.html`](qui-suis-je.html) | Récit et vignettes de la page de présentation. Les styles de cette page sont regroupés sous `.about-story` dans `site.css`. |
| [`site.js`](site.js) | Animation de la route et interactions de la carte sur l’accueil. |
| [`scrollcraft.js`](scrollcraft.js) et [`scrollcraft.css`](scrollcraft.css) | Moteur et styles des animations au défilement. |
| [`assets/`](assets/) | Photos, logo et icônes. |

Pour ajouter un voyage ou une aventure, crée sa page de détail à partir d’une fiche existante, puis ajoute un lien vers celle-ci dans le carnet correspondant. Si le voyage figure sur la carte d’accueil, fais pointer le repère dans `index.html` vers la page de détail et ajoute les informations de la destination à l’objet `destinations` dans `site.js`.

Pour modifier un lien du menu ou l’adresse de contact, mets à jour les liens dans les pages HTML concernées.

## Publication

Le fichier [`CNAME`](CNAME) indique le domaine personnalisé [cyrilenvoyage.com](https://cyrilenvoyage.com/). Les fichiers du site, dont `index.html`, se trouvent à la racine de la branche `main`.

Dans les [réglages Pages du dépôt](https://github.com/contactcyrilenvoyage-lgtm/Cyril-en-voyage/settings/pages), la source à choisir pour publier depuis une branche est **Deploy from a branch**, avec **`main`** et **`/ (root)`**. Avec cette configuration, GitHub Pages publie les modifications poussées sur `main`. [Documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
