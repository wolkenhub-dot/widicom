<div align="center">
  <img src="https://raw.githubusercontent.com/wolkenhub-dot/widicom/main/app/public/vite.svg" height="80" alt="Widicom Logo"/>
  <h1>Widicom</h1>
  <p><strong>O buscador definitivo focado em encontrar arquivos, mídias e conteúdos raros escondidos pela internet.</strong></p>
  <p>
    <a href="#-funcionalidades"><img src="https://img.shields.io/badge/Pesquisa-11%20Fontes--Simultâneas-indigo?style=for-the-badge&logo=search" /></a>
    <a href="#-tecnologias"><img src="https://img.shields.io/badge/Fastify-Node.js-black?style=for-the-badge&logo=fastify" /></a>
    <a href="#-tecnologias"><img src="https://img.shields.io/badge/React-TailwindCSS-0f172a?style=for-the-badge&logo=react" /></a>
  </p>
</div>

<br/>

O **Widicom** (anteriormente *Widicom Retro*) não é apenas um buscador comum. Ele é uma engine de **Metabusca** massivamente pararela construída em **Node.js** com um scraper assíncrono projetado para escapar de filtros agressivos como Cloudflare, Captchas e blockslists de IPs de indexadores modernos. 

Seu objetivo é primário e brutal: **preservar a internet e toda a "Lost Media" global.**

Ele mergulha em mais de 11 fontes silmutâneas através de um único requisição GET e 10 segundos, formatando e entregando links de **download direto verificados dinamicamente**, **links magnéticos com seeds**, **torrents puros**, livros manuais, ROMs abandonadas e Hack-ROMs – empacotado tudo em **uma interface minimalista extremamente veloz e luxuosa.**

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/search.svg" width="300" />
</p>

---

## ✨ Funcionalidades

- ⚡️ **11 Módulos P2P e Diretos:** Internet Archive, Open Directories (Dorks customizadas via `generateODDorks`), GitHub APIs (Projetos e documentação), OpenLibrary (Scanlations), The Pirate Bay API "apibay" (Torrents), Vimm's Lair, GameBanana, YTS (Filmes alta escala) e Nyaa RSS (Anime/Manga).
- 🚀 **Performance Absoluta (Fastify + Axios):** O backend executa funções multitarefas estritas em uma matriz `Promise.all()`. Se alguma das bibliotecas tomar Rate Limit temporário da Cloudflare (ou de IP local), o algoritmo utiliza o conceito de **Graceful Degradation** e injeta `[]` ignorando a falha sem afetar nenhuma outra fonte.
- 🎯 **Motor de Relevância Preditiva:**
  - O backend aplica peso automático e cruza a string de pesquisa ordenando a amostragem em tempo real (`relevanceEngine`).
  - Um script HTTP HEAD varre individualmente links Google Drive/Mega da internet validando se os mesmos estão vivos ou corrompidos. **Porém**, se detectado protocolos não-http ou **Links Magnéticos**, a blindagem Bypass de Link Checker atribui aprovação autônoma, livrando o painel de gargalos e crashes em Torrents vivos.
- 🎨 **Minimalismo Glassmorphism (Frontend UI):** Abordagem visual reinventada (*Adeus Web 1.0 Retro*!). Com a fluidez da landing page do **Google** unificada a transições *Cubic Bezier*, layouts Blur com Glass Card Effect e Skeleton Loaders progressivos pelo VITE nativo.

---

## 💻 Como Instalar e Rodar

Siga os passos abaixo em seu ambiente Windows / Linux para erguer as portas independentes do **Backend** e do **Frontend** conectadas pela API de roteamento na sua interface loopback.

### Requisitos Iniciais
Certifique-se de possuir instalado em sua arquitetura atual o `Node.js` (Na versão => v18) e o `git` CLI (NPM/NPX estarão embutidos).

```bash
# 1. Clone o repositório principal
git clone https://github.com/wolkenhub-dot/widicom.git

# 2. Navegue até o diretório raiz localmente
cd widicom
```

### Passo 1: Iniciar a Engine (API backend)
Localizada por padrão na porta `3000` a API em Fastify servirá os payloads.

```bash
# Entre na unidade raiz de infraestrutura API
cd api

# Instale imediatamente todas os escudos dependentes (Axios, Cheerio, Fastify...)
npm install

# Em caso de dev/run, acione os módulos
npm run dev
```

### Passo 2: Iniciar Interfaces Reativas (React Vite App)
Abra uma **nova** janela via terminal (Prompt Command/Powershell/Bash) na raiz do repositório clonado inicial:

```bash
# Entre na sessão de renderização DOM virtual
cd app

# Busque os packages do sistema Lucide, Tailwind 4.0, Sonner
npm install

# Instancie o framework para o seu Browser (Escuta a porta 5173 por Padrão)
npm run dev
```

---

## 🕹️ Experiência e Modo de Uso

1. Abra a aplicação gráfica recém-hosteada por meio do Localhost em seu navegador web (Firefox/Chrome preferenciais). `http://localhost:5173`.
2. O Socket irá verificar silenciosamente o status de colmutações da **API Node.js**, sinalizando Offline com um card se o Passo 1 não tiver ocorrido de forma correta.
3. **Página Inicial:** Você estará diante das minimalistas premissas de entrada de texto livre Widicom. Insira sua mídia procurada (Ex: `Super Mario 64`, `Matrix.1080p.WEB.x264`, `Final Fantasy VII Disk 1 ISO` , `Manga Name Manual`).
4. **Resolução Paralela Acionada:** A barra subirá veloz e graciosamente na Viewport enquanto cascateia skeletons na grid para todas as **11 pontes APIs globais**.
5. **Decifrando o Painel de Metadados Inteligente:** Nos luxuosos Cards em Glass que surgirem das sombras de poeira e opacidade, você verá métricas decisórias absolutas:
   - **Fontes de Arquivo Fechadas:** Tags cinzas informam que o link foi extraído via Archive, GitHub, ou Diretórios Abertos. Clique no botão de cor Roxo/Índigo com a seta pra baixo para interagir pela web ou transferir.
   - **Arquivos Magnéticos P2P:** Ícones azul/roxeados com métricas atreladas `[Nº de SEEDS]` na tag (ex: extraído pelo *YYS* ou *Apibay*) injetarão o protocolo `magnet:?`, acordando e disparando o aplicativo final de roteamento `qBittorrent`/`Transmission` instalado em seu sistema com um microclique sem adwaress nojentas.
6. **Filtros por Tags Categóricas e Paginação Dinâmica:** Como as matrizes puxarão infinitude de logs espalhados, isole a aba superior apertando na Pill exata referente a provedor se desejar, e escorralege pelas setas centrais até navegar fluidamente na **Página 2** ou **3** mantendo todo o banco carregado na pre-definição de cache.

---

> ⚠️ Nota Transparente e Legalidade: Para sanar dúvidas, vale salientar que absolutamente 0% do backend copia, armazena, espelha ou distribui pacotes ilegais, restritos de Copyright ou conteúdo de hospedagem sensível. O projeto atua com web scrapping puramente documental visando a expansão da capacidade natural do indexador web para fins unicamente educacionais e retro-entusiastas. Caso ocorra limitação extrema em requisições de origem (*Ex: Google Search Fallbacks sendo barrados na source Machine*), é totalmente encorajado deployar em Vultr, VPS com IP não filtrado para melhor integridade da aplicação!
