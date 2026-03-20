const axios = require('axios');

/**
 * Serviço de Enriquecimento Visual Inteligente.
 * Consome APIs públicas robustas (Apple iTunes Open API, entre outras) para extrair 
 * Posters e Capas HQ silenciosamente em fallback.
 */
async function enrichWithMetadata(results) {
  // Limita o enriquecimento aos Top 30 para evitar flood na rede durante a resolução
  const resultsToEnrich = results.slice(0, 30);
  const remaining = results.slice(30);

  const enriched = await Promise.all(resultsToEnrich.map(async (r) => {
    // Preserva se a plataforma já o populou nativamente (como YTS, OpenLibrary)
    if (r.imageUrl) return r;

    try {
      const isTorrentOrMovie = r.type === 'torrent' || r.plataforma.toLowerCase().includes('yts') || r.plataforma.toLowerCase().includes('nyaa') || r.plataforma.toLowerCase().includes('torrent');
      const isGame = r.plataforma === "Vimm's Lair" || r.plataforma === 'GameBanana';

      // Limpa as tags de rippers Torrent (ex: [1080p] [YIFY]) para a busca semântica do metadado
      const cleanTitle = r.titulo.replace(/\[.*?\]|\(.*?\)|\b(1080p|720p|WEB|BluRay|x264|x265|MULTi|Dual)\b/gi, '').split('-')[0].trim();

      if (isTorrentOrMovie && cleanTitle.length > 2) {
        // Tenta achar filme via iTunes
        const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=movie&limit=1`, { timeout: 2500 });
        if (res.data.results && res.data.results.length > 0) {
          r.imageUrl = res.data.results[0].artworkUrl100.replace('100x100bb', '600x800bb');
          return r;
        }
        // Fallback pra Series
        const tvRes = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=tvSeason&limit=1`, { timeout: 2500 });
        if (tvRes.data.results && tvRes.data.results.length > 0) {
          r.imageUrl = tvRes.data.results[0].artworkUrl100.replace('100x100bb', '600x800bb');
        }
      } 
      else if (isGame && cleanTitle.length > 2) {
        // Encontra Box Arts de Software/Jogos
        const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=software&limit=1`, { timeout: 2500 });
        if (res.data.results && res.data.results.length > 0) {
          // Extrai o asset na maior resolução possível
          r.imageUrl = res.data.results[0].artworkUrl512.replace('512x512bb', '600x800bb');
        }
      }
    } catch (error) {
      // Degrada graciosamente e retorna o card sem background
    }
    
    return r;
  }));

  return [...enriched, ...remaining];
}

module.exports = { enrichWithMetadata };
