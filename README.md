# Maser Engineering — project tracking

Single-page web app served by Google Apps Script, built with Vite, Alpine.js, Tailwind CSS v4, FlyonUI and Moment.js
(all installed with npm). The mockups in `mocks/` are the visual reference: the app must stay pixel-identical to them.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local server with reload — `http://localhost:5173/#/dashboard` |
| `npm run build` | Empties and rebuilds `dist/` (one self-contained `index.html` + the server code) |
| `npm run deploy` | `build`, then `clasp push -f` to the Apps Script project |
| `npm run pull` | `clasp pull` into `dist/` (overwritten by the next build) |
| `npm run login` | Connect clasp to your Google account (once) |
| `npm run open` | Open the project in the Apps Script editor |

`clasp push` updates the test deployment (`/dev` URL). For the `/exec` URL, create or update a versioned
deployment (`npx clasp create-deployment` / `npx clasp update-deployment <id>`).

## Where do I find…

```
src/
  client/                        everything the browser runs (Vite builds it into dist/index.html)
    index.html                   page skeleton: <head>, layout pieces, one outlet per page
    main.js                      entry point: imports, registers the Alpine components
    styles/                      main.css imports tokens.css (colours) · theme.css (Tailwind names) ·
                                 base.css (global rules) · components.css (btn, card, input…)
    core/                        logic shared by every page, no markup
    layout/                      the shell around the pages (menu, header, dialogs)
    features/                    logic shared by a page and a project tab
    pages/                       one folder per page: <page>.html + <page>.js
      index.js                   the list of pages
      project-detail/tabs/       one file per project tab
  server/                        Apps Script code, copied as is into dist/
    Code.js                      doGet(): serves index.html
    appsscript.json              manifest (time zone, web app access)
```

| I want to change… | Look in |
| --- | --- |
| A page | `pages/<page>/<page>.html` (markup) and `<page>.js` (logic) |
| A page's menus / dialogs | `pages/<page>/<page>.overlays.html` |
| A project tab | `pages/project-detail/tabs/<tab>.html` (+ `.js`) |
| Task board, test results, notes, amendments, meetings, schedules | `features/` (used by both the page and the tab) |
| Half-day planning (Team Schedule grid, My Schedule week) | `features/half-day-planning.js` (shared logic) + `pages/team-schedule/half-day-grid.*`, `pages/my-schedule/my-week.*` |
| Visual org chart | `pages/organisation/org-chart.*` |
| The side / top menu, its entries | `layout/sidebar.html`, `layout/top-nav.html`, `layout/navigation.js` |
| The header (search, notifications, profile) | `layout/header.html` + `layout/search.*`, `notifications.*`, `profile-menu.*` |
| "Create project" dialog | `layout/create-project.*` |
| Icons | `layout/icons.html` (Lucide sprite: `<svg class="i"><use href="#i-name"/></svg>`) |
| Who can **see** what (roles, hierarchy) | `core/session.js` |
| Who can **change** what | `core/permissions.js` |
| Data, saving, localStorage keys | `core/store.js` (demo data: `core/demo-data.js`) |
| Theme, palette, density, menu position | `core/preferences.js`, `styles/tokens.css` |
| Dates, money, avatar and badge colours | `core/format.js`, `core/tones.js` |
| Navigation, URL | `core/router.js` (current page, `go()`), `core/url.js` (URL sync) |
| Button, input, card… styles | `styles/components.css` |

## How it fits together

- **One root component.** `<body x-data="app">` is `core/app.js`, built from the parts of `core/` and `layout/`.
  Each page is a nested component (`x-data="tasksPage"`…) and sees everything of the root through `this`
  (`this.user`, `this.canEdit(pid)`, `this.saveData('allTasks')`, `this.go('projects.html')`…).
- **Pages.** `index.html` has one `<template x-if="route.name === '…'">` per page: only the current page exists.
  Changing page re-creates its component, like a page load. Links keep the mockups' form
  (`<a href="project-detail.html?id=p1&tab=tasks">`): `core/router.js` intercepts them.
- **HTML fragments.** `<!-- @include path/from/src/client.html -->` comments are replaced by the file at build
  time (`vite.config.js`). Fragments may include fragments.
- **Features and `compose()`.** A page and its project tab share one feature module and only add what differs:
  ```js
  // pages/project-detail/tabs/tasks.js
  export const tasksTab = () => compose(taskBoard(), {
    get taskPool() { return this.pTasks; },        // which tasks
    get defaultTaskProject() { return this.project.id; },
  });
  ```
  Each feature lists at its top the properties the page must provide. `compose()` (`core/compose.js`) merges
  objects while keeping getters reactive.
- **Saving data.** Change a collection, then save it: `this.allTasks = [...]; this.saveData('allTasks')`.
  Today `saveData()` writes to the browser (localStorage). `core/store.js` is the only place to change to load and
  save from the Google Sheet (`google.script.run`).
- **Page hooks.** In its `init()`, a page may call `this.usePage({ close, searchCtx })`: `close()` runs on Escape,
  `searchCtx()` puts the page's project / kind first in the header search.

## Adding a page

1. Create `pages/<name>/<name>.html` and `pages/<name>/<name>.js` (`export default () => ({ … })`).
2. Register it in `pages/index.js` (`component`, `factory`, `title`, `nav`, optionally `opt`).
3. Add its outlet in `index.html`, inside `<main>`:
   ```html
   <template x-if="route.name === '<name>'">
     <div x-data="<component>" class="contents">
       <!-- @include pages/<name>/<name>.html -->
     </div>
   </template>
   ```
4. If it belongs in the menu, add an entry to `nav` in `layout/navigation.js`. Link to it with `href="<name>.html"`.

## FlyonUI

The mockups restyle FlyonUI's class names (`btn`, `card`, `input`, `badge`, `select`, `menu-item`…) with the Maser
theme (`styles/components.css`). The FlyonUI CSS plugin (`@plugin "flyonui"`) is deliberately **not** enabled: it
restyles those classes (purple primary button, borderless inputs…) and breaks the match with the mockups.
FlyonUI's JavaScript is imported from npm, as in the mockups.
