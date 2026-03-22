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

// Helper wrapper para pingar os sites puramente via HTTP GET
async function pingDomain(url) {
  try {
    const response = await axios.get(url, { timeout: 8000 });
    return { isPingOnly: true, status: response.status === 200 ? 'Online' : 'Vazio/Bloqueado' };
  } catch (error) {
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
  
  const sources = [
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
    { name: 'Nyaa RSS (Anime Torrent)', platform: 'Nyaa.si', fn: () => nyaaService.searchNyaa(query, 1) },
    
    // Novos Repositórios Arquivistas (Extração SearxNG Direta)
    { name: 'CDRomance', platform: 'CDRomance', fn: () => pingSearxNG('cdromance.org') },
    { name: 'NoPayStation', platform: 'NoPayStation', fn: () => pingSearxNG('nopaystation.com', 'dlc') },
    { name: 'Retro-eXo', platform: 'Retro-eXo', fn: () => pingSearxNG('retro-exo.com', 'windows') },
    { name: 'Hidden Palace', platform: 'Hidden Palace', fn: () => pingSearxNG('hiddenpalace.org', 'prototype') },
    { name: 'The Cutting Room Floor', platform: 'TCRF', fn: () => pingSearxNG('tcrf.net', 'mario') },
    { name: 'Hugging Face', platform: 'Hugging Face Datasets', fn: () => pingSearxNG('huggingface.co/datasets', 'model') },
    { name: 'WinWorld', platform: 'WinWorld', fn: () => pingSearxNG('winworldpc.com', 'dos') },
    { name: 'Macintosh Garden', platform: 'Macintosh Garden', fn: () => pingSearxNG('macintoshgarden.org', 'mac') },
    
    // Novas Fontes P2 (Elite Sources - Extração SearxNG)
    { name: 'BetaArchive', platform: 'BetaArchive', fn: () => pingSearxNG('betaarchive.com', 'windows') },
    { name: 'Tokyo Toshokan', platform: 'Tokyo Toshokan', fn: () => pingSearxNG('tokyotoshokan.info', 'raw') },
    { name: 'OldGamesDownload', platform: 'OldGamesDownload', fn: () => pingSearxNG('oldgamesdownload.com', 'nfs') },
    { name: 'GOG-Games', platform: 'GOG-Games', fn: () => pingSearxNG('gog-games.to', 'cyberpunk') },
    { name: 'RuTracker', platform: 'RuTracker', fn: () => pingSearxNG('rutracker.org', 'adobe') },
    { name: 'ModDB', platform: 'ModDB', fn: () => pingSearxNG('moddb.com', 'mod') },
    { name: 'Ziperto', platform: 'Ziperto', fn: () => pingSearxNG('ziperto.com', '3ds') },
    { name: 'RomUlation', platform: 'RomUlation', fn: () => pingSearxNG('romulation.org', 'nintendo') },
    { name: 'APKMirror', platform: 'APKMirror', fn: () => pingSearxNG('apkmirror.com', 'whatsapp') },
    { name: 'Abandonia', platform: 'Abandonia', fn: () => pingSearxNG('abandonia.com', 'prince') }
  ];

  try {
    const rawResults = await Promise.allSettled(sources.map(async (s) => {
        const startTime = Date.now();
        const res = await s.fn();
        const timeTook = Date.now() - startTime;
        
        let state = 'Offline';
        let customCount = 0;

        if (res && res.isPingOnly) {
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

module.exports = { checkSources };
