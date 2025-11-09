// Busca semântica avançada de produtos

import { normalizeMessage, similarity } from './nlp';

export interface Product {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  image?: string;
  [key: string]: any;
}

export interface SearchResult {
  product: Product;
  score: number;
  matchedTerms: string[];
}

// Busca semântica com pontuação
export function semanticSearch(
  query: string,
  products: Product[],
  options: {
    threshold?: number;
    limit?: number;
    fields?: string[];
  } = {}
): SearchResult[] {
  const {
    threshold = 0.3,
    limit = 20,
    fields = ['name', 'description', 'category'],
  } = options;

  const normalizedQuery = normalizeMessage(query);
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  const results: SearchResult[] = products.map(product => {
    let score = 0;
    const matchedTerms: string[] = [];

    // Buscar em cada campo
    fields.forEach(field => {
      const fieldValue = product[field];
      if (!fieldValue) return;

      const normalizedField = normalizeMessage(String(fieldValue));
      const fieldWords = normalizedField.split(/\s+/);

      // Verificar correspondência exata de palavras
      queryWords.forEach(queryWord => {
        if (fieldWords.includes(queryWord)) {
          score += 0.5;
          matchedTerms.push(queryWord);
        }
      });

      // Verificar similaridade parcial
      if (normalizedField.includes(normalizedQuery)) {
        score += 0.8;
      }

      // Similaridade geral
      const sim = similarity(normalizedQuery, normalizedField);
      score += sim * 0.3;
    });

    return {
      product,
      score,
      matchedTerms: [...new Set(matchedTerms)],
    };
  });

  // Filtrar por threshold e ordenar
  return results
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Busca por sinônimos
export function searchWithSynonyms(
  query: string,
  products: Product[],
  synonymMap: { [key: string]: string[] } = {}
): SearchResult[] {
  // Expandir query com sinônimos
  const expandedQueries = [query];
  const normalizedQuery = normalizeMessage(query);

  for (const [canonical, synonyms] of Object.entries(synonymMap)) {
    if (normalizedQuery.includes(canonical)) {
      synonyms.forEach(syn => {
        expandedQueries.push(query.replace(canonical, syn));
      });
    }
  }

  // Buscar com todas as variações
  const allResults = new Map<string | number, { product: Product; score: number; matchedTerms: string[] }>();

  expandedQueries.forEach(expandedQuery => {
    const results = semanticSearch(expandedQuery, products);
    results.forEach(result => {
      const existing = allResults.get(result.product.id);
      if (!existing || existing.score < result.score) {
        allResults.set(result.product.id, result);
      }
    });
  });

  return Array.from(allResults.values())
    .sort((a, b) => b.score - a.score);
}

// Busca fuzzy (permite erros de digitação)
export function fuzzySearch(
  query: string,
  products: Product[],
  maxDistance: number = 2
): SearchResult[] {
  const normalizedQuery = normalizeMessage(query);
  const results: SearchResult[] = [];

  products.forEach(product => {
    const productText = normalizeMessage(
      [product.name, product.description, product.category].filter(Boolean).join(' ')
    );

    // Levenshtein distance simples para palavras
    const queryWords = normalizedQuery.split(/\s+/);
    let score = 0;

    queryWords.forEach(queryWord => {
      const productWords = productText.split(/\s+/);
      productWords.forEach(productWord => {
        const distance = levenshteinDistance(queryWord, productWord);
        if (distance <= maxDistance && queryWord.length >= 3) {
          score += (1 - distance / Math.max(queryWord.length, productWord.length));
        }
      });
    });

    if (score > 0) {
      results.push({
        product,
        score: score / queryWords.length,
        matchedTerms: [],
      });
    }
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

// Levenshtein distance (distância de edição)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}


