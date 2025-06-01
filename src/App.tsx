
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreditOffers from "./pages/CreditOffers";
import OfferDetails from "./pages/OfferDetails";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { CreditOfferProvider } from "./contexts/CreditOfferContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CreditOfferProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/offers" element={<CreditOffers />} />
              <Route path="/offers/:offerId" element={<OfferDetails />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CreditOfferProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
