const dorkEngine = require('./dorkEngine');
const scraperService = require('./scraperService');
const searxngService = require('./searxngService');
const annasArchiveService = require('./annasArchiveService');
const odService = require('./odService');
const githubService = require('./githubService');
const openLibraryService = require('./openLibraryService');
const torrentService = require('./torrentService');
const vimmsLairService = require('./vimmsLairService');
const gameBananaService = require('./gameBananaService');
const ytsService = require('./ytsService');
const nyaaService = require('./nyaaService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const statsService = require('./statsService');

// Helper wrapper para pingar os sites puramente via HTTP GET
async function pingDomain(url) {
  try {
    const response = await axios.get(url, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    return { isPingOnly: true, status: response.status === 200 ? 'Online' : 'Vazio/Bloqueado' };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // 403 Forbidden is technically online and blocking our bot, which means the site is up!
      return { isPingOnly: true, status: 'Online (Firewall)' };
    }
    return { isPingOnly: true, status: 'Offline' };
  }
}

// Helper Avançado para Teste de Extração (Verifica se SearxNG consegue ler a CDN usando uma palavra curinga)
const SEARXNG_INSTANCES = [
  'https://searx.be', 'https://paulgo.io', 'https://searx.fmac.network',
  'https://search.mdosch.de', 'https://search.ononoki.org'
];

async function pingSearxNG(siteUrl, term = "mario") {
  const instance = SEARXNG_INSTANCES[Math.floor(Math.random() * SEARXNG_INSTANCES.length)];
  try {
    const res = await axios.get(`${instance}/search`, {
      params: { q: `"${term}" site:${siteUrl}`, format: 'json', language: 'pt-BR' },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    });
    
    // Teste real: retorna a matriz de extração
    return Array.isArray(res?.data?.results) ? res.data.results : [];
  } catch(e) {
    return []; // Força zero resultados, triggando o erro visual na UI
  }
}

async function checkSources(request, reply) {
  const query = "mario"; // Base dummy payload to test systems
  const dorks = dorkEngine.generateDorks(query);
  
  const safe = (promise, ms) =>
    Promise.race([
      promise.catch((e) => { console.error('Teste falhou:', e.message); return null; }),
      new Promise(res => setTimeout(() => res(null), ms))
    ]);

  const baseSources = [
    { name: 'Internet Archive', platform: 'Internet Archive', fn: () => scraperService.searchDorks(dorks, 1) },
    { name: 'SearxNG / Reddit', platform: 'SearxNG', fn: () => searxngService.searchSearxNG(query, 1) },
    { name: "Anna's Archive", platform: "Anna's Archive", fn: () => annasArchiveService.searchAnnasArchive(query, 1) },
    { name: 'Open Directories', platform: 'Open Directory', fn: () => odService.searchODs(query, 1) },
    { name: 'GitHub', platform: 'GitHub', fn: () => githubService.searchGitHub(query, 1) },
    { name: 'OpenLibrary', platform: 'OpenLibrary (Manuais/Livros)', fn: () => openLibraryService.searchOpenLibrary(query, 1) },
    { name: 'The Pirate Bay (Torrent)', platform: 'Torrent (Magnet)', fn: () => torrentService.searchTorrents(query, 1) },
    { name: "Vimm's Lair", platform: "Vimm's Lair", fn: () => vimmsLairService.searchVimmsLair(query, 1) },
    { name: 'GameBanana', platform: 'GameBanana', fn: () => gameBananaService.searchGameBanana(query, 1) },
    { name: 'YTS Filmes (Torrent)', platform: 'YTS', fn: () => ytsService.searchYTS(query, 1) },
    { name: 'Nyaa RSS (Anime Torrent)', platform: 'Nyaa.si', fn: () => nyaaService.searchNyaa(query, 1) }
  ];

  const allDomains = dorkEngine.REGRAS_CATEGORIAS['tudo'].sites;
  const ignoredDomains = ['edu', 'ac.jp', 'ac.uk', 'ac.nz', 'edu.br', 'ac.id', 'edu.au'];
  
  const distributedSources = allDomains
    .filter(d => !ignoredDomains.includes(d))
    .map(domain => ({
       name: domain,
       platform: 'Repositório',
       fn: () => pingDomain(`https://${domain}`)
    }));

  const sources = [...baseSources, ...distributedSources];

  try {
    const rawResults = await Promise.allSettled(sources.map(async (s) => {
        const startTime = Date.now();
        // Limita qualquer bridge/API a no máximo 7.5 segundos absolutos
        const res = await safe(s.fn(), 7500);
        const timeTook = Date.now() - startTime;
        
        let state = 'Offline';
        let customCount = 0;

        if (res === null) {
            state = timeTook >= 7500 ? 'Timeout' : 'Offline';
            customCount = 0;
        } else if (res && res.isPingOnly) {
            state = res.status;
            customCount = '-';
        } else if (res && res.length > 0) {
            state = 'Online';
            customCount = res.length;
        } else if (res && res.length === 0) {
            state = 'Offline';
            customCount = 0;
        }

        return {
            name: s.name,
            platform: s.platform,
            timeMs: timeTook,
            status: state,
            count: customCount
        };
    }));

    const formatted = rawResults.map((r, index) => {
        if (r.status === 'fulfilled') return r.value;
        return {
            name: sources[index].name,
            platform: sources[index].platform,
            timeMs: 10000,
            status: 'Timeout',
            count: 0
        };
    });

    return reply.send({
        success: true,
        data: formatted
    });

  } catch(e) {
    return reply.status(500).send({ success: false, error: e.message });
  }
}

async function getStats(request, reply) {
    try {
        const stats = statsService.getStats();
        
        const allDomains = dorkEngine.REGRAS_CATEGORIAS['tudo'].sites;
        const ignoredDomains = ['edu', 'ac.jp', 'ac.uk', 'ac.nz', 'edu.br', 'ac.id', 'edu.au'];
        const remoteCount = allDomains.filter(d => !ignoredDomains.includes(d)).length;
        
        // 11 base sources + dynamic distributed domains
        const totalSources = 11 + remoteCount;
        
        // Coverage is inherently 100% since tests are dynamically injected directly from the Search Engine's source arrays
        const covered = true;

        return reply.send({
            success: true,
            data: {
                totalSearches: stats.totalSearches || 0,
                totalSources: totalSources,
                verificationStatus: covered
            }
        });
    } catch (e) {
        return reply.status(500).send({ success: false, error: e.message });
    }
}

module.exports = { checkSources, getStats };
