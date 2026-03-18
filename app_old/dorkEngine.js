/**
 * dorkEngine.js
 * 
 * Este módulo é responsável por transformar o termo de busca do usuário em uma lista de Google/DuckDuckGo Dorks.
 * O objetivo é encontrar arquivos em serviços de nuvem específicos e índices abertos.
 */

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
 */
function generateDorks(query) {
  const dorks = [];

  // 1. Dorks por plataforma de nuvem
  CLOUD_PLATFORMS.forEach(platform => {
    // Busca simples no site
    dorks.push(`site:${platform.site} "${query}"`);
    
    // Busca por arquivos específicos na URL (se aplicável)
    if (platform.site === 'drive.google.com') {
      dorks.push(`site:${platform.site}/file/d/ "${query}"`);
      dorks.push(`site:${platform.site}/drive/folders/ "${query}"`);
    }
  });

  // 2. Dorks para índices abertos (Index of)
  FILE_EXTENSIONS.forEach(ext => {
    dorks.push(`intitle:"index of" "${query}.${ext}"`);
    dorks.push(`intitle:"index of" "${query}" +(${ext})`);
  });

  // 3. Dorks para sites de compartilhamento de arquivos genéricos
  dorks.push(`"${query}" (site:pastebin.com OR site:github.com OR site:gitlab.com)`);

  return dorks;
}

module.exports = {
  generateDorks
};
