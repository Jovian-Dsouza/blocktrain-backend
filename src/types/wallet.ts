export interface CreateWalletRequest {
  address: string;
  name?: string;
  description?: string;
}

export interface UpdateWalletRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface WalletResponse {
  id: string;
  address: string;
  name?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: WalletStats;
}

export interface WalletStats {
  totalProfit: number;
  transactionCount: number;
  lastUpdate?: string;
  profitPercentage?: number;
}

export interface DashboardStats {
  totalWallets: number;
  totalProfit: number;
  activeWallets: number;
  totalTransactions: number;
}

export interface WalletSearchQuery {
  query?: string;
  isActive?: boolean;
  minProfit?: number;
  maxProfit?: number;
  limit?: number;
  offset?: number;
}

export interface WalletSearchResponse {
  wallets: WalletResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface WalletTransactionsQuery {
  limit?: number;
  cursor?: string;
  tradeType?: 'BUY' | 'SELL';
}

export interface WalletPerformanceData {
  date: string;
  profit: number;
  transactionCount: number;
}
