import { Customer, WelcomeBid, BidResponse, EligibilityProfile } from "@/types";
import { generateWelcomeBids } from "./mockBankPartners";

export interface BiddingAuditEntry {
  timestamp: number;
  action: string;
  details: string;
  bankId?: string;
}

export const evaluateWelcomeBalanceBids = (customer: Customer): BidResponse => {
  const auditTrail: string[] = [];
  const timestamp = Date.now();
  
  // Step 1: Retrieve active bids
  auditTrail.push(`[${new Date(timestamp).toISOString()}] Starting bid evaluation for customer ${customer.id}`);
  const allBids = generateWelcomeBids(customer);
  auditTrail.push(`[${new Date().toISOString()}] Retrieved ${allBids.length} active bids from bank partners`);
  
  // Step 2: Filter by eligibility
  const eligibleBids = allBids.filter(bid => isCustomerEligible(customer, bid.eligibility));
  auditTrail.push(`[${new Date().toISOString()}] ${eligibleBids.length} bids passed eligibility criteria`);
  
  // Log filtered out bids
  const filteredOut = allBids.filter(bid => !isCustomerEligible(customer, bid.eligibility));
  filteredOut.forEach(bid => {
    auditTrail.push(`[${new Date().toISOString()}] Filtered out ${bid.bank_name}: Failed eligibility check`);
  });
  
  // Step 3: Check quota availability
  const availableBids = eligibleBids.filter(bid => bid.quota_remaining > 0);
  const quotaExhausted = eligibleBids.filter(bid => bid.quota_remaining <= 0);
  
  quotaExhausted.forEach(bid => {
    auditTrail.push(`[${new Date().toISOString()}] ${bid.bank_name} excluded: Daily quota exhausted`);
  });
  
  auditTrail.push(`[${new Date().toISOString()}] ${availableBids.length} bids have available quota`);
  
  // Step 4: Sort by bid amount (highest first)
  const sortedBids = availableBids.sort((a, b) => b.bid_amount - a.bid_amount);
  
  if (sortedBids.length > 0) {
    sortedBids.forEach((bid, index) => {
      auditTrail.push(`[${new Date().toISOString()}] Rank ${index + 1}: ${bid.bank_name} - SAR ${bid.bid_amount}`);
    });
  }
  
  // Step 5: Select winner
  let winningBid: WelcomeBid | undefined;
  let decisionReason: string;
  
  if (sortedBids.length === 0) {
    decisionReason = "No eligible bids available. Customer may not meet minimum criteria or all bank quotas are exhausted.";
    auditTrail.push(`[${new Date().toISOString()}] RESULT: No winning bid - ${decisionReason}`);
  } else {
    winningBid = sortedBids[0];
    decisionReason = `Highest bid selected: ${winningBid.bank_name} with SAR ${winningBid.bid_amount}`;
    auditTrail.push(`[${new Date().toISOString()}] RESULT: Winner selected - ${winningBid.bank_name} (SAR ${winningBid.bid_amount})`);
    
    // Log competitive landscape
    if (sortedBids.length > 1) {
      const secondHighest = sortedBids[1];
      const margin = winningBid.bid_amount - secondHighest.bid_amount;
      auditTrail.push(`[${new Date().toISOString()}] Winning margin: SAR ${margin} over ${secondHighest.bank_name}`);
    }
  }
  
  // Log customer profile summary for audit
  auditTrail.push(`[${new Date().toISOString()}] Customer Profile: Income=${customer.income}, CreditScore=${customer.creditScore}, Location=${customer.location}, Age=${customer.age}`);
  
  return {
    winning_bid: winningBid,
    eligible_bids: sortedBids,
    decision_reason: decisionReason,
    audit_trail: auditTrail
  };
};

const isCustomerEligible = (customer: Customer, eligibility: EligibilityProfile): boolean => {
  // Income range check
  if (eligibility.income_min && customer.income < eligibility.income_min) return false;
  if (eligibility.income_max && customer.income > eligibility.income_max) return false;
  
  // Age range check
  if (eligibility.age_min && customer.age < eligibility.age_min) return false;
  if (eligibility.age_max && customer.age > eligibility.age_max) return false;
  
  // Credit score check
  if (eligibility.creditScore_min && customer.creditScore < eligibility.creditScore_min) return false;
  if (eligibility.creditScore_max && customer.creditScore > eligibility.creditScore_max) return false;
  
  // Region check
  if (eligibility.regions && !eligibility.regions.includes(customer.location)) return false;
  
  // Nationality check
  if (eligibility.nationalities && !eligibility.nationalities.includes(customer.nationality)) return false;
  
  // Debt burden ratio check
  if (eligibility.debtBurdenRatio_max && customer.debtBurdenRatio > eligibility.debtBurdenRatio_max) return false;
  
  // Cobrand partner check
  if (eligibility.cobrandPartners && customer.cobrandPartner && !eligibility.cobrandPartners.includes(customer.cobrandPartner)) return false;
  
  return true;
};

export const formatWelcomeBalanceOffer = (bid: WelcomeBid): string => {
  return `Offer Welcome Balance – SAR ${bid.bid_amount.toLocaleString()}`;
};

export const formatBankTooltip = (bid: WelcomeBid): string => {
  return `This is a one-time cash incentive of SAR ${bid.bid_amount.toLocaleString()}, funded by ${bid.bank_name}, deposited directly into the cardholder's account upon activation.`;
};

export const simulateQuotaDepletion = (bid: WelcomeBid): WelcomeBid => {
  return {
    ...bid,
    quota_remaining: Math.max(0, bid.quota_remaining - 1)
  };
};

export const generateBiddingReport = (responses: BidResponse[]): string => {
  const totalBids = responses.reduce((acc, response) => acc + response.eligible_bids.length, 0);
  const winners = responses.filter(response => response.winning_bid).length;
  const averageBid = responses
    .filter(response => response.winning_bid)
    .reduce((acc, response) => acc + response.winning_bid!.bid_amount, 0) / winners;
  
  return `Bidding Summary: ${totalBids} total bids, ${winners} winners, Average winning bid: SAR ${averageBid.toFixed(2)}`;
};