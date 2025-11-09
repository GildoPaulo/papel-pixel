// Calculadora de Frete por Localização

export interface ShippingLocation {
  province: string;
  city?: string;
  postalCode?: string;
}

export interface ShippingRate {
  cost: number;
  estimatedDays: number;
  description: string;
}

// Tarifas de frete por província (em MZN)
const PROVINCE_SHIPPING_RATES: { [key: string]: { cost: number; days: number } } = {
  'Maputo': { cost: 50, days: 2 },
  'Maputo Cidade': { cost: 50, days: 2 },
  'Gaza': { cost: 75, days: 3 },
  'Inhambane': { cost: 80, days: 4 },
  'Sofala': { cost: 70, days: 3 },
  'Manica': { cost: 85, days: 4 },
  'Tete': { cost: 100, days: 5 },
  'Zambézia': { cost: 90, days: 5 },
  'Nampula': { cost: 110, days: 6 },
  'Cabo Delgado': { cost: 120, days: 7 },
  'Niassa': { cost: 130, days: 8 },
};

// Calcular frete baseado na localização
export function calculateShipping(
  location: ShippingLocation,
  subtotal: number
): ShippingRate {
  // Frete grátis acima de 500 MZN
  if (subtotal >= 500) {
    return {
      cost: 0,
      estimatedDays: 5,
      description: 'Frete Grátis (Compra acima de 500 MZN)',
    };
  }

  // Buscar tarifa da província
  const provinceRate = PROVINCE_SHIPPING_RATES[location.province];
  
  if (provinceRate) {
    return {
      cost: provinceRate.cost,
      estimatedDays: provinceRate.days,
      description: `Entrega para ${location.province}`,
    };
  }

  // Tarifa padrão (caso a província não esteja mapeada)
  return {
    cost: 80,
    estimatedDays: 5,
    description: 'Entrega padrão',
  };
}

// Obter prazo estimado de entrega
export function getEstimatedDelivery(location: ShippingLocation): string {
  const provinceRate = PROVINCE_SHIPPING_RATES[location.province];
  const days = provinceRate?.days || 5;
  
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + days);
  
  return deliveryDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Lista de províncias para select
export const MOZAMBIQUE_PROVINCES = [
  'Maputo',
  'Maputo Cidade',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa',
];


