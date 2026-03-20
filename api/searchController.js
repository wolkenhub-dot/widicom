/**
 * searchController.js
 * 
 * Este módulo é responsável por orquestrar a lógica de busca, chamando os serviços necessários.
 */

const dorkEngine = require('./dorkEngine');
const scraperService = require('./scraperService');
const searxngService = require('./searxngService');
const annasArchiveService = require('./annasArchiveService');
const odService = require('./odService');
const githubService = require('./githubService');
const openLibraryService = require('./openLibraryService');
const torrentService = require('./torrentService');
const linkResolver = require('./linkResolver');
const linkChecker = require('./linkChecker');
const relevanceEngine = require('./relevanceEngine');

/**
 * Lógica principal da rota de busca.
 * 
 * @param {Object} request O objeto de requisição do Fastify.
 * @param {Object} reply O objeto de resposta do Fastify.
 */
async function search(request, reply) {
  const { query } = request.query;
  let page = parseInt(request.query.page, 10);

  // Validação segura da página solicitada
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }

  if (!query) {
    return reply.status(400).send({ error: 'O parâmetro "query" é obrigatório.' });
  }

  try {
    // 1. Gera as dorks com base no termo de busca (para o Archive)
    const dorks = dorkEngine.generateDorks(query);

    // 2. Executa a metabusca de todos os módulos de forma paralela repassando a página
    const [archiveResults, searxngResults, annasResults, odResults, githubResults, openLibraryResults, torrentResults] = await Promise.all([
      scraperService.searchDorks(dorks, page),  
      searxngService.searchSearxNG(query, page),
      annasArchiveService.searchAnnasArchive(query, page),
      odService.searchODs(query, page),
      githubService.searchGitHub(query, page),
      openLibraryService.searchOpenLibrary(query, page),
      torrentService.searchTorrents(query, page)
    ]);
    
    // Mescla os resultados 
    const searchResults = [...searxngResults, ...archiveResults, ...annasResults, ...odResults, ...githubResults, ...openLibraryResults, ...torrentResults];

    // 3. Resolve os links de download direto para cada resultado
    const resolvedResults = searchResults.map(result => {
      const directLink = linkResolver.resolveDirectLink(result.url, result.platform);
      return {
        titulo: result.title,
        plataforma: result.platform,
        url_original: result.url,
        url_download_direto: directLink
      };
    });

    // 4. Verifica o status de cada link de download direto
    const finalResults = await linkChecker.checkLinks(resolvedResults);

    // 5. Ordena os resultados com base na relevância e ocorrência das palavras chave no título
    const sortedResults = relevanceEngine.sortResultsByRelevance(finalResults, query);

    // 6. Retorna os resultados finais em formato JSON com metadados de paginação
    return reply.send({
      query,
      pagina_atual: page,
      total_resultados_nesta_pagina: sortedResults.length,
      resultados: sortedResults
    });
  } catch (error) {
    console.error('Erro durante a busca:', error.message);
    return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar a busca.' });
  }
}

module.exports = {
  search
};
