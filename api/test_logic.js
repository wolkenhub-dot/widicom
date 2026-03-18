const dorkEngine = require('./dorkEngine');
const scraperService = require('./scraperService');
const linkChecker = require('./linkChecker');
const linkResolver = require('./linkResolver');

async function testLogic() {
  const query = "bob esponja";
  console.log("Gerando dorks para:", query);
  const dorks = dorkEngine.generateDorks(query);
  console.log("Número de dorks geradas:", dorks.length);
  
  console.log("Executando metabusca assíncrona...");
  const searchResults = await scraperService.searchDorks(dorks);
  console.log("Resultados da metabusca:", searchResults.length);
  
  const resolvedResults = searchResults.map(result => ({
    titulo: result.title,
    plataforma: result.platform,
    url_original: result.url,
    url_download_direto: linkResolver.resolveDirectLink(result.url, result.platform)
  }));
  
  console.log("Links resolvidos:", resolvedResults.length);
  console.log("Verificando status...");
  
  const finalResults = await linkChecker.checkLinks(resolvedResults);
  console.log("Resultados finais recebidos:", finalResults.length);
  console.log(finalResults.slice(0, 2));
}

testLogic();
