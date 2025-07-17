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

// New interfaces for dynamic bidding system
export interface EligibilityProfile {
  income_min?: number;
  income_max?: number;
  age_min?: number;
  age_max?: number;
  creditScore_min?: number;
  creditScore_max?: number;
  regions?: string[];
  nationalities?: string[];
  cobrandPartners?: string[];
  debtBurdenRatio_max?: number;
}

export interface WelcomeBid {
  bank_id: string;
  bank_name: string;
  bank_logo?: string;
  bid_amount: number; // SAR 25-500+
  quota_remaining: number;
  eligibility: EligibilityProfile;
  campaign_id?: string;
  expires_at?: number;
  created_at: number;
}

export interface BankPartner {
  id: string;
  name: string;
  logo: string;
  daily_quota: number;
  min_bid: number;
  max_bid: number;
  preferred_segments: string[];
  bidding_strategy: 'conservative' | 'aggressive' | 'balanced';
}

export interface BidResponse {
  winning_bid?: WelcomeBid;
  eligible_bids: WelcomeBid[];
  decision_reason: string;
  audit_trail: string[];
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
  // New bidding system settings
  minWelcomeBalance: number;
  maxWelcomeBalance: number;
  enableDynamicBidding: boolean;
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
  // New bidding system fields
  winningBid?: WelcomeBid;
  biddingAuditTrail?: string[];
}