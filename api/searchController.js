/**
 * searchController.js
 *
 * Orquestra a lógica de busca streaming (SSE) chamando serviços em paralelo.
 * Padrão: Busca de alta performance (4s) com resultados em tempo real.
 */

const dorkEngine        = require('./dorkEngine');
const rromsScraper      = require('./rromsScraper');
const scraperService    = require('./scraperService');
const searxngService    = require('./searxngService');
const annasArchiveService = require('./annasArchiveService');
const odService         = require('./odService');
const githubService     = require('./githubService');
const openLibraryService = require('./openLibraryService');
const torrentService    = require('./torrentService');
const vimmsLairService  = require('./vimmsLairService');
const gameBananaService = require('./gameBananaService');
const ytsService        = require('./ytsService');
const nyaaService       = require('./nyaaService');
const linkResolver      = require('./linkResolver');
const linkChecker       = require('./linkChecker');
const relevanceEngine   = require('./relevanceEngine');
const metadataService   = require('./metadataService');
const statsService      = require('./statsService');

// SSE Logic active

async function search(request, reply) {
  const { query, mode = 'quick' } = request.query;
  let page = parseInt(request.query.page, 10);

  if (Number.isNaN(page) || page < 1) page = 1;

  if (!query) {
    return reply.status(400).send({ error: 'O parâmetro "query" é obrigatório.' });
  }

  // Use raw response for absolute control over SSE and CORS
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable buffering for Nginx/Proxies
  });

  const sendEvent = (event, data) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const budget = mode === 'quick' ? 4000 : 58000;
  const startTime = Date.now();
  const seen = new Set();
  
  try {
    statsService.incrementSearchCount();
    
    const { termoPositivo, termosNegativos } = dorkEngine.parseQueryTerms(query);
    const positiveQuery = termoPositivo || query;
    const dorks = dorkEngine.generateDorks(query, 'tudo', mode);

    const safe = (promise, ms) =>
      Promise.race([
        promise.catch(() => []),
        new Promise(res => setTimeout(() => res([]), ms))
      ]);

    const processChunk = async (newResults) => {
      let chunk = newResults.filter(r => {
        if (!r || !r.url || seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });

      if (chunk.length === 0) return [];

      if (termosNegativos) {
        const negWords = termosNegativos.trim().split(/\s+/).map(w => w.replace('-', '').toLowerCase());
        chunk = chunk.filter(r => {
          const t = (r.title || '').toLowerCase();
          const u = (r.url || '').toLowerCase();
          return !negWords.some(n => t.includes(n) || u.includes(n));
        });
      }

      const normalResults   = chunk.filter(r => r.type !== 'torrent' && !(r.url && r.url.startsWith('magnet:')));
      const torrentResults2 = chunk.filter(r => r.type === 'torrent'  || (r.url && r.url.startsWith('magnet:')));

      const resolvedResults = normalResults.map(result => ({
        titulo:               result.title,
        plataforma:           result.platform,
        url_original:         result.url,
        url_download_direto:  linkResolver.resolveDirectLink(result.url, result.platform),
        type:                 result.type,
        imageUrl:             result.imageUrl
      }));

      let activeResults;
      if (mode === 'deep') {
        const elapsed = Date.now() - startTime;
        const remaining = budget - elapsed;
        if (remaining > 3000) {
          activeResults = await safe(linkChecker.checkLinks(resolvedResults), remaining);
          if (!Array.isArray(activeResults) || activeResults.length === 0) {
            activeResults = resolvedResults.map(r => ({ ...r, status: 'Ativo' }));
          }
        } else {
          activeResults = resolvedResults.map(r => ({ ...r, status: 'Ativo' }));
        }
      } else {
        activeResults = resolvedResults.map(r => ({ ...r, status: 'Ativo' }));
      }

      const formattedTorrents = torrentResults2.map(r => ({
        titulo:              r.title,
        url_original:        r.url,
        url_download_direto: r.url,
        plataforma:          r.platform,
        status:              'Ativo',
        type:                r.type,
        imageUrl:            r.imageUrl
      }));

      const finalMerged = [...activeResults, ...formattedTorrents];
      const sortedResults = relevanceEngine.sortResultsByRelevance(finalMerged, positiveQuery);

      let enrichedResults = sortedResults;
      if (mode === 'deep') {
        const elapsed = Date.now() - startTime;
        const remaining = budget - elapsed;
        if (remaining > 2000) {
          enrichedResults = await safe(metadataService.enrichWithMetadata(sortedResults), remaining);
          if (!Array.isArray(enrichedResults) || enrichedResults.length === 0) {
            enrichedResults = sortedResults;
          }
        }
      }

      return enrichedResults;
    };

    const runSource = async (name, promiseFactory) => {
      try {
        let results = [];
        if (mode === 'quick') {
          results = await safe(promiseFactory(page), budget);
        } else {
          const pagesToFetch = [page, page+1, page+2, page+3, page+4];
          const pagePromises = pagesToFetch.map(pg => promiseFactory(pg));
          const allPages = await safe(Promise.all(pagePromises), budget) || [];
          results = allPages.flat();
        }
        
        const processed = await processChunk(results);
        if (processed.length > 0) {
          sendEvent('results', { source: name, resultados: processed });
        }
      } catch (e) {
        console.error(`Erro fonte ${name}:`, e);
      }
    };

    const sources = [
      { name: 'rroms', fn: (pg) => rromsScraper.searchRRoms(positiveQuery) },
      { name: 'dorks', fn: (pg) => scraperService.searchDorks(dorks, pg) },
      { name: 'searxng', fn: (pg) => searxngService.searchSearxNG(positiveQuery, pg, mode) },
      { name: 'annas', fn: (pg) => annasArchiveService.searchAnnasArchive(positiveQuery, pg) },
      { name: 'opendir', fn: (pg) => odService.searchODs(positiveQuery, pg) },
      { name: 'github', fn: (pg) => githubService.searchGitHub(positiveQuery, pg) },
      { name: 'openlibrary', fn: (pg) => openLibraryService.searchOpenLibrary(positiveQuery, pg) },
      { name: 'torrents', fn: (pg) => torrentService.searchTorrents(positiveQuery, pg) },
      { name: 'vimms', fn: (pg) => vimmsLairService.searchVimmsLair(positiveQuery, pg) },
      { name: 'gamebanana', fn: (pg) => gameBananaService.searchGameBanana(positiveQuery, pg) },
      { name: 'yts', fn: (pg) => ytsService.searchYTS(positiveQuery, pg) },
      { name: 'nyaa', fn: (pg) => nyaaService.searchNyaa(positiveQuery, pg) }
    ];

    const runnerPromise = Promise.all(sources.map(s => runSource(s.name, s.fn)));
    const globalTimeout = new Promise(res => setTimeout(res, budget));
    
    await Promise.race([runnerPromise, globalTimeout]);
    
    sendEvent('end', { message: 'Busca concluída' });
    reply.raw.end();
  } catch (error) {
    console.error('Erro durante a busca:', error.stack || error);
    sendEvent('error', { error: String(error.message) });
    reply.raw.end();
  }
}


module.exports = { search };
