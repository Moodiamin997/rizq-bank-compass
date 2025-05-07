
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, CreditCard, ChevronRight, Lock, Download, ArrowRight, Shield } from "lucide-react";
import { formatCurrency } from "@/utils/mockData";
import { useCreditOffers } from "@/contexts/CreditOfferContext";
import TimerDisplay from "@/components/TimerDisplay";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCobrandPartner } from "@/utils/cobrandPartners";

const CreditOffers = () => {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "settings" | "offers">("offers");
  const { offerHistory, withdrawOffer, updateOfferStatus } = useCreditOffers();
  const [cancelReason, setCancelReason] = useState("");
  const [issuingOffer, setIssuingOffer] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Function to format date from timestamp - updated to use 'en-US' locale for English month names
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to render status badge with appropriate icon and color
  const renderStatusBadge = (status: "won" | "lost" | "pending" | "issued" | "cancelled") => {
    switch (status) {
      case "won":
        return (
          <Badge className="bg-green-700 hover:bg-green-800 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Selected
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-red-700 hover:bg-red-800 flex items-center gap-1">
            <X className="h-3 w-3" />
            Not Selected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "issued":
        return (
          <Badge className="bg-blue-700 hover:bg-blue-800 flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Issued
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-700 hover:bg-gray-800 flex items-center gap-1">
            <X className="h-3 w-3" />
            Cancelled
          </Badge>
        );
    }
  };

  // Function to render cobrand partner badge - updated to avoid showing None when partnerId exists
  const renderCobrandPartnerBadge = (partnerId: string | undefined) => {
    // Skip rendering the None badge if partnerId is undefined or empty string
    if (!partnerId) {
      return (
        <Badge
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
          style={{ backgroundColor: "#666666", color: "white" }}
        >
          None
        </Badge>
      );
    }
    
    const partner = getCobrandPartner(partnerId);
    return (
      <Badge
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
        style={{ backgroundColor: partner.color, color: "white" }}
      >
        {partner.logoText}
      </Badge>
    );
  };

  // Handle withdraw offer
  const handleWithdrawOffer = (offerId: string, customerName: string) => {
    withdrawOffer(offerId);
    toast.success(`Offer to ${customerName} has been withdrawn`);
  };

  // Handle confirm & lock
  const handleConfirmAndLock = (offerId: string, customerName: string) => {
    updateOfferStatus(offerId, "won");
    toast.success(`Offer to ${customerName} has been locked`);
  };

  // Handle trigger issuance
  const handleTriggerIssuance = (offerId: string, customerName: string) => {
    setIssuingOffer(offerId);
    
    // Simulate API call to card management system
    setTimeout(() => {
      updateOfferStatus(offerId, "issued");
      setIssuingOffer(null);
      toast.success(`Card issuance for ${customerName} has been triggered successfully`);
    }, 2000);
  };

  // Handle KYC download
  const handleDownloadKYC = (customerName: string) => {
    toast.success(`KYC packet for ${customerName} is being downloaded`);
    // In a real application, this would trigger a file download
  };

  // Handle cancel issuance
  const handleCancelIssue = () => {
    if (selectedOfferId) {
      const offer = offerHistory.find(o => o.id === selectedOfferId);
      if (offer) {
        updateOfferStatus(selectedOfferId, "cancelled", cancelReason);
        toast.success(`Card issuance for ${offer.customerName} has been cancelled`);
        handleDialogOpenChange(false);
      }
    }
  };

  // Handle dialog open/close to properly reset state
  const handleDialogOpenChange = (open: boolean) => {
    setShowCancelDialog(open);
    if (!open) {
      // Reset state when dialog is closed
      setSelectedOfferId(null);
      setCancelReason("");
    }
  };

  // Open cancel dialog
  const openCancelDialog = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowCancelDialog(true);
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Credit Offer History</h1>
        <div className="bg-secondary/40 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            This page shows all the credit offers you've made to customers and their current status.
          </p>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px] font-semibold">Customer</TableHead>
                <TableHead className="w-[120px] font-semibold">Location</TableHead>
                <TableHead className="w-[150px] font-semibold">Card Type</TableHead>
                <TableHead className="w-[80px] font-semibold text-center">APR</TableHead>
                <TableHead className="w-[150px] font-semibold">Cobrand Partner</TableHead>
                <TableHead className="w-[150px] font-semibold">Date</TableHead>
                <TableHead className="w-[120px] font-semibold">Credit Limit</TableHead>
                <TableHead className="w-[120px] font-semibold">Status</TableHead>
                <TableHead className="text-right w-[120px] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No credit offers made yet
                  </TableCell>
                </TableRow>
              ) : (
                offerHistory.map((offer) => (
                  <TableRow key={offer.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{offer.customerName}</TableCell>
                    <TableCell>{offer.customerLocation}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{offer.cardProduct || "Visa Platinum"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground">
                        {offer.apr || 30}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {renderCobrandPartnerBadge(offer.cobrandPartner)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(offer.timestamp)}</span>
                        {offer.status === "pending" && (
                          <TimerDisplay startTime={offer.timestamp} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(offer.creditLimit)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {renderStatusBadge(offer.status)}
                        {offer.cancelReason && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                                <span className="sr-only">Info</span>
                                <X className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Cancellation Reason</h4>
                                <p className="text-sm text-muted-foreground">{offer.cancelReason}</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {offer.status === "pending" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                View Actions <ChevronRight className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive font-medium"
                                onClick={() => handleWithdrawOffer(offer.id, offer.customerName)}
                              >
                                Withdraw
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : offer.status === "won" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                View Actions <ChevronRight className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center"
                                onClick={() => handleConfirmAndLock(offer.id, offer.customerName)}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Confirm & Lock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center"
                                onClick={() => handleTriggerIssuance(offer.id, offer.customerName)}
                                disabled={issuingOffer === offer.id}
                              >
                                <ArrowRight className="mr-2 h-4 w-4" />
                                {issuingOffer === offer.id ? "Processing..." : "Trigger Issuance"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center"
                                onClick={() => handleDownloadKYC(offer.customerName)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download KYC Packet
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive font-medium flex items-center"
                                onClick={() => openCancelDialog(offer.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Issue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : offer.status !== "lost" ? (
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Card Issuance</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this card issuance. This action can be reversed later if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation (e.g., suspected fraud, policy change, customer request)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelIssue}
              disabled={!cancelReason}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CreditOffers;
