import { Router } from 'express';
import { TransactionController } from '../controllers/transactions';

/**
 * Transaction routes for the ComPilot Transaction Monitoring System.
 * Handles all transaction-related endpoints.
 * 
 * Available Routes:
 * - POST /: Submit a new transaction to ComPilot
 *   - Request body should contain transaction details
 *   - Returns transaction response from ComPilot API
 * 
 * Future Routes (commented out):
 * - GET /:id: Get transaction status (to be implemented)
 * 
 * Note: These routes are mounted at /api/transactions in index.ts
 * So the full path would be /api/transactions/
 */
const router = Router();

router.post('/', TransactionController.submitTransaction);
// router.get('/:id', TransactionController.getTransactionStatus);

export const transactionRoutes = router; 