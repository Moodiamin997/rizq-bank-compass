
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
    cobrandPartner: undefined, // Added cobrand partner filter
    sortByApplicationTime: "none", // Added sort by application time
  });
  
  // State for settings
  const [settings, setSettings] = useState<SettingsState>({
    prioritizeLowestDTI: false,
    minCreditScore: 650,
    maxDebtBurdenRatio: 0.4,
    defaultWelcomeBalance: 15000,
  });
  
  // State for credit offer modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);
  
  // Filter and sort customers based on current filters
  const filteredCustomers = useMemo(() => {
    let result = allCustomers.filter(customer => {
      // Applied card filter
      if (filters.appliedCard !== "all_cards" && customer.appliedCard !== filters.appliedCard) {
        return false;
      }
      
      // Cobrand partner filter
      if (filters.cobrandPartner && customer.cobrandPartner !== filters.cobrandPartner) {
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

    // Apply sorting based on application time
    if (filters.sortByApplicationTime === "newest") {
      result = result.sort((a, b) => {
        if (!a.applicationTime && !b.applicationTime) return 0;
        if (!a.applicationTime) return 1;
        if (!b.applicationTime) return -1;
        return b.applicationTime - a.applicationTime; // Newest first (descending)
      });
    } else if (filters.sortByApplicationTime === "oldest") {
      result = result.sort((a, b) => {
        if (!a.applicationTime && !b.applicationTime) return 0;
        if (!a.applicationTime) return 1;
        if (!b.applicationTime) return -1;
        return a.applicationTime - b.applicationTime; // Oldest first (ascending)
      });
    }

    return result;
  }, [allCustomers, filters, settings]);
  
  // Handle offering welcome balance to a customer
  const handleOfferWelcomeBalance = (customer: Customer) => {
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
          <h1 className="text-2xl font-bold mb-6">Welcome Balance Applications</h1>
          <FilterBar 
            onApplyFilters={handleApplyFilters} 
            initialFilters={filters} 
          />
          <CustomerTable 
            customers={filteredCustomers} 
            onOfferWelcomeBalance={handleOfferWelcomeBalance} 
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
