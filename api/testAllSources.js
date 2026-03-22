const axios = require('axios');

// Usamos uma instância pública com bom histórico de tolerância a scripts de teste de Dorking
const SEARXNG_URL = 'https://searx.be/search'; 

const TEST_CASES = [
  // Nuvem e Genéricos
  { name: 'Google Drive', site: 'drive.google.com', query: 'filme dublado mp4', useIndex: false, ext: '(ext:mp4 OR ext:mkv)' },
  { name: 'Mega', site: 'mega.nz', query: 'curso', useIndex: false, ext: '(ext:rar OR ext:zip)' },
  { name: 'MediaFire', site: 'mediafire.com', query: 'gta san andreas pc', useIndex: false, ext: '(ext:rar OR ext:zip OR ext:7z)' },
  { name: 'Dropbox', site: 'dropbox.com', query: 'pdf', useIndex: false, ext: '(ext:pdf)' },
  { name: 'Yandex Disk', site: 'disk.yandex.com', query: 'windows 10', useIndex: false, ext: '(ext:iso)' },

  // Arquivistas
  { name: 'Internet Archive', site: 'archive.org', query: 'mario', useIndex: false, ext: '(ext:zip OR ext:iso)' },
  { name: 'Myrient', site: 'myrient.erista.me', query: 'zelda', useIndex: false, ext: '(ext:zip OR ext:7z)' },
  { name: 'The-Eye', site: 'the-eye.eu', query: 'linux', useIndex: false, ext: '(ext:iso)' },
  { name: 'EdgeEmu', site: 'edgeemu.net', query: 'pokemon', useIndex: false, ext: '(ext:zip OR ext:gba)' },

  // Novas CDNs Especializadas (Arquivismo e Protótipos)
  { name: 'CDRomance', site: 'cdromance.org', query: 'final fantasy', useIndex: false, ext: '' },
  { name: 'Retro-eXo', site: 'retro-exo.com', query: 'windows 95', useIndex: false, ext: '(ext:zip)' },
  { name: 'Hidden Palace', site: 'hiddenpalace.org', query: 'sonic beta', useIndex: false, ext: '' },
  { name: 'TCRF', site: 'tcrf.net', query: 'mario 64', useIndex: false, ext: '' },
  { name: 'Hugging Face Datasets', site: 'huggingface.co/datasets', query: 'model', useIndex: false, ext: '(ext:zip OR ext:7z OR ext:parquet)' },
  { name: 'NoPayStation', site: 'nopaystation.com', query: 'persona', useIndex: false, ext: '(ext:pkg)' },
  { name: 'WinWorld', site: 'winworldpc.com', query: 'ms-dos', useIndex: false, ext: '(ext:7z)' },
  { name: 'Macintosh Garden', site: 'macintoshgarden.org', query: 'warcraft', useIndex: false, ext: '(ext:sit OR ext:hqx)' },

  // Elite Alternativas (Onda 2)
  { name: 'BetaArchive', site: 'betaarchive.com', query: 'Windows Longhorn', useIndex: false, ext: '(ext:iso OR ext:rar)' },
  { name: 'Tokyo Toshokan', site: 'tokyotoshokan.info', query: 'anime raw', useIndex: false, ext: '(ext:mkv OR ext:zip)' },
  { name: 'OldGamesDownload', site: 'oldgamesdownload.com', query: 'need for speed', useIndex: false, ext: '(ext:zip OR ext:iso)' },
  { name: 'GOG-Games', site: 'gog-games.to', query: 'cyberpunk', useIndex: false, ext: '(ext:rar OR ext:zip)' },
  { name: 'RuTracker', site: 'rutracker.org', query: 'photoshop', useIndex: false, ext: '' },
  { name: 'ModDB', site: 'moddb.com', query: 'half-life mod', useIndex: false, ext: '(ext:zip OR ext:rar)' },
  { name: 'Ziperto', site: 'ziperto.com', query: 'pokemon 3ds', useIndex: false, ext: '(ext:rar)' },
  { name: 'RomUlation', site: 'romulation.org', query: 'super mario', useIndex: false, ext: '(ext:iso OR ext:rar)' },
  { name: 'APKMirror', site: 'apkmirror.com', query: 'flappy bird', useIndex: false, ext: '(ext:apk)' },
  { name: 'Abandonia', site: 'abandonia.com', query: 'prince of persia', useIndex: false, ext: '(ext:zip)' },

  // Servidores Abertos (Universidades / FTP)
  { name: 'Global Universities (.edu)', site: 'edu', query: 'physics', useIndex: true, ext: '(ext:pdf OR ext:ppt)' },
  { name: 'Japanese Universities (.ac.jp)', site: 'ac.jp', query: 'math', useIndex: true, ext: '(ext:pdf)' }
];

async function runAudit() {
  console.log('🔄 Iniciando Auditoria de Cobertura Total no SearxNG...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    let dork = '';
    
    // Regra de Ouro SearxNG: Não misture site:drive.google.com com intitle:"index of".
    // Mas para ".edu" a busca de Índices raiz é mandatória.
    if (test.useIndex) {
      dork = `intitle:"index of" "${test.query}" site:${test.site} ${test.ext}`;
    } else {
      dork = `"${test.query}" site:${test.site} ${test.ext}`;
    }
    
    // Removemos espaços duplos
    dork = dork.replace(/\s+/g, ' ').trim();
    
    try {
      const resp = await axios.get(SEARXNG_URL, {
        params: { q: dork, format: 'json', language: 'en' },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // Simula navegação legítima
        },
        timeout: 8000
      });
      
      const results = resp.data.results || [];
      if (results.length > 0) {
        console.log(`\x1b[32m✅ [${test.name}] PASSOU - ${results.length} resultados encontrados\x1b[0m\n   Dork: ${dork}\n`);
        passed++;
      } else {
        console.log(`\x1b[31m❌ [${test.name}] FALHOU - 0 resultados retornados. Sintaxe suspeita ou base sem arquivos.\x1b[0m\n   Dork: ${dork}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`\x1b[31m❌ [${test.name}] ERRO HTTP - ${err.message}.\x1b[0m\n   Dork: ${dork}\n`);
      failed++;
    }
    
    // Throttle de segurança para evitar banimento da instância pública "Too Many Requests" (HTTP 429)
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nRelatório de Auditoria Múltipla Concluído! ✅ Passaram: ${passed} | ❌ Falharam: ${failed}`);
}

runAudit();
