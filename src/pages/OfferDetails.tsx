
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreditOffers } from "@/contexts/CreditOfferContext";
import { Customer, BankOffer, SettingsState } from "@/types";
import { generateBankOffers } from "@/utils/mockData";
import CreditOfferModal from "@/components/CreditOfferModal";
import { toast } from "sonner";

const OfferDetails = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { offerHistory } = useCreditOffers();
  const [currentTab, setCurrentTab] = useState<"dashboard" | "settings" | "offers">("offers");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingOffer, setExistingOffer] = useState<any>(null);

  useEffect(() => {
    if (!offerId) {
      toast.error("Invalid offer ID");
      navigate("/offers");
      return;
    }

    // Find the offer in the history
    const offer = offerHistory.find(o => o.id === offerId);
    if (!offer) {
      toast.error("Offer not found");
      navigate("/offers");
      return;
    }

    // Only allow viewing details for pending offers
    if (offer.status !== "pending") {
      toast.error("Can only view details for pending offers");
      navigate("/offers");
      return;
    }

    // Store the existing offer for the modal
    setExistingOffer(offer);

    // Reconstruct customer data using stored financial data if available
    const reconstructedCustomer: Customer = {
      id: `customer-${offerId}`,
      name: offer.customerName,
      age: offer.customerAge || 35, // Use stored age or default
      location: offer.customerLocation,
      income: offer.customerIncome || 75000, // Use stored income or default
      creditScore: offer.customerCreditScore || 650, // Use stored credit score or default
      debtBurdenRatio: offer.customerDebtBurdenRatio || 0.3, // Use stored DTI or default
      appliedCard: offer.cardProduct || "Visa Platinum",
      applicationTime: offer.timestamp,
      nationality: offer.customerNationality || "Saudi Arabian", // Use stored nationality or default
      cobrandPartner: offer.cobrandPartner
    };

    console.log("Reconstructed customer with stored financial data:", {
      income: reconstructedCustomer.income,
      creditScore: reconstructedCustomer.creditScore,
      debtBurdenRatio: reconstructedCustomer.debtBurdenRatio,
      age: reconstructedCustomer.age
    });

    setCustomer(reconstructedCustomer);

    // Use stored competing offers if available, otherwise generate fresh ones
    if (offer.competingOffers && offer.competingOffers.length > 0) {
      console.log("Using stored competing offers:", offer.competingOffers);
      setBankOffers(offer.competingOffers);
    } else {
      console.log("Generating fresh bank offers");
      // Generate competing bank offers
      const defaultSettings: SettingsState = {
        prioritizeLowestDTI: false,
        minCreditScore: 600,
        maxDebtBurdenRatio: 0.5,
        defaultCreditLimit: 20000
      };

      const offers = generateBankOffers(reconstructedCustomer, defaultSettings);
      setBankOffers(offers);
    }
    
    // Automatically open the modal to show offers
    setIsModalOpen(true);
  }, [offerId, offerHistory, navigate]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate("/offers");
  };

  if (!customer) {
    return (
      <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        <div className="flex items-center justify-center h-64">
          <p>Loading offer details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/offers")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Credit Offers
          </Button>
          <h1 className="text-2xl font-bold">Offer Details - {customer.name}</h1>
        </div>

        <div className="bg-secondary/40 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            View competing bank offers and submit additional credit offers for this pending application.
          </p>
        </div>

        <CreditOfferModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          customer={customer}
          bankOffers={bankOffers}
          existingOffer={existingOffer}
        />
      </div>
    </Layout>
  );
};

export default OfferDetails;
