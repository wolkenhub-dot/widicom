/**
 * proxyController.js
 * 
 * Secure proxy endpoint to bypass CORS restrictions when fetching
 * files (e.g., retro game ROMs) from third-party hosts. Streams the 
 * response as an arraybuffer block to the client's memory.
 */

const axios = require('axios');

async function proxyFile(request, reply) {
  const { url } = request.query;

  if (!url) {
    return reply.status(400).send({ error: 'Faltando o parâmetro URL.' });
  }

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Widicom/1.0',
        'Accept': '*/*, application/zip'
      },
      timeout: 30000 // 30 second timeout for downloading larger ROMs
    });

    // Forward the content type and headers to the client buffer
    reply.header('Content-Type', response.headers['content-type'] || 'application/zip');
    reply.header('Content-Length', response.headers['content-length']);
    reply.header('Content-Disposition', `attachment; filename="rom_proxy.zip"`);

    return reply.send(response.data);
  } catch (error) {
    console.error('[Proxy Error] Failed to fetch target URL:', error.message);
    return reply.status(502).send({ error: 'Não foi possível baixar o arquivo através do Proxy Widicom.' });
  }
}

module.exports = { proxyFile };
