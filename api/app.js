/**
 * app.js
 * 
 * Este arquivo é o ponto de entrada da aplicação Fastify.
 * Ele inicializa o servidor, define as rotas e os middlewares necessários.
 */

const fastify = require('fastify')({ logger: true });
const path = require('path');
const searchController = require('./searchController');
const healthController = require('./healthController');
const autocompleteController = require('./autocompleteController');

require('dotenv').config();

fastify.register(require('@fastify/cors'), {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.get('/', async (request, reply) => {
  return { 
    message: 'API de Metabuscador de Lost Media está ativa!',
    status: 'online',
    version: '1.0.0'
  };
});

fastify.get('/search', searchController.search);

/**
 * Rota para autocompletar termos de busca na interface do terminal.
 */
fastify.get('/autocomplete', autocompleteController.getSuggestions);

/**
 * Rota para obter estatísticas globais e verificar integridade
 */
fastify.get('/stats', healthController.getStats);

/**
 * Rota para verificar a integridade da conexão direta com todas as pontes API
 */
fastify.get('/health/sources', healthController.checkSources);

/**
 * Inicializa o servidor Fastify na porta especificada.
 */
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Servidor rodando em http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
