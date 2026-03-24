const fs = require('fs');
const path = require('path');
const os = require('os');

const statsFilePath = path.join(__dirname, 'stats.json');

// Default structure
const defaultStats = {
  totalSearches: 0,
  searchHistory: [],       // Last 200 searches
  topQueries: {},          // query -> count map
  searchesByHour: {},      // 'YYYY-MM-DD-HH' -> count
};

// Garante que o arquivo exista com estrutura correta
function loadStats() {
  try {
    if (!fs.existsSync(statsFilePath)) {
      fs.writeFileSync(statsFilePath, JSON.stringify(defaultStats, null, 2));
      return { ...defaultStats };
    }
    const data = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));
    // Migrate old format
    if (!data.searchHistory) data.searchHistory = [];
    if (!data.topQueries) data.topQueries = {};
    if (!data.searchesByHour) data.searchesByHour = {};
    return data;
  } catch (e) {
    return { ...defaultStats };
  }
}

function saveStats(stats) {
  try {
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error('Erro ao salvar stats:', e.message);
  }
}

function getStats() {
  return loadStats();
}

function incrementSearchCount() {
  const stats = loadStats();
  stats.totalSearches = (stats.totalSearches || 0) + 1;
  saveStats(stats);
}

/**
 * Record a full search event for admin analytics.
 * @param {{ query: string, mode: string, resultsCount: number, durationMs: number }} param0
 */
function recordSearch({ query, mode, resultsCount, durationMs }) {
  try {
    const stats = loadStats();

    // Increment total
    stats.totalSearches = (stats.totalSearches || 0) + 1;

    // Build history entry
    const entry = {
      query: query || '',
      mode: mode || 'quick',
      resultsCount: resultsCount || 0,
      durationMs: durationMs || 0,
      timestamp: new Date().toISOString(),
    };

    // Keep last 200 entries (most recent first)
    stats.searchHistory = [entry, ...(stats.searchHistory || [])].slice(0, 200);

    // Top queries map
    const qLower = (query || '').toLowerCase().trim();
    if (qLower) {
      stats.topQueries = stats.topQueries || {};
      stats.topQueries[qLower] = (stats.topQueries[qLower] || 0) + 1;
    }

    // Searches by hour bucket
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}`;
    stats.searchesByHour = stats.searchesByHour || {};
    stats.searchesByHour[hourKey] = (stats.searchesByHour[hourKey] || 0) + 1;

    // Prune hour buckets older than 7 days
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const key of Object.keys(stats.searchesByHour)) {
      const [y, m, d, h] = key.split('-').map(Number);
      const keyDate = new Date(y, m - 1, d, h).getTime();
      if (keyDate < cutoff) delete stats.searchesByHour[key];
    }

    saveStats(stats);
  } catch (e) {
    console.error('Erro ao registrar busca:', e.message);
  }
}

/**
 * Get real-time system metrics for admin dashboard.
 */
function getSystemMetrics() {
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpus = os.cpus();
  const uptime = process.uptime();
  
  return {
    uptime,
    memory: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      external: mem.external,
      systemTotal: totalMem,
      systemFree: freeMem,
      systemUsed: totalMem - freeMem,
    },
    cpu: {
      count: cpus.length,
      model: cpus[0]?.model || 'Unknown',
    },
    platform: os.platform(),
    hostname: os.hostname(),
    nodeVersion: process.version,
  };
}

/**
 * Get sorted top queries list.
 */
function getTopQueries(limit = 10) {
  const stats = loadStats();
  return Object.entries(stats.topQueries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

/**
 * Get searches per hour for the last 24 hours.
 */
function getSearchesByHour() {
  const stats = loadStats();
  const result = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}`;
    result.push({
      hour: `${String(d.getHours()).padStart(2,'0')}:00`,
      count: (stats.searchesByHour || {})[key] || 0,
    });
  }
  return result;
}

module.exports = {
  getStats,
  incrementSearchCount,
  recordSearch,
  getSystemMetrics,
  getTopQueries,
  getSearchesByHour,
};
