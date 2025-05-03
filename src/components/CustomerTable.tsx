
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Customer } from "@/types";
import { formatCurrency } from "@/utils/mockData";
import { CARD_TYPES } from "@/utils/mockData";
import TimerDisplay from "@/components/TimerDisplay";

interface CustomerTableProps {
  customers: Customer[];
  onOfferCredit: (customer: Customer) => void;
}

const CustomerTable = ({ customers, onOfferCredit }: CustomerTableProps) => {
  const getCardLogo = (cardName: string) => {
    const card = CARD_TYPES.find(c => c.name === cardName);
    return card ? card.logo : "default";
  };

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>Credit Score</TableHead>
            <TableHead>Debt Burden Ratio</TableHead>
            <TableHead>Applied Card</TableHead>
            <TableHead>Application Time</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-10">
                No customers match the current filters
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="border-t border-white/10">
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.age}</TableCell>
                <TableCell>{customer.nationality}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{formatCurrency(customer.income)}</TableCell>
                <TableCell>{customer.creditScore}</TableCell>
                <TableCell>{customer.debtBurdenRatio.toFixed(2)}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <div className="text-xs text-white bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="font-bold uppercase">{getCardLogo(customer.appliedCard)}</span>
                    <span>{customer.appliedCard}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {customer.applicationTime && (
                    <TimerDisplay startTime={customer.applicationTime} />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onOfferCredit(customer)}
                    className="bg-[#403E43] hover:bg-[#555555] text-[#F6F6F7] border border-[#8E9196] transition-all duration-300 hover:shadow-[0_0_15px_rgba(142,145,150,0.6)] hover:border-[#aaadb0]"
                  >
                    Offer Credit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;
