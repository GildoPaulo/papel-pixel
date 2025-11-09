// Middleware de tratamento de erros

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Não autorizado'
    });
  }

  // Erro não encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: err.message || 'Recurso não encontrado'
    });
  }

  // Erro genérico do servidor
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
};

// Middleware para 404
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
};

module.exports = {
  errorHandler,
  notFound
};

