/**
 * githubService.js
 * 
 * Módulo para buscar repositórios, projetos abandonados, homebrews, ports 
 * e fan-translations diretamente via API oficial do GitHub.
 * Esta API é aberta (com alto rate limit para anonimos, 60 req/hora)
 * e não usa proteção de Cloudflare, garantindo estabilidade nativa.
 */

const axios = require('axios');

/**
 * Busca repositórios no GitHub via API oficial.
 * 
 * @param {string} query O termo original de busca.
 * @param {number} page A página atual.
 * @returns {Promise<Object[]>} Array contendo os links pro GitHub.
 */
async function searchGitHub(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // A API nativa do GitHub aceita parametros limpos e paginação
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=15`;
    
    // Timeout local de 5s
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Widicom-Retro-SearchBot/1.0'
      },
      timeout: 5000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.data && response.data.items) {
      return response.data.items.map(item => ({
        // Mesclamos o nome do repo com a descrição para o RelevanceEngine
        title: `${item.name} - ${item.description || 'Repositório sem descrição'}`,
        url: item.html_url,
        platform: 'GitHub'
      }));
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('[githubService] Abortado por timeout local/global.');
    } else {
      console.error(`[githubService] Falha ao consultar GitHub API: ${error.message}`);
    }
  }

  clearTimeout(timeoutId);
  return []; 
}

module.exports = {
  searchGitHub
};
