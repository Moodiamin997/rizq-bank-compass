
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
