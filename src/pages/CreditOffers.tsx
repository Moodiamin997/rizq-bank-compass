
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/mockData";

interface CreditOfferHistory {
  id: string;
  customerName: string;
  customerLocation: string;
  timestamp: number;
  creditLimit: number;
  status: "won" | "lost" | "pending";
  competingBank?: string;
}

const CreditOffers = () => {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "settings" | "offers">("offers");
  
  // Mock credit offer history data - in a real app, this would come from API or context
  const [offerHistory] = useState<CreditOfferHistory[]>([
    {
      id: "offer-1",
      customerName: "Mohammed Al-Qahtani",
      customerLocation: "Riyadh",
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      creditLimit: 25000,
      status: "won"
    },
    {
      id: "offer-2",
      customerName: "Sara Al-Shehri",
      customerLocation: "Jeddah",
      timestamp: Date.now() - 3600000 * 6, // 6 hours ago
      creditLimit: 18000,
      status: "lost",
      competingBank: "SNB"
    },
    {
      id: "offer-3",
      customerName: "Abdullah Al-Otaibi",
      customerLocation: "Dammam",
      timestamp: Date.now() - 1800000, // 30 minutes ago
      creditLimit: 30000,
      status: "pending"
    },
    {
      id: "offer-4",
      customerName: "Fatima Al-Harbi",
      customerLocation: "Mecca",
      timestamp: Date.now() - 86400000, // 1 day ago
      creditLimit: 15000,
      status: "won"
    },
    {
      id: "offer-5",
      customerName: "Khalid Al-Zahrani",
      customerLocation: "Medina",
      timestamp: Date.now() - 129600000, // 1.5 days ago
      creditLimit: 22000,
      status: "lost",
      competingBank: "Al Ahli Bank"
    }
  ]);

  // Function to format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-SA', {
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
            Bid Won
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-red-700 hover:bg-red-800 flex items-center gap-1">
            <X className="h-3 w-3" />
            Bid Lost
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
                <TableHead>Date</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No credit offers made yet
                  </TableCell>
                </TableRow>
              ) : (
                offerHistory.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.customerName}</TableCell>
                    <TableCell>{offer.customerLocation}</TableCell>
                    <TableCell>{formatDate(offer.timestamp)}</TableCell>
                    <TableCell>{formatCurrency(offer.creditLimit)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(offer.status)}
                        {offer.status === "lost" && offer.competingBank && (
                          <span className="text-xs text-muted-foreground">
                            to {offer.competingBank}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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
