
import React, { createContext, useContext, useState } from "react";
import { CreditOfferHistory } from "@/types";

interface CreditOfferContextType {
  offerHistory: CreditOfferHistory[];
  addOffer: (offer: CreditOfferHistory) => void;
}

const CreditOfferContext = createContext<CreditOfferContextType>({
  offerHistory: [],
  addOffer: () => {},
});

export const useCreditOffers = () => useContext(CreditOfferContext);

// Define consistent APR rates by card product
const CARD_APR_RATES = {
  "Visa Signature": 28,
  "Mastercard World": 32,
  "Visa Infinite": 26,
  "Visa Platinum": 30
};

export const CreditOfferProvider = ({ children }: { children: React.ReactNode }) => {
  const [offerHistory, setOfferHistory] = useState<CreditOfferHistory[]>([
    // Initial mock data
    {
      id: "offer-1",
      customerName: "Mohammed Al-Qahtani",
      customerLocation: "Riyadh",
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      creditLimit: 25000,
      status: "won",
      cardProduct: "Visa Signature",
      apr: CARD_APR_RATES["Visa Signature"]
    },
    {
      id: "offer-2",
      customerName: "Sara Al-Shehri",
      customerLocation: "Jeddah",
      timestamp: Date.now() - 3600000 * 6, // 6 hours ago
      creditLimit: 18000,
      status: "lost",
      competingBank: "SNB",
      cardProduct: "Mastercard World",
      apr: CARD_APR_RATES["Mastercard World"]
    },
    {
      id: "offer-3",
      customerName: "Abdullah Al-Otaibi",
      customerLocation: "Dammam",
      timestamp: Date.now() - 1800000, // 30 minutes ago
      creditLimit: 30000,
      status: "pending",
      cardProduct: "Visa Infinite",
      apr: CARD_APR_RATES["Visa Infinite"]
    },
    {
      id: "offer-4",
      customerName: "Fatima Al-Harbi",
      customerLocation: "Mecca",
      timestamp: Date.now() - 86400000, // 1 day ago
      creditLimit: 15000,
      status: "won",
      cardProduct: "Visa Platinum",
      apr: CARD_APR_RATES["Visa Platinum"]
    },
    {
      id: "offer-5",
      customerName: "Khalid Al-Zahrani",
      customerLocation: "Medina",
      timestamp: Date.now() - 129600000, // 1.5 days ago
      creditLimit: 22000,
      status: "lost",
      competingBank: "Al Ahli Bank",
      cardProduct: "Visa Infinite",
      apr: CARD_APR_RATES["Visa Infinite"]
    }
  ]);

  const addOffer = (offer: CreditOfferHistory) => {
    // Ensure consistent APR based on card product
    if (offer.cardProduct && CARD_APR_RATES[offer.cardProduct as keyof typeof CARD_APR_RATES]) {
      offer.apr = CARD_APR_RATES[offer.cardProduct as keyof typeof CARD_APR_RATES];
    }
    setOfferHistory(prev => [offer, ...prev]);
  };

  return (
    <CreditOfferContext.Provider value={{ offerHistory, addOffer }}>
      {children}
    </CreditOfferContext.Provider>
  );
};
