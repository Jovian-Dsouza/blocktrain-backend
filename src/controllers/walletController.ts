import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { 
  CreateWalletRequest, 
  UpdateWalletRequest, 
  WalletResponse, 
  DashboardStats, 
  WalletSearchQuery, 
  WalletSearchResponse,
  WalletTransactionsQuery,
  WalletPerformanceData
} from '../types/wallet';
import { TradeResponse } from '../types/trade';

// Helper function to calculate wallet stats
const calculateWalletStats = async (walletId: string) => {
  const events = await prisma.event.findMany({
    where: { walletId },
    orderBy: { tradedAt: 'desc' }
  });

  let totalProfit = 0;
  let transactionCount = events.length;
  let lastUpdate = events.length > 0 ? events[0].tradedAt : null;

  // Calculate profit based on BUY/SELL events
  for (const event of events) {
    if (event.tradeType === 'BUY') {
      totalProfit -= (event.amount1 || 0) * (event.priceAt || 0);
    } else if (event.tradeType === 'SELL') {
      totalProfit += (event.amount1 || 0) * (event.priceAt || 0);
    }
  }

  return {
    totalProfit,
    transactionCount,
    lastUpdate: lastUpdate?.toISOString()
  };
};

// GET /api/v1/wallets - Get all tracked wallets
export const getWallets = async (req: Request, res: Response) => {
  try {
    const { includeStats = 'true' } = req.query;
    const shouldIncludeStats = includeStats === 'true';

    const wallets = await prisma.wallet.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const walletResponses: WalletResponse[] = [];

    for (const wallet of wallets) {
      const walletResponse: WalletResponse = {
        id: wallet.id,
        address: wallet.address,
        name: wallet.name || undefined,
        description: wallet.description || undefined,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString()
      };

      if (shouldIncludeStats) {
        walletResponse.stats = await calculateWalletStats(wallet.id);
      }

      walletResponses.push(walletResponse);
    }

    res.json(walletResponses);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/v1/wallets - Add a new wallet
export const createWallet = async (req: Request, res: Response) => {
  try {
    const { address, name, description }: CreateWalletRequest = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'Wallet address is required'
      });
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { address }
    });

    if (existingWallet) {
      return res.status(409).json({
        error: 'Wallet already exists'
      });
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        name,
        description
      }
    });

    const response: WalletResponse = {
      id: wallet.id,
      address: wallet.address,
      name: wallet.name || undefined,
      description: wallet.description || undefined,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/wallets/:id - Get specific wallet
export const getWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeStats = 'true' } = req.query;
    const shouldIncludeStats = includeStats === 'true';

    const wallet = await prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    const response: WalletResponse = {
      id: wallet.id,
      address: wallet.address,
      name: wallet.name || undefined,
      description: wallet.description || undefined,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString()
    };

    if (shouldIncludeStats) {
      response.stats = await calculateWalletStats(wallet.id);
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/v1/wallets/:id - Update wallet
export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive }: UpdateWalletRequest = req.body;

    const wallet = await prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    const response: WalletResponse = {
      id: updatedWallet.id,
      address: updatedWallet.address,
      name: updatedWallet.name || undefined,
      description: updatedWallet.description || undefined,
      isActive: updatedWallet.isActive,
      createdAt: updatedWallet.createdAt.toISOString(),
      updatedAt: updatedWallet.updatedAt.toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/v1/wallets/:id - Delete wallet
export const deleteWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const wallet = await prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    await prisma.wallet.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/dashboard/stats - Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeWallets = await prisma.wallet.count({
      where: { isActive: true }
    });

    const totalWallets = await prisma.wallet.count();

    const totalTransactions = await prisma.event.count();

    // Calculate total profit across all wallets
    const events = await prisma.event.findMany({
      include: { wallet: true }
    });

    let totalProfit = 0;
    for (const event of events) {
      if (event.tradeType === 'BUY') {
        totalProfit -= (event.amount1 || 0) * (event.priceAt || 0);
      } else if (event.tradeType === 'SELL') {
        totalProfit += (event.amount1 || 0) * (event.priceAt || 0);
      }
    }

    const stats: DashboardStats = {
      totalWallets,
      totalProfit,
      activeWallets,
      totalTransactions
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/wallets/search - Search wallets
export const searchWallets = async (req: Request, res: Response) => {
  try {
    const { 
      query = '', 
      isActive, 
      minProfit, 
      maxProfit, 
      limit = 10, 
      offset = 0 
    }: WalletSearchQuery = req.query as any;

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { address: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const wallets = await prisma.wallet.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit)),
      skip: parseInt(String(offset))
    });

    const total = await prisma.wallet.count({ where: whereClause });

    const walletResponses: WalletResponse[] = [];

    for (const wallet of wallets) {
      const stats = await calculateWalletStats(wallet.id);
      
      // Apply profit filters if specified
      if (minProfit !== undefined && stats.totalProfit < minProfit) continue;
      if (maxProfit !== undefined && stats.totalProfit > maxProfit) continue;

      walletResponses.push({
        id: wallet.id,
        address: wallet.address,
        name: wallet.name || undefined,
        description: wallet.description || undefined,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
        stats
      });
    }

    const response: WalletSearchResponse = {
      wallets: walletResponses,
      total,
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset))
    };

    res.json(response);
  } catch (error) {
    console.error('Error searching wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/wallets/:id/transactions - Get wallet transactions
export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 10, cursor, tradeType }: WalletTransactionsQuery = req.query as any;

    const wallet = await prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    const whereClause: any = { walletId: id };

    if (tradeType) {
      whereClause.tradeType = tradeType;
    }

    if (cursor) {
      whereClause.tradedAt = {
        lt: new Date(cursor)
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { tradedAt: 'desc' },
      take: parseInt(String(limit)) + 1
    });

    const hasMore = events.length > parseInt(String(limit));
    const data = events.slice(0, parseInt(String(limit)));

    const transactions: TradeResponse[] = data.map(event => ({
      id: event.id,
      walletAddress: event.walletAddress,
      tokenAddress: event.token1,
      tradeType: event.tradeType as any,
      amount: event.amount1 || 0,
      tradedAt: event.tradedAt.toISOString(),
      priceAt: event.priceAt || undefined
    }));

    res.json({
      limit: parseInt(String(limit)),
      cursor: hasMore ? data[data.length - 1].tradedAt.toISOString() : undefined,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/wallets/:id/performance - Get wallet performance over time
export const getWalletPerformance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const wallet = await prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(String(days)));

    const events = await prisma.event.findMany({
      where: {
        walletId: id,
        tradedAt: {
          gte: startDate
        }
      },
      orderBy: { tradedAt: 'asc' }
    });

    // Group events by date and calculate daily performance
    const dailyPerformance = new Map<string, { profit: number; transactionCount: number }>();

    for (const event of events) {
      const date = event.tradedAt.toISOString().split('T')[0];
      const current = dailyPerformance.get(date) || { profit: 0, transactionCount: 0 };
      
      if (event.tradeType === 'BUY') {
        current.profit -= (event.amount1 || 0) * (event.priceAt || 0);
      } else if (event.tradeType === 'SELL') {
        current.profit += (event.amount1 || 0) * (event.priceAt || 0);
      }
      
      current.transactionCount++;
      dailyPerformance.set(date, current);
    }

    const performanceData: WalletPerformanceData[] = Array.from(dailyPerformance.entries()).map(([date, data]) => ({
      date,
      profit: data.profit,
      transactionCount: data.transactionCount
    }));

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching wallet performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/v1/wallets/export - Export all wallet data
export const exportWallets = async (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    const wallets = await prisma.wallet.findMany({
      where: { isActive: true },
      include: {
        events: {
          orderBy: { tradedAt: 'desc' }
        }
      }
    });

    const exportData = wallets.map(wallet => {
      const stats = calculateWalletStats(wallet.id);
      return {
        id: wallet.id,
        address: wallet.address,
        name: wallet.name,
        description: wallet.description,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt.toISOString(),
        updatedAt: wallet.updatedAt.toISOString(),
        stats,
        transactions: wallet.events.map(event => ({
          id: event.id,
          tokenAddress: event.token1,
          tradeType: event.tradeType,
          amount: event.amount1,
          priceAt: event.priceAt,
          tradedAt: event.tradedAt.toISOString()
        }))
      };
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wallets.csv');
      res.send(csv);
    } else {
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};
