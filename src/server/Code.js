/**
 * Web app entry point: serves the single-page app (index.html, built by Vite).
 * The title and the viewport tag must be set here: Apps Script ignores the ones in <head>.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Maser Engineering')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
