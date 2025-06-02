
export interface CardTierConfig {
  name: string;
  network: "Visa" | "Mastercard";
  minMonthlyIncome: number;
  multiplierRange: [number, number]; // [min, max] multiplier of monthly salary
  description: string;
}

export const CARD_TIERS: Record<string, CardTierConfig> = {
  "Visa Platinum": {
    name: "Visa Platinum",
    network: "Visa",
    minMonthlyIncome: 7000,
    multiplierRange: [2, 4],
    description: "Entry-level premium card"
  },
  "Visa Signature": {
    name: "Visa Signature",
    network: "Visa", 
    minMonthlyIncome: 15000,
    multiplierRange: [3, 5],
    description: "Mid-tier premium card"
  },
  "Visa Infinite": {
    name: "Visa Infinite",
    network: "Visa",
    minMonthlyIncome: 30000,
    multiplierRange: [5, 6.5],
    description: "High-tier card for HNW individuals"
  },
  "Mastercard Standard": {
    name: "Mastercard Standard",
    network: "Mastercard",
    minMonthlyIncome: 5000,
    multiplierRange: [1, 3],
    description: "Entry-level card"
  },
  "Mastercard World": {
    name: "Mastercard World", 
    network: "Mastercard",
    minMonthlyIncome: 12000,
    multiplierRange: [3, 4.5],
    description: "Mid-tier card"
  },
  "Mastercard World Elite": {
    name: "Mastercard World Elite",
    network: "Mastercard",
    minMonthlyIncome: 25000,
    multiplierRange: [4, 6],
    description: "High-tier card for executives"
  }
};

export type RiskLevel = "conservative" | "standard" | "aggressive" | "outlier";

export interface ValidationResult {
  isValid: boolean;
  riskLevel: RiskLevel;
  message: string;
  suggestedAmount: number;
  multiplier: number;
}

export function validateCreditLimit(
  creditLimit: number,
  monthlyIncome: number,
  cardType: string
): ValidationResult {
  const tierConfig = CARD_TIERS[cardType];
  
  if (!tierConfig) {
    return {
      isValid: false,
      riskLevel: "outlier",
      message: "Unknown card type",
      suggestedAmount: monthlyIncome * 3,
      multiplier: 0
    };
  }

  const multiplier = creditLimit / monthlyIncome;
  const [minMultiplier, maxMultiplier] = tierConfig.multiplierRange;
  const midMultiplier = (minMultiplier + maxMultiplier) / 2;
  
  let riskLevel: RiskLevel;
  let message: string;
  let isValid = true;

  if (multiplier > maxMultiplier) {
    riskLevel = "outlier";
    message = `Exceeds ${cardType} maximum (${maxMultiplier}× salary). Requires approval.`;
    isValid = false;
  } else if (multiplier > midMultiplier + 0.5) {
    riskLevel = "aggressive";
    message = `Above typical range for ${cardType}. Consider risk factors.`;
  } else if (multiplier >= minMultiplier) {
    riskLevel = "standard";
    message = `Within normal range for ${cardType}.`;
  } else {
    riskLevel = "conservative";
    message = `Conservative limit for ${cardType}.`;
  }

  return {
    isValid,
    riskLevel,
    message,
    suggestedAmount: Math.round(monthlyIncome * midMultiplier),
    multiplier
  };
}

export function getAutoSuggestedLimit(monthlyIncome: number, cardType: string): number {
  const tierConfig = CARD_TIERS[cardType];
  if (!tierConfig) return monthlyIncome * 3;
  
  const [minMultiplier, maxMultiplier] = tierConfig.multiplierRange;
  const midMultiplier = (minMultiplier + maxMultiplier) / 2;
  
  return Math.round(monthlyIncome * midMultiplier);
}

export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case "conservative":
      return "text-blue-400 bg-blue-900/20 border-blue-700";
    case "standard":
      return "text-green-400 bg-green-900/20 border-green-700";
    case "aggressive":
      return "text-orange-400 bg-orange-900/20 border-orange-700";
    case "outlier":
      return "text-red-400 bg-red-900/20 border-red-700";
    default:
      return "text-gray-400 bg-gray-900/20 border-gray-700";
  }
}
