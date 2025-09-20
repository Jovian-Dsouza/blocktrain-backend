import { Router } from 'express';
import { createTrade, getRecentTrades } from '../controllers/tradeController';

const router = Router();

// POST /api/v1/trade
router.post('/trade', createTrade);

// GET /api/v1/recent-trades
router.get('/recent-trades', getRecentTrades);

export { router as tradeRoutes };
