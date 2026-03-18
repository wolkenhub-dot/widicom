const { searchSearxNG } = require('./searxngService');

async function testGraceful() {
  console.log("=== Iniciando teste SearxNG (Timeout Limit: 10s) ===");
  const start = Date.now();
  
  try {
    const results = await searchSearxNG("bob esponja");
    const end = Date.now();
    const duration = (end - start) / 1000;
    
    console.log(`\nTempo total de execução: ${duration}s`);
    console.log(`Resultados recebidos: ${results.length}`);
    if (results.length > 0) {
      console.log(results.slice(0, 3));
    }
    
    if (duration <= 10.5) {
      console.log("-> SUCESSO: Limite global de 10s foi devidamente respeitado.");
    } else {
      console.warn("-> AVISO: A execução ultrapassou os 10s!");
    }
  } catch(e) {
    console.error("-> ERRO FATAL: O módulo repassou uma exceção em vez de falhar graciosamente!", e);
  }
}

testGraceful();
