/**
 * Point d'entrée de la web app : renvoie l'application monopage (index.html, généré par Vite).
 * Le titre et la balise viewport doivent être définis ici : Apps Script ignore ceux du <head>.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Maser Engineering')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
