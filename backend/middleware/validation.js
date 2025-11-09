// Middleware de validação de dados

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  // Valida formato de telefone (+258XXXXXXXXX)
  const re = /^\+258\d{9}$/;
  return re.test(phone);
};

// Validador genérico
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validar email
    if (schema.email && req.body.email && !validateEmail(req.body.email)) {
      errors.push('Email inválido');
    }

    // Validar telefone
    if (schema.phone && req.body.phone && !validatePhone(req.body.phone)) {
      errors.push('Formato de telefone inválido. Use: +258XXXXXXXXX');
    }

    // Validar campos obrigatórios
    if (schema.required) {
      schema.required.forEach(field => {
        if (!req.body[field]) {
          errors.push(`${field} é obrigatório`);
        }
      });
    }

    // Validar comprimento de strings
    if (schema.lengths) {
      Object.entries(schema.lengths).forEach(([field, maxLength]) => {
        if (req.body[field] && req.body[field].length > maxLength) {
          errors.push(`${field} muito longo (máx. ${maxLength} caracteres)`);
        }
      });
    }

    // Validar valores mínimos
    if (schema.min) {
      Object.entries(schema.min).forEach(([field, minValue]) => {
        if (req.body[field] !== undefined && parseFloat(req.body[field]) < minValue) {
          errors.push(`${field} deve ser maior que ${minValue}`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

module.exports = { validate, validateEmail, validatePhone };

