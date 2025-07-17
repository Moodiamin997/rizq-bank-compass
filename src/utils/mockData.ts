import { Customer, SettingsState, BankOffer } from "@/types";
import { COBRAND_PARTNERS } from "./cobrandPartners";
import { CARD_TIERS, getAutoSuggestedLimit, validateCreditLimit } from "./creditLimitValidation";

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
  // Import the new bidding system
  const { evaluateWelcomeBalanceBids } = require('./welcomeBalanceBidding');
  
  try {
    // Use the new dynamic bidding system
    const bidResponse = evaluateWelcomeBalanceBids(customer);
    
    if (bidResponse.winning_bid) {
      // Convert the winning bid to the expected BankOffer format
      const winningOffer: BankOffer = {
        bankName: bidResponse.winning_bid.bank_name,
        welcomeBalance: bidResponse.winning_bid.bid_amount,
        isWinner: true,
        timestamp: bidResponse.winning_bid.created_at
      };
      
      // Convert other eligible bids to BankOffer format
      const otherOffers: BankOffer[] = bidResponse.eligible_bids
        .filter(bid => bid.bank_id !== bidResponse.winning_bid!.bank_id)
        .map(bid => ({
          bankName: bid.bank_name,
          welcomeBalance: bid.bid_amount,
          isWinner: false,
          timestamp: bid.created_at
        }));
      
      return [winningOffer, ...otherOffers];
    } else {
      // Fallback: No winning bid available
      return [];
    }
  } catch (error) {
    console.error('Error in dynamic bidding system, falling back to legacy system:', error);
    
    // Fallback to simplified legacy system for welcome balance
    const baseAmount = settings.defaultWelcomeBalance || 100;
    const now = Date.now();
    
    const offers = [
      { bankName: "SNB", welcomeBalance: baseAmount + Math.floor(Math.random() * 100), isWinner: false, timestamp: now },
      { bankName: "ANB", welcomeBalance: baseAmount + Math.floor(Math.random() * 100), isWinner: false, timestamp: now },
      { bankName: "Rajhi Bank", welcomeBalance: baseAmount + Math.floor(Math.random() * 100), isWinner: false, timestamp: now }
    ];
    
    // Highest offer wins
    const highestOffer = Math.max(...offers.map(o => o.welcomeBalance));
    offers.find(o => o.welcomeBalance === highestOffer)!.isWinner = true;
    
    return offers;
  }
};

export const simulateImprovedBankOffers = (currentOffers: BankOffer[], userOffer: BankOffer, customer?: Customer): BankOffer[] => {
  const userWelcomeBalance = userOffer.welcomeBalance;
  const highestCurrentOffer = Math.max(...currentOffers.map(o => o.welcomeBalance));
  
  // Only improve offers if user's offer ties with or beats the current highest
  if (userWelcomeBalance < highestCurrentOffer) {
    return currentOffers;
  }
  
  // Determine probability based on risk level of user's offer
  let improvementProbability = 0.7; // Default 70% chance
  
  if (customer) {
    const validationResult = validateCreditLimit(userWelcomeBalance, customer.income, customer.appliedCard);
    
    // If user's offer is classified as "outlier" risk, banks are much less likely to respond
    if (validationResult.riskLevel === "outlier") {
      improvementProbability = 0.05; // Only 5% chance for outlier offers
    }
  }
  
  const improvedOffers = currentOffers.map(offer => {
    // Skip user's own offers
    if (offer.bankName.includes("Your") || offer.bankName.includes("Riyad Bank")) {
      return offer;
    }
    
    // Use risk-adjusted probability for banks to improve their offers
    const willImprove = Math.random() < improvementProbability;
    
    if (willImprove && offer.welcomeBalance <= userWelcomeBalance) {
      // Get the card tier configuration to respect maximum limits
      const tierConfig = customer ? CARD_TIERS[customer.appliedCard] : null;
      
      if (tierConfig && customer) {
        // Calculate the maximum allowed credit limit for this card tier
        const maxAllowedLimit = customer.income * tierConfig.multiplierRange[1];
        
        // If the current offer is already at or near the maximum, don't increase
        if (offer.welcomeBalance >= maxAllowedLimit * 0.95) {
          return offer; // Bank declines to increase due to guideline constraints
        }
        
        // Improve by 5-15% above the user's offer, but cap at tier maximum
        const improvementFactor = 1.05 + (Math.random() * 0.10); // 5-15% improvement
        const proposedLimit = Math.round((userWelcomeBalance * improvementFactor) / 1000) * 1000;
        
        // Ensure the improved offer doesn't exceed card tier guidelines
        const improvedLimit = Math.min(proposedLimit, maxAllowedLimit, offer.welcomeBalance * 2);
        
        // Only improve if the new limit is actually higher and within guidelines
        if (improvedLimit > offer.welcomeBalance) {
          return {
            ...offer,
            welcomeBalance: improvedLimit,
            timestamp: Date.now() // Update timestamp to show this is a new offer
          };
        }
      } else {
        // Fallback logic when no customer data or tier config is available
        const improvementFactor = 1.05 + (Math.random() * 0.10);
        const newLimit = Math.round((userWelcomeBalance * improvementFactor) / 1000) * 1000;
        const maxLimit = offer.welcomeBalance * 2;
        const improvedLimit = Math.min(newLimit, maxLimit);
        
        return {
          ...offer,
          welcomeBalance: improvedLimit,
          timestamp: Date.now()
        };
      }
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
