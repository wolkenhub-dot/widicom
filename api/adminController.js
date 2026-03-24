/**
 * adminController.js
 *
 * Controlador do painel admin oculto.
 * Fornece dados de estatísticas, histórico de buscas e métricas do sistema.
 * Protegido por token Bearer simples.
 */

const statsService = require('./statsService');
const geoService = require('./geoService');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'widicom2026';

// Active SSE clients for /admin/stream
const sseClients = new Set();

function checkAuth(request, reply) {
  const authHeader = request.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token !== ADMIN_TOKEN) {
    reply.status(401).send({ error: 'Não autorizado.' });
    return false;
  }
  return true;
}

/**
 * GET /admin/stats
 * Returns full stats snapshot.
 */
async function getAdminStats(request, reply) {
  if (!checkAuth(request, reply)) return;

  try {
    const stats = statsService.getStats();
    const metrics = statsService.getSystemMetrics();
    const topQueries = statsService.getTopQueries(10);
    const searchesByHour = statsService.getSearchesByHour();
    const activeVisitors = geoService.getActiveVisitors();

    return reply.send({
      success: true,
      data: {
        totalSearches: stats.totalSearches || 0,
        searchHistory: (stats.searchHistory || []).slice(0, 200),
        topQueries,
        searchesByHour,
        metrics,
        activeClients: sseClients.size,
        activeVisitors,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (e) {
    return reply.status(500).send({ success: false, error: e.message });
  }
}

/**
 * GET /admin/stream
 * Server-Sent Events — pushes live updates every 2 seconds.
 */
async function adminStream(request, reply) {
  if (!checkAuth(request, reply)) return;

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no',
  });

  const sendUpdate = () => {
    try {
      const metrics = statsService.getSystemMetrics();
      const stats = statsService.getStats();
      const lastSearch = (stats.searchHistory || [])[0] || null;
      const searchesByHour = statsService.getSearchesByHour();
      const topQueries = statsService.getTopQueries(10);
      const activeVisitors = geoService.getActiveVisitors();

      const payload = JSON.stringify({
        metrics,
        totalSearches: stats.totalSearches || 0,
        lastSearch,
        searchesByHour,
        topQueries,
        activeVisitors,
        activeClients: sseClients.size,
        serverTime: new Date().toISOString(),
      });

      reply.raw.write(`event: update\ndata: ${payload}\n\n`);
    } catch (e) {
      // client may have disconnected
    }
  };

  // Register client
  sseClients.add(reply.raw);
  sendUpdate();
  const interval = setInterval(sendUpdate, 2000);

  request.raw.on('close', () => {
    sseClients.delete(reply.raw);
    clearInterval(interval);
  });
}

module.exports = { getAdminStats, adminStream };
