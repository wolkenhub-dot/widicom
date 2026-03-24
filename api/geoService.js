/**
 * geoService.js
 *
 * Tracks active user sessions by IP address with geolocation.
 * Uses ip-api.com (free, no key required, up to 45 req/min).
 * Stores last seen active visitors in memory (last 30 minutes).
 */

const axios = require('axios');

// Map of ip -> { lat, lon, country, city, lastSeen, query }
const activeVisitors = new Map();

// Cleanup stale visitors (older than 30 minutes)
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [ip, data] of activeVisitors.entries()) {
    if (data.lastSeen < cutoff) activeVisitors.delete(ip);
  }
}, 60 * 1000);

// Cache geo lookups to avoid rate limiting (ip -> geo data)
const geoCache = new Map();

async function lookupIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    // Local / private IP — use a demo lat/lon (Brazil)
    return { lat: -15.7801, lon: -47.9292, country: 'Brasil', city: 'Brasília', countryCode: 'BR' };
  }

  if (geoCache.has(ip)) return geoCache.get(ip);

  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,lat,lon,country,city,countryCode`, {
      timeout: 3000,
    });
    if (res.data?.status === 'success') {
      const geo = {
        lat: res.data.lat,
        lon: res.data.lon,
        country: res.data.country,
        city: res.data.city,
        countryCode: res.data.countryCode,
      };
      geoCache.set(ip, geo);
      // Expire cache after 1 hour
      setTimeout(() => geoCache.delete(ip), 60 * 60 * 1000);
      return geo;
    }
  } catch (e) {
    // Silently fail
  }
  return null;
}

/**
 * Record a visitor (call on every search).
 * @param {string} ip - Client IP address
 * @param {string} query - Search query
 */
async function recordVisitor(ip, query) {
  try {
    const geo = await lookupIP(ip);
    if (!geo) return;

    activeVisitors.set(ip, {
      ...geo,
      lastSeen: Date.now(),
      query: query || '',
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Get list of currently active visitors (last 30 min).
 */
function getActiveVisitors() {
  const result = [];
  for (const [ip, data] of activeVisitors.entries()) {
    result.push({
      ip: ip.replace(/\.\d+$/, '.***'), // Partially mask IP for privacy
      lat: data.lat,
      lon: data.lon,
      country: data.country,
      city: data.city,
      countryCode: data.countryCode,
      lastSeen: data.lastSeen,
      query: data.query,
    });
  }
  // Sort by most recent
  return result.sort((a, b) => b.lastSeen - a.lastSeen);
}

module.exports = { recordVisitor, getActiveVisitors };
