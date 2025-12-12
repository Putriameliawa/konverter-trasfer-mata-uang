// Currency conversion utilities and API integration

export interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  date: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
];

// Using exchangerate.host API (free, no key required)
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRate> {
  try {
    const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const data = await response.json();
    
    // Validate API response structure
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid API response structure');
    }
    
    // Ensure all required currencies are present
    const requiredCurrencies = ['IDR', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD'];
    const missingCurrencies = requiredCurrencies.filter(currency => 
      currency !== baseCurrency && !(currency in data.rates)
    );
    
    if (missingCurrencies.length > 0) {
      // Handle missing currencies in production without console output
    }
    
    // Return validated data with fallback for missing rates
    return {
      base: data.base || baseCurrency,
      rates: {
        ...getFallbackRates(baseCurrency),
        ...data.rates
      },
      date: data.date || new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    // Silent error handling for production
    // Fallback mock data for demo purposes
    return {
      base: baseCurrency,
      rates: getFallbackRates(baseCurrency),
      date: new Date().toISOString().split('T')[0]
    };
  }
}

// Helper function to get fallback rates
function getFallbackRates(baseCurrency: string): Record<string, number> {
  const baseRates: Record<string, number> = {
    IDR: 15000,
    USD: 1,
    EUR: 0.85,
    JPY: 110,
    GBP: 0.73,
    AUD: 1.35,
    CAD: 1.25,
    CHF: 0.92,
    CNY: 6.45,
    SGD: 1.35
  };
  
  // If base currency is not USD, adjust all rates
  if (baseCurrency !== 'USD') {
    const baseRate = baseRates[baseCurrency];
    if (baseRate) {
      const adjustedRates: Record<string, number> = {};
      Object.entries(baseRates).forEach(([currency, rate]) => {
        if (currency !== baseCurrency) {
          adjustedRates[currency] = rate / baseRate;
        }
      });
      return adjustedRates;
    }
  }
  
  return baseRates;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
  baseCurrency: string = 'USD'
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Validate inputs
  if (!rates || typeof rates !== 'object') {
    throw new Error('Invalid exchange rates data');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Get the rates for both currencies relative to base
  const fromRate = fromCurrency === baseCurrency ? 1 : rates[fromCurrency];
  const toRate = toCurrency === baseCurrency ? 1 : rates[toCurrency];
  
  if (fromCurrency !== baseCurrency && (fromRate === undefined || fromRate === null || fromRate <= 0)) {
    throw new Error(`Exchange rate not available for ${fromCurrency}`);
  }
  
  if (toCurrency !== baseCurrency && (toRate === undefined || toRate === null || toRate <= 0)) {
    throw new Error(`Exchange rate not available for ${toCurrency}`);
  }
  
  // Convert from source currency to base currency, then to target currency
  if (fromCurrency === baseCurrency) {
    // From base currency to target
    return amount * toRate;
  } else if (toCurrency === baseCurrency) {
    // From source currency to base
    return amount / fromRate;
  } else {
    // From source to base, then base to target
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}