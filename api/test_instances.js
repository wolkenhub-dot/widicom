const axios = require('axios');

const testInstances = [
  'https://searx.ro',
  'https://search.mdosch.de',
  'https://paulgo.io',
  'https://searx.fmac.network',
  'https://priv.au',
  'https://search.ononoki.org',
  'https://searx.perennialte.ch',
  'https://search.gwhois.org',
  'https://searx.gnu.style',
  'https://searx.tiekoetter.com',
  'https://searx.xyz',
  'https://opnxng.com'
];

async function runTests() {
  console.log("Iniciando batch test de instâncias do SearxNG...");
  const workingInstances = [];

  for (const url of testInstances) {
    try {
      console.log(`Testando ${url}...`);
      const response = await axios.get(`${url}/search`, {
        params: { q: 'teste', format: 'json' },
        timeout: 2000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        console.log(`[SUCESSO] ${url} retornou ${response.data.results.length} resultados.`);
        workingInstances.push(url);
      } else {
         console.log(`[VAZIO] ${url} retornou vazio.`);
      }
    } catch (e) {
      console.log(`[ERRO] ${url} falhou com ${e.message}`);
    }
  }

  console.log("\nInstâncias funcionais:", workingInstances);
}

runTests();
