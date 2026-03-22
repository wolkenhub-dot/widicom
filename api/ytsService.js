const axios = require('axios');

const YTS_MIRRORS = [
  'https://yts.mx',
  'https://yts.lt',
  'https://yts.ag',
  'https://yts.am',
  'https://yts.rs'
];

let cachedMirror = null;
let lastCheckTime = 0;

async function getActiveYTSMirror() {
  // Retorna o cache se tiver menos de 30 minutos
  if (cachedMirror && (Date.now() - lastCheckTime < 1000 * 60 * 30)) {
    return cachedMirror;
  }

  // Promise.any faz uma "corrida", o primeiro mirror a dar STATUS 200 válido ganha
  const checkPromises = YTS_MIRRORS.map(mirror => 
    axios.get(`${mirror}/api/v2/list_movies.json?limit=1`, { timeout: 4500 })
      .then(res => {
        if (res.data && res.data.status === 'ok') return mirror;
        throw new Error('YTS API inválida');
      })
  );

  try {
    cachedMirror = await Promise.any(checkPromises);
    lastCheckTime = Date.now();
    console.log(`[ytsService] Novo mirror dinâmico YTS selecionado: ${cachedMirror}`);
    return cachedMirror;
  } catch (e) {
    console.error(`[ytsService] Todos os mirrors YTS falharam! Tentando fallback forçado.`);
    return YTS_MIRRORS[0];
  }
}

async function searchYTS(query, page = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const baseUrl = await getActiveYTSMirror();
    const url = `${baseUrl}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&page=${page}&limit=15`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 9000,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.data && response.data.data && response.data.data.movies) {
      return response.data.data.movies.map(movie => {
        // Tenta pegar o Magnet Link do torrent de maior qualidade (normalmente o ultimo no array)
        let magnetLink = movie.url; 
        if (movie.torrents && movie.torrents.length > 0) {
          const t = movie.torrents[0];
          magnetLink = `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(movie.title)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`;
        }

        return {
          title: `${movie.title} (${movie.year}) [${movie.rating}/10]`,
          url: magnetLink,
          platform: 'YTS',
          type: 'torrent',
          imageUrl: movie.large_cover_image
        };
      });
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('[ytsService] Erro ao buscar no YTS:', error.message);
  }

  return [];
}

module.exports = { searchYTS };
