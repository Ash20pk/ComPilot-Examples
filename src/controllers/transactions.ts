import { Request, Response } from 'express';
import { ComPilotService } from '../services/compilot';
import { Transaction } from '../types/transaction';
import { TransactionTracker } from '../services/transactionTracker';

/**
 * Controller handling transaction submissions to ComPilot.
 * This controller:
 * 1. Receives transaction requests from clients
 * 2. Validates and formats transaction data
 * 3. Submits transactions to ComPilot API
 * 4. Returns API responses to clients
 * 
 * Endpoints:
 * - POST /api/transactions: Submit a new transaction
 * 
 * Example request:
 * ```json
 * {
 *   "transactionType": "crypto",
 *   "transactionSubType": "wallet transfer",
 *   "transactionInfo": {
 *     "direction": "IN",
 *     "amount": 0.5,
 *     "currencyCode": "ETH"
 *   }
 * }
 * ```
 */
export class TransactionController {
    /**
     * Handles transaction submission requests.
     * 1. Validates the transaction data
     * 2. Submits to ComPilot API
     * 3. Returns the API response
     * 
     * @param req - Express request containing transaction data
     * @param res - Express response
     * 
     * Success Response:
     * ```json
     * {
     *   "transactionId": "tx_123...",
     *   "status": "pending",
     *   ...other fields
     * }
     * ```
     * 
     * Error Response:
     * ```json
     * {
     *   "error": "Error message"
     * }
     * ```
     */
    static async submitTransaction(req: Request, res: Response) {
        try {
            const transaction: Transaction = req.body;
            const waitForWebhook = req.query.waitForWebhook === 'true';
            const webhookTimeout = req.query.webhookTimeout ? parseInt(req.query.webhookTimeout as string) : 30000;

            console.log('💰 Processing transaction:', {
                type: transaction.transactionType,
                subType: transaction.transactionSubType,
                direction: transaction.transactionInfo.direction,
                amount: transaction.transactionInfo.amount,
                currency: transaction.transactionInfo.currencyCode,
                waitForWebhook
            });

            // Submit transaction to ComPilot API
            const response = await ComPilotService.submitTransaction(transaction);
            console.log('✅ Transaction submitted successfully:', response);

            if (waitForWebhook && response.id) {
                try {
                    console.log(`⏳ Waiting for final status webhook for transaction ${response.id}...`);
                    // Wait for the webhook with final status to be received
                    const webhookResponse = await TransactionTracker.waitForWebhook(response.id, webhookTimeout);
                    
                    // Check if this was a timeout but we're returning the latest webhook anyway
                    if (webhookResponse._timeoutIndicator) {
                        console.log(`⏱️ Timeout reached, but returning latest webhook for ${response.id}:`, webhookResponse);
                        res.status(202).json({
                            initialResponse: response,
                            webhookResponse,
                            webhookStatus: 'timeout_with_partial_data',
                            message: 'Transaction submitted, but final status was not received within the timeout period. Returning latest available status.'
                        });
                    } else {
                        console.log(`✅ Received final status webhook for transaction ${response.id}:`, webhookResponse);
                        // Return both the initial response and the webhook data
                        res.json({
                            initialResponse: response,
                            webhookResponse,
                            webhookStatus: 'final'
                        });
                    }
                } catch (webhookError) {
                    console.error(`⏱️ No webhooks received for transaction ${response.id}:`, webhookError);
                    res.status(202).json({
                        initialResponse: response,
                        webhookStatus: 'timeout_no_data',
                        message: 'Transaction submitted successfully, but no webhook responses were received within the timeout period'
                    });
                }
            } else {
                // Return just the initial response if not waiting for webhook
                res.json(response);
            }
        } catch (error) {
            console.error('❌ Transaction error:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
} 