

export interface Customer {
  id: string;
  name: string;
  age: number;
  location: string;
  income: number;
  creditScore: number;
  debtBurdenRatio: number;
  appliedCard: string;
  applicationTime?: number; // Timestamp when the application was submitted
  nationality: string; // Added nationality field
}

export interface BankOffer {
  bankName: string;
  creditLimit: number;
  isWinner: boolean;
  isTied?: boolean; // Adding the isTied property
  timestamp?: number; // When the offer was made
}

export interface FilterState {
  appliedCard: string;
  ageRange: [number, number];
  location: string;
  creditScoreRange: [number, number];
  incomeLevel: [number, number];
  debtBurdenRatio: [number, number];
}

export interface SettingsState {
  prioritizeLowestDTI: boolean;
  minCreditScore: number;
  maxDebtBurdenRatio: number;
  defaultCreditLimit: number;
}

export interface CreditOfferHistory {
  id: string;
  customerName: string;
  customerLocation: string;
  timestamp: number;
  creditLimit: number;
  status: "won" | "lost" | "pending" | "issued" | "cancelled";
  competingBank?: string;
  cardProduct?: string; // Added card product field
  apr?: number; // Added APR field
  cancelReason?: string; // Added reason for cancellation
}

