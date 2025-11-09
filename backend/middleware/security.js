const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Rate limiting para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
  },
  skipSuccessfulRequests: true
});

// Rate limiting para criar recursos
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 requisições por minuto
  message: {
    error: 'Muitas requisições. Aguarde um momento.'
  }
});

// Middleware de segurança
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }),
  compression(),
  morgan('dev')
];

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter,
  securityMiddleware
};

