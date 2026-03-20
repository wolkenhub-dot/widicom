/* 

const CLOUD_PLATFORMS = [
  { name: 'Google Drive', site: 'drive.google.com' },
  { name: 'Mega.nz', site: 'mega.nz' },
  { name: 'MediaFire', site: 'mediafire.com' },
  { name: 'Dropbox', site: 'dropbox.com' },
  { name: 'Yandex Disk', site: 'disk.yandex.com' },
  { name: 'Internet Archive', site: 'archive.org' }
];

const FILE_EXTENSIONS = ['mp4', 'mkv', 'avi', 'mov', 'zip', 'rar', '7z', 'iso', 'bin'];

/**
 * Gera uma lista de dorks com base no termo de busca fornecido.
 * 
 * @param {string} query O termo de busca do usuário.
 * @returns {string[]} Uma lista de strings contendo as dorks geradas.
 
function generateDorks(query) {
  const dorks = [];

  // 1. Dorks por plataforma de nuvem
  CLOUD_PLATFORMS.forEach(platform => {
    // Busca simples no site
    dorks.push(`site:${platform.site} ${query}`);
  });

  // 2. Dorks para índices abertos (Index of)
  FILE_EXTENSIONS.forEach(ext => {
    dorks.push(`intitle:"index of" ${query}.${ext}`);
    dorks.push(`intitle:"index of" ${query} +(${ext})`);
  });

  // 3. Dorks para sites de compartilhamento de arquivos genéricos
  dorks.push(`${query} (site:pastebin.com OR site:github.com OR site:gitlab.com)`);

  return dorks;
}

module.exports = {
  generateDorks
};
 */

/**
 * dorkEngine.js
 * * Este módulo transforma o termo de busca e a categoria em Dorks complexas.
 * Otimizado para metabuscadores como o SearxNG usando operadores OR para reduzir requisições.
 */

// Dicionário de regras por categoria (facilita muito adicionar coisas novas depois)
const REGRAS_CATEGORIAS = {
  "roms": {
    // Foco em repositórios de arquivistas e extensões de disco/compressão
    sites: "(site:myrient.erista.me OR site:the-eye.eu OR site:edgeemu.net OR site:archive.org OR site:drive.google.com OR site:mega.nz)",
    extensoes: "(ext:iso OR ext:rom OR ext:zip OR ext:bin OR ext:cue OR ext:7z)"
  },
  "videos": {
    sites: "(site:drive.google.com OR site:mega.nz OR site:mediafire.com OR site:archive.org)",
    extensoes: "(ext:mp4 OR ext:mkv OR ext:avi OR ext:mov)"
  },
  "docs": {
    sites: "(site:drive.google.com OR site:mega.nz OR site:dropbox.com OR site:archive.org)",
    extensoes: "(ext:pdf OR ext:epub OR ext:txt OR ext:cbz OR ext:cbr)"
  },
  "tudo": {
    // Busca geral se o usuário não escolher filtro
    sites: "(site:drive.google.com OR site:mega.nz OR site:mediafire.com OR site:archive.org OR site:disk.yandex.com)",
    extensoes: ""
  }
};

/**
 * Gera uma lista otimizada (curta) de dorks baseada no termo e categoria.
 * * @param {string} query O termo de busca do usuário.
 * @param {string} categoria A categoria desejada (roms, videos, docs, tudo).
 * @returns {string[]} Lista contendo de 2 a 3 dorks altamente complexas.
 */
function generateDorks(query, categoria = "tudo") {
  const dorks = [];
  const termoLimpo = query.trim();

  // 1. Pega as regras da categoria escolhida (ou cai em 'tudo' se der erro)
  const regra = REGRAS_CATEGORIAS[categoria] || REGRAS_CATEGORIAS["tudo"];

  // 2. Dork Principal: Busca em Nuvem e Repositórios
  // Exemplo: Need for Speed (site:drive... OR site:mega...) (ext:iso OR ext:zip...)
  let dorkPrincipal = `${termoLimpo} ${regra.sites}`;
  if (regra.extensoes) {
    dorkPrincipal += ` ${regra.extensoes}`;
  }
  dorks.push(dorkPrincipal);

  // 3. Dork Secundária: Índices Abertos (Index Of)
  // O SearxNG é ótimo em achar diretórios abertos. Juntamos tudo em uma string só.
  let extensoesParaIndex = regra.extensoes || "(ext:mp4 OR ext:zip OR ext:iso OR ext:pdf)";
  dorks.push(`intitle:"index of" "${termoLimpo}" ${extensoesParaIndex}`);

  // 4. Dork Terciária: Vazamentos de texto e códigos (apenas se for busca geral)
  if (categoria === "tudo") {
    dorks.push(`"${termoLimpo}" (site:pastebin.com OR site:github.com OR site:gitlab.com)`);
  }

  return dorks;
}

/**
 * Gera uma dork focada exclusivamente em Index of (Open Directories).
 * Útil para achar arquivos hospedados em servidores raiz sem interface.
 * 
 * @param {string} query O termo de busca do usuário.
 * @returns {string[]} Uma query focada para encontrar ODs antigos (Apache/Nginx).
 */
function generateODDorks(query) {
  const termoLimpo = query.trim();
  // Busca por título index of e exclui páginas comuns de web dinâmicas 
  // para focar nas listagens originais (como se fosse um FTP web).
  return [
    `intitle:"index of" "${termoLimpo}" -inurl:(jsp|pl|php|html|aspx|htm|cf|shtml)`
  ];
}

module.exports = {
  generateDorks,
  generateODDorks
};