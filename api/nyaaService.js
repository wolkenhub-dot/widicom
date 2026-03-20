const axios = require('axios');
const cheerio = require('cheerio');

async function searchNyaa(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&p=${page}`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 9000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const $ = cheerio.load(response.data, { xmlMode: true });
    const results = [];

    $('item').each((i, el) => {
      const title = $(el).find('title').text();
      // O link no RSS é direto para o arquivo .torrent
      // Alguns itens podem conter tags nyaa:infoHash, mas linkamos o torrent HTTP ou View original
      const viewLink = $(el).find('guid').text() || $(el).find('link').text();
      const seeders = $(el).find('nyaa\\:seeders').text() || '0';
      const size = $(el).find('nyaa\\:size').text() || 'N/A';

      if (title && viewLink) {
        results.push({
          title: `[${size} | Seeds: ${seeders}] ${title}`,
          // Passamos a GUID (página do torrent) ou o Magnet/Torrent link
          url: viewLink, 
          platform: 'Nyaa.si',
          type: 'torrent'
        });
      }
    });

    return results;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('[nyaaService] Erro ao buscar no Nyaa.si:', error.message);
    return [];
  }
}

module.exports = { searchNyaa };
