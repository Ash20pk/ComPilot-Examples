"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTracker = void 0;
/**
 * Service for tracking pending transactions and their corresponding webhooks.
 * This enables synchronous request-response patterns with asynchronous webhooks.
 */
class TransactionTracker {
    /**
     * Checks if a transaction status is considered final (no longer pending)
     *
     * @param status - The transaction status to check
     * @returns boolean - Whether the status is final
     */
    static isFinalStatus(status) {
        if (!status)
            return false;
        return this.finalStatuses.includes(status.toLowerCase());
    }
    /**
     * Registers a new transaction and returns a promise that will resolve
     * when the final webhook (with non-pending status) is received.
     *
     * @param transactionId - The ID of the transaction to track
     * @param timeoutMs - Timeout in milliseconds (default: 60 seconds)
     * @returns Promise that resolves with the final webhook data or rejects on timeout
     */
    static waitForWebhook(transactionId, timeoutMs = 60000) {
        // If there's already a pending transaction with this ID, clear it
        if (this.pendingTransactions.has(transactionId)) {
            const existing = this.pendingTransactions.get(transactionId);
            if (existing) {
                clearTimeout(existing.timeout);
                existing.reject(new Error('Transaction tracking was reset'));
                this.pendingTransactions.delete(transactionId);
            }
        }
        return new Promise((resolve, reject) => {
            // Set a timeout to reject the promise if no final webhook is received
            const timeout = setTimeout(() => {
                if (this.pendingTransactions.has(transactionId)) {
                    const pendingData = this.pendingTransactions.get(transactionId);
                    const webhookHistory = pendingData?.webhookHistory || [];
                    this.pendingTransactions.delete(transactionId);
                    // If we have at least one webhook, return the latest one with a timeout indicator
                    if (webhookHistory.length > 0) {
                        const latestWebhook = webhookHistory[webhookHistory.length - 1];
                        latestWebhook._timeoutIndicator = true;
                        resolve(latestWebhook);
                    }
                    else {
                        reject(new Error(`Webhook timeout for transaction ${transactionId}`));
                    }
                }
            }, timeoutMs);
            // Store the promise resolvers, timeout, and initialize webhook history
            this.pendingTransactions.set(transactionId, {
                resolve,
                reject,
                timeout,
                webhookHistory: []
            });
            console.log(`🔍 Waiting for final status webhook for transaction: ${transactionId}`);
        });
    }
    /**
     * Processes a webhook for a pending transaction. If the webhook contains a final status,
     * the transaction is resolved. Otherwise, the webhook is stored in history and we continue waiting.
     *
     * @param transactionId - The ID of the transaction that received a webhook
     * @param webhookData - The webhook data received
     * @returns boolean - Whether a pending transaction was found
     */
    static resolveWebhook(transactionId, webhookData) {
        const pending = this.pendingTransactions.get(transactionId);
        if (pending) {
            // Get the transaction status from the webhook payload
            const status = webhookData.payload?.status;
            console.log(`📥 Received webhook for transaction ${transactionId} with status: ${status}`);
            // Add this webhook to the history
            pending.webhookHistory.push(webhookData);
            // If this is a final status, resolve the promise
            if (this.isFinalStatus(status)) {
                console.log(`✅ Final status received for transaction: ${transactionId}`);
                clearTimeout(pending.timeout);
                pending.resolve(webhookData);
                this.pendingTransactions.delete(transactionId);
                return true;
            }
            console.log(`⏳ Status ${status} is not final, continuing to wait for transaction: ${transactionId}`);
            return true;
        }
        console.log(`⚠️ No pending transaction found for webhook: ${transactionId}`);
        return false;
    }
}
exports.TransactionTracker = TransactionTracker;
TransactionTracker.pendingTransactions = new Map();
// List of final statuses that indicate a transaction is no longer pending
TransactionTracker.finalStatuses = ['approved', 'declined', 'rejected', 'failed', 'completed'];
