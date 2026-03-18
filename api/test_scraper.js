const { searchDorks } = require('./scraperService');
const dorkEngine = require('./dorkEngine');

async function checkFix() {
  const query = "bob esponja (ext:iso OR ext:rom)";
  console.log("Input Query from UI:", query);

  const dorks = dorkEngine.generateDorks(query);
  console.log("Dork Engine Output (Top 1):", dorks[0]);

  // Simulando a extraçao do scraperService
  const dork = dorks[0];
  let baseQuery = dork.replace(/\(site:[^)]+\)/g, '').replace(/"/g, '').replace(/\s+/g, ' ').trim();
  baseQuery = baseQuery.replace(/ext:/g, '');
  
  console.log("Sanitized IA Base Query:", baseQuery);

  console.log("Executando IA Fetch...");
  const iaRes = await searchDorks(dorks);
  console.log("IA Results:", iaRes.length);
}

checkFix();
