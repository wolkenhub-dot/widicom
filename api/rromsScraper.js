const axios = require('axios');
const cheerio = require('cheerio');

/**
 * rromsScraper.js
 * Scrapes the specific R-Roms Megathread page requested by the user.
 */

async function searchRRoms(query) {
  if (!query) return [];

  // Pressionando o termo para Regex (case-insensitive)
  const termoLower = query.toLowerCase().trim();
  const results = [];

  try {
    // 1. O URL EXATO que o usuário pediu para priorizar.
    const TARGET_URL = 'https://r-roms.github.io/Sony/sony-playstation-portable';
    
    // 2. Extraindo a página (R-Roms é hospedado no Github Pages, sem Cloudflare/CORS traps pesados no backend)
    const { data } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Widicom/1.0'
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);

    // 3. Iterando nas tabelas de jogos
    $('table tbody tr').each((i, row) => {
      // Normalmente o R-Roms tem a estrutura <td>Nome do Jogo</td> <td><a href="Link do Archive"></a></td>
      const columns = $(row).find('td');
      
      if (columns.length > 0) {
        // Assume-se que o titulo na primeira coluna, ou o texto envolto nela
        const titleText = $(columns[0]).text().trim();
        
        if (titleText.toLowerCase().includes(termoLower)) {
          // Acha a tag <a> que contem o link de download direto do Archive.org
          const downloadAnchor = $(row).find('a[href*="archive.org/download/"], a[href*="myrient.erista.me/"]');
          
          if (downloadAnchor.length > 0) {
            let archiveLink = downloadAnchor.attr('href');
            
            // Garantir que termina em extensão pra facilitar o Arcade Modal
            // No caso do R-Roms, as vezes acaba num arquivo .zip, as vezes em .chd
            results.push({
              title: titleText,
              url: archiveLink,
              platform: 'R-Roms Megathread (PSP)',
              type: 'direct',
              imageUrl: null
            });
          }
        }
      }
    });

    return results;
  } catch (error) {
    console.error('[R-Roms Scraper] Falha ao extrair do Megathread:', error.message);
    return [];
  }
}

module.exports = {
  searchRRoms
};
