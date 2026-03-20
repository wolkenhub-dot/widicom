/**
 * torrentService.js
 * 
 * Módulo para buscar filmes clássicos, séries, discografias e conteúdos raros 
 * via APIs abertas de indexadores de Torrent (apibay.org).
 * Como é focado em P2P, não sofre com perdas de links (link rot) caso haja seeders.
 */

const axios = require('axios');

/**
 * Busca torrents públicos e converte em Magnet Links.
 * 
 * @param {string} query O termo procurado
 * @param {number} page A página atual
 * @returns {Promise<Object[]>}
 */
async function searchTorrents(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // API JSON ofical aberta sem bloqueios
    const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}`;
    
    // Timeout local de 5s
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Widicom-Retro-SearchBot/1.0'
      },
      timeout: 5000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // O apibay retorna um array e o id '0' significa sem resultados.
    if (response.data && Array.isArray(response.data) && response.data[0] && response.data[0].id !== '0') {
      return response.data.map(item => {
        // Converte bytes para tamanho legível
        const sizeGb = (parseInt(item.size, 10) / (1024 * 1024 * 1024)).toFixed(2);
        const sizeLabel = sizeGb > 1 ? `${sizeGb}GB` : `${(parseInt(item.size, 10) / (1024 * 1024)).toFixed(0)}MB`;

        // Monta o Magnet Link Universal
        const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce`;
        
        return {
          title: `[${sizeLabel} | Seeds: ${item.seeders}] ${item.name}`,
          url: magnet,
          platform: 'Torrent (Magnet)' // Tag para destacar Filmes/Mídias P2P
        };
      });
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('[torrentService] Abortado por timeout local/global.');
    } else {
      console.error(`[torrentService] Falha ao consultar apibay: ${error.message}`);
    }
  }

  clearTimeout(timeoutId);
  return [];
}

module.exports = {
  searchTorrents
};
