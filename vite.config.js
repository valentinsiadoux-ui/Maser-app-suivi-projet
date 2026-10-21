import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const CLIENT = path.resolve('src/client');
const SERVER = path.resolve('src/server');

// <!-- @include chemin/fichier.html --> : assemble index.html à partir des fragments (récursif,
// chemins relatifs au fichier qui inclut).
function htmlIncludes() {
  const re = /<!--\s*@include\s+(\S+)\s*-->/g;
  const expand = (html, dir) => html.replace(re, (_, rel) => {
    const file = path.resolve(dir, rel);
    return expand(fs.readFileSync(file, 'utf8'), path.dirname(file));
  });
  return {
    name: 'html-includes',
    transformIndexHtml: { order: 'pre', handler: (html) => expand(html, CLIENT) },
    // un fragment modifié : rechargement complet en développement
    handleHotUpdate({ file, server }) {
      if (file.startsWith(CLIENT) && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

// Copie le code serveur Apps Script (.js, appsscript.json) à la racine de dist/
function appsScriptServer() {
  return {
    name: 'apps-script-server',
    apply: 'build',
    generateBundle() {
      for (const f of fs.readdirSync(SERVER)) {
        this.emitFile({ type: 'asset', fileName: f, source: fs.readFileSync(path.join(SERVER, f), 'utf8') });
      }
    },
  };
}

export default defineConfig({
  root: CLIENT,
  plugins: [htmlIncludes(), tailwindcss(), viteSingleFile(), appsScriptServer()],
  build: {
    outDir: path.resolve('dist'),
    emptyOutDir: true,
  },
});
