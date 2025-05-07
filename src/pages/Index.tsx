
import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import FilterBar from "@/components/FilterBar";
import CustomerTable from "@/components/CustomerTable";
import CreditOfferModal from "@/components/CreditOfferModal";
import SettingsPanel from "@/components/SettingsPanel";
import { Customer, FilterState, BankOffer, SettingsState } from "@/types";
import { generateMockCustomers, generateBankOffers } from "@/utils/mockData";

const Index = () => {
  // Current tab (dashboard or settings)
  const [currentTab, setCurrentTab] = useState<"dashboard" | "settings" | "offers">("dashboard");
  
  // State for customers
  const [allCustomers] = useState<Customer[]>(generateMockCustomers(30));
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    appliedCard: "all_cards",
    ageRange: [25, 65],
    location: "all_locations",
    creditScoreRange: [500, 850],
    incomeLevel: [5000, 30000],
    debtBurdenRatio: [0, 0.5],
  });
  
  // State for settings
  const [settings, setSettings] = useState<SettingsState>({
    prioritizeLowestDTI: false,
    minCreditScore: 650,
    maxDebtBurdenRatio: 0.4,
    defaultCreditLimit: 15000,
  });
  
  // State for credit offer modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  
  // Filter customers based on current filters
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      // Applied card filter
      if (filters.appliedCard !== "all_cards" && customer.appliedCard !== filters.appliedCard) {
        return false;
      }
      
      // Age range filter
      if (customer.age < filters.ageRange[0] || customer.age > filters.ageRange[1]) {
        return false;
      }
      
      // Location filter
      if (filters.location !== "all_locations" && customer.location !== filters.location) {
        return false;
      }
      
      // Credit score filter
      if (customer.creditScore < filters.creditScoreRange[0] || customer.creditScore > filters.creditScoreRange[1]) {
        return false;
      }
      
      // Income level filter
      if (customer.income < filters.incomeLevel[0] || customer.income > filters.incomeLevel[1]) {
        return false;
      }
      
      // Debt burden ratio filter
      if (
        customer.debtBurdenRatio < filters.debtBurdenRatio[0] || 
        customer.debtBurdenRatio > filters.debtBurdenRatio[1]
      ) {
        return false;
      }
      
      // Decision rules from settings
      if (customer.creditScore < settings.minCreditScore) {
        return false;
      }
      
      if (customer.debtBurdenRatio > settings.maxDebtBurdenRatio) {
        return false;
      }
      
      return true;
    });
  }, [allCustomers, filters, settings]);
  
  // Handle offering credit to a customer
  const handleOfferCredit = (customer: Customer) => {
    setSelectedCustomer(customer);
    const offers = generateBankOffers(customer, settings);
    setBankOffers(offers);
    setIsModalOpen(true);
  };
  
  // Handle applying filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  // Handle settings change
  const handleSettingsChange = (newSettings: SettingsState) => {
    setSettings(newSettings);
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setBankOffers([]);
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === "dashboard" ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Credit Card Applications</h1>
          <FilterBar 
            onApplyFilters={handleApplyFilters} 
            initialFilters={filters} 
          />
          <CustomerTable 
            customers={filteredCustomers} 
            onOfferCredit={handleOfferCredit} 
          />
          <CreditOfferModal 
            isOpen={isModalOpen}
            onClose={handleModalClose}
            customer={selectedCustomer}
            bankOffers={bankOffers}
          />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Application Settings</h1>
          <SettingsPanel 
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </>
      )}
    </Layout>
  );
};

export default Index;
