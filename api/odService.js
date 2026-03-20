/**
 * odService.js
 * 
 * Módulo para buscar diretórios abertos (Open Directories) via SearxNG.
 * Herda a estabilidade e lista de instâncias do mecanismo principal do SearxNG.
 */

const axios = require('axios');
const dorkEngine = require('./dorkEngine');

// Compartilhamos uma lista robusta parecida com a do searxngService
const SEARXNG_INSTANCES = [
  'http://137.131.205.231:8080',
  'https://searx.be',
  'https://paulgo.io',
  'https://searx.fmac.network',
  'https://search.mdosch.de',
  'https://search.ononoki.org',
  'https://searx.tiekoetter.com',
  'https://searx.bndnet.org',
  'https://searx.stvm.it',
];

/**
 * Busca Open Directories no SearxNG.
 * 
 * @param {string} query O termo original.
 * @param {number} page A página atual da busca.
 * @returns {Promise<Object[]>} Array contendo os links brutos (Open Directory).
 */
async function searchODs(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // Solicitamos a Dork específica pro diretório
  const dorks = dorkEngine.generateODDorks(query);
  const searxQuery = dorks[0];

  for (const instance of SEARXNG_INSTANCES) {
    if (controller.signal.aborted) {
       console.log('[odService] Timeout de 10s atingido. Cancelei instâncias.');
       break;
    }

    try {
      const response = await axios.get(`${instance}/search`, {
        params: {
          q: searxQuery,
          pageno: page,
          format: 'json',
          language: 'pt-BR'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 3500, // Timeout local para pular instâncias travadas sem consumir todo o tempo
        signal: controller.signal
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        clearTimeout(timeoutId);
        
        // Mapeamos diretamente para a plataforma Open Directory
        return response.data.results.map(item => ({
          title: item.title || '[Index of]',
          url: item.url,
          platform: 'Open Directory'
        }));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        console.log('[odService] Timeout global estourou durante a requisição. Abortando loop.');
        break; 
      }
      console.error(`[odService] Falha na instância ${instance} (${error.message}). Rodando próxima...`);
    }
  }

  // Fallback Definitivo caso o SearxNG esteja bloqueando o IP (Erro 429) usando a biblioteca nativa googlethis
  if (!controller.signal.aborted) {
    if (page === 1) {
      console.log('[odService] Instâncias SearxNG falharam. Tentando Fallback nativo do Google (googlethis)...');
      try {
        const google = require('googlethis');
        // Usamos uma dork um pouco mais relaxada para evitar bloqueio pesado do Google
        const ggQuery = `intitle:"index of" "${query.trim()}"`;
        const res = await google.search(ggQuery, {
          page: 0, 
          safe: false, 
          parse_ads: false,
          additional_params: { hl: 'pt-BR' }
        });

        if (res && res.results && res.results.length > 0) {
          clearTimeout(timeoutId);
          // Mapeamos para a interface de Open Directory local
          return res.results.map(item => ({
            title: item.title,
            url: item.url,
            platform: 'Open Directory'
          }));
        }
      } catch (e) {
        console.log("[odService] Fallback nativo do Google falhou:", e.message);
      }
    }
  }

  // Diferente do searxngService, Open Directories não funcionam legal no reddit. Retornamos vazio.
  clearTimeout(timeoutId);
  return []; 
}

module.exports = {
  searchODs
};
