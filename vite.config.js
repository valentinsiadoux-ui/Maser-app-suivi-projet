import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const CLIENT = path.resolve('src/client');
const SERVER = path.resolve('src/server');

// <!-- @include path/to/file.html --> assembles index.html from HTML fragments at build time.
// Paths are always relative to src/client/, and fragments may include other fragments.
function htmlIncludes() {
  const re = /<!--\s*@include\s+(\S+)\s*-->/g;
  const expand = (html) => html.replace(re, (_, rel) => expand(fs.readFileSync(path.resolve(CLIENT, rel), 'utf8')));
  return {
    name: 'html-includes',
    transformIndexHtml: { order: 'pre', handler: expand },
    // a fragment changed: full reload in development
    handleHotUpdate({ file, server }) {
      if (file.startsWith(CLIENT) && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

// Copies the Apps Script server code (.js, appsscript.json) to the root of dist/
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
