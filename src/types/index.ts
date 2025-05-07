
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
  nationality: string;
  cobrandPartner?: string; // Added cobrand partner field
}

export interface BankOffer {
  bankName: string;
  creditLimit: number;
  isWinner: boolean;
  isTied?: boolean;
  timestamp?: number;
}

export interface FilterState {
  appliedCard: string;
  ageRange: [number, number];
  location: string;
  creditScoreRange: [number, number];
  incomeLevel: [number, number];
  debtBurdenRatio: [number, number];
  cobrandPartner?: string; // Added cobrand partner filter
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
  cardProduct?: string;
  apr?: number;
  cancelReason?: string;
  cobrandPartner?: string; // Added cobrand partner field
}
