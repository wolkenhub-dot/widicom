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
  // Custom VPS instance (user-provided)
  'http://137.131.205.231:8080',
  // Public instances (fallback)
  'https://searx.be',
  'https://paulgo.io',
  'https://searx.fmac.network',
  'https://search.mdosch.de',
  'https://search.ononoki.org',
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
  if (urlLower.includes('github.com')) return 'GitHub';
  if (urlLower.includes('gitlab.com')) return 'GitLab';
  if (urlLower.includes('sourceforge.net')) return 'SourceForge';
  if (urlLower.includes('4shared.com')) return '4Shared';
  return 'Outra';
}

/**
 * Realiza a busca no SearxNG com tolerância a falhas e timeout global.
 * 
 * @param {string} query O termo de busca original do usuário.
 * @param {number} page Número da página a ser pesquisada.
 * @returns {Promise<Object[]>} Arrays de resultados ou vazio em caso de erro.
 */
async function searchSearxNG(query, page = 1) {
  // Configura o AbortController nativo com timeout de 10 segundos global
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const hasTags = query.includes('(');
  const cleanQuery = query.replace(/ext:/g, '');
  const baseOnly = query.split('(')[0].trim();

  // Apenas englobamos com aspas se for uma string simples para ser precisa. Se houver tags (OR/AND), evitamos corromper a regex nativa dos buscadores.
  const expandedSites = "site:drive.google.com OR site:mega.nz OR site:mediafire.com OR site:dropbox.com OR site:github.com OR site:gitlab.com OR site:sourceforge.net OR site:4shared.com";
  const searxQuery = hasTags
    ? `${cleanQuery} (${expandedSites})`
    : `"${query}" (${expandedSites})`;

  for (const instance of SEARXNG_INSTANCES) {
    if (controller.signal.aborted) {
      console.log('[searxngService] Timeout global de 10s atingido. Abortando instâncias restantes.');
      break;
    }

    try {
      const response = await axios.get(`${instance}/search`, {
        params: {
          q: searxQuery,
          pageno: page,
          format: 'json',
          language: 'pt-BR'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 3500, // Timeout por instância de 3.5s para não comer o AbortController global
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
      if (controller.signal.aborted) {
        console.log('[searxngService] Timeout global estourou durante a requisição. Abortando loop.');
        break; 
      }
      console.error(`[searxngService] Falha de comunicação na instância ${instance} (${error.message}). Rodando próxima...`);
    }
  }

  // Fallback Definitivo caso o SearxNG rejeite via Bloqueio de IP: Reddit JSON (Geralmente indexa muitos arquivos Google Drive)
  if (!controller.signal.aborted) {
    if (page === 1) {
      console.log('[searxngService] Todas instâncias SearxNG caíram ou bloquearam (IP Ban). Acionando Reddit Fallback...');
      try {
        // Para o Reddit, querys booleanas longas falham as buscas. Mandamos apenas a palavra chave principal protegida.
        const redditSites = '"drive.google.com" OR "mega.nz" OR "mediafire.com" OR "dropbox.com" OR "github.com" OR "gitlab.com" OR "sourceforge.net" OR "4shared.com"';
        const redditQ = hasTags
          ? `"${baseOnly}" (${redditSites})`
          : `"${query}" (${redditSites})`;

        const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(redditQ)}&sort=relevance&limit=15`;
        const res = await axios.get(redditUrl, {
          headers: { 'User-Agent': 'LostMediaBot/1.0' },
          signal: controller.signal
        });

        const results = [];
        const urlRegex = /(https?:\/\/(?:drive\.google\.com|mega\.nz|mediafire\.com|dropbox\.com|github\.com|gitlab\.com|sourceforge\.net|4shared\.com)[^\s"'\)\]]+)/gi;

        res.data.data.children.forEach(post => {
          const text = post.data.selftext || "";
          let match;
          while ((match = urlRegex.exec(text)) !== null) {
            let cleanUrl = match[1].replace(/\\_/g, '_').replace(/\\/g, '');
            results.push({ title: post.data.title, url: cleanUrl, platform: identifyPlatform(cleanUrl) });
          }
          if (post.data.url && post.data.url.match(/(drive\.google|mega\.nz|mediafire|dropbox|github|gitlab|sourceforge|4shared)/i)) {
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
    } else {
      console.log("[searxngService] Página > 1 requisitada e instâncias SearxNG falharam. Fallback do Reddit ignorado por limitação de cursor.");
    }
  }

  // Graceful degradation: Retorna vetor vazio se tudo falhar ou timeout estourar
  clearTimeout(timeoutId);
  return [];
}

module.exports = {
  searchSearxNG
};
