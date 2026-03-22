const fs = require('fs');
const path = require('path');

const statsFilePath = path.join(__dirname, 'stats.json');

// Garante que o arquivo exista
if (!fs.existsSync(statsFilePath)) {
    fs.writeFileSync(statsFilePath, JSON.stringify({ totalSearches: 0 }, null, 2));
}

function getStats() {
    try {
        const data = fs.readFileSync(statsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { totalSearches: 0 };
    }
}

function incrementSearchCount() {
    try {
        const stats = getStats();
        stats.totalSearches = (stats.totalSearches || 0) + 1;
        fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("Erro ao incrementar estatística de busca:", e.message);
    }
}

module.exports = {
    getStats,
    incrementSearchCount
};
