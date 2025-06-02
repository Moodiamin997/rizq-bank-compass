import { Customer, SettingsState, BankOffer } from "@/types";
import { COBRAND_PARTNERS } from "./cobrandPartners";
import { CARD_TIERS, getAutoSuggestedLimit } from "./creditLimitValidation";

export const CARD_TYPES = [
  { name: "Visa Platinum", logo: "VISA" },
  { name: "Visa Signature", logo: "VISA" },
  { name: "Visa Infinite", logo: "VISA" },
  { name: "Mastercard Standard", logo: "MASTERCARD" },
  { name: "Mastercard World", logo: "MASTERCARD" },
  { name: "Mastercard World Elite", logo: "MASTERCARD" }
];

// Saudi Arabian names
const SAUDI_FIRST_NAMES = [
  "Mohammed", "Abdullah", "Ahmed", "Saad", "Khalid", "Fahad", "Omar", "Ali", "Saleh", "Ibrahim", 
  "Nasser", "Saud", "Faisal", "Turki", "Abdulaziz", "Majid", "Hassan", "Waleed", "Yousef", "Nawaf",
  "Fatima", "Aisha", "Maryam", "Sara", "Nora", "Hessa", "Lina", "Reem", "Layla", "Amira",
  "Nouf", "Abeer", "Raneem", "Latifa", "Manal", "Ghadah", "Hala", "Dalal", "Samira", "Shahad"
];

const SAUDI_LAST_NAMES = [
  "Al-Saud", "Al-Qahtani", "Al-Ghamdi", "Al-Shehri", "Al-Otaibi", "Al-Zahrani", "Al-Dossari", "Al-Harbi", 
  "Al-Mutairi", "Al-Shamrani", "Al-Saleh", "Al-Faraj", "Al-Yami", "Al-Malki", "Al-Amri", "Al-Shammari",
  "Al-Qurashi", "Al-Balawi", "Al-Anazi", "Al-Juhani", "Al-Subaie", "Al-Ruwaili", "Al-Rashidi", "Al-Buqami"
];

// Nationalities with higher probability for Saudi Arabian
const NATIONALITIES = [
  "Saudi Arabian", "Saudi Arabian", "Saudi Arabian", "Saudi Arabian", "Saudi Arabian", // Higher probability for Saudi
  "Emirati", "Kuwaiti", "Bahraini", "Omani", "Qatari", "Egyptian", "Jordanian", "Lebanese", "Yemeni"
];

export const LOCATIONS = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Tabuk"];

export const generateMockCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const randomCardIndex = Math.floor(Math.random() * CARD_TYPES.length);
    const randomLocationIndex = Math.floor(Math.random() * LOCATIONS.length);
    const randomIncome = Math.floor(Math.random() * 25000) + 5000;
    const randomCreditScore = Math.floor(Math.random() * 350) + 500;
    const randomDebtBurdenRatio = parseFloat((Math.random() * 0.5).toFixed(2));
    const randomAge = Math.floor(Math.random() * 40) + 25;
    const randomNationalityIndex = Math.floor(Math.random() * NATIONALITIES.length);
    
    // Create more realistic, varied application times
    // Random time between 5 minutes ago and 23 hours ago
    const minTimeAgo = 5 * 60 * 1000; // 5 minutes in milliseconds
    const maxTimeAgo = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    const randomTimeAgo = Math.floor(Math.random() * (maxTimeAgo - minTimeAgo)) + minTimeAgo;
    const applicationTime = now - randomTimeAgo;
    
    // Randomly select a cobrand partner (excluding the "none" option)
    const validPartners = COBRAND_PARTNERS.filter(partner => partner.id !== "none");
    const randomPartnerIndex = Math.floor(Math.random() * validPartners.length);
    const randomCobrandPartner = validPartners[randomPartnerIndex].id;
    
    customers.push({
      id: `customer-${i + 1}`,
      name: generateRandomName(),
      age: randomAge,
      location: LOCATIONS[randomLocationIndex],
      income: randomIncome,
      creditScore: randomCreditScore,
      debtBurdenRatio: randomDebtBurdenRatio,
      appliedCard: CARD_TYPES[randomCardIndex].name,
      applicationTime: applicationTime,
      nationality: NATIONALITIES[randomNationalityIndex],
      cobrandPartner: randomCobrandPartner
    });
  }
  
  return customers;
};

export const generateBankOffers = (customer: Customer, settings: SettingsState) => {
  // Use tier-based calculation instead of arbitrary base amount
  const suggestedLimit = getAutoSuggestedLimit(customer.income, customer.appliedCard);
  
  // Apply adjustments based on credit score and debt ratio
  const creditScoreFactor = Math.min(customer.creditScore / 750, 1.2); // Cap at 20% bonus
  const debtFactor = Math.max(1 - customer.debtBurdenRatio, 0.6); // Min 60% of base
  
  // Generate realistic offers with tier-appropriate variations
  const tierConfig = CARD_TIERS[customer.appliedCard];
  const [minMultiplier, maxMultiplier] = tierConfig?.multiplierRange || [2, 4];
  
  // Each bank offers within the tier range, with some variation
  const snbMultiplier = minMultiplier + (Math.random() * (maxMultiplier - minMultiplier) * 0.8);
  const anbMultiplier = minMultiplier + (Math.random() * (maxMultiplier - minMultiplier) * 0.9);
  const rajhiMultiplier = minMultiplier + (Math.random() * (maxMultiplier - minMultiplier) * 0.85);
  
  const snbOffer = Math.round((customer.income * snbMultiplier * creditScoreFactor * debtFactor) / 1000) * 1000;
  const anbOffer = Math.round((customer.income * anbMultiplier * creditScoreFactor * debtFactor) / 1000) * 1000;
  const rajhiOffer = Math.round((customer.income * rajhiMultiplier * creditScoreFactor * debtFactor) / 1000) * 1000;
  
  // Get current timestamp
  const now = Date.now();
  
  const offers = [
    { bankName: "SNB", creditLimit: snbOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 3600000) },
    { bankName: "ANB", creditLimit: anbOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 7200000) },
    { bankName: "Rajhi Bank", creditLimit: rajhiOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 10800000) }
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

export const simulateImprovedBankOffers = (currentOffers: BankOffer[], userOffer: BankOffer, customer?: Customer): BankOffer[] => {
  const userCreditLimit = userOffer.creditLimit;
  const highestCurrentOffer = Math.max(...currentOffers.map(o => o.creditLimit));
  
  // Only improve offers if user's offer ties with or beats the current highest
  if (userCreditLimit < highestCurrentOffer) {
    return currentOffers;
  }
  
  const improvedOffers = currentOffers.map(offer => {
    // Skip user's own offers
    if (offer.bankName.includes("Your") || offer.bankName.includes("Riyad Bank")) {
      return offer;
    }
    
    // 70% chance a bank will improve their offer when faced with competition
    const willImprove = Math.random() < 0.7;
    
    if (willImprove && offer.creditLimit <= userCreditLimit) {
      // Improve by 5-15% above the user's offer
      const improvementFactor = 1.05 + (Math.random() * 0.10); // 5-15% improvement
      const newLimit = Math.round((userCreditLimit * improvementFactor) / 1000) * 1000; // Round to nearest 1000
      
      // Cap at reasonable limits (don't exceed 200% of original offer)
      const maxLimit = offer.creditLimit * 2;
      const improvedLimit = Math.min(newLimit, maxLimit);
      
      return {
        ...offer,
        creditLimit: improvedLimit,
        timestamp: Date.now() // Update timestamp to show this is a new offer
      };
    }
    
    return offer;
  });
  
  return improvedOffers;
};

export const formatCurrency = (amount: number): string => {
  // Using the Saudi Riyal symbol with a non-breaking space for better display
  return `ريال ${amount.toLocaleString()}`;
};

function generateRandomName(): string {
  const firstName = SAUDI_FIRST_NAMES[Math.floor(Math.random() * SAUDI_FIRST_NAMES.length)];
  const lastName = SAUDI_LAST_NAMES[Math.floor(Math.random() * SAUDI_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}
