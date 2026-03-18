/**
 * searxngService.js
 * 
 * Módulo isolado para buscar arquivos no Google Drive, Mega e MediaFire
 * através de instâncias públicas do SearxNG.
 * Possui um limite de tempo global restrito (10s) e degradação suave 
 * (retorna [] em falhas para não travar a aplicação principal).
 */

const axios = require('axios');

// Instâncias públicas para rotação
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://searx.work',
  'https://searx.space',
  'https://searx.tiekoetter.com'
];

/**
 * Identifica a plataforma com base na URL fornecida.
 */
function identifyPlatform(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('drive.google.com')) return 'Google Drive';
  if (urlLower.includes('mega.nz')) return 'Mega.nz';
  if (urlLower.includes('mediafire.com')) return 'MediaFire';
  if (urlLower.includes('dropbox.com')) return 'Dropbox';
  return 'Outra';
}

/**
 * Realiza a busca no SearxNG com tolerância a falhas e timeout global.
 * 
 * @param {string} query O termo de busca original do usuário.
 * @returns {Promise<Object[]>} Arrays de resultados ou vazio em caso de erro.
 */
async function searchSearxNG(query) {
  // Configura o AbortController nativo com timeout de 10 segundos global
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); 

  const hasTags = query.includes('(');
  const cleanQuery = query.replace(/ext:/g, '');
  const baseOnly = query.split('(')[0].trim();
  
  // Apenas englobamos com aspas se for uma string simples para ser precisa. Se houver tags (OR/AND), evitamos corromper a regex nativa dos buscadores.
  const searxQuery = hasTags
    ? `${cleanQuery} (site:drive.google.com OR site:mega.nz OR site:mediafire.com)`
    : `"${query}" (site:drive.google.com OR site:mega.nz OR site:mediafire.com)`;

  for (const instance of SEARXNG_INSTANCES) {
    if (controller.signal.aborted) {
       console.log('[searxngService] Timeout global de 10s atingido. Abortando instâncias restantes.');
       break;
    }

    try {
      const response = await axios.get(`${instance}/search`, {
        params: {
          q: searxQuery,
          format: 'json',
          language: 'pt-BR'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: controller.signal // O Axios usará o singal nativo do Node.js
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        clearTimeout(timeoutId);
        
        return response.data.results.map(item => ({
          title: item.title,
          url: item.url,
          platform: identifyPlatform(item.url)
        }));
      }
    } catch (error) {
      if (axios.isCancel(error) || error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.log('[searxngService] Serviço SearxNG abortado compulsoriamente devido ao limite de tempo.');
        break; 
      }
      console.error(`[searxngService] Falha de comunicação na instância ${instance} (${error.message}). Rodando fallback...`);
    }
  }

  // Fallback Definitivo caso o SearxNG rejeite via Bloqueio de IP: Reddit JSON (Geralmente indexa muitos arquivos Google Drive)
  if (!controller.signal.aborted) {
    console.log('[searxngService] Todas instâncias SearxNG caíram ou bloquearam (IP Ban). Acionando Reddit Fallback...');
    try {
      // Para o Reddit, querys booleanas longas falham as buscas. Mandamos apenas a palavra chave principal protegida.
      const redditQ = hasTags
        ? `"${baseOnly}" ("drive.google.com" OR "mega.nz" OR "mediafire.com")`
        : `"${query}" ("drive.google.com" OR "mega.nz" OR "mediafire.com")`;
        
      const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(redditQ)}&sort=relevance&limit=15`;
      const res = await axios.get(redditUrl, { 
        headers: { 'User-Agent': 'LostMediaBot/1.0' },
        signal: controller.signal
      });
      
      const results = [];
      const urlRegex = /(https?:\/\/(?:drive\.google\.com|mega\.nz|mediafire\.com)[^\s"'\)\]]+)/gi;
      
      res.data.data.children.forEach(post => {
        const text = post.data.selftext || "";
        let match;
        while ((match = urlRegex.exec(text)) !== null) {
           let cleanUrl = match[1].replace(/\\_/g, '_').replace(/\\/g, '');
           results.push({ title: post.data.title, url: cleanUrl, platform: identifyPlatform(cleanUrl) });
        }
        if (post.data.url && post.data.url.match(/(drive\.google|mega\.nz|mediafire)/i)) {
           let cleanUrl = post.data.url.replace(/\\_/g, '_').replace(/\\/g, '');
           results.push({ title: post.data.title, url: cleanUrl, platform: identifyPlatform(cleanUrl) });
        }
      });
      
      if (results.length > 0) {
         clearTimeout(timeoutId);
         return results;
      }
    } catch (e) {
      console.log("[searxngService] Reddit fallback falhou:", e.message);
    }
  }

  // Graceful degradation: Retorna vetor vazio se tudo falhar ou timeout estourar
  clearTimeout(timeoutId);
  return []; 
}

module.exports = {
  searchSearxNG
};
