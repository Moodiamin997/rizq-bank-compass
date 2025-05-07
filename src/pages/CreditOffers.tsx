
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/mockData";
import { useCreditOffers } from "@/contexts/CreditOfferContext";
import TimerDisplay from "@/components/TimerDisplay";
import { toast } from "sonner";

const CreditOffers = () => {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "settings" | "offers">("offers");
  const { offerHistory, withdrawOffer } = useCreditOffers();

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
  const renderStatusBadge = (status: "won" | "lost" | "pending") => {
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
    }
  };

  // Function to render APR badge
  const renderAprBadge = (apr: number) => {
    return (
      <Badge variant="outline" className="ml-2 text-xs bg-secondary text-secondary-foreground">
        {apr}% APR
      </Badge>
    );
  };

  // Handle withdraw offer
  const handleWithdrawOffer = (offerId: string, customerName: string) => {
    withdrawOffer(offerId);
    toast.success(`Offer to ${customerName} has been withdrawn`);
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Credit Offer History</h1>
        <div className="bg-secondary/40 p-4 rounded-md mb-6">
          <p className="text-sm text-muted-foreground">
            This page shows all the credit offers you've made to customers and their current status.
          </p>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Card Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No credit offers made yet
                  </TableCell>
                </TableRow>
              ) : (
                offerHistory.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.customerName}</TableCell>
                    <TableCell>{offer.customerLocation}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{offer.cardProduct || "Visa Platinum"}</span>
                        {renderAprBadge(offer.apr || 30)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {formatDate(offer.timestamp)}
                        {offer.status === "pending" && (
                          <TimerDisplay startTime={offer.timestamp} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(offer.creditLimit)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {renderStatusBadge(offer.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {offer.status === "pending" && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleWithdrawOffer(offer.id, offer.customerName)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default CreditOffers;
