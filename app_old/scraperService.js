/**
 * scraperService.js
 * 
 * Este módulo é responsável por executar a busca assíncrona e extrair links dos resultados.
 * Ele utiliza o motor de dorks gerado anteriormente e faz requisições a instâncias públicas do SearxNG ou SerpAPI.
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Exemplo de instância pública do SearxNG (em um cenário real, você deve usar várias instâncias ou uma própria)
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://searx.me',
  'https://searx.space'
];

/**
 * Realiza a busca assíncrona para uma lista de dorks.
 * 
 * @param {string[]} dorks Uma lista de strings contendo as dorks.
 * @returns {Promise<Object[]>} Uma promessa que resolve para uma lista de objetos de resultados.
 */
async function searchDorks(dorks) {
  // Limita o número de dorks a serem buscadas simultaneamente para evitar bloqueios
  const limitedDorks = dorks.slice(0, 5); // Exemplo: busca as primeiras 5 dorks

  const searchPromises = limitedDorks.map(async (dork) => {
    try {
      // Seleciona uma instância aleatória do SearxNG
      const instance = SEARXNG_INSTANCES[Math.floor(Math.random() * SEARXNG_INSTANCES.length)];
      
      const response = await axios.get(`${instance}/search`, {
        params: {
          q: dork,
          format: 'json', // O SearxNG suporta saída em JSON
          language: 'pt-BR'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // Timeout de 5 segundos
      });

      return response.data.results || [];
    } catch (error) {
      console.error(`Erro ao buscar dork "${dork}":`, error.message);
      return [];
    }
  });

  // Executa todas as buscas em paralelo
  const results = await Promise.allSettled(searchPromises);

  // Consolida os resultados e remove duplicatas por URL
  const allResults = results
    .filter(res => res.status === 'fulfilled')
    .flatMap(res => res.value);

  const uniqueResults = [];
  const seenUrls = new Set();

  for (const item of allResults) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueResults.push({
        title: item.title,
        url: item.url,
        platform: identifyPlatform(item.url)
      });
    }
  }

  return uniqueResults;
}

/**
 * Identifica a plataforma com base na URL fornecida.
 * 
 * @param {string} url A URL a ser analisada.
 * @returns {string} O nome da plataforma identificada.
 */
function identifyPlatform(url) {
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('mega.nz')) return 'Mega.nz';
  if (url.includes('mediafire.com')) return 'MediaFire';
  if (url.includes('dropbox.com')) return 'Dropbox';
  if (url.includes('disk.yandex.com')) return 'Yandex Disk';
  if (url.includes('archive.org')) return 'Internet Archive';
  return 'Outra';
}

module.exports = {
  searchDorks
};
