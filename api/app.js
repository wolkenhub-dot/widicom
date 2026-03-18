/**
 * app.js
 * 
 * Este arquivo é o ponto de entrada da aplicação Fastify.
 * Ele inicializa o servidor, define as rotas e os middlewares necessários.
 */

const fastify = require('fastify')({ logger: true });
const path = require('path');
const searchController = require('./searchController');

// Carrega variáveis de ambiente de um arquivo .env (opcional)
require('dotenv').config();

// Habilita o CORS (Cross-Origin Resource Sharing)
fastify.register(require('@fastify/cors'), {
  origin: '*', // Permite todas as origens (ajuste para produção)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

/**
 * Rota raiz da API.
 * 
 * @param {Object} request O objeto de requisição do Fastify.
 * @param {Object} reply O objeto de resposta do Fastify.
 */
fastify.get('/', async (request, reply) => {
  return { 
    message: 'API de Metabuscador de Lost Media está ativa!',
    status: 'online',
    version: '1.0.0'
  };
});

/**
 * Rota de busca principal.
 * 
 * @param {Object} request O objeto de requisição do Fastify.
 * @param {Object} reply O objeto de resposta do Fastify.
 */
fastify.get('/search', searchController.search);

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
