// Sistema NLP (Processamento de Linguagem Natural) para entender intenções do usuário

export interface Intent {
  type: 'purchase' | 'search' | 'question' | 'help' | 'greeting' | 'farewell';
  productType?: string;
  color?: string;
  size?: string;
  attributes?: string[];
  confidence: number;
}

// Sinônimos e variações de palavras
const PRODUCT_SYNONYMS: { [key: string]: string[] } = {
  'camisa': ['camisa', 'shirt', 'blusa', 'roupa superior'],
  'livro': ['livro', 'book', 'publicação', 'obra'],
  'caderno': ['caderno', 'notebook', 'bloco', 'papel'],
  'caneta': ['caneta', 'pen', 'esferográfica', 'escrita'],
  'revista': ['revista', 'magazine', 'periódico'],
  'papelaria': ['papelaria', 'stationery', 'material escolar', 'escritório'],
};

const COLOR_SYNONYMS: { [key: string]: string[] } = {
  'azul': ['azul', 'blue', 'azulado'],
  'vermelho': ['vermelho', 'red', 'vermelhão', 'encarnado'],
  'verde': ['verde', 'green', 'verdejante'],
  'preto': ['preto', 'black', 'negro'],
  'branco': ['branco', 'white', 'alvo'],
};

const SIZE_SYNONYMS: { [key: string]: string[] } = {
  'pequeno': ['pequeno', 'small', 'S', 'pequena', 'p'],
  'médio': ['médio', 'medium', 'M', 'média', 'med'],
  'grande': ['grande', 'large', 'L', 'grand'],
};

// Palavras-chave para intenções
const INTENT_KEYWORDS = {
  purchase: ['quero comprar', 'quero', 'preciso de', 'comprar', 'adquirir', 'tenho interesse', 'estou procurando'],
  search: ['buscar', 'procurar', 'encontrar', 'tem', 'existe', 'vocês têm', 'vocês tem'],
  question: ['qual', 'quanto', 'como', 'onde', 'quando', 'por que', 'porque'],
  help: ['ajuda', 'ajudar', 'suporte', 'dúvida', 'help'],
  greeting: ['olá', 'oi', 'hey', 'hello', 'bom dia', 'boa tarde', 'boa noite'],
  farewell: ['tchau', 'bye', 'até logo', 'até breve', 'até mais'],
};

// Extrair entidades da mensagem
export function extractEntities(message: string): { productType?: string; color?: string; size?: string; attributes?: string[] } {
  const lowerMessage = message.toLowerCase();
  const entities: { productType?: string; color?: string; size?: string; attributes?: string[] } = {};
  const foundAttributes: string[] = [];

  // Buscar tipo de produto
  for (const [canonical, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    if (synonyms.some(syn => lowerMessage.includes(syn))) {
      entities.productType = canonical;
      break;
    }
  }

  // Buscar cor
  for (const [canonical, synonyms] of Object.entries(COLOR_SYNONYMS)) {
    if (synonyms.some(syn => lowerMessage.includes(syn))) {
      entities.color = canonical;
      foundAttributes.push(`cor ${canonical}`);
      break;
    }
  }

  // Buscar tamanho
  for (const [canonical, synonyms] of Object.entries(SIZE_SYNONYMS)) {
    if (synonyms.some(syn => lowerMessage.includes(syn))) {
      entities.size = canonical;
      foundAttributes.push(`tamanho ${canonical}`);
      break;
    }
  }

  // Atributos adicionais
  if (lowerMessage.includes('barato') || lowerMessage.includes('econômico')) {
    foundAttributes.push('preço baixo');
  }
  if (lowerMessage.includes('caro') || lowerMessage.includes('premium')) {
    foundAttributes.push('preço alto');
  }
  if (lowerMessage.includes('desconto') || lowerMessage.includes('promoção')) {
    foundAttributes.push('promoção');
  }
  if (lowerMessage.includes('destaque') || lowerMessage.includes('popular')) {
    foundAttributes.push('popular');
  }

  if (foundAttributes.length > 0) {
    entities.attributes = foundAttributes;
  }

  return entities;
}

// Detectar intenção principal
export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase().trim();
  const entities = extractEntities(message);

  // Verificar intenções por ordem de especificidade
  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
    if (matches.length > 0) {
      return {
        type: intentType as Intent['type'],
        ...entities,
        confidence: matches.length > 1 ? 0.9 : 0.7,
      };
    }
  }

  // Se tem entidades, provavelmente é busca/compra
  if (entities.productType || entities.color || entities.size) {
    return {
      type: 'search',
      ...entities,
      confidence: 0.8,
    };
  }

  // Default
  return {
    type: 'question',
    confidence: 0.5,
  };
}

// Normalizar mensagem para comparação
export function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

// Calcular similaridade entre strings (Jaccard)
export function similarity(str1: string, str2: string): number {
  const words1 = new Set(normalizeMessage(str1).split(/\s+/));
  const words2 = new Set(normalizeMessage(str2).split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}


