
import { BankOffer } from "@/types";

// Internal data that only Rizq has access to - never exposed to banks
export interface InternalBankData {
  bankName: string;
  trustScore: number; // 0-100, based on past performance/disqualifications
  todayWins: number; // Portfolio balance tracking
  commitTimestamp: number; // When the bank locked in their offer
  isPreferredIssuer?: boolean; // Retailer preference flag
}

// Internal bank data - this would typically come from Rizq's database
const INTERNAL_BANK_DATA: Record<string, Omit<InternalBankData, 'bankName'>> = {
  "SNB": {
    trustScore: 85,
    todayWins: 2,
    commitTimestamp: 0, // Will be set dynamically
    isPreferredIssuer: false
  },
  "ANB": {
    trustScore: 78,
    todayWins: 1,
    commitTimestamp: 0, // Will be set dynamically
    isPreferredIssuer: false
  },
  "Rajhi Bank": {
    trustScore: 92,
    todayWins: 0,
    commitTimestamp: 0, // Will be set dynamically
    isPreferredIssuer: false
  },
  "Your Offer (Riyad Bank)": {
    trustScore: 88,
    todayWins: 1,
    commitTimestamp: 0, // Will be set dynamically
    isPreferredIssuer: false
  },
  "Your Previous Offer (Riyad Bank)": {
    trustScore: 88,
    todayWins: 1,
    commitTimestamp: 0, // Will be set dynamically
    isPreferredIssuer: false
  }
};

// Deterministic hash function for final tie-breaking
function generateDeterministicHash(customerId: string, bankName: string): number {
  let hash = 0;
  const str = `${customerId}-${bankName}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export interface TieBreakingResult {
  updatedOffers: BankOffer[];
  auditTrail: string[];
}

export function resolveTieBreaking(
  offers: BankOffer[], 
  customerId: string,
  cobrandPartner?: string
): TieBreakingResult {
  const auditTrail: string[] = [];
  
  // Step 1: Find highest credit limit
  const highestLimit = Math.max(...offers.map(o => o.creditLimit));
  const tiedOffers = offers.filter(offer => offer.creditLimit === highestLimit);
  
  auditTrail.push(`Highest credit limit: ${highestLimit.toLocaleString()}`);
  auditTrail.push(`Banks tied at highest limit: ${tiedOffers.map(o => o.bankName).join(", ")}`);
  
  // If only one offer at highest limit, it wins
  if (tiedOffers.length === 1) {
    const updatedOffers = offers.map(offer => ({
      ...offer,
      isWinner: offer.creditLimit === highestLimit,
      isTied: false
    }));
    
    auditTrail.push(`Clear winner: ${tiedOffers[0].bankName} (unique highest offer)`);
    return { updatedOffers, auditTrail };
  }
  
  // Step 2: Apply tie-breaking cascade
  auditTrail.push("Applying tie-breaking cascade...");
  
  // Get internal data for tied offers
  const tiedWithInternalData = tiedOffers.map(offer => {
    const internalData = INTERNAL_BANK_DATA[offer.bankName];
    return {
      ...offer,
      internal: {
        ...internalData,
        bankName: offer.bankName,
        commitTimestamp: offer.timestamp || Date.now() - Math.random() * 3600000 // Use offer timestamp or generate
      }
    };
  });
  
  // 2a. Earliest commit wins
  const earliestCommit = Math.min(...tiedWithInternalData.map(o => o.internal.commitTimestamp));
  const earliestCommitters = tiedWithInternalData.filter(o => o.internal.commitTimestamp === earliestCommit);
  
  if (earliestCommitters.length === 1) {
    const winner = earliestCommitters[0];
    const updatedOffers = offers.map(offer => ({
      ...offer,
      isWinner: offer.bankName === winner.bankName,
      isTied: false
    }));
    
    const commitTime = new Date(earliestCommit).toLocaleTimeString();
    auditTrail.push(`Winner: ${winner.bankName} (earliest commit time: ${commitTime})`);
    return { updatedOffers, auditTrail };
  }
  
  // 2b. Retailer preference (based on cobrand partnership)
  if (cobrandPartner) {
    // Simple preference logic - in real implementation this would be more sophisticated
    const preferredBanks = earliestCommitters.filter(o => {
      // Example: Amazon cobrand prefers ANB, Jarir prefers SNB
      if (cobrandPartner === "amazon" && o.bankName === "ANB") return true;
      if (cobrandPartner === "jarir" && o.bankName === "SNB") return true;
      return false;
    });
    
    if (preferredBanks.length === 1) {
      const winner = preferredBanks[0];
      const updatedOffers = offers.map(offer => ({
        ...offer,
        isWinner: offer.bankName === winner.bankName,
        isTied: false
      }));
      
      auditTrail.push(`Winner: ${winner.bankName} (retailer preference for ${cobrandPartner} cobrand)`);
      return { updatedOffers, auditTrail };
    }
  }
  
  // 2c. Trust score priority (highest wins)
  const highestTrustScore = Math.max(...earliestCommitters.map(o => o.internal.trustScore));
  const highestTrustOffers = earliestCommitters.filter(o => o.internal.trustScore === highestTrustScore);
  
  if (highestTrustOffers.length === 1) {
    const winner = highestTrustOffers[0];
    const updatedOffers = offers.map(offer => ({
      ...offer,
      isWinner: offer.bankName === winner.bankName,
      isTied: false
    }));
    
    auditTrail.push(`Winner: ${winner.bankName} (highest trust score: ${highestTrustScore})`);
    return { updatedOffers, auditTrail };
  }
  
  // 2d. Portfolio balance (fewest wins today)
  const fewestWins = Math.min(...highestTrustOffers.map(o => o.internal.todayWins));
  const portfolioBalancedOffers = highestTrustOffers.filter(o => o.internal.todayWins === fewestWins);
  
  if (portfolioBalancedOffers.length === 1) {
    const winner = portfolioBalancedOffers[0];
    const updatedOffers = offers.map(offer => ({
      ...offer,
      isWinner: offer.bankName === winner.bankName,
      isTied: false
    }));
    
    auditTrail.push(`Winner: ${winner.bankName} (portfolio balance: ${fewestWins} wins today)`);
    return { updatedOffers, auditTrail };
  }
  
  // 2e. Deterministic hash (final fallback)
  const hashResults = portfolioBalancedOffers.map(offer => ({
    ...offer,
    hash: generateDeterministicHash(customerId, offer.bankName)
  }));
  
  const highestHash = Math.max(...hashResults.map(o => o.hash));
  const winner = hashResults.find(o => o.hash === highestHash)!;
  
  const updatedOffers = offers.map(offer => ({
    ...offer,
    isWinner: offer.bankName === winner.bankName,
    isTied: false
  }));
  
  auditTrail.push(`Winner: ${winner.bankName} (deterministic hash: ${highestHash})`);
  return { updatedOffers, auditTrail };
}
