/**
 * annasArchiveService.js
 * 
 * Módulo para buscar documentos, livros e manuais no Anna's Archive via web scraping.
 * Possui timeout de 10s e retorna vetor vazio em caso de falha (graceful degradation).
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Cache para não sobrecarregar o open-slum.org
let cachedMirrors = ['https://annas-archive.gs']; // Fallback fixo padrão
let lastFetchTime = 0;

async function getActiveMirrors() {
  // Limita o fetch a 1 vez por hora (60 min)
  if (Date.now() - lastFetchTime < 1000 * 60 * 60) {
    return cachedMirrors; 
  }

  try {
    const res = await axios.get('https://open-slum.org/', { timeout: 6000 });
    // Extrator por Regex pegando o campo 'url' do payload injectado de React/Vue do dashboard
    const regex = /['"]?url['"]?\s*:\s*['"](https:\/\/annas-archive\.[a-z]+)\/['"]/gi;
    const matches = [...res.data.matchAll(regex)];
    const urls = matches.map(m => m[1]);
    
    if (urls.length > 0) {
      // Remove redundâncias se houver arrays duplicados no state interno da página
      cachedMirrors = [...new Set(urls)];
      lastFetchTime = Date.now();
      console.log(`[annasArchiveService] Update de Mirrors via SLUM: ${cachedMirrors.join(', ')}`);
    }
  } catch (e) {
    console.error('[annasArchiveService] Falha de sincronia SLUM:', e.message);
  }
  return cachedMirrors;
}


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
    const mirrors = await getActiveMirrors();
    const baseUrl = mirrors[Math.floor(Math.random() * mirrors.length)];

    // Anna's Archive usa URLs no formato /search?q=...
    // O scraper fará o fetching da página HTML dinamicamente através do mirror ativo
    const url = `${baseUrl}/search?q=${encodeURIComponent(query)}`;
    
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
          url: `${baseUrl}${link}`,
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
