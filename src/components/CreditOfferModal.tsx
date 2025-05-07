
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BankOffer, Customer } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import TimerDisplay from "@/components/TimerDisplay";
import { v4 as uuidv4 } from 'uuid';
import { useCreditOffers } from "@/contexts/CreditOfferContext";

interface CreditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  bankOffers: BankOffer[];
}

const CreditOfferModal = ({ isOpen, onClose, customer, bankOffers }: CreditOfferModalProps) => {
  const { toast } = useToast();
  const { addOffer } = useCreditOffers();
  const [creditLimit, setCreditLimit] = useState("");
  const [localBankOffers, setLocalBankOffers] = useState<BankOffer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  
  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen && bankOffers) {
      // Filter out any existing "Your Offer" entries when initializing
      const filteredOffers = bankOffers.filter(offer => 
        offer.bankName !== "Your Offer (Riyad Bank)"
      );
      setLocalBankOffers([...filteredOffers]);
      setSubmitted(false);
      setCreditLimit("");
    }
  }, [isOpen, bankOffers]);
  
  // Format the input with commas as the user types
  const handleCreditLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const value = e.target.value.replace(/\D/g, "");
    
    // Format with commas
    if (value === "") {
      setCreditLimit("");
    } else {
      setCreditLimit(Number(value).toLocaleString());
    }
  };
  
  const handleSubmitOffer = () => {
    // Parse the credit limit by removing commas
    const numberValue = creditLimit.replace(/,/g, "");
    const creditLimitValue = Number(numberValue);
    
    if (!creditLimitValue || isNaN(creditLimitValue)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid credit limit",
        variant: "destructive"
      });
      return;
    }
    
    // Create user offer
    const userOffer: BankOffer = {
      bankName: "Your Offer (Riyad Bank)",
      creditLimit: creditLimitValue,
      isWinner: false,
      timestamp: Date.now() // Add current timestamp
    };
    
    // Add the user's offer to the list
    const updatedOffers = [...localBankOffers];
    
    // Check if the user offer is already in the list and update it
    const existingUserOfferIndex = updatedOffers.findIndex(offer => 
      offer.bankName === "Your Offer (Riyad Bank)"
    );
    
    if (existingUserOfferIndex >= 0) {
      // Update existing offer
      updatedOffers[existingUserOfferIndex] = userOffer;
    } else {
      // Add new offer
      updatedOffers.push(userOffer);
    }
    
    setLocalBankOffers(updatedOffers);
    setSubmitted(true);
    
    // Determine if our offer won (highest credit limit)
    const highestOffer = Math.max(...updatedOffers.map(o => o.creditLimit));
    const offerWon = highestOffer === creditLimitValue;
    
    // Add to global credit offer history
    if (customer) {
      addOffer({
        id: uuidv4(),
        customerName: customer.name,
        customerLocation: customer.location,
        timestamp: Date.now(),
        creditLimit: creditLimitValue,
        status: offerWon ? "won" : "pending",
        competingBank: offerWon ? undefined : updatedOffers.find(o => o.creditLimit === highestOffer)?.bankName
      });
    }
    
    toast({
      title: "Credit offer submitted",
      description: `Successfully offered ${formatCurrency(creditLimitValue)} to ${customer?.name}`,
    });
  };
  
  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };
  
  if (!customer) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border border-white/10" aria-describedby="credit-offer-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Offer Credit to {customer.name}</DialogTitle>
          <DialogDescription id="credit-offer-description">
            Review the details and make a credit offer to this customer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Card Applied</p>
              <p className="text-base">{customer.appliedCard}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-base">{customer.location}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-base">{formatCurrency(customer.income)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Debt Burden Ratio</p>
              <p className="text-base">{customer.debtBurdenRatio.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Bank Offers</h3>
            <div className="space-y-2">
              {localBankOffers.map((offer) => (
                <div 
                  key={offer.bankName} 
                  className={`p-3 rounded-md flex justify-between items-center ${
                    offer.isWinner 
                      ? "bg-green-900/30 border border-green-700" 
                      : offer.bankName === "Your Offer (Riyad Bank)"
                        ? "bg-blue-900/30 border border-blue-700"
                        : "bg-secondary"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <p>{offer.bankName}</p>
                    {offer.timestamp && (
                      <TimerDisplay startTime={offer.timestamp} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p>{formatCurrency(offer.creditLimit)}</p>
                    {offer.isWinner && (
                      <span className="text-xs font-semibold text-green-400 uppercase">Best Offer</span>
                    )}
                    {offer.bankName === "Your Offer (Riyad Bank)" && (
                      <span className="text-xs font-semibold text-blue-400 uppercase">Your Offer</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="creditLimit" className="block text-sm font-medium mb-1">
              Your Credit Limit Offer
            </label>
            <Input
              id="creditLimit"
              placeholder="15,000"
              value={creditLimit}
              onChange={handleCreditLimitChange}
              className="bg-secondary border-white/10"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitOffer} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Submit Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditOfferModal;
