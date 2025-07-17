
export interface Customer {
  id: string;
  name: string;
  age: number;
  location: string;
  income: number;
  creditScore: number;
  debtBurdenRatio: number;
  appliedCard: string;  // This remains as the card type (Visa Signature, etc.)
  applicationTime?: number; // Timestamp when the application was submitted
  nationality: string;
  cobrandPartner?: string; // Cobrand partner field (Jarir, Amazon, etc.)
}

export interface BankOffer {
  bankName: string;
  welcomeBalance: number;
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
  cobrandPartner?: string; // Cobrand partner filter
  sortByApplicationTime: string; // Sort by application time
}

export interface SettingsState {
  prioritizeLowestDTI: boolean;
  minCreditScore: number;
  maxDebtBurdenRatio: number;
  defaultWelcomeBalance: number;
}

export interface CreditOfferHistory {
  id: string;
  customerName: string;
  customerLocation: string;
  timestamp: number;
  welcomeBalance: number;
  status: "won" | "lost" | "pending" | "issued" | "cancelled";
  competingBank?: string;
  cardProduct?: string;
  apr?: number;
  cancelReason?: string;
  cobrandPartner?: string;
  competingOffers?: BankOffer[];
  auditTrail?: string[];
  // Store original customer financial data
  customerIncome?: number;
  customerCreditScore?: number;
  customerDebtBurdenRatio?: number;
  customerAge?: number;
  customerNationality?: string;
  // Add validation metadata for audit purposes
  validationResult?: {
    riskLevel: "conservative" | "standard" | "aggressive" | "outlier";
    multiplier: number;
    isValid: boolean;
    message: string;
  };
}
