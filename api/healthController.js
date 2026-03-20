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
    { name: 'Nyaa RSS (Anime Torrent)', platform: 'Nyaa.si', fn: () => nyaaService.searchNyaa(query, 1) }
  ];

  try {
    const rawResults = await Promise.allSettled(sources.map(async (s) => {
        const startTime = Date.now();
        const res = await s.fn();
        const timeTook = Date.now() - startTime;
        
        let state = 'Offline';
        if (res && res.length > 0) state = 'Online';
        else if (res && res.length === 0) state = 'Vazio/Bloqueado';

        return {
            name: s.name,
            platform: s.platform,
            timeMs: timeTook,
            status: state,
            count: res ? res.length : 0
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
