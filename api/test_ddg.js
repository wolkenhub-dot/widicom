const { search, SafeSearchType } = require('duck-duck-scrape');

async function testDDG() {
  try {
    const results = await search('site:drive.google.com bob esponja', {
      safeSearch: SafeSearchType.OFF
    });
    console.log(`Encontrados ${results.results.length} resultados.`);
    console.log(results.results.slice(0, 3));
  } catch(e) {
    console.error("Falha no duck-duck-scrape:", e.message);
  }
}
testDDG();
