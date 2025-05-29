"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRoutes = void 0;
const express_1 = require("express");
const transactions_1 = require("../controllers/transactions");
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
const router = (0, express_1.Router)();
router.post('/', transactions_1.TransactionController.submitTransaction);
// router.get('/:id', TransactionController.getTransactionStatus);
exports.transactionRoutes = router;
