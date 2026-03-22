/**
 * autocompleteController.js
 * 
 * Proxies autocomplete queries to DuckDuckGo to bypass CORS restrictions
 * and provide rich prediction data for the Widicom terminal.
 */

const axios = require('axios');

async function getSuggestions(request, reply) {
  const { q } = request.query;

  if (!q) {
    return reply.send({ data: [] });
  }

  try {
    const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 3000
    });

    if (Array.isArray(response.data)) {
      // DuckDuckGo returns an array of objects: [{ phrase: "mario bros" }, ...]
      const suggestions = response.data.map(item => item.phrase);
      return reply.send({ data: suggestions });
    }

    return reply.send({ data: [] });
  } catch (error) {
    console.error('[Autocomplete Error] DuckDuckGo fetch failed:', error.message);
    return reply.status(500).send({ error: 'Falha ao obter sugestões.', data: [] });
  }
}

module.exports = { getSuggestions };
