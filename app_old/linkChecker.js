/**
 * linkChecker.js
 * 
 * Este módulo é responsável por verificar a validade de um link de download direto.
 * Ele utiliza requisições HEAD para obter o status HTTP do link de forma rápida e eficiente.
 */

const axios = require('axios');

/**
 * Verifica se um link de download direto está ativo.
 * 
 * @param {string} url O link de download direto a ser verificado.
 * @returns {Promise<string>} O status do link ('Ativo', 'Inativo' ou 'Desconhecido').
 */
async function checkLinkStatus(url) {
  try {
    // Realiza uma requisição HEAD para verificar o status do link
    const response = await axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 3000 // Timeout de 3 segundos
    });

    // Verifica se o status HTTP está na faixa de sucesso (200-299)
    if (response.status >= 200 && response.status < 300) {
      return 'Ativo';
    } else {
      return 'Inativo';
    }
  } catch (error) {
    // Trata erros de requisição, como 404, 403, etc.
    if (error.response) {
      if (error.response.status === 404) {
        return 'Inativo';
      } else if (error.response.status === 403) {
        return 'Ativo'; // O link pode estar ativo, mas requer autenticação ou cookies
      }
    }
    
    // Para outros erros (timeout, rede, etc.), retornamos Desconhecido
    console.error(`Erro ao verificar link "${url}":`, error.message);
    return 'Desconhecido';
  }
}

/**
 * Verifica uma lista de resultados e atualiza o status de cada link.
 * 
 * @param {Object[]} results Uma lista de objetos de resultados.
 * @returns {Promise<Object[]>} Uma promessa que resolve para a lista de resultados atualizada.
 */
async function checkLinks(results) {
  const checkPromises = results.map(async (result) => {
    // Se não houver link de download direto, o status é Desconhecido
    if (!result.url_download_direto) {
      return { ...result, status: 'Desconhecido' };
    }

    const status = await checkLinkStatus(result.url_download_direto);
    return { ...result, status };
  });

  // Executa todas as verificações em paralelo
  const updatedResults = await Promise.all(checkPromises);
  
  // Opcional: Filtra resultados inativos se desejar
  // return updatedResults.filter(res => res.status !== 'Inativo');
  
  return updatedResults;
}

module.exports = {
  checkLinkStatus,
  checkLinks
};
