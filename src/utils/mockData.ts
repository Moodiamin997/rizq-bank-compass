import { Customer, SettingsState } from "@/types";
import { COBRAND_PARTNERS } from "./cobrandPartners";

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

export const generateMockCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomCardIndex = Math.floor(Math.random() * CARD_TYPES.length);
    const randomLocationIndex = Math.floor(Math.random() * LOCATIONS.length);
    const randomIncome = Math.floor(Math.random() * 25000) + 5000;
    const randomCreditScore = Math.floor(Math.random() * 350) + 500;
    const randomDebtBurdenRatio = parseFloat((Math.random() * 0.5).toFixed(2));
    const randomAge = Math.floor(Math.random() * 40) + 25;
    const randomNationalityIndex = Math.floor(Math.random() * NATIONALITIES.length);
    
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
      applicationTime: Date.now() - Math.floor(Math.random() * 3600000), // Random time within the last hour
      nationality: NATIONALITIES[randomNationalityIndex],
      cobrandPartner: randomCobrandPartner // Assign a random cobrand partner
    });
  }
  
  return customers;
};

export const generateBankOffers = (customer: Customer, settings: SettingsState) => {
  // Base amount calculated from income, but use defaultCreditLimit as a starting point
  const baseAmount = settings.defaultCreditLimit * (customer.income / 10000);
  
  // Apply adjustments based on credit score and debt ratio
  const creditScoreFactor = customer.creditScore / 800;
  const debtFactor = 1 - customer.debtBurdenRatio;
  
  // Generate offers with some variation
  const snbOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 - Math.random() * 0.1)) / 1000) * 1000;
  const anbOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 - Math.random() * 0.15)) / 1000) * 1000;
  const alAhliOffer = Math.round((baseAmount * creditScoreFactor * debtFactor * (1 - Math.random() * 0.12)) / 1000) * 1000;
  
  // Get current timestamp
  const now = Date.now();
  
  const offers = [
    { bankName: "SNB", creditLimit: snbOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 3600000) }, // Random time within last hour
    { bankName: "ANB", creditLimit: anbOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 7200000) }, // Random time within last 2 hours
    { bankName: "Al Ahli Bank", creditLimit: alAhliOffer, isWinner: false, timestamp: now - Math.floor(Math.random() * 10800000) } // Random time within last 3 hours
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
  // Using the Saudi Riyal symbol with a non-breaking space for better display
  return `ريال ${amount.toLocaleString()}`;
};

function generateRandomName(): string {
  const firstName = SAUDI_FIRST_NAMES[Math.floor(Math.random() * SAUDI_FIRST_NAMES.length)];
  const lastName = SAUDI_LAST_NAMES[Math.floor(Math.random() * SAUDI_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}
