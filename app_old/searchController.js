/**
 * searchController.js
 * 
 * Este módulo é responsável por orquestrar a lógica de busca, chamando os serviços necessários.
 */

const dorkEngine = require('../services/dorkEngine');
const scraperService = require('../services/scraperService');
const linkResolver = require('../services/linkResolver');
const linkChecker = require('../services/linkChecker');

/**
 * Lógica principal da rota de busca.
 * 
 * @param {Object} request O objeto de requisição do Fastify.
 * @param {Object} reply O objeto de resposta do Fastify.
 */
async function search(request, reply) {
  const { query } = request.query;

  if (!query) {
    return reply.status(400).send({ error: 'O parâmetro "query" é obrigatório.' });
  }

  try {
    // 1. Gera as dorks com base no termo de busca
    const dorks = dorkEngine.generateDorks(query);

    // 2. Executa a metabusca assíncrona
    const searchResults = await scraperService.searchDorks(dorks);

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

    // 5. Retorna os resultados finais em formato JSON
    return reply.send({
      query,
      total_resultados: finalResults.length,
      resultados: finalResults
    });
  } catch (error) {
    console.error('Erro durante a busca:', error.message);
    return reply.status(500).send({ error: 'Ocorreu um erro interno ao processar a busca.' });
  }
}

module.exports = {
  search
};
