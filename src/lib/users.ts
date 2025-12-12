import { writable } from 'svelte/store';
import { getBankById } from './banks';

export interface TransferUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profilePicture?: string;
  preferredBank?: {
    bankId: string;
    accountNumber: string;
    accountHolder: string;
  };
  isOnline: boolean;
  lastSeen: Date;
  joinedDate: Date;
  transferHistory?: {
    totalTransfers: number;
    lastTransfer: Date | null;
  };
}

// Mock data for other users in the system
const MOCK_USERS: TransferUser[] = [
  {
    id: 'user_001',
    email: 'john.doe@gmail.com',
    fullName: 'John Doe',
    phone: '+62812-3456-7890',
    profilePicture: '👨‍💼',
    preferredBank: {
      bankId: 'bca',
      accountNumber: '1234567890',
      accountHolder: 'JOHN DOE'
    },
    isOnline: true,
    lastSeen: new Date(),
    joinedDate: new Date('2023-06-15'),
    transferHistory: {
      totalTransfers: 15,
      lastTransfer: new Date('2024-01-10')
    }
  },
  {
    id: 'user_002',
    email: 'sarah.smith@gmail.com',
    fullName: 'Sarah Smith',
    phone: '+62813-9876-5432',
    profilePicture: '👩‍💻',
    preferredBank: {
      bankId: 'mandiri',
      accountNumber: '0987654321',
      accountHolder: 'SARAH SMITH'
    },
    isOnline: false,
    lastSeen: new Date('2024-01-14'),
    joinedDate: new Date('2023-08-20'),
    transferHistory: {
      totalTransfers: 8,
      lastTransfer: new Date('2024-01-12')
    }
  },
  {
    id: 'user_003',
    email: 'michael.johnson@gmail.com',
    fullName: 'Michael Johnson',
    phone: '+62814-1111-2222',
    profilePicture: '👨‍🎓',
    preferredBank: {
      bankId: 'bni',
      accountNumber: '5555666677',
      accountHolder: 'MICHAEL JOHNSON'
    },
    isOnline: true,
    lastSeen: new Date(),
    joinedDate: new Date('2023-04-10'),
    transferHistory: {
      totalTransfers: 22,
      lastTransfer: new Date('2024-01-13')
    }
  },
  {
    id: 'user_004',
    email: 'lisa.wong@gmail.com',
    fullName: 'Lisa Wong',
    phone: '+62815-3333-4444',
    profilePicture: '👩‍🔬',
    preferredBank: {
      bankId: 'bri',
      accountNumber: '9999888877',
      accountHolder: 'LISA WONG'
    },
    isOnline: false,
    lastSeen: new Date('2024-01-13'),
    joinedDate: new Date('2023-09-05'),
    transferHistory: {
      totalTransfers: 5,
      lastTransfer: new Date('2024-01-08')
    }
  },
  {
    id: 'user_005',
    email: 'david.chen@gmail.com',
    fullName: 'David Chen',
    phone: '+62816-5555-6666',
    profilePicture: '👨‍🎨',
    preferredBank: {
      bankId: 'cimb',
      accountNumber: '7777999988',
      accountHolder: 'DAVID CHEN'
    },
    isOnline: true,
    lastSeen: new Date(),
    joinedDate: new Date('2023-07-12'),
    transferHistory: {
      totalTransfers: 12,
      lastTransfer: new Date('2024-01-11')
    }
  },
  {
    id: 'user_006',
    email: 'anna.martinez@gmail.com',
    fullName: 'Anna Martinez',
    phone: '+62817-7777-8888',
    profilePicture: '👩‍🏫',
    preferredBank: {
      bankId: 'danamon',
      accountNumber: '1111222233',
      accountHolder: 'ANNA MARTINEZ'
    },
    isOnline: false,
    lastSeen: new Date('2024-01-12'),
    joinedDate: new Date('2023-05-30'),
    transferHistory: {
      totalTransfers: 18,
      lastTransfer: new Date('2024-01-09')
    }
  }
];

// Store for managing users
export const usersStore = writable<TransferUser[]>(MOCK_USERS);

// User management service
export class UserService {
  private static instance: UserService;
  private users: TransferUser[] = MOCK_USERS;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Get all users except current user
  getAllUsers(excludeUserId?: string): TransferUser[] {
    return this.users.filter(user => user.id !== excludeUserId);
  }

  // Get user by ID
  getUserById(userId: string): TransferUser | undefined {
    return this.users.find(user => user.id === userId);
  }

  // Search users by name or email
  searchUsers(query: string, excludeUserId?: string): TransferUser[] {
    if (!query.trim()) {
      return this.getAllUsers(excludeUserId);
    }

    const searchQuery = query.toLowerCase();
    return this.users.filter(user => 
      user.id !== excludeUserId && (
        user.fullName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery) ||
        user.phone.includes(searchQuery)
      )
    );
  }

  // Get online users
  getOnlineUsers(excludeUserId?: string): TransferUser[] {
    return this.users.filter(user => 
      user.id !== excludeUserId && user.isOnline
    );
  }

  // Get recent users (users with recent transfers)
  getRecentUsers(excludeUserId?: string, limit: number = 5): TransferUser[] {
    return this.users
      .filter(user => user.id !== excludeUserId && user.transferHistory?.lastTransfer)
      .sort((a, b) => {
        const aDate = a.transferHistory?.lastTransfer || new Date(0);
        const bDate = b.transferHistory?.lastTransfer || new Date(0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, limit);
  }

  // Add transfer record (for updating transfer history)
  recordTransfer(userId: string): void {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.transferHistory) {
        user.transferHistory = { totalTransfers: 0, lastTransfer: null };
      }
      user.transferHistory.totalTransfers++;
      user.transferHistory.lastTransfer = new Date();
      
      // Update the store
      usersStore.update(users => 
        users.map(u => u.id === userId ? user : u)
      );
    }
  }

  // Format user display info
  formatUserInfo(user: TransferUser): {
    displayName: string;
    bankInfo: string | null;
    statusIndicator: string;
  } {
    const bank = user.preferredBank ? getBankById(user.preferredBank.bankId) : null;
    
    return {
      displayName: user.fullName,
      bankInfo: bank ? `${bank.name} • ${user.preferredBank?.accountNumber}` : null,
      statusIndicator: user.isOnline ? '🟢' : '⚫'
    };
  }

  // Check if user can receive transfers
  canReceiveTransfer(user: TransferUser): boolean {
    return !!(user.preferredBank?.bankId && user.preferredBank?.accountNumber);
  }
}

// Export singleton instance
export const userService = UserService.getInstance();

// Helper functions
export function formatLastSeen(date: Date): string {
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

export function formatMemberSince(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}