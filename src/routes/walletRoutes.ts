import { Router } from 'express';
import {
  getWallets,
  createWallet,
  getWallet,
  updateWallet,
  deleteWallet,
  getDashboardStats,
  searchWallets,
  getWalletTransactions,
  getWalletPerformance,
  exportWallets
} from '../controllers/walletController';

const router = Router();

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Wallet CRUD operations
router.get('/wallets', getWallets);
router.post('/wallets', createWallet);
router.get('/wallets/:id', getWallet);
router.put('/wallets/:id', updateWallet);
router.delete('/wallets/:id', deleteWallet);

// Wallet search and filtering
router.get('/wallets/search', searchWallets);

// Wallet-specific data
router.get('/wallets/:id/transactions', getWalletTransactions);
router.get('/wallets/:id/performance', getWalletPerformance);

// Export functionality
router.get('/wallets/export', exportWallets);

export { router as walletRoutes };
