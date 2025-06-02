
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Settings, X, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  currentTab: "dashboard" | "settings" | "offers";
  setCurrentTab: (tab: "dashboard" | "settings" | "offers") => void;
}

const Layout = ({ children, currentTab, setCurrentTab }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h1 className="text-xl font-semibold text-white">
              Bank Dashboard
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-6">
            <Button
              variant={currentTab === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => setCurrentTab("dashboard")}
              asChild
            >
              <Link to="/">Dashboard</Link>
            </Button>
            <Button
              variant={currentTab === "offers" ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => setCurrentTab("offers")}
              asChild
            >
              <Link to="/offers">
                <CreditCard className="mr-2 h-4 w-4" />
                Credit Offers
              </Link>
            </Button>
            <Button
              variant={currentTab === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentTab("settings")}
              asChild
            >
              <Link to="/">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-white/10 bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-4 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-medium">
                {currentTab === "dashboard" ? "Applications Dashboard" : 
                 currentTab === "offers" ? "Credit Offers" : "Settings"}
              </h1>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
