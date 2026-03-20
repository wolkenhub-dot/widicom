/**
 * openLibraryService.js
 * 
 * Módulo para buscar livros clássicos, em PDF/EPUB, scanlations e documentação
 * nativa via JSON sem rate-limits abusivos do domínio `openlibrary.org`.
 * Isso bypassa barreiras anti-scrapers comuns ao retornar metadados JSON direto.
 */

const axios = require('axios');

/**
 * Busca livros, manuais e scans no OpenLibrary.
 * 
 * @param {string} query O termo procurado
 * @param {number} page Paginação (já que eles dão suporte)
 * @returns {Promise<Object[]>}
 */
async function searchOpenLibrary(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // API aberta (Sem auth key necessária)
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=15`;
    
    // Timeout local de 5s para não prender o event loop se o site engasgar
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Widicom-Retro-SearchBot/1.0'
      },
      timeout: 5000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.data && response.data.docs) {
      return response.data.docs.map(item => {
        let titleLine = item.title;
        if (item.author_name && item.author_name.length > 0) {
           titleLine += ` (Autor: ${item.author_name[0]})`;
        }
        if (item.first_publish_year) {
           titleLine += ` - ${item.first_publish_year}`;
        }
        
        return {
          title: titleLine.length > 120 ? titleLine.substring(0, 120) + '...' : titleLine,
          url: `https://openlibrary.org${item.key}`,
          // Categoriza como Manuais/Livros no filter da plataforma
          platform: 'OpenLibrary (Manuais/Livros)'
        };
      });
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('[openLibraryService] Abortado por timeout local/global.');
    } else {
      console.error(`[openLibraryService] Falha ao acessar JSON do OpenLibrary: ${error.message}`);
    }
  }

  clearTimeout(timeoutId);
  return [];
}

module.exports = {
  searchOpenLibrary
};
