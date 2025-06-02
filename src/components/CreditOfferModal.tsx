import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BankOffer, Customer } from "@/types";
import { formatCurrency, simulateImprovedBankOffers } from "@/utils/mockData";
import { resolveTieBreaking } from "@/utils/tieBreaking";
import { validateCreditLimit, getAutoSuggestedLimit, getRiskLevelColor, CARD_TIERS } from "@/utils/creditLimitValidation";
import { useToast } from "@/hooks/use-toast";
import TimerDisplay from "@/components/TimerDisplay";
import { v4 as uuidv4 } from 'uuid';
import { useCreditOffers } from "@/contexts/CreditOfferContext";
import { Info, Lightbulb } from "lucide-react";

interface CreditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  bankOffers: BankOffer[];
  existingOffer?: any;
}

const CreditOfferModal = ({ isOpen, onClose, customer, bankOffers, existingOffer }: CreditOfferModalProps) => {
  const { toast } = useToast();
  const { addOffer, updateOfferStatus } = useCreditOffers();
  const [creditLimit, setCreditLimit] = useState("");
  const [localBankOffers, setLocalBankOffers] = useState<BankOffer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSimulatingResponses, setIsSimulatingResponses] = useState(false);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  
  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen && bankOffers) {
      // Filter out any existing "Your Offer" entries when initializing
      const filteredOffers = bankOffers.filter(offer => 
        offer.bankName !== "Your Offer (Riyad Bank)" && 
        offer.bankName !== "Your Previous Offer (Riyad Bank)"
      );
      
      // If there's an existing offer, add it to the list and pre-fill the input
      if (existingOffer) {
        const previousOffer: BankOffer = {
          bankName: "Your Previous Offer (Riyad Bank)",
          creditLimit: existingOffer.creditLimit,
          isWinner: false,
          isTied: false,
          timestamp: existingOffer.timestamp
        };
        filteredOffers.push(previousOffer);
        
        // Pre-fill the credit limit input with the existing offer amount
        setCreditLimit(existingOffer.creditLimit.toLocaleString());
      }
      
      // Apply sophisticated tie-breaking logic
      if (customer) {
        const tieBreakingResult = resolveTieBreaking(filteredOffers, customer.id, customer.cobrandPartner);
        setLocalBankOffers(tieBreakingResult.updatedOffers);
        setAuditTrail(tieBreakingResult.auditTrail);
      } else {
        setLocalBankOffers(filteredOffers);
        setAuditTrail([]);
      }
      
      setSubmitted(false);
      
      // Only clear credit limit if there's no existing offer
      if (!existingOffer) {
        setCreditLimit("");
      }
    }
  }, [isOpen, bankOffers, existingOffer, customer]);
  
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
  
  // Get validation result for current input
  const getValidationResult = () => {
    if (!customer || !creditLimit) return null;
    
    const numberValue = Number(creditLimit.replace(/,/g, ""));
    if (!numberValue || isNaN(numberValue)) return null;
    
    return validateCreditLimit(numberValue, customer.income, customer.appliedCard);
  };
  
  const validationResult = getValidationResult();
  const tierConfig = customer ? CARD_TIERS[customer.appliedCard] : null;
  const suggestedAmount = customer ? getAutoSuggestedLimit(customer.income, customer.appliedCard) : 0;
  
  const handleAutoSuggest = () => {
    if (suggestedAmount) {
      setCreditLimit(suggestedAmount.toLocaleString());
      setShowAutoSuggest(false);
    }
  };
  
  const handleSubmitOffer = async () => {
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
    
    // Check validation before proceeding
    if (validationResult && !validationResult.isValid) {
      toast({
        title: "Credit limit validation warning",
        description: validationResult.message,
        variant: "destructive"
      });
    }
    
    // Create user offer
    const userOffer: BankOffer = {
      bankName: "Your Offer (Riyad Bank)",
      creditLimit: creditLimitValue,
      isWinner: false,
      isTied: false,
      timestamp: Date.now()
    };
    
    // Add the user's offer to the list, removing any previous "Your Offer" entries
    let updatedOffers = localBankOffers.filter(offer => 
      offer.bankName !== "Your Offer (Riyad Bank)"
    );
    updatedOffers.push(userOffer);
    
    // Check if this creates a tie or if user is winning
    const highestCompetitorOffer = Math.max(...updatedOffers.filter(o => !o.bankName.includes("Your")).map(o => o.creditLimit));
    const isTiedOrWinning = creditLimitValue >= highestCompetitorOffer;
    
    // If tied or winning, simulate bank responses
    if (isTiedOrWinning) {
      setIsSimulatingResponses(true);
      
      // Show initial offer submission
      setLocalBankOffers(updatedOffers);
      setSubmitted(true);
      
      // Wait a moment to show the initial state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate improved bank offers with customer data for validation
      const improvedOffers = simulateImprovedBankOffers(updatedOffers, userOffer, customer);
      updatedOffers = improvedOffers;
      
      setIsSimulatingResponses(false);
      
      if (improvedOffers.some(o => o.timestamp && o.timestamp > userOffer.timestamp!)) {
        toast({
          title: "Banks responded!",
          description: "Some banks have improved their offers in response to your submission.",
          variant: "default"
        });
      }
    } else {
      setSubmitted(true);
    }
    
    // Apply sophisticated tie-breaking logic to determine the final winner
    if (customer) {
      const tieBreakingResult = resolveTieBreaking(updatedOffers, customer.id, customer.cobrandPartner);
      setLocalBankOffers(tieBreakingResult.updatedOffers);
      setAuditTrail(tieBreakingResult.auditTrail);
      
      // Determine final status based on whether user's offer won
      const userOfferWon = tieBreakingResult.updatedOffers.find(o => 
        o.bankName === "Your Offer (Riyad Bank)"
      )?.isWinner || false;
      
      const finalStatus = userOfferWon ? "won" : "pending";
      
      // If this is updating an existing offer, update it; otherwise add new offer
      if (existingOffer && customer) {
        updateOfferStatus(existingOffer.id, finalStatus, undefined, creditLimitValue, tieBreakingResult.updatedOffers);
      } else if (customer) {
        // Add to global credit offer history with competing offers and customer financial data
        addOffer({
          id: uuidv4(),
          customerName: customer.name,
          customerLocation: customer.location,
          timestamp: customer.applicationTime || Date.now(),
          creditLimit: creditLimitValue,
          status: finalStatus,
          competingBank: !userOfferWon ? tieBreakingResult.updatedOffers.find(o => o.isWinner)?.bankName : undefined,
          cardProduct: customer.appliedCard,
          cobrandPartner: customer.cobrandPartner,
          competingOffers: tieBreakingResult.updatedOffers,
          // Store customer financial data to preserve it
          customerIncome: customer.income,
          customerCreditScore: customer.creditScore,
          customerDebtBurdenRatio: customer.debtBurdenRatio,
          customerAge: customer.age,
          customerNationality: customer.nationality
        });
      }
      
      const actionText = existingOffer ? "updated" : "submitted";
      const statusText = finalStatus === "won" ? "won" : "is pending due to competitive offers";
      toast({
        title: `Credit offer ${actionText}`,
        description: `Successfully ${actionText} offer of ${formatCurrency(creditLimitValue)} to ${customer?.name}. Offer ${statusText}.`,
      });
    }
  };
  
  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };
  
  if (!customer) return null;
  
  // Find the earliest timestamp among all bank offers to use as the request start time
  const requestStartTime = Math.min(...localBankOffers.map(offer => offer.timestamp || Date.now()));
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border border-white/10" aria-describedby="credit-offer-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {existingOffer ? `Update Credit Offer to ${customer.name}` : `Offer Credit to ${customer.name}`}
          </DialogTitle>
          <DialogDescription id="credit-offer-description">
            {existingOffer 
              ? "Review and update your credit offer to this customer."
              : "Review the details and make a credit offer to this customer."
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Display single timer for the entire request */}
        <div className="mt-1 mb-3 flex justify-end">
          <div className="bg-secondary/60 px-3 py-1 rounded-md flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Time remaining:</span>
            <TimerDisplay startTime={customer.applicationTime || requestStartTime} />
          </div>
        </div>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Card Applied</p>
              <p className="text-base">{customer.appliedCard}</p>
              {tierConfig && (
                <p className="text-xs text-muted-foreground">
                  {tierConfig.multiplierRange[0]}×–{tierConfig.multiplierRange[1]}× salary range
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-base">{formatCurrency(customer.income)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credit Score</p>
              <p className="text-base">{customer.creditScore}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Debt Burden Ratio</p>
              <p className="text-base">{customer.debtBurdenRatio.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Bank Offers</h3>
              {isSimulatingResponses && (
                <span className="text-xs text-blue-400 animate-pulse">Banks responding...</span>
              )}
            </div>
            <div className="space-y-2">
              {localBankOffers.map((offer) => (
                <div 
                  key={`${offer.bankName}-${offer.timestamp}`} 
                  className={`p-3 rounded-md flex justify-between items-center transition-all duration-300 ${
                    offer.isWinner && (offer.bankName === "Your Offer (Riyad Bank)" || offer.bankName === "Your Previous Offer (Riyad Bank)")
                      ? "bg-green-900/30 border border-green-700" 
                      : offer.isWinner
                        ? "bg-green-900/30 border border-green-700"
                        : (offer.bankName === "Your Offer (Riyad Bank)" || offer.bankName === "Your Previous Offer (Riyad Bank)")
                          ? "bg-blue-900/30 border border-blue-700"
                          : "bg-secondary"
                  }`}
                >
                  <div>
                    <p>{offer.bankName}</p>
                    {offer.timestamp && offer.timestamp > Date.now() - 10000 && !offer.bankName.includes("Your") && (
                      <span className="text-xs text-orange-400">Just improved!</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p>{formatCurrency(offer.creditLimit)}</p>
                    {offer.isWinner ? (
                      <span className="text-xs font-semibold text-green-400 uppercase">
                        Winner
                      </span>
                    ) : (offer.bankName === "Your Offer (Riyad Bank)" || offer.bankName === "Your Previous Offer (Riyad Bank)") && (
                      <span className="text-xs font-semibold text-blue-400 uppercase">
                        {offer.bankName === "Your Previous Offer (Riyad Bank)" ? "Previous" : "Your Offer"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Audit Trail */}
            {auditTrail.length > 0 && (
              <div className="mt-3 p-2 bg-secondary/30 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Selection Process:</p>
                {auditTrail.map((step, index) => (
                  <p key={index} className="text-xs text-muted-foreground">• {step}</p>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="creditLimit" className="block text-sm font-medium">
                {existingOffer 
                  ? `Your Credit Limit Offer (Previous: ${formatCurrency(existingOffer.creditLimit)})`
                  : "Your Credit Limit Offer"
                }
              </label>
              {showAutoSuggest && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoSuggest}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Lightbulb className="h-3 w-3" />
                  Suggest {formatCurrency(suggestedAmount)}
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                id="creditLimit"
                placeholder="15,000"
                value={creditLimit}
                onChange={handleCreditLimitChange}
                className={`bg-secondary border-white/10 ${
                  validationResult ? getRiskLevelColor(validationResult.riskLevel) : ""
                }`}
              />
              
              {validationResult && (
                <div className={`flex items-start gap-2 p-2 rounded-md text-xs ${getRiskLevelColor(validationResult.riskLevel)}`}>
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {validationResult.riskLevel.charAt(0).toUpperCase() + validationResult.riskLevel.slice(1)} Risk 
                      ({validationResult.multiplier.toFixed(1)}× salary)
                    </p>
                    <p>{validationResult.message}</p>
                  </div>
                </div>
              )}
              
              {tierConfig && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>
                    {tierConfig.name} typical range: {formatCurrency(customer.income * tierConfig.multiplierRange[0])} - {formatCurrency(customer.income * tierConfig.multiplierRange[1])}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmitOffer} 
            disabled={isSimulatingResponses}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSimulatingResponses ? "Processing..." : existingOffer ? "Update Offer" : "Submit Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditOfferModal;
