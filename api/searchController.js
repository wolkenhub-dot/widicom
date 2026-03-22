/**
 * searchController.js
 *
 * Orquestra a lógica de busca chamando todos os serviços de forma paralela.
 * Modo quick: 4.5s máximo, sem link-check nem metadata enrichment.
 * Modo deep : 59s máximo, busca múltiplas páginas em paralelo, verifica links e enriquece metadata.
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

async function search(request, reply) {
  const { query, mode = 'quick' } = request.query;
  let page = parseInt(request.query.page, 10);

  if (Number.isNaN(page) || page < 1) page = 1;

  if (!query) {
    return reply.status(400).send({ error: 'O parâmetro "query" é obrigatório.' });
  }

  // Budget in ms. Leave 500ms for post-processing in quick mode.
  const budget = mode === 'quick' ? 4000 : 58000;
  const startTime = Date.now();

  try {
    statsService.incrementSearchCount();
    
    const { termoPositivo, termosNegativos } = dorkEngine.parseQueryTerms(query);
    const positiveQuery = termoPositivo || query;
    const dorks = dorkEngine.generateDorks(query, 'tudo', mode);

    // Wraps a promise so it never rejects and times out to [] if it takes too long
    const safe = (promise, ms) =>
      Promise.race([
        promise.catch(() => []),
        new Promise(res => setTimeout(() => res([]), ms))
      ]);

    // Fetch ONE page of results from all 12 sources in parallel
    const fetchPage = (pg, timeoutMs) => Promise.all([
      safe(rromsScraper.searchRRoms(positiveQuery),              timeoutMs),
      safe(scraperService.searchDorks(dorks, pg),                timeoutMs),
      safe(searxngService.searchSearxNG(positiveQuery, pg, mode), timeoutMs),
      safe(annasArchiveService.searchAnnasArchive(positiveQuery, pg), timeoutMs),
      safe(odService.searchODs(positiveQuery, pg),               timeoutMs),
      safe(githubService.searchGitHub(positiveQuery, pg),        timeoutMs),
      safe(openLibraryService.searchOpenLibrary(positiveQuery, pg), timeoutMs),
      safe(torrentService.searchTorrents(positiveQuery, pg),     timeoutMs),
      safe(vimmsLairService.searchVimmsLair(positiveQuery, pg),  timeoutMs),
      safe(gameBananaService.searchGameBanana(positiveQuery, pg), timeoutMs),
      safe(ytsService.searchYTS(positiveQuery, pg),              timeoutMs),
      safe(nyaaService.searchNyaa(positiveQuery, pg),            timeoutMs)
    ]);

    let combined; // will be array-of-11-arrays

    if (mode === 'quick') {
      // Quick: just one page, short timeout
      combined = await fetchPage(page, budget);
    } else {
      // Deep: fetch pages 1-5 ALL IN PARALLEL so everything runs concurrently
      const pagesToFetch = [page, page+1, page+2, page+3, page+4];
      const perPageTimeout = budget; // each page gets the full budget since they run in parallel
      const pagePromises = pagesToFetch.map(pg => fetchPage(pg, perPageTimeout));
      
      // Race the whole batch against the global budget
      const allPages = await Promise.race([
        Promise.all(pagePromises),
        new Promise(res => setTimeout(() => {
          // Return whatever pages resolved so far (Promise.all won't have resolved, so return partial)
          res(null);
        }, budget))
      ]) || await Promise.allSettled(pagePromises).then(results =>
        results.map(r => r.status === 'fulfilled' ? r.value : Array(12).fill([]))
      );

      // Merge: combine each source's results across all pages
      combined = Array(12).fill(null).map((_, sourceIdx) =>
        allPages.flatMap(pageResult => Array.isArray(pageResult) ? (pageResult[sourceIdx] || []) : [])
      );
    }

    // Destructure the 12 sources (order matches fetchPage)
    const [
      rromsResults, archiveResults, searxngResults, annasResults, odResults, githubResults,
      openLibraryResults, torrentResults, vimmsResults, gbResults, ytsResults, nyaaResults
    ] = combined;

    // Merge all sources
    let searchResults = [
      ...rromsResults, ...searxngResults, ...archiveResults, ...annasResults, ...odResults,
      ...githubResults, ...openLibraryResults, ...torrentResults,
      ...vimmsResults, ...gbResults, ...ytsResults, ...nyaaResults
    ];

    // Remove duplicates by URL
    const seen = new Set();
    searchResults = searchResults.filter(r => {
      if (!r || !r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    // Apply negative filters
    if (termosNegativos) {
      const negWords = termosNegativos.trim().split(/\s+/).map(w => w.replace('-', '').toLowerCase());
      searchResults = searchResults.filter(r => {
        const t = (r.title || '').toLowerCase();
        const u = (r.url || '').toLowerCase();
        return !negWords.some(n => t.includes(n) || u.includes(n));
      });
    }

    // Separate torrents/magnets (bypass link checker)
    const normalResults   = searchResults.filter(r => r.type !== 'torrent' && !(r.url && r.url.startsWith('magnet:')));
    const torrentResults2 = searchResults.filter(r => r.type === 'torrent'  || (r.url && r.url.startsWith('magnet:')));

    // Resolve direct links
    const resolvedResults = normalResults.map(result => ({
      titulo:               result.title,
      plataforma:           result.platform,
      url_original:         result.url,
      url_download_direto:  linkResolver.resolveDirectLink(result.url, result.platform),
      type:                 result.type,
      imageUrl:             result.imageUrl
    }));

    // Link check (only deep mode, and only if budget allows)
    let activeResults;
    if (mode === 'deep') {
      const elapsed = Date.now() - startTime;
      const remaining = budget - elapsed;
      if (remaining > 3000) {
        activeResults = await safe(linkChecker.checkLinks(resolvedResults), remaining);
        if (!Array.isArray(activeResults) || activeResults.length === 0) {
          activeResults = resolvedResults.map(r => ({ ...r, status: 'Desconhecido' }));
        }
      } else {
        activeResults = resolvedResults.map(r => ({ ...r, status: 'Desconhecido' }));
      }
    } else {
      activeResults = resolvedResults.map(r => ({ ...r, status: 'Desconhecido' }));
    }

    // Format torrents
    const formattedTorrents = torrentResults2.map(r => ({
      titulo:              r.title,
      url_original:        r.url,
      url_download_direto: r.url,
      plataforma:          r.platform,
      status:              'Ativo',
      type:                r.type,
      imageUrl:            r.imageUrl
    }));

    // Merge and sort
    const finalMerged   = [...activeResults, ...formattedTorrents];
    const sortedResults = relevanceEngine.sortResultsByRelevance(finalMerged, positiveQuery);

    // Metadata enrichment (only deep mode)
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

    // Paginate: quick shows 50 per page, deep returns ALL (front-end handles display)
    const pageSize = mode === 'quick' ? 50 : enrichedResults.length;
    const paginated = enrichedResults.slice(0, pageSize);

    return reply.send({
      query,
      mode,
      pagina_atual: page,
      total_resultados: enrichedResults.length,
      total_resultados_nesta_pagina: paginated.length,
      resultados: paginated
    });

  } catch (error) {
    console.error('Erro durante a busca:', error.stack || error);
    return reply.status(500).send({ error: String(error.stack || error) });
  }
}

module.exports = { search };
