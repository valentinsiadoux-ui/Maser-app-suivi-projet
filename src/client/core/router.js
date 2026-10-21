// Which page is shown, and how to go to another one (single-page app: no reload).
//
// Templates navigate with ordinary links (<a href="projects.html">) or go('page.html?…'):
// clicks on such links are intercepted here. Each navigation re-creates the page component,
// like a page load in the mockups. The list of pages is in pages/index.js.
import { parseHref, readLocation, writeLocation, onLocationChange } from './url.js';
import { PAGES, DEFAULT_ROUTE } from '../pages/index.js';

export const router = () => ({
  route: { name: null, query: '' },
  // hooks registered by the page on screen: { close() (Escape key), searchCtx() (see layout/search.js) }
  pageApi: null,

  init() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self')) return;
      if (!parseHref(a.getAttribute('href'))) return;
      e.preventDefault();
      this.go(a.getAttribute('href'));
    });
    onLocationChange((r) => this.show(r));
    readLocation((r) => this.show(r));
  },

  // go('project-detail.html?id=p1&tab=tasks')
  go(href) {
    const r = parseHref(href);
    if (!r) { window.open(href, '_blank', 'noopener'); return; }
    writeLocation(r);
    this.show(r);
  },
  // update the URL without re-creating the page (tabs, settings sections)
  replaceRoute(href) {
    const r = parseHref(href); if (!r) return;
    this.route = { ...this.route, query: r.query };
    writeLocation(r, true);
  },
  // display a route (unknown names fall back to the dashboard)
  show(r) {
    const next = { name: PAGES[r.name] ? r.name : DEFAULT_ROUTE, query: r.query || '' };
    this.closeAll();
    this.pageApi = null;
    document.title = (PAGES[next.name].title ? PAGES[next.name].title + ' · ' : '') + 'Maser Engineering';
    window.scrollTo(0, 0);
    if (this.route.name === next.name) {
      // same page with other parameters: unmount first so the page starts fresh
      this.route = { name: null, query: '' };
      this.$nextTick(() => { this.route = next; });
    } else {
      this.route = next;
    }
  },
  // called by a page in its init()
  usePage(api) { this.pageApi = api; },

  // URL parameters of the current page (?id=…&tab=…)
  get params() { return new URLSearchParams(this.route.query); },
  // menu entry highlighted for this page, and its optional-page key (if any)
  get page() { return PAGES[this.route.name]?.nav ?? ''; },
  get optKey() { return PAGES[this.route.name]?.opt; },
  // project shown by the project detail page
  get projectId() { return this.route.name === 'project-detail' ? this.params.get('id') : null; },
});
