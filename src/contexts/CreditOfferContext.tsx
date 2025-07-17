
import React, { createContext, useContext, useState } from "react";
import { CreditOfferHistory, BankOffer } from "@/types";

interface CreditOfferContextType {
  offerHistory: CreditOfferHistory[];
  addOffer: (offer: CreditOfferHistory) => void;
  withdrawOffer: (offerId: string) => void;
  updateOfferStatus: (offerId: string, status: CreditOfferHistory["status"], cancelReason?: string, welcomeBalance?: number, competingOffers?: BankOffer[]) => void;
}

const CreditOfferContext = createContext<CreditOfferContextType>({
  offerHistory: [],
  addOffer: () => {},
  withdrawOffer: () => {},
  updateOfferStatus: () => {},
});

export const useCreditOffers = () => useContext(CreditOfferContext);

// Define consistent APR rates by card product - updated to match the 6 specified card types
const CARD_APR_RATES = {
  "Visa Platinum": 30,
  "Visa Signature": 28,
  "Visa Infinite": 26,
  "Mastercard Standard": 32,
  "Mastercard World": 32,
  "Mastercard World Elite": 24
};

export const CreditOfferProvider = ({ children }: { children: React.ReactNode }) => {
  const [offerHistory, setOfferHistory] = useState<CreditOfferHistory[]>([
    // Initial mock data updated with customer financial data
    {
      id: "offer-1",
      customerName: "Mohammed Al-Qahtani",
      customerLocation: "Riyadh",
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      welcomeBalance: 25000,
      status: "won",
      cardProduct: "Visa Signature",
      apr: CARD_APR_RATES["Visa Signature"],
      cobrandPartner: "jarir",
      customerIncome: 85000,
      customerCreditScore: 720,
      customerDebtBurdenRatio: 0.25,
      customerAge: 34,
      customerNationality: "Saudi Arabian"
    },
    {
      id: "offer-2",
      customerName: "Sara Al-Shehri",
      customerLocation: "Jeddah",
      timestamp: Date.now() - 3600000 * 6, // 6 hours ago
      welcomeBalance: 18000,
      status: "lost",
      competingBank: "SNB",
      cardProduct: "Mastercard World",
      apr: CARD_APR_RATES["Mastercard World"],
      cobrandPartner: "amazon",
      customerIncome: 65000,
      customerCreditScore: 680,
      customerDebtBurdenRatio: 0.35,
      customerAge: 29,
      customerNationality: "Saudi Arabian"
    },
    {
      id: "offer-3",
      customerName: "Abdullah Al-Otaibi",
      customerLocation: "Dammam",
      timestamp: Date.now() - 1800000, // 30 minutes ago
      welcomeBalance: 30000,
      status: "pending",
      cardProduct: "Visa Infinite",
      apr: CARD_APR_RATES["Visa Infinite"],
      cobrandPartner: "extra",
      customerIncome: 95000,
      customerCreditScore: 750,
      customerDebtBurdenRatio: 0.20,
      customerAge: 41,
      customerNationality: "Saudi Arabian"
    },
    {
      id: "offer-4",
      customerName: "Fatima Al-Harbi",
      customerLocation: "Mecca",
      timestamp: Date.now() - 86400000, // 1 day ago
      welcomeBalance: 15000,
      status: "won",
      cardProduct: "Visa Platinum",
      apr: CARD_APR_RATES["Visa Platinum"],
      cobrandPartner: "carrefour",
      customerIncome: 55000,
      customerCreditScore: 640,
      customerDebtBurdenRatio: 0.40,
      customerAge: 27,
      customerNationality: "Saudi Arabian"
    },
    {
      id: "offer-5",
      customerName: "Khalid Al-Zahrani",
      customerLocation: "Medina",
      timestamp: Date.now() - 129600000, // 1.5 days ago
      welcomeBalance: 22000,
      status: "lost",
      competingBank: "Rajhi Bank",
      cardProduct: "Mastercard World Elite",
      apr: CARD_APR_RATES["Mastercard World Elite"],
      cobrandPartner: "panda",
      customerIncome: 78000,
      customerCreditScore: 695,
      customerDebtBurdenRatio: 0.30,
      customerAge: 38,
      customerNationality: "Saudi Arabian"
    }
  ]);

  const addOffer = (offer: CreditOfferHistory) => {
    // Ensure consistent APR based on card product
    if (offer.cardProduct && CARD_APR_RATES[offer.cardProduct as keyof typeof CARD_APR_RATES]) {
      offer.apr = CARD_APR_RATES[offer.cardProduct as keyof typeof CARD_APR_RATES];
    }
    
    console.log("Adding new offer with cobrandPartner:", offer.cobrandPartner);
    console.log("Adding new offer with competingOffers:", offer.competingOffers);
    console.log("Adding new offer with customer financial data:", {
      income: offer.customerIncome,
      creditScore: offer.customerCreditScore,
      debtBurdenRatio: offer.customerDebtBurdenRatio
    });
    
    setOfferHistory(prev => [offer, ...prev]);
  };

  const withdrawOffer = (offerId: string) => {
    setOfferHistory(prev => prev.filter(offer => offer.id !== offerId));
  };

  const updateOfferStatus = (offerId: string, status: CreditOfferHistory["status"], cancelReason?: string, welcomeBalance?: number, competingOffers?: BankOffer[]) => {
    setOfferHistory(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { 
              ...offer, 
              status, 
              ...(cancelReason ? { cancelReason } : {}),
              ...(welcomeBalance !== undefined ? { welcomeBalance } : {}),
              ...(competingOffers ? { competingOffers } : {})
            }
          : offer
      )
    );
  };

  return (
    <CreditOfferContext.Provider value={{ offerHistory, addOffer, withdrawOffer, updateOfferStatus }}>
      {children}
    </CreditOfferContext.Provider>
  );
};
