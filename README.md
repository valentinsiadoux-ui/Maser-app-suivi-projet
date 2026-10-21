# Maser Engineering — suivi de projets

Application web monopage (Google Apps Script) construite avec Vite, Alpine.js, Tailwind CSS v4, FlyonUI et Moment.js.
Les maquettes de référence sont dans `mocks/` : l'application doit leur rester identique au pixel près.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur local avec rechargement (`http://localhost:5173/#/dashboard`) |
| `npm run build` | Vide et régénère `dist/` (`index.html` autonome + code serveur) |
| `npm run deploy` | `build` puis `clasp push -f` vers le projet Apps Script |
| `npm run pull` | `clasp pull` (récupère le code distant dans `dist/`, écrasé au prochain build) |
| `npm run login` | Connexion de clasp à votre compte Google (une seule fois) |
| `npm run open` | Ouvre le projet dans l'éditeur Apps Script |

`clasp push` met à jour le déploiement de test (URL `/dev`). Pour l'URL `/exec`, créez ou mettez à jour un déploiement versionné (`npx clasp create-deployment` / `npx clasp update-deployment <id>`).

## Organisation

```
src/
  client/                 → compilé par Vite en un seul dist/index.html (JS et CSS intégrés)
    index.html            coquille : <body x-data="app">, une <template x-if> par page
    main.js               point d'entrée : imports npm, enregistrement des composants Alpine
    styles/main.css       Tailwind v4 + tokens Maser + classes btn/card/input… des maquettes
    partials/             fragments HTML insérés par <!-- @include … --> (au build)
      shell-start.html    menu latéral / haut, barre supérieure
      shell-end.html      dialogue « Create project »
      pages/<page>.html   contenu de <main> de chaque maquette
      pages/<page>.overlays.html  menus et dialogues propres à une page (téléportés dans <body>)
    js/
      app.js              composant racine : utilisateur, droits, menu, recherche, navigation
      router.js           routes ↔ URL (google.script.history dans Apps Script, hash en local)
      constants.js        tons, couleurs, liste des routes
      data/demo.js        données de démonstration (à remplacer par le Google Sheet)
      pages/*.js          un composant Alpine par page (hérite des données de app.js)
  server/                 → copié tel quel dans dist/
    Code.js               doGet() : sert index.html
    appsscript.json       manifeste
```

### Navigation

Les liens des maquettes (`projects.html`, `project-detail.html?id=p1&tab=tasks`…) sont conservés : un
intercepteur de clics les transforme en changements de route, sans rechargement. Chaque changement de
page recrée le composant de la page, comme un chargement de page dans les maquettes.

### FlyonUI

Les maquettes redéfinissent les classes de FlyonUI (`btn`, `card`, `input`, `badge`, `select`, `menu-item`…)
avec le thème Maser. Le plugin CSS `@plugin "flyonui"` n'est volontairement **pas** activé : il remplace
ces styles (bouton principal violet, champs sans bordure…) et casse la fidélité aux maquettes. Le JavaScript
de FlyonUI est importé depuis npm, comme dans les maquettes.
