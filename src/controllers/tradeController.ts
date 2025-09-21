import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateTradeRequest, TradeResponse, RecentTradesQuery, RecentTradesResponse } from '../types/trade';
import { NotificationService } from '../services/notificationService';

// Global notification service instance
let notificationService: NotificationService | null = null;

export const setNotificationService = (service: NotificationService) => {
  notificationService = service;
};

export const createTrade = async (req: Request, res: Response) => {
  try {
    const { walletAddress, tokenAddress, tradeType, amount, tradedAt, priceAt }: CreateTradeRequest = req.body;

    // Validate required fields
    if (!walletAddress || !tokenAddress || !tradeType || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: walletAddress, tokenAddress, tradeType, amount'
      });
    }

    // Validate tradeType
    if (!['BUY', 'SELL'].includes(tradeType)) {
      return res.status(400).json({
        error: 'Invalid tradeType. Must be BUY or SELL'
      });
    }

    // Check if wallet is tracked
    const trackedWallet = await prisma.wallet.findUnique({
      where: { address: walletAddress }
    });

    // Create trade event
    const event = await prisma.event.create({
      data: {
        walletAddress,
        walletId: trackedWallet?.id || null,
        token1: tokenAddress,
        amount1: amount,
        token2: '', // Not used in current API but required by schema
        amount2: null,
        tradeType: tradeType as any,
        priceAt: priceAt || null,
        tradedAt: tradedAt ? new Date(tradedAt) : new Date()
      }
    });

    const response: TradeResponse = {
      id: event.id,
      walletAddress: event.walletAddress,
      tokenAddress: event.token1,
      tradeType: event.tradeType as any,
      amount: event.amount1 || 0,
      tradedAt: event.tradedAt.toISOString(),
      priceAt: event.priceAt || undefined
    };

    // Trigger notification asynchronously
    if (notificationService) {
      notificationService.processNewEvent(event.id).catch(error => {
        console.error('Error processing notification:', error);
      });
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecentTrades = async (req: Request, res: Response) => {
  try {
    const { walletAddress, limit = 5, cursor }: RecentTradesQuery = req.query as any;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'walletAddress is required'
      });
    }

    const limitNum = Math.min(parseInt(String(limit)) || 5, 100); // Max 100 results

    const whereClause: any = {
      walletAddress
    };

    if (cursor) {
      whereClause.tradedAt = {
        lt: new Date(cursor)
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        tradedAt: 'desc'
      },
      take: limitNum + 1 // Get one extra to check if there are more results
    });

    const hasMore = events.length > limitNum;
    const data = events.slice(0, limitNum);

    const response: RecentTradesResponse = {
      limit: limitNum,
      cursor: hasMore ? data[data.length - 1].tradedAt.toISOString() : undefined,
      data: data.map(event => ({
        id: event.id,
        walletAddress: event.walletAddress,
        tokenAddress: event.token1,
        tradeType: event.tradeType as any,
        amount: event.amount1 || 0,
        tradedAt: event.tradedAt.toISOString(),
        priceAt: event.priceAt || undefined
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
