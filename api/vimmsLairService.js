const axios = require('axios');
const cheerio = require('cheerio');

async function searchVimmsLair(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Vimm's Lair não adota esquema de paginação via URL comum em /vault/?p=list
    // Passaremos a query direta
    const url = `https://vimm.net/vault/?p=list&q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 9000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const $ = cheerio.load(response.data);
    const results = [];

    // O Vimm's Lair possui tabelas com classe .System ou links diretos pro /vault/
    $('a[href^="/vault/"]').each((i, el) => {
      const href = $(el).attr('href');
      let title = $(el).text().trim();
      
      // Ignora links de navegação ou imagens vazias
      if (title && title.length > 2 && href && href.match(/\/vault\/\d+/)) {
        // Formata link absoluto
        results.push({
          title: title,
          url: `https://vimm.net${href}`,
          platform: "Vimm's Lair",
          type: 'direct'
        });
      }
    });

    // Remove duplicados pelo URL
    const uniqueResults = [];
    const seen = new Set();
    for (const r of results) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        uniqueResults.push(r);
      }
    }

    return uniqueResults;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('[vimmsLairService] Erro ao buscar no Vimm\'s Lair:', error.message);
    return [];
  }
}

module.exports = { searchVimmsLair };
