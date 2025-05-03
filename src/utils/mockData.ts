import { Customer } from "@/types";

export const CARD_TYPES = [
  { name: "Visa Premium", logo: "visa" },
  { name: "Mastercard Gold", logo: "mastercard" },
  { name: "Amex Platinum", logo: "amex" },
  { name: "Revolut Metal", logo: "revolut" }
];

export const LOCATIONS = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Tabuk"];

export const generateMockCustomers = (count = 20): Customer[] => {
  return Array.from({ length: count }, (_, i) => {
    const age = Math.floor(Math.random() * 40) + 25; // 25-65
    const income = Math.floor(Math.random() * 15000) + 5000; // 5000-20000
    const creditScore = Math.floor(Math.random() * 300) + 500; // 500-800
    const debtBurdenRatio = parseFloat((Math.random() * 0.5).toFixed(2)); // 0-0.5
    
    return {
      id: `cust-${i + 1}`,
      name: `Customer ${i + 1}`,
      age,
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      income,
      creditScore,
      debtBurdenRatio,
      appliedCard: CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)].name,
    };
  });
};

export const generateBankOffers = (customer: Customer, settings: { prioritizeLowestDTI: boolean }) => {
  // Base amount calculated from income
  const baseAmount = customer.income * 0.75;
  
  // Apply adjustments based on credit score and debt ratio
  const creditScoreFactor = customer.creditScore / 800;
  const debtFactor = 1 - customer.debtBurdenRatio;
  
  // Generate offers with some variation
  const rajhiOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 + Math.random() * 0.1)) / 1000) * 1000;
  const snbOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 - Math.random() * 0.1)) / 1000) * 1000;
  const anbOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 - Math.random() * 0.15)) / 1000) * 1000;
  
  const offers = [
    { bankName: "Rajhi Bank", creditLimit: rajhiOffer, isWinner: false },
    { bankName: "SNB", creditLimit: snbOffer, isWinner: false },
    { bankName: "ANB", creditLimit: anbOffer, isWinner: false }
  ];
  
  // Determine the winning offer based on settings
  if (settings.prioritizeLowestDTI) {
    // If prioritizing lowest DTI, adjust which offer wins based on debt burden ratio
    const dtiAdjustedOffers = offers.map(offer => ({
      ...offer,
      adjustedValue: offer.creditLimit * (1 - customer.debtBurdenRatio)
    }));
    
    const winner = dtiAdjustedOffers.reduce((prev, current) => 
      prev.adjustedValue > current.adjustedValue ? prev : current
    );
    
    offers.find(o => o.bankName === winner.bankName)!.isWinner = true;
  } else {
    // Otherwise, highest offer wins
    const highestOffer = Math.max(...offers.map(o => o.creditLimit));
    offers.find(o => o.creditLimit === highestOffer)!.isWinner = true;
  }
  
  return offers;
};

export const formatCurrency = (amount: number): string => {
  return `SAR ${amount.toLocaleString()}`;
};
