// Bank data structure and utilities for Indonesian banking system

export interface Bank {
  id: string;
  name: string;
  fullName: string;
  code: string;
  type: 'government' | 'private' | 'regional' | 'foreign' | 'syariah';
  logo: string;
  color: string;
  description: string;
  services: string[];
  popular: boolean;
}

export const INDONESIAN_BANKS: Bank[] = [
  // Government Banks
  {
    id: 'bri',
    name: 'BRI',
    fullName: 'Bank Rakyat Indonesia',
    code: '002',
    type: 'government',
    logo: '🏛️',
    color: '#003d82',
    description: 'Indonesia\'s largest bank serving millions of customers nationwide',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'International Transfer'],
    popular: true
  },
  {
    id: 'bni',
    name: 'BNI',
    fullName: 'Bank Negara Indonesia',
    code: '009',
    type: 'government',
    logo: '🏦',
    color: '#ff8500',
    description: 'State-owned bank with extensive international presence',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'Trade Finance'],
    popular: true
  },
  {
    id: 'btn',
    name: 'BTN',
    fullName: 'Bank Tabungan Negara',
    code: '200',
    type: 'government',
    logo: '🏠',
    color: '#0066cc',
    description: 'Government bank specializing in housing and infrastructure financing',
    services: ['ATM', 'Housing Loans', 'Internet Banking', 'Mobile Banking'],
    popular: false
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    fullName: 'Bank Mandiri',
    code: '008',
    type: 'government',
    logo: '🌟',
    color: '#003d82',
    description: 'Indonesia\'s largest bank by assets with comprehensive financial services',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'Investment', 'Insurance'],
    popular: true
  },

  // Private Banks
  {
    id: 'bca',
    name: 'BCA',
    fullName: 'Bank Central Asia',
    code: '014',
    type: 'private',
    logo: '💙',
    color: '#0066cc',
    description: 'Leading private bank known for excellent digital banking services',
    services: ['ATM', 'KlikBCA', 'Mobile Banking', 'Investment', 'Credit Cards'],
    popular: true
  },
  {
    id: 'bni_syariah',
    name: 'BNI Syariah',
    fullName: 'Bank BNI Syariah',
    code: '427',
    type: 'syariah',
    logo: '☪️',
    color: '#00a651',
    description: 'Sharia-compliant banking services following Islamic principles',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'Sharia Investment'],
    popular: false
  },
  {
    id: 'cimb_niaga',
    name: 'CIMB Niaga',
    fullName: 'CIMB Niaga',
    code: '022',
    type: 'foreign',
    logo: '🔴',
    color: '#d50000',
    description: 'Malaysian-owned bank with strong digital presence in Indonesia',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'International Transfer'],
    popular: true
  },
  {
    id: 'danamon',
    name: 'Danamon',
    fullName: 'Bank Danamon',
    code: '011',
    type: 'private',
    logo: '🟢',
    color: '#00a651',
    description: 'Leading private bank with focus on retail and SME banking',
    services: ['ATM', 'D-Bank Pro', 'Mobile Banking', 'SME Banking'],
    popular: false
  },
  {
    id: 'permata',
    name: 'Permata',
    fullName: 'Bank Permata',
    code: '013',
    type: 'private',
    logo: '💎',
    color: '#8e24aa',
    description: 'Premium banking services with innovative digital solutions',
    services: ['ATM', 'PermataMobile X', 'Internet Banking', 'Investment'],
    popular: false
  },
  {
    id: 'maybank',
    name: 'Maybank',
    fullName: 'Maybank Indonesia',
    code: '016',
    type: 'foreign',
    logo: '🟡',
    color: '#ffab00',
    description: 'Malaysian bank offering comprehensive financial services',
    services: ['ATM', 'Maybank2u', 'Mobile Banking', 'International Banking'],
    popular: false
  },

  // Regional Banks
  {
    id: 'bjb',
    name: 'BJB',
    fullName: 'Bank Jawa Barat dan Banten',
    code: '110',
    type: 'regional',
    logo: '🏛️',
    color: '#1976d2',
    description: 'Regional bank serving West Java and Banten provinces',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'Regional Services'],
    popular: false
  },
  {
    id: 'bank_jatim',
    name: 'Bank Jatim',
    fullName: 'Bank Jawa Timur',
    code: '114',
    type: 'regional',
    logo: '🌊',
    color: '#0288d1',
    description: 'Regional bank focused on East Java development',
    services: ['ATM', 'Internet Banking', 'Mobile Banking', 'UMKM Banking'],
    popular: false
  },

  // Digital Banks
  {
    id: 'jenius',
    name: 'Jenius',
    fullName: 'Bank BTPN Jenius',
    code: '213',
    type: 'private',
    logo: '📱',
    color: '#00bcd4',
    description: 'Digital bank with innovative mobile-first banking experience',
    services: ['Mobile Banking', 'Digital Wallet', 'Investment', 'Savings Goals'],
    popular: true
  },
  {
    id: 'jago',
    name: 'Jago',
    fullName: 'Bank Jago',
    code: '094',
    type: 'private',
    logo: '🚀',
    color: '#2196f3',
    description: 'Digital bank designed for the modern lifestyle',
    services: ['Mobile Banking', 'Digital Pockets', 'Investment', 'Bill Payment'],
    popular: true
  },
  {
    id: 'seabank',
    name: 'SeaBank',
    fullName: 'Bank SeaBank Indonesia',
    code: '535',
    type: 'private',
    logo: '🌊',
    color: '#00acc1',
    description: 'Digital bank by Sea Group with focus on financial inclusion',
    services: ['Mobile Banking', 'Digital Services', 'E-commerce Integration'],
    popular: true
  }
];

export const BANK_TYPES = {
  government: {
    label: 'Government Bank',
    description: 'State-owned banks with government backing',
    color: '#1976d2'
  },
  private: {
    label: 'Private Bank',
    description: 'Privately-owned commercial banks',
    color: '#388e3c'
  },
  regional: {
    label: 'Regional Bank',
    description: 'Regional development banks',
    color: '#f57c00'
  },
  foreign: {
    label: 'Foreign Bank',
    description: 'Foreign-owned banks operating in Indonesia',
    color: '#7b1fa2'
  },
  syariah: {
    label: 'Sharia Bank',
    description: 'Islamic banking following Sharia principles',
    color: '#00796b'
  }
};

// Utility functions
export function getBankById(id: string): Bank | undefined {
  return INDONESIAN_BANKS.find(bank => bank.id === id);
}

export function getBanksByType(type: Bank['type']): Bank[] {
  return INDONESIAN_BANKS.filter(bank => bank.type === type);
}

export function getPopularBanks(): Bank[] {
  return INDONESIAN_BANKS.filter(bank => bank.popular);
}

export function searchBanks(query: string): Bank[] {
  const lowerQuery = query.toLowerCase();
  return INDONESIAN_BANKS.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.fullName.toLowerCase().includes(lowerQuery) ||
    bank.code.includes(query)
  );
}

export function formatBankDisplay(bank: Bank): string {
  return `${bank.logo} ${bank.name} - ${bank.fullName}`;
}

export function getBankTypeColor(type: Bank['type']): string {
  return BANK_TYPES[type]?.color || '#757575';
}