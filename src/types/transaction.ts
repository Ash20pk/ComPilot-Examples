export type TransactionType = 'crypto' | 'fiat';
export type TransactionSubType = 'wallet transfer' | 'merchant payment' | 'credit card' | 'wire transfer';
export type Direction = 'IN' | 'OUT';
export type PartyType = 'individual' | 'company';

export interface Fees {
    networkFeeAmount?: number;
    platformFeeAmount?: number;
    networkFeeCurrencyCode?: string;
    platformFeeCurrencyCode?: string;
    transactionFeeAmount?: number;
}

export interface Address {
    formatted: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    region?: string | null;
    postalCode?: string | null;
    locality?: string | null;
    country: string | null;
}

export interface TransactionMethod {
    type: 'crypto' | 'card' | 'account';
    accountId: string;
    issuingCountry?: string | null;
    threeDsUsed?: string | null;
    twoFaUsed?: string | null;
}

export interface Institution {
    name?: string;
    code?: string;
    vasp?: string | null;
    address?: Address;
}

export interface Party {
    type: PartyType;
    name: string;
    partyId: string | null;
    address: Address;
    transactionMethod: TransactionMethod;
    institution: Institution;
}

export interface TransactionInfo {
    direction: Direction;
    currencyCode: string;
    blockchain?: string;
    chainId?: string;
    hash?: string;
    customInfos?: string;
    amount: number;
    fees: Fees;
}

export interface Transaction {
    customerId: string;
    externalTransactionId: string;
    transactionDate: string;
    transactionType: TransactionType;
    transactionSubType: TransactionSubType;
    transactionInfo: TransactionInfo;
    originator: Party;
    beneficiary: Party;
}

// Response type for the API
export interface TransactionResponse {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    message?: string;
} 