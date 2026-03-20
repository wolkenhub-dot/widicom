const axios = require('axios');

async function searchGameBanana(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // GameBanana V11 Search Util API Request
    const url = `https://gamebanana.com/apiv11/Util/Search/Results?_sModelName=Mod&_sSearchString=${encodeURIComponent(query)}&_nPage=${page}`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 9000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.data && response.data._aRecords) {
      return response.data._aRecords.map(item => ({
        title: `${item._sName} - ${item._aCategory?._sName || 'Mod'}`,
        url: item._sProfileUrl,
        platform: 'GameBanana',
        type: 'direct'
      }));
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('[gameBananaService] Erro ao buscar no GameBanana:', error.message);
  }

  return [];
}

module.exports = { searchGameBanana };
