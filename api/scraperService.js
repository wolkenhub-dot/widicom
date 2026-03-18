/**
 * scraperService.js
 * 
 * Este módulo utiliza a API oficial do Internet Archive (Archive.org)
 * para realizar buscas resilientes e assíncronas de arquivos e mídias perdidas,
 * já que scrapers genéricos (Google/DDG) bloqueiam requisições de servidores.
 */

const axios = require('axios');

/**
 * Realiza a busca utilizando a API do Internet Archive.
 * 
 * @param {string[]} dorks Lista de queries (apenas a query em si é repassada).
 * @returns {Promise<Object[]>} Uma promessa com a lista de resultados.
 */
async function searchDorks(dorks) {
  // Utilizamos a primeira query formatada que não contenha os operadores "site:" ou isolamos a palavra chave
  let baseQuery = "arquivos perdidos";
  if (dorks.length > 0) {
     // Isola o termo principal removendo o bloco de sites (site:xxx OR site:yyy)
     // Dork Ex: "Mario (site:drive... OR site:mega...) (ext:iso OR ext:rom...)"
     const dork = dorks[0];
     baseQuery = dork.replace(/\(site:[^)]+\)/g, '').replace(/"/g, '').replace(/\s+/g, ' ').trim();
  }

  // Remove o operador "ext:" pois o Internet Archive não processa sintaxe nativa do Google.
  // Transforma em texto plano ex: "bob esponja (iso OR rom OR zip)"
  baseQuery = baseQuery.replace(/ext:/g, '');

  const results = [];
  try {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(baseQuery)}&output=json&rows=15`;
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data && response.data.response && response.data.response.docs) {
      const items = response.data.response.docs;
      
      for (const item of items) {
        if (item.title && item.identifier) {
           results.push({
             title: item.title,
             url: `https://archive.org/details/${item.identifier}`,
             platform: 'Internet Archive'
           });
        }
      }
    }
  } catch (error) {
    console.error('Erro na busca do Internet Archive:', error.message);
  }

  return results;
}

/**
 * Funções exportadas.
 */
module.exports = {
  searchDorks
};
