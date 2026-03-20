/**
 * relevanceEngine.js
 * 
 * Este módulo processa e classifica os resultados da busca com base na
 * relevância das palavras-chave em relação ao título do arquivo.
 */

/**
 * Limpa e padroniza a string de busca para análise.
 * @param {string} str O texto a ser limpo.
 * @returns {string} O texto em caixa baixa e sem caracteres especiais desnecessários.
 */
function sanitize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^\w\s\u00C0-\u00FF-]/gi, '').trim();
}

/**
 * Filtra e ordena a array de resultados calculando o score de relevância.
 * 
 * Critérios:
 * - Titulo contém a query exata (Muito Alta Relevância)
 * - Titulo contém múltiplas palavras da query (Alta Relevância)
 * - Título contém pelo menos uma palavra da query (Relevância Média)
 * - URL contém as palavras da query (Baixa Relevância)
 * 
 * @param {Object[]} results Resultados da busca unificada.
 * @param {string} query O termo procurado originalmente.
 * @returns {Object[]} A mesma lista, mas ordenada.
 */
function sortResultsByRelevance(results, query) {
  if (!query || results.length === 0) return results;

  const baseQuery = query.split('(')[0].trim(); // Se houver tags booleanas, pega só o nome do arquivo
  const cleanQuery = sanitize(baseQuery);
  const keywords = cleanQuery.split(/\s+/).filter(kw => kw.length > 2); // Palavras chaves com mais de 2 letras
  
  // Se não sobrar keywords longas, usa a sanitizada por completo para match simplório
  if (keywords.length === 0) {
    if (cleanQuery.length > 0) keywords.push(cleanQuery);
    else return results;
  }

  // Atribui o score para cada item
  const scoredResults = results.map(item => {
    let score = 0;
    const cleanTitle = sanitize(item.titulo);
    const cleanUrl = sanitize(item.url_original); // Pode ter o slug amigavel do arquivo

    // 1. O Título tem o termo 100% exato? (Ex: "Bob Esponja O Filme" == "Bob Esponja O Filme")
    if (cleanTitle === cleanQuery) {
       score += 1000;
    } 
    // 2. O Título contem a frase inteira junta?
    else if (cleanTitle.includes(cleanQuery)) {
       score += 500;
       // Bônus se a query exata aparece logo no inicio do título
       if (cleanTitle.startsWith(cleanQuery)) {
          score += 200;
       }
    }

    // 3. Score para Palavras Individuais (Se "Bob Esponja" foi buscado, testar "Bob" e "Esponja")
    let wordsMatched = 0;
    for (const kw of keywords) {
       if (cleanTitle.includes(kw)) {
          wordsMatched++;
          score += 50; // Achou no título = +50
       } else if (cleanUrl.includes(kw)) {
          score += 10; // Achou apenas no link (As vezes o título no site é ruim mas o link do drive tem o nome do arquivo)
       }
    }
    
    // Se o titulo bater com todas as palavras chaves separadas (ex: Bob Filme Esponja), ganha bônus de coesão
    if (wordsMatched === keywords.length && wordsMatched > 1) {
       score += 150; 
    }

    return { ...item, score };
  });

  // Ordena descendente pelo maior Score
  return scoredResults.sort((a, b) => b.score - a.score);
}

module.exports = {
  sortResultsByRelevance
};
