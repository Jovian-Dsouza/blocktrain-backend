export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface CreateTradeRequest {
  walletAddress: string;
  tokenAddress: string;
  tradeType: TradeType;
  amount: number;
  tradedAt?: string;
  priceAt?: number;
}

export interface TradeResponse {
  id: string;
  walletAddress: string;
  tokenAddress: string;
  tradeType: TradeType;
  amount: number;
  tradedAt: string;
  priceAt?: number;
}

export interface RecentTradesResponse {
  limit: number;
  cursor?: string;
  data: TradeResponse[];
}

export interface RecentTradesQuery {
  walletAddress: string;
  limit?: number;
  cursor?: string;
}
