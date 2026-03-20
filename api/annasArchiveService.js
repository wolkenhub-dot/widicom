/**
 * annasArchiveService.js
 * 
 * Módulo para buscar documentos, livros e manuais no Anna's Archive via web scraping.
 * Possui timeout de 10s e retorna vetor vazio em caso de falha (graceful degradation).
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Realiza a busca no Anna's Archive.
 * 
 * @param {string} query O termo de busca do usuário.
 * @param {number} page Número da página a ser pesquisada.
 * @returns {Promise<Object[]>} Array de resultados formatados.
 */
async function searchAnnasArchive(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Anna's Archive usa URLs no formato /search?q=...
    // O scraper fará o fetching da página HTML
    const url = `https://annas-archive.gs/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // O Anna's Archive costuma agrupar os resultados em links de âncora que começam com /md5/
    $('a[href^="/md5/"]').each((i, el) => {
      const link = $(el).attr('href');
      // O texto contém o título e autores amontoados, mas limpamos os espaços
      const rawTitle = $(el).text().replace(/\s+/g, ' ').trim();
      
      if (link && rawTitle) {
        results.push({
          title: rawTitle.length > 120 ? rawTitle.substring(0, 120) + '...' : rawTitle,
          url: `https://annas-archive.org${link}`,
          platform: 'Anna\'s Archive'
        });
      }
    });

    clearTimeout(timeoutId);
    return results;

  } catch (error) {
    if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log('[annasArchiveService] Abortado compulsoriamente devido ao limite de tempo global (10s).');
    } else {
      console.error(`[annasArchiveService] Falha ao consultar: ${error.message}`);
    }
    
    // Graceful degradation
    clearTimeout(timeoutId);
    return [];
  }
}

module.exports = {
  searchAnnasArchive
};
