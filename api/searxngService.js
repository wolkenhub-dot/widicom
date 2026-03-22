/**
 * searxngService.js
 * 
 * Módulo isolado para buscar arquivos no Google Drive, Mega e MediaFire
 * através de instâncias públicas do SearxNG.
 * Possui um limite de tempo global restrito (10s) e degradação suave 
 * (retorna [] em falhas para não travar a aplicação principal).
 */

const axios = require('axios');
const dorkEngine = require('./dorkEngine');

// Instâncias públicas para rotação
const SEARXNG_INSTANCES = [
  // Custom VPS instance (user-provided)
  'http://137.131.205.231:8080',
  // Public instances (fallback)
  'https://searx.be',
  'https://paulgo.io',
  'https://searx.fmac.network',
  'https://search.mdosch.de',
  'https://search.ononoki.org',
  'https://searx.tiekoetter.com'
];

/**
 * Identifica a plataforma com base na URL fornecida.
 */
function identifyPlatform(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('drive.google.com')) return 'Google Drive';
  if (urlLower.includes('mega.nz')) return 'Mega.nz';
  if (urlLower.includes('mediafire.com')) return 'MediaFire';
  if (urlLower.includes('dropbox.com')) return 'Dropbox';
  if (urlLower.includes('github.com')) return 'GitHub';
  if (urlLower.includes('gitlab.com')) return 'GitLab';
  if (urlLower.includes('sourceforge.net')) return 'SourceForge';
  if (urlLower.includes('4shared.com')) return '4Shared';
  if (urlLower.includes('cdromance.org')) return 'CDRomance';
  if (urlLower.includes('retro-exo.com')) return 'Retro-eXo';
  if (urlLower.includes('hiddenpalace.org')) return 'Hidden Palace';
  if (urlLower.includes('nopaystation.com')) return 'NoPayStation';
  if (urlLower.includes('tcrf.net')) return 'TCRF';
  if (urlLower.includes('winworldpc.com')) return 'WinWorld';
  if (urlLower.includes('macintoshgarden.org')) return 'Macintosh Garden';
  if (urlLower.includes('betaarchive.com')) return 'BetaArchive';
  if (urlLower.includes('tokyotoshokan.info')) return 'Tokyo Toshokan';
  if (urlLower.includes('oldgamesdownload.com')) return 'OldGamesDownload';
  if (urlLower.includes('gog-games.to')) return 'GOG-Games';
  if (urlLower.includes('rutracker.org')) return 'RuTracker';
  if (urlLower.includes('moddb.com')) return 'ModDB';
  if (urlLower.includes('ziperto.com')) return 'Ziperto';
  if (urlLower.includes('romulation.org')) return 'RomUlation';
  if (urlLower.includes('apkmirror.com')) return 'APKMirror';
  if (urlLower.includes('abandonia.com')) return 'Abandonia';
  return 'Outra';
}

/**
 * Realiza a busca no SearxNG com tolerância a falhas e timeout global.
 * 
 * @param {string} query O termo de busca original do usuário.
 * @param {number} page Número da página a ser pesquisada.
 * @param {string} mode O modo de busca ('quick' ou 'deep').
 * @returns {Promise<Object[]>} Arrays de resultados ou vazio em caso de erro.
 */
async function searchSearxNG(query, page = 1, mode = "deep") {
  // Limites Dinâmicos: Quick = 8s (para fechar UI em 5s), Deep = 59.5s
  const isQuick = mode === 'quick';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), isQuick ? 8000 : 59500);

  // Pega todas as dezenas de frações formatadas
  const dorksSeguras = dorkEngine.generateDorks(query, 'tudo', mode);
  
  let allResults = [];
  let instanceIndex = 0;

  const chunkArray = (arr, size) => arr.length ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [];
  
  // Quick = Atira tudo de uma vez. Deep = Separa em lotes de 3.
  const rotinasDistribuidas = isQuick ? [dorksSeguras] : chunkArray(dorksSeguras, 3); 

  for (const lote of rotinasDistribuidas) {
    if (controller.signal.aborted) break;

    const promisesDoLote = lote.map(async (searxQuery) => {
      const instance = SEARXNG_INSTANCES[instanceIndex % SEARXNG_INSTANCES.length];
      instanceIndex++;

      try {
        const response = await axios.get(`${instance}/search`, {
          params: { q: searxQuery, pageno: page, format: 'json', language: 'pt-BR' },
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: isQuick ? 8000 : 55000,
          signal: controller.signal
        });

        const dataResults = response?.data?.results;
        if (Array.isArray(dataResults) && dataResults.length > 0) {
          return dataResults.map(item => ({
            title: item.title,
            url: item.url,
            platform: identifyPlatform(item.url)
          }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(`[searxngService] Bypass da instância ${instance} falhou para a Dork: ${searxQuery.substring(0, 30)}...`);
        }
      }
      return [];
    });

    const resolucoes = await Promise.allSettled(promisesDoLote);
    resolucoes.forEach(r => {
      if (r.status === 'fulfilled' && r.value.length > 0) {
        allResults = [...allResults, ...r.value];
      }
    });

    if (!isQuick) {
      // Pacing Tático só rola na busca profunda (Deep)
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  // Retorno Rápido
  if (allResults.length > 0) {
    clearTimeout(timeoutId);
    return allResults;
  }

  // Fallback Definitivo caso o SearxNG rejeite via Bloqueio de IP: Reddit JSON (Geralmente indexa muitos arquivos Google Drive)
  if (!controller.signal.aborted) {
    if (page === 1) {
      console.log('[searxngService] Todas instâncias SearxNG caíram ou bloquearam (IP Ban). Acionando Reddit Fallback...');
      try {
        // Para o Reddit, querys booleanas longas falham as buscas. Mandamos apenas a palavra chave principal protegida.
        const redditSites = '"drive.google.com" OR "mega.nz" OR "mediafire.com" OR "dropbox.com" OR "github.com" OR "gitlab.com" OR "sourceforge.net" OR "4shared.com"';
        const hasTags = query.includes('(');
        const baseOnly = query.split('(')[0].trim();
        const redditQ = hasTags
          ? `"${baseOnly}" (${redditSites})`
          : `"${query}" (${redditSites})`;

        const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(redditQ)}&sort=relevance&limit=15`;
        const res = await axios.get(redditUrl, {
          headers: { 'User-Agent': 'LostMediaBot/1.0' },
          signal: controller.signal
        });

        const results = [];
        const urlRegex = /(https?:\/\/(?:drive\.google\.com|mega\.nz|mediafire\.com|dropbox\.com|github\.com|gitlab\.com|sourceforge\.net|4shared\.com)[^\s"'\)\]]+)/gi;

        res.data.data.children.forEach(post => {
          const text = post.data.selftext || "";
          let match;
          while ((match = urlRegex.exec(text)) !== null) {
            let cleanUrl = match[1].replace(/\\_/g, '_').replace(/\\/g, '');
            results.push({ title: post.data.title, url: cleanUrl, platform: identifyPlatform(cleanUrl) });
          }
          if (post.data.url && post.data.url.match(/(drive\.google|mega\.nz|mediafire|dropbox|github|gitlab|sourceforge|4shared)/i)) {
            let cleanUrl = post.data.url.replace(/\\_/g, '_').replace(/\\/g, '');
            results.push({ title: post.data.title, url: cleanUrl, platform: identifyPlatform(cleanUrl) });
          }
        });

        if (results.length > 0) {
          clearTimeout(timeoutId);
          return results;
        }
      } catch (e) {
        console.log("[searxngService] Reddit fallback falhou:", e.message);
      }
    } else {
      console.log("[searxngService] Página > 1 requisitada e instâncias SearxNG falharam. Fallback do Reddit ignorado por limitação de cursor.");
    }
  }

  // Graceful degradation: Retorna vetor vazio se tudo falhar ou timeout estourar
  clearTimeout(timeoutId);
  return [];
}

module.exports = {
  searchSearxNG
};
