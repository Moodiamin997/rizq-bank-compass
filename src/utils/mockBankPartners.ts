import { BankPartner, WelcomeBid, Customer, EligibilityProfile } from "@/types";

export const SAUDI_BANK_PARTNERS: BankPartner[] = [
  {
    id: "snb",
    name: "Saudi National Bank",
    logo: "SNB",
    daily_quota: 100,
    min_bid: 25,
    max_bid: 400,
    preferred_segments: ["high_income", "riyadh", "jeddah"],
    bidding_strategy: "aggressive"
  },
  {
    id: "anb",
    name: "Arab National Bank",
    logo: "ANB",
    daily_quota: 80,
    min_bid: 30,
    max_bid: 350,
    preferred_segments: ["mid_income", "dammam", "mecca"],
    bidding_strategy: "balanced"
  },
  {
    id: "rajhi",
    name: "Al Rajhi Bank",
    logo: "RAJHI",
    daily_quota: 120,
    min_bid: 25,
    max_bid: 500,
    preferred_segments: ["conservative", "islamic", "family"],
    bidding_strategy: "conservative"
  },
  {
    id: "alinma",
    name: "Alinma Bank",
    logo: "ALINMA",
    daily_quota: 90,
    min_bid: 35,
    max_bid: 450,
    preferred_segments: ["young_professionals", "tech", "modern"],
    bidding_strategy: "aggressive"
  },
  {
    id: "samba",
    name: "Samba Financial Group",
    logo: "SAMBA",
    daily_quota: 75,
    min_bid: 40,
    max_bid: 600,
    preferred_segments: ["premium", "high_net_worth", "business"],
    bidding_strategy: "aggressive"
  },
  {
    id: "riyadbank",
    name: "Riyad Bank",
    logo: "RIYAD",
    daily_quota: 95,
    min_bid: 25,
    max_bid: 375,
    preferred_segments: ["traditional", "medina", "tabuk"],
    bidding_strategy: "balanced"
  }
];

// Simulate quota usage throughout the day
const getQuotaRemaining = (bank: BankPartner): number => {
  const now = new Date();
  const hoursIntoDay = now.getHours() + (now.getMinutes() / 60);
  const dayProgress = hoursIntoDay / 24;
  
  // Simulate different usage patterns by bank strategy
  let usageRate: number;
  switch (bank.bidding_strategy) {
    case 'aggressive':
      usageRate = 0.7 + (dayProgress * 0.3); // Fast quota usage
      break;
    case 'conservative':
      usageRate = 0.3 + (dayProgress * 0.4); // Steady usage
      break;
    default:
      usageRate = 0.5 + (dayProgress * 0.4); // Balanced usage
  }
  
  const used = Math.floor(bank.daily_quota * usageRate);
  return Math.max(0, bank.daily_quota - used);
};

export const generateWelcomeBids = (customer: Customer): WelcomeBid[] => {
  const bids: WelcomeBid[] = [];
  const now = Date.now();
  
  for (const bank of SAUDI_BANK_PARTNERS) {
    const quotaRemaining = getQuotaRemaining(bank);
    
    // Skip if quota exhausted
    if (quotaRemaining <= 0) continue;
    
    // Check basic eligibility
    if (!isEligibleForBank(customer, bank)) continue;
    
    // Generate bid amount based on customer profile and bank strategy
    const bidAmount = calculateBidAmount(customer, bank);
    
    // Create eligibility profile for this bid
    const eligibility = createEligibilityProfile(bank, customer);
    
    bids.push({
      bank_id: bank.id,
      bank_name: bank.name,
      bank_logo: bank.logo,
      bid_amount: bidAmount,
      quota_remaining: quotaRemaining,
      eligibility,
      campaign_id: `campaign_${bank.id}_${new Date().toISOString().split('T')[0]}`,
      expires_at: now + (24 * 60 * 60 * 1000), // 24 hours
      created_at: now - Math.floor(Math.random() * 3600000) // Random time in last hour
    });
  }
  
  return bids;
};

const isEligibleForBank = (customer: Customer, bank: BankPartner): boolean => {
  // Basic eligibility checks
  if (customer.creditScore < 600) return false;
  if (customer.debtBurdenRatio > 0.5) return false;
  
  // Bank-specific preferences
  switch (bank.id) {
    case 'snb':
      return customer.income >= 8000 && ['Riyadh', 'Jeddah'].includes(customer.location);
    case 'anb':
      return customer.income >= 6000;
    case 'rajhi':
      return customer.nationality === 'Saudi Arabian';
    case 'alinma':
      return customer.age <= 45 && customer.income >= 7000;
    case 'samba':
      return customer.income >= 15000 && customer.creditScore >= 700;
    case 'riyadbank':
      return customer.income >= 5000;
    default:
      return true;
  }
};

const calculateBidAmount = (customer: Customer, bank: BankPartner): number => {
  // Base bid calculation
  let baseBid = bank.min_bid;
  
  // Income-based adjustments
  if (customer.income >= 15000) baseBid += 100;
  else if (customer.income >= 10000) baseBid += 60;
  else if (customer.income >= 7000) baseBid += 30;
  
  // Credit score adjustments
  if (customer.creditScore >= 750) baseBid += 80;
  else if (customer.creditScore >= 700) baseBid += 50;
  else if (customer.creditScore >= 650) baseBid += 25;
  
  // Age adjustments (banks prefer younger customers)
  if (customer.age <= 30) baseBid += 40;
  else if (customer.age <= 40) baseBid += 20;
  
  // Debt burden ratio adjustments
  if (customer.debtBurdenRatio <= 0.2) baseBid += 50;
  else if (customer.debtBurdenRatio <= 0.3) baseBid += 25;
  
  // Location adjustments (premium for major cities)
  if (['Riyadh', 'Jeddah'].includes(customer.location)) baseBid += 30;
  
  // Cobrand partner adjustments
  const premiumPartners = ['jarir', 'amazon', 'extra'];
  if (customer.cobrandPartner && premiumPartners.includes(customer.cobrandPartner)) {
    baseBid += 25;
  }
  
  // Apply bank strategy multiplier
  switch (bank.bidding_strategy) {
    case 'aggressive':
      baseBid *= 1.3;
      break;
    case 'conservative':
      baseBid *= 0.8;
      break;
    default:
      baseBid *= 1.0;
  }
  
  // Add random variation (±20%)
  const variation = 0.8 + (Math.random() * 0.4);
  baseBid *= variation;
  
  // Round to nearest 5 SAR and cap within bank limits
  const roundedBid = Math.round(baseBid / 5) * 5;
  return Math.min(Math.max(roundedBid, bank.min_bid), bank.max_bid);
};

const createEligibilityProfile = (bank: BankPartner, customer: Customer): EligibilityProfile => {
  // Create eligibility criteria based on bank preferences and customer profile
  const eligibility: EligibilityProfile = {};
  
  switch (bank.id) {
    case 'snb':
      eligibility.income_min = 8000;
      eligibility.regions = ['Riyadh', 'Jeddah'];
      eligibility.creditScore_min = 650;
      break;
    case 'anb':
      eligibility.income_min = 6000;
      eligibility.creditScore_min = 600;
      break;
    case 'rajhi':
      eligibility.nationalities = ['Saudi Arabian'];
      eligibility.income_min = 5000;
      break;
    case 'alinma':
      eligibility.age_max = 45;
      eligibility.income_min = 7000;
      eligibility.creditScore_min = 650;
      break;
    case 'samba':
      eligibility.income_min = 15000;
      eligibility.creditScore_min = 700;
      break;
    case 'riyadbank':
      eligibility.income_min = 5000;
      eligibility.debtBurdenRatio_max = 0.4;
      break;
  }
  
  return eligibility;
};

export const getBankById = (bankId: string): BankPartner | undefined => {
  return SAUDI_BANK_PARTNERS.find(bank => bank.id === bankId);
};

export const formatBankDisplay = (bid: WelcomeBid): string => {
  return `${bid.bank_name} - SAR ${bid.bid_amount}`;
};