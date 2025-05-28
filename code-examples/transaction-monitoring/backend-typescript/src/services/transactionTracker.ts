/**
 * Service for tracking pending transactions and their corresponding webhooks.
 * This enables synchronous request-response patterns with asynchronous webhooks.
 */
export class TransactionTracker {
  private static pendingTransactions: Map<string, {
    resolve: (data: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  /**
   * Registers a new transaction and returns a promise that will resolve
   * when the corresponding webhook is received.
   * 
   * @param transactionId - The ID of the transaction to track
   * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
   * @returns Promise that resolves with the webhook data or rejects on timeout
   */
  static waitForWebhook(transactionId: string, timeoutMs: number = 30000): Promise<any> {
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
      // Set a timeout to reject the promise if no webhook is received
      const timeout = setTimeout(() => {
        if (this.pendingTransactions.has(transactionId)) {
          this.pendingTransactions.delete(transactionId);
          reject(new Error(`Webhook timeout for transaction ${transactionId}`));
        }
      }, timeoutMs);

      // Store the promise resolvers and timeout
      this.pendingTransactions.set(transactionId, { resolve, reject, timeout });
      console.log(`🔍 Waiting for webhook for transaction: ${transactionId}`);
    });
  }

  /**
   * Resolves a pending transaction when a webhook is received.
   * 
   * @param transactionId - The ID of the transaction that received a webhook
   * @param webhookData - The webhook data to resolve with
   * @returns boolean - Whether a pending transaction was found and resolved
   */
  static resolveWebhook(transactionId: string, webhookData: any): boolean {
    const pending = this.pendingTransactions.get(transactionId);
    
    if (pending) {
      console.log(`✅ Received webhook for transaction: ${transactionId}`);
      clearTimeout(pending.timeout);
      pending.resolve(webhookData);
      this.pendingTransactions.delete(transactionId);
      return true;
    }
    
    console.log(`⚠️ No pending transaction found for webhook: ${transactionId}`);
    return false;
  }
}
