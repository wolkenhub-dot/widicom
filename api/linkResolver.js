/**
 * linkResolver.js
 * 
 * Este módulo é responsável por converter a URL original de visualização de uma plataforma em um link de download direto.
 * Ele utiliza RegEx ou manipulação de URL para realizar a conversão.
 */

/**
 * Tenta converter uma URL de visualização em um link de download direto.
 * 
 * @param {string} url A URL original de visualização.
 * @param {string} platform A plataforma identificada para a URL.
 * @returns {string|null} O link de download direto ou null se não for possível converter.
 */
function resolveDirectLink(url, platform) {
  try {
    switch (platform) {
      case 'Google Drive':
        return resolveGoogleDrive(url);
      case 'Mega.nz':
        return resolveMega(url);
      case 'MediaFire':
        return resolveMediaFire(url);
      case 'Dropbox':
        return resolveDropbox(url);
      case 'Yandex Disk':
        return resolveYandex(url);
      case 'Internet Archive':
        return resolveInternetArchive(url);
      default:
        return url; // Retorna a URL original se não houver resolvedor específico
    }
  } catch (error) {
    console.error(`Erro ao resolver link para ${platform}:`, error.message);
    return null;
  }
}

/**
 * Resolve link de download direto para o Google Drive.
 * 
 * @param {string} url A URL original do Google Drive.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveGoogleDrive(url) {
  // Padrão para arquivos: https://drive.google.com/file/d/ID/view?usp=sharing
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
  }

  // Padrão para pastas: https://drive.google.com/drive/folders/ID?usp=sharing
  const folderIdMatch = url.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderIdMatch && folderIdMatch[1]) {
    // Para pastas, não há link direto simples, retornamos a URL original
    return url;
  }

  return url;
}

/**
 * Resolve link de download direto para o Mega.nz.
 * 
 * @param {string} url A URL original do Mega.nz.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveMega(url) {
  // O Mega.nz requer renderização de JavaScript para obter o link direto.
  // Em uma chamada HTTP pura, retornamos a URL original.
  // Sugestão futura: integração com Puppeteer ou Playwright.
  return url;
}

/**
 * Resolve link de download direto para o MediaFire.
 * 
 * @param {string} url A URL original do MediaFire.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveMediaFire(url) {
  // O MediaFire requer scraping da página para encontrar o link de download direto.
  // Em uma chamada HTTP pura, retornamos a URL original.
  // Sugestão futura: scraping assíncrono com Cheerio.
  return url;
}

/**
 * Resolve link de download direto para o Dropbox.
 * 
 * @param {string} url A URL original do Dropbox.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveDropbox(url) {
  // Padrão: https://www.dropbox.com/s/ID/filename?dl=0
  // Mudando dl=0 para dl=1, o Dropbox inicia o download direto.
  if (url.includes('dl=0')) {
    return url.replace('dl=0', 'dl=1');
  } else if (!url.includes('dl=1')) {
    return `${url}${url.includes('?') ? '&' : '?'}dl=1`;
  }
  return url;
}

/**
 * Resolve link de download direto para o Yandex Disk.
 * 
 * @param {string} url A URL original do Yandex Disk.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveYandex(url) {
  // O Yandex Disk requer uma chamada de API ou scraping.
  // Retornamos a URL original por enquanto.
  return url;
}

/**
 * Resolve link de download direto para o Internet Archive.
 * 
 * @param {string} url A URL original do Internet Archive.
 * @returns {string|null} O link de download direto ou null.
 */
function resolveInternetArchive(url) {
  // Padrão: https://archive.org/details/IDENTIFIER
  // Download: https://archive.org/download/IDENTIFIER/filename.ext
  // Retornamos a URL original por enquanto.
  return url;
}

module.exports = {
  resolveDirectLink
};
