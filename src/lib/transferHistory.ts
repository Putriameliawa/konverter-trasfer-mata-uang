import { writable } from 'svelte/store';
import { userService } from './users';

export interface TransferRecord {
  id: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'conversion';
  status: 'completed' | 'pending' | 'failed';
  
  // Amount details
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  exchangeRate: number;
  
  // User details
  fromUserId?: string;
  toUserId?: string;
  fromUserName?: string;
  toUserName?: string;
  
  // Transaction details
  transactionId: string;
  method: 'hand_gesture' | 'biometric' | 'standard';
  notes?: string;
  
  // Fees and charges
  fee?: number;
  feeCurrency?: string;
  
  // Location and device (optional)
  location?: string;
  device?: string;
}

// Mock transfer history data
const MOCK_HISTORY: TransferRecord[] = [
  {
    id: 'txn_001',
    timestamp: new Date('2024-01-15T10:30:00'),
    type: 'sent',
    status: 'completed',
    fromAmount: 1000000,
    fromCurrency: 'IDR',
    toAmount: 66.67,
    toCurrency: 'USD',
    exchangeRate: 15000,
    fromUserId: 'current_user',
    toUserId: 'user_001',
    fromUserName: 'You',
    toUserName: 'John Doe',
    transactionId: 'TXN20240115103000',
    method: 'hand_gesture',
    notes: 'Payment for services',
    fee: 2500,
    feeCurrency: 'IDR'
  },
  {
    id: 'txn_002',
    timestamp: new Date('2024-01-14T15:45:00'),
    type: 'received',
    status: 'completed',
    fromAmount: 50,
    fromCurrency: 'USD',
    toAmount: 750000,
    toCurrency: 'IDR',
    exchangeRate: 15000,
    fromUserId: 'user_002',
    toUserId: 'current_user',
    fromUserName: 'Sarah Smith',
    toUserName: 'You',
    transactionId: 'TXN20240114154500',
    method: 'hand_gesture',
    notes: 'Freelance payment'
  },
  {
    id: 'txn_003',
    timestamp: new Date('2024-01-13T09:15:00'),
    type: 'conversion',
    status: 'completed',
    fromAmount: 100,
    fromCurrency: 'EUR',
    toAmount: 108.50,
    toCurrency: 'USD',
    exchangeRate: 1.085,
    transactionId: 'TXN20240113091500',
    method: 'standard',
    notes: 'Currency conversion for travel'
  },
  {
    id: 'txn_004',
    timestamp: new Date('2024-01-12T14:20:00'),
    type: 'sent',
    status: 'completed',
    fromAmount: 2000000,
    fromCurrency: 'IDR',
    toAmount: 133.33,
    toCurrency: 'USD',
    exchangeRate: 15000,
    fromUserId: 'current_user',
    toUserId: 'user_003',
    fromUserName: 'You',
    toUserName: 'Michael Johnson',
    transactionId: 'TXN20240112142000',
    method: 'biometric',
    notes: 'Investment contribution',
    fee: 5000,
    feeCurrency: 'IDR'
  },
  {
    id: 'txn_005',
    timestamp: new Date('2024-01-11T11:10:00'),
    type: 'received',
    status: 'completed',
    fromAmount: 25,
    fromCurrency: 'USD',
    toAmount: 375000,
    toCurrency: 'IDR',
    exchangeRate: 15000,
    fromUserId: 'user_004',
    toUserId: 'current_user',
    fromUserName: 'Lisa Wong',
    toUserName: 'You',
    transactionId: 'TXN20240111111000',
    method: 'hand_gesture',
    notes: 'Lunch money'
  },
  {
    id: 'txn_006',
    timestamp: new Date('2024-01-10T16:30:00'),
    type: 'sent',
    status: 'failed',
    fromAmount: 500000,
    fromCurrency: 'IDR',
    toAmount: 33.33,
    toCurrency: 'USD',
    exchangeRate: 15000,
    fromUserId: 'current_user',
    toUserId: 'user_005',
    fromUserName: 'You',
    toUserName: 'David Chen',
    transactionId: 'TXN20240110163000',
    method: 'hand_gesture',
    notes: 'Payment failed due to network error'
  },
  {
    id: 'txn_007',
    timestamp: new Date('2024-01-09T13:45:00'),
    type: 'conversion',
    status: 'completed',
    fromAmount: 1000,
    fromCurrency: 'JPY',
    toAmount: 6.67,
    toCurrency: 'USD',
    exchangeRate: 150,
    transactionId: 'TXN20240109134500',
    method: 'standard',
    notes: 'Travel money conversion'
  }
];

// Transfer history store
export const transferHistoryStore = writable<TransferRecord[]>(MOCK_HISTORY);

// Transfer history service
export class TransferHistoryService {
  private static instance: TransferHistoryService;
  private history: TransferRecord[] = [...MOCK_HISTORY];

  static getInstance(): TransferHistoryService {
    if (!TransferHistoryService.instance) {
      TransferHistoryService.instance = new TransferHistoryService();
    }
    return TransferHistoryService.instance;
  }

  // Add new transfer record
  addTransfer(transfer: Omit<TransferRecord, 'id' | 'timestamp' | 'transactionId'>): TransferRecord {
    const newTransfer: TransferRecord = {
      ...transfer,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };

    this.history.unshift(newTransfer); // Add to beginning for newest first
    this.updateStore();
    
    return newTransfer;
  }

  // Get all transfers
  getAllTransfers(userId?: string): TransferRecord[] {
    if (!userId) return this.history;
    
    return this.history.filter(transfer => 
      transfer.fromUserId === userId || transfer.toUserId === userId
    );
  }

  // Get transfers by type
  getTransfersByType(type: TransferRecord['type'], userId?: string): TransferRecord[] {
    const userTransfers = this.getAllTransfers(userId);
    return userTransfers.filter(transfer => transfer.type === type);
  }

  // Get transfers by status
  getTransfersByStatus(status: TransferRecord['status'], userId?: string): TransferRecord[] {
    const userTransfers = this.getAllTransfers(userId);
    return userTransfers.filter(transfer => transfer.status === status);
  }

  // Get transfers by date range
  getTransfersByDateRange(startDate: Date, endDate: Date, userId?: string): TransferRecord[] {
    const userTransfers = this.getAllTransfers(userId);
    return userTransfers.filter(transfer => 
      transfer.timestamp >= startDate && transfer.timestamp <= endDate
    );
  }

  // Get recent transfers
  getRecentTransfers(limit: number = 10, userId?: string): TransferRecord[] {
    const userTransfers = this.getAllTransfers(userId);
    return userTransfers.slice(0, limit);
  }

  // Search transfers
  searchTransfers(query: string, userId?: string): TransferRecord[] {
    if (!query.trim()) return this.getAllTransfers(userId);
    
    const searchQuery = query.toLowerCase();
    const userTransfers = this.getAllTransfers(userId);
    
    return userTransfers.filter(transfer => 
      transfer.toUserName?.toLowerCase().includes(searchQuery) ||
      transfer.fromUserName?.toLowerCase().includes(searchQuery) ||
      transfer.notes?.toLowerCase().includes(searchQuery) ||
      transfer.transactionId.toLowerCase().includes(searchQuery) ||
      transfer.fromCurrency.toLowerCase().includes(searchQuery) ||
      transfer.toCurrency.toLowerCase().includes(searchQuery)
    );
  }

  // Get transfer statistics
  getTransferStats(userId?: string): {
    totalTransfers: number;
    totalSent: number;
    totalReceived: number;
    totalConversions: number;
    completedTransfers: number;
    failedTransfers: number;
    totalVolume: { [currency: string]: number };
  } {
    const userTransfers = this.getAllTransfers(userId);
    
    const stats = {
      totalTransfers: userTransfers.length,
      totalSent: userTransfers.filter(t => t.type === 'sent').length,
      totalReceived: userTransfers.filter(t => t.type === 'received').length,
      totalConversions: userTransfers.filter(t => t.type === 'conversion').length,
      completedTransfers: userTransfers.filter(t => t.status === 'completed').length,
      failedTransfers: userTransfers.filter(t => t.status === 'failed').length,
      totalVolume: {} as { [currency: string]: number }
    };

    // Calculate total volume by currency
    userTransfers.forEach(transfer => {
      if (transfer.status === 'completed') {
        if (!stats.totalVolume[transfer.fromCurrency]) {
          stats.totalVolume[transfer.fromCurrency] = 0;
        }
        if (!stats.totalVolume[transfer.toCurrency]) {
          stats.totalVolume[transfer.toCurrency] = 0;
        }
        
        if (transfer.type === 'sent' || transfer.type === 'conversion') {
          stats.totalVolume[transfer.fromCurrency] += transfer.fromAmount;
        }
        if (transfer.type === 'received' || transfer.type === 'conversion') {
          stats.totalVolume[transfer.toCurrency] += transfer.toAmount;
        }
      }
    });

    return stats;
  }

  // Update transfer status
  updateTransferStatus(transferId: string, status: TransferRecord['status']): boolean {
    const transferIndex = this.history.findIndex(t => t.id === transferId);
    if (transferIndex !== -1) {
      this.history[transferIndex].status = status;
      this.updateStore();
      return true;
    }
    return false;
  }

  // Get transfer by ID
  getTransferById(transferId: string): TransferRecord | undefined {
    return this.history.find(t => t.id === transferId);
  }

  // Update store
  private updateStore(): void {
    transferHistoryStore.set([...this.history]);
  }

  // Format currency display
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IDR' || currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' || currency === 'JPY' ? 0 : 2
    }).format(amount);
  }

  // Format relative time
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const transferHistoryService = TransferHistoryService.getInstance();

// Helper function to create transfer record for completed transfers
export function createTransferRecord(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  convertedAmount: number,
  exchangeRate: number,
  selectedUser?: any,
  method: TransferRecord['method'] = 'hand_gesture',
  notes?: string
): Omit<TransferRecord, 'id' | 'timestamp' | 'transactionId'> {
  if (selectedUser) {
    // Transfer to another user
    return {
      type: 'sent',
      status: 'completed',
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      exchangeRate,
      fromUserId: 'current_user',
      toUserId: selectedUser.id,
      fromUserName: 'You',
      toUserName: selectedUser.fullName,
      method,
      notes,
      fee: method === 'hand_gesture' ? 2500 : 5000,
      feeCurrency: 'IDR'
    };
  } else {
    // Simple currency conversion
    return {
      type: 'conversion',
      status: 'completed',
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      exchangeRate,
      method,
      notes: notes || 'Currency conversion'
    };
  }
}