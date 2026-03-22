/**
 * dorkEngine.js
 * Motor central de formatação de Dorks do Widicom.
 * Sintaxe à prova de falhas: Separa sites em pedaços e nunca mistura Index Of com Cloud.
 */

// Dicionário de regras. Os sites ficam em arrays para poderem ser divididos se a lista for gigante.
const REGRAS_CATEGORIAS = {
  "metadata": {
    "version": "2.0.0",
    "description": "Configuração avançada de dorks para Widicom - Metabuscador de Lost Media",
    "last_updated": "2026-03-22",
    "total_sources": 65,
    "total_categories": 12,
    "notes": "Arquivo otimizado com 50+ fontes adicionais sem limitações de busca"
  },

  "roms_e_isos": {
    "description": "ROMs, ISOs e arquivos de jogos retro",
    "sites": [
      "cdromance.org",
      "nopaystation.com",
      "myrient.erista.me",
      "edgeemu.net",
      "romulation.org",
      "archive.org/details/software",
      "github.com",
      "zenodo.org"
    ],
    "extensoes": "(ext:iso OR ext:rom OR ext:zip OR ext:bin OR ext:cue OR ext:7z OR ext:pkg OR ext:cia OR ext:vpk OR ext:chd OR ext:img)",
    "useIndex": false,
    "priority": "high"
  },

  "pc_retro_dos": {
    "description": "Jogos e software retro para PC, DOS, Windows antigo",
    "sites": [
      "retro-exo.com",
      "winworldpc.com",
      "macintoshgarden.org",
      "oldgamesdownload.com",
      "gog-games.to",
      "archive.org/details/software",
      "github.com/datasets",
      "sourceforge.net"
    ],
    "extensoes": "(ext:zip OR ext:rar OR ext:7z OR ext:iso OR ext:img OR ext:exe OR ext:dmg OR ext:deb OR ext:rpm)",
    "useIndex": false,
    "priority": "high"
  },

  "prototipos_e_betas": {
    "description": "Protótipos, versões beta e builds canceladas",
    "sites": [
      "hiddenpalace.org",
      "tcrf.net",
      "huggingface.co/datasets",
      "betaarchive.com",
      "archive.org/details",
      "github.com",
      "zenodo.org",
      "figshare.com"
    ],
    "extensoes": "(ext:iso OR ext:zip OR ext:7z OR ext:chd OR ext:rar OR ext:bin OR ext:cue)",
    "useIndex": false,
    "priority": "high"
  },

  "mobile_e_apps": {
    "description": "Aplicativos mobile e APKs",
    "sites": [
      "archive.org/details/software",
      "github.com",
      "sourceforge.net",
      "gitlab.com",
      "bitbucket.org",
      "zenodo.org",
      "figshare.com"
    ],
    "extensoes": "(ext:apk OR ext:xapk OR ext:apks OR ext:ipa OR ext:app OR ext:zip)",
    "useIndex": false,
    "priority": "medium"
  },

  "servidores_academicos": {
    "description": "Repositórios acadêmicos e universidades",
    "sites": [
      "edu",
      "ac.jp",
      "ac.uk",
      "ac.nz",
      "edu.br",
      "ac.id",
      "edu.au"
    ],
    "extensoes": "(ext:iso OR ext:zip OR ext:rar OR ext:7z OR ext:tar OR ext:gz OR ext:pdf OR ext:epub)",
    "useIndex": true,
    "priority": "medium"
  },

  "roms": {
    "description": "ROMs de consoles e computadores antigos",
    "sites": [
      "myrient.erista.me",
      "edgeemu.net",
      "archive.org",
      "drive.google.com",
      "mega.nz",
      "zenodo.org",
      "github.com",
      "figshare.com"
    ],
    "extensoes": "(ext:iso OR ext:rom OR ext:zip OR ext:bin OR ext:cue OR ext:7z OR ext:chd)",
    "useIndex": false,
    "priority": "high"
  },

  "videos": {
    "description": "Vídeos, filmes e documentários",
    "sites": [
      "drive.google.com",
      "mega.nz",
      "mediafire.com",
      "archive.org/details/movies",
      "archive.org/details/television",
      "commons.wikimedia.org",
      "europeana.eu",
      "vimeo.com"
    ],
    "extensoes": "(ext:mp4 OR ext:mkv OR ext:avi OR ext:mov OR ext:flv OR ext:webm OR ext:m4v OR ext:3gp)",
    "useIndex": false,
    "priority": "high"
  },

  "docs": {
    "description": "Documentos, livros, PDFs e e-books",
    "sites": [
      "drive.google.com",
      "mega.nz",
      "dropbox.com",
      "archive.org",
      "project-gutenberg.org",
      "standardebooks.org",
      "openlibrary.org",
      "wikisource.org",
      "scribd.com",
      "academia.edu"
    ],
    "extensoes": "(ext:pdf OR ext:epub OR ext:txt OR ext:cbz OR ext:cbr OR ext:doc OR ext:docx OR ext:odt)",
    "useIndex": false,
    "priority": "high"
  },

  "bibliotecas_digitais": {
    "description": "Bibliotecas digitais e acervos públicos",
    "sites": [
      "project-gutenberg.org",
      "standardebooks.org",
      "openlibrary.org",
      "wikisource.org",
      "librivox.org",
      "loc.gov/collections",
      "gallica.bnf.fr",
      "deutsche-digitale-bibliothek.de",
      "commons.wikimedia.org",
      "europeana.eu"
    ],
    "extensoes": "(ext:pdf OR ext:epub OR ext:txt OR ext:mp3 OR ext:ogg OR ext:jpg OR ext:png)",
    "useIndex": false,
    "priority": "high"
  },

  "repositorios_dados": {
    "description": "Repositórios de dados abertos e pesquisa",
    "sites": [
      "zenodo.org",
      "figshare.com",
      "osf.io",
      "kaggle.com",
      "data.gov",
      "data.europa.eu",
      "data.world",
      "github.com/datasets",
      "dataverse.org",
      "nber.org/research/data"
    ],
    "extensoes": "(ext:csv OR ext:json OR ext:xml OR ext:sql OR ext:zip OR ext:tar OR ext:gz)",
    "useIndex": false,
    "priority": "medium"
  },

  "codigo_aberto": {
    "description": "Projetos de código aberto e desenvolvimento",
    "sites": [
      "github.com",
      "gitlab.com",
      "sourceforge.net",
      "bitbucket.org",
      "gitea.io",
      "zenodo.org",
      "figshare.com"
    ],
    "extensoes": "(ext:zip OR ext:tar OR ext:gz OR ext:7z OR ext:rar OR ext:exe OR ext:dmg)",
    "useIndex": false,
    "priority": "medium"
  },

  "tudo": {
    "description": "Busca geral em todas as plataformas",
    "sites": [
      "drive.google.com",
      "mega.nz",
      "mediafire.com",
      "cdromance.org",
      "retro-exo.com",
      "hiddenpalace.org",
      "nopaystation.com",
      "archive.org",
      "tcrf.net",
      "winworldpc.com",
      "macintoshgarden.org",
      "betaarchive.com",
      "oldgamesdownload.com",
      "gog-games.to",
      "rutracker.org",
      "moddb.com",
      "ziperto.com",
      "romulation.org",
      "edgeemu.net",
      "myrient.erista.me",
      "project-gutenberg.org",
      "standardebooks.org",
      "openlibrary.org",
      "wikisource.org",
      "zenodo.org",
      "figshare.com",
      "osf.io",
      "kaggle.com",
      "github.com",
      "gitlab.com",
      "sourceforge.net",
      "commons.wikimedia.org",
      "europeana.eu",
      "loc.gov",
      "gallica.bnf.fr",
      "vimeo.com",
      "scribd.com",
      "academia.edu",
      "core.ac.uk",
      "data.gov",
      "data.europa.eu",
      "huggingface.co/datasets",
      "bitbucket.org",
      "gitea.io"
    ],
    "extensoes": "",
    "useIndex": false,
    "priority": "low"
  },

  "alternativas_resolvidas": {
    "description": "Alternativas para URLs que não funcionam",
    "the-eye.eu": {
      "status": "offline",
      "alternativas": ["archive.org/details/software", "zenodo.org", "figshare.com"],
      "motivo": "Servidor indisponível"
    },
    "abandonia.com": {
      "status": "erro_conexao",
      "alternativas": ["oldgamesdownload.com", "retro-exo.com", "archive.org"],
      "motivo": "Erro de conexão"
    },
    "tokyotoshokan.info": {
      "status": "indisponivel",
      "alternativas": ["archive.org/details/movies", "archive.org/details/television"],
      "motivo": "Servidor indisponível"
    },
    "ziperto.com": {
      "status": "acesso_restrito",
      "alternativas": ["romulation.org", "cdromance.org", "myrient.erista.me"],
      "motivo": "Acesso restrito (403)"
    },
    "moddb.com": {
      "status": "acesso_restrito",
      "alternativas": ["github.com", "sourceforge.net", "gitlab.com"],
      "motivo": "Acesso restrito (403)"
    },
    "apkmirror.com": {
      "status": "acesso_restrito",
      "alternativas": ["archive.org/details/software", "github.com", "zenodo.org"],
      "motivo": "Acesso restrito (403)"
    }
  },

  "dorks_templates": {
    "description": "Templates de dorks para uso avançado",
    "basico": "site:{site} \"{query}\"",
    "arquivo_especifico": "site:{site} \"{query}\" {extensoes}",
    "index_of": "intitle:\"index of\" \"{query}\" {extensoes}",
    "pasta_compartilhada": "site:{site} \"{query}\" (folder OR directory)",
    "busca_avancada": "site:{site} \"{query}\" -virus -malware -fake",
    "data_especifica": "site:{site} \"{query}\" after:2010 before:2020",
    "tamanho_arquivo": "site:{site} \"{query}\" filesize:>100MB",
    "tipo_documento": "site:{site} filetype:{extensao} \"{query}\""
  },

  "configuracoes_otimizacao": {
    "timeout_requisicao": 5000,
    "retry_tentativas": 3,
    "delay_entre_requisicoes": 500,
    "cache_duracao_minutos": 60,
    "limite_resultados_por_site": 10,
    "usar_proxy": false,
    "verificar_disponibilidade": true,
    "remover_duplicatas": true,
    "ordenar_por_relevancia": true
  },

  "estatisticas": {
    "urls_funcionais": 16,
    "urls_com_restricoes": 3,
    "urls_nao_funcionais": 3,
    "fontes_adicionadas": 50,
    "total_fontes_unicas": 65,
    "categorias_principais": 12,
    "extensoes_suportadas": 35
  }
};

/**
 * Extrai termos positivos e negativos da query para suportar exclusões.
 * Exemplo: "naruto -shippuden" -> { termoPositivo: "naruto", termosNegativos: " -shippuden" }
 */
function parseQueryTerms(query) {
  const parts = query.trim().split(/\s+/);
  const positivos = [];
  const negativos = [];

  parts.forEach(part => {
    if (part.startsWith('-') && part.length > 1) {
      negativos.push(part);
    } else {
      positivos.push(part);
    }
  });

  return {
    termoPositivo: positivos.join(' '),
    termosNegativos: negativos.length > 0 ? " " + negativos.join(' ') : ""
  };
}

/**
 * Agrupa arrays gigantes em pedaços de tamanho definido (chunking).
 * Evita gerar queries OR gigantescas que o SearxNG rejeita.
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Gera uma lista otimizada com sintaxe defensiva de dorks.
 */
function generateDorks(query, categoria = "tudo", mode = "deep") {
  const dorks = [];
  const { termoPositivo, termosNegativos } = parseQueryTerms(query);
  const termoLimpo = termoPositivo.trim();

  const regra = REGRAS_CATEGORIAS[categoria] || REGRAS_CATEGORIAS["tudo"];
  
  // Isolamento Dinâmico de Fontes: 
  // 'quick': Dilui a busca (6 sites por Dork) para ir rápido 
  // 'deep': Alta Densidade (2 sites por Dork) cavando fundo mas lento.
  const chunkSize = mode === 'quick' ? 6 : 2;
  const chunks = chunkArray(regra.sites, chunkSize);

  chunks.forEach(grupoDeSites => {
    const siteString = "(" + grupoDeSites.map(s => `site:${s}`).join(" OR ") + ")";

    if (regra.useIndex) {
      // Regra Ouro: `intitle:"index of"` apenas quando estritamente definido na regra
      let dork = `intitle:"index of" "${termoLimpo}" ${siteString}`;
      if (regra.extensoes) dork += ` ${regra.extensoes}`;
      dorks.push((dork + termosNegativos).trim().replace(/\s+/g, ' '));
    } else {
      let dork = `"${termoLimpo}" ${siteString}`;
      if (regra.extensoes) dork += ` ${regra.extensoes}`;
      dorks.push((dork + termosNegativos).trim().replace(/\s+/g, ' '));
    }
  });

  // Dork extra universal para encontrar Índices Abertos "Aleatórios" ao listar em "tudo"
  if (categoria === "tudo") {
    let extensoesPadrao = "(ext:mp4 OR ext:zip OR ext:iso OR ext:pdf OR ext:rar OR ext:7z)";
    // Dork avulsa só para index of padrão. Sem amarrar com cloud drives.
    dorks.push(`intitle:"index of" "${termoLimpo}" ${extensoesPadrao}${termosNegativos}`.replace(/\s+/g, ' ').trim());
    
    // Dork para vazamentos de código
    dorks.push(`"${termoLimpo}" (site:pastebin.com OR site:github.com OR site:gitlab.com)${termosNegativos}`.replace(/\s+/g, ' ').trim());
  }

  return dorks;
}

/**
 * Gera uma dork focada exclusivamente em Open Directories genéricos (+antigos Apache/Nginx).
 */
function generateODDorks(query) {
  const { termoPositivo, termosNegativos } = parseQueryTerms(query);
  const termoLimpo = termoPositivo.trim();
  return [
    `intitle:"index of" "${termoLimpo}" -inurl:(jsp|pl|php|html|aspx|htm|cf|shtml)${termosNegativos}`.replace(/\s+/g, ' ').trim()
  ];
}

module.exports = {
  generateDorks,
  generateODDorks,
  parseQueryTerms
};