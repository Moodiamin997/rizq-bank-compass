import { Customer, WelcomeBid, BidResponse } from "@/types";
import { evaluateWelcomeBalanceBids } from "./welcomeBalanceBidding";
import { generateWelcomeBids, getBankById } from "./mockBankPartners";

// Simulate API endpoints for welcome balance bidding

export interface WelcomeBidsAPIResponse {
  success: boolean;
  data: WelcomeBid[];
  metadata: {
    total_banks: number;
    eligible_banks: number;
    average_bid: number;
    max_bid: number;
    min_bid: number;
  };
  timestamp: number;
}

export interface BidEvaluationAPIResponse {
  success: boolean;
  winning_bid?: WelcomeBid;
  all_bids: WelcomeBid[];
  decision_reason: string;
  audit_trail: string[];
  metadata: {
    evaluation_time_ms: number;
    total_eligible: number;
    customer_segment: string;
  };
  timestamp: number;
}

// GET /welcome-bids?customer_id=xxx
export const fetchWelcomeBids = async (customerId: string, customer: Customer): Promise<WelcomeBidsAPIResponse> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
  
  try {
    const bids = generateWelcomeBids(customer);
    
    const metadata = {
      total_banks: bids.length,
      eligible_banks: bids.filter(bid => bid.quota_remaining > 0).length,
      average_bid: bids.reduce((acc, bid) => acc + bid.bid_amount, 0) / bids.length || 0,
      max_bid: Math.max(...bids.map(bid => bid.bid_amount), 0),
      min_bid: Math.min(...bids.map(bid => bid.bid_amount), 0)
    };
    
    return {
      success: true,
      data: bids,
      metadata,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching welcome bids:', error);
    return {
      success: false,
      data: [],
      metadata: {
        total_banks: 0,
        eligible_banks: 0,
        average_bid: 0,
        max_bid: 0,
        min_bid: 0
      },
      timestamp: Date.now()
    };
  }
};

// POST /evaluate-bids
export const evaluateBidsForCustomer = async (customer: Customer): Promise<BidEvaluationAPIResponse> => {
  const startTime = Date.now();
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 150));
  
  try {
    const bidResponse = evaluateWelcomeBalanceBids(customer);
    const evaluationTime = Date.now() - startTime;
    
    // Determine customer segment for analytics
    const customerSegment = determineCustomerSegment(customer);
    
    return {
      success: true,
      winning_bid: bidResponse.winning_bid,
      all_bids: bidResponse.eligible_bids,
      decision_reason: bidResponse.decision_reason,
      audit_trail: bidResponse.audit_trail,
      metadata: {
        evaluation_time_ms: evaluationTime,
        total_eligible: bidResponse.eligible_bids.length,
        customer_segment: customerSegment
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error evaluating bids:', error);
    return {
      success: false,
      all_bids: [],
      decision_reason: 'System error during bid evaluation',
      audit_trail: [`Error: ${error}`],
      metadata: {
        evaluation_time_ms: Date.now() - startTime,
        total_eligible: 0,
        customer_segment: 'unknown'
      },
      timestamp: Date.now()
    };
  }
};

// GET /bank-details?bank_id=xxx
export const fetchBankDetails = async (bankId: string) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const bank = getBankById(bankId);
  
  if (!bank) {
    return {
      success: false,
      error: 'Bank not found',
      timestamp: Date.now()
    };
  }
  
  return {
    success: true,
    data: {
      ...bank,
      contact_info: {
        phone: '+966-11-xxx-xxxx',
        website: `www.${bank.id}.com.sa`,
        support_email: `support@${bank.id}.com.sa`
      },
      compliance_info: {
        license_number: `CL-${bank.id.toUpperCase()}-2024`,
        regulatory_body: 'Saudi Central Bank (SAMA)',
        last_audit: '2024-Q1'
      }
    },
    timestamp: Date.now()
  };
};

// Helper function to determine customer segment
const determineCustomerSegment = (customer: Customer): string => {
  if (customer.income >= 20000 && customer.creditScore >= 750) {
    return 'premium';
  } else if (customer.income >= 10000 && customer.creditScore >= 700) {
    return 'affluent';
  } else if (customer.income >= 7000 && customer.creditScore >= 650) {
    return 'mass_market';
  } else {
    return 'emerging';
  }
};

// POST /submit-acceptance
export const submitBidAcceptance = async (customerId: string, bidId: string, bankId: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    confirmation_number: `WB-${Date.now()}-${bankId.toUpperCase()}`,
    processing_time: '2-3 business days',
    next_steps: [
      'Bank will verify customer information',
      'Welcome balance will be deposited upon card activation',
      'Customer will receive SMS confirmation when processed'
    ],
    timestamp: Date.now()
  };
};

// GET /bidding-analytics
export const fetchBiddingAnalytics = async (timeframe: string = '24h') => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock analytics data
  return {
    success: true,
    data: {
      total_evaluations: 1247,
      successful_matches: 1156,
      average_bid_amount: 187.5,
      top_performing_bank: 'Saudi National Bank',
      customer_segments: {
        premium: 15,
        affluent: 35,
        mass_market: 40,
        emerging: 10
      },
      hourly_trends: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        evaluations: 30 + Math.floor(Math.random() * 50),
        avg_bid: 150 + Math.floor(Math.random() * 100)
      }))
    },
    timestamp: Date.now()
  };
};