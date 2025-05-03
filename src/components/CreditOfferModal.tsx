
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BankOffer, Customer } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";

interface CreditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  bankOffers: BankOffer[];
}

const CreditOfferModal = ({ isOpen, onClose, customer, bankOffers }: CreditOfferModalProps) => {
  const { toast } = useToast();
  const [creditLimit, setCreditLimit] = useState("");
  
  const winningOffer = bankOffers.find(offer => offer.isWinner);
  
  const handleSubmitOffer = () => {
    toast({
      title: "Credit offer submitted",
      description: `Successfully offered ${formatCurrency(Number(creditLimit))} to ${customer?.name}`,
    });
    onClose();
  };
  
  if (!customer) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Offer Credit to {customer.name}</DialogTitle>
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
              {bankOffers.map((offer) => (
                <div 
                  key={offer.bankName} 
                  className={`p-3 rounded-md flex justify-between items-center ${
                    offer.isWinner 
                      ? "bg-green-900/30 border border-green-700" 
                      : "bg-secondary"
                  }`}
                >
                  <p>{offer.bankName}</p>
                  <div className="flex items-center gap-2">
                    <p>{formatCurrency(offer.creditLimit)}</p>
                    {offer.isWinner && (
                      <span className="text-xs font-semibold text-green-400 uppercase">Best Offer</span>
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
              placeholder="SAR 15,000"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="bg-secondary border-white/10"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
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
