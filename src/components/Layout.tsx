
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Settings, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentTab: "dashboard" | "settings";
  setCurrentTab: (tab: "dashboard" | "settings") => void;
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
            <h1 className="text-xl font-semibold text-white flex items-center">
              <img 
                src="/lovable-uploads/9304979f-d2db-4c16-b091-df2c7b68e3d1.png" 
                alt="Rizq Logo" 
                className="h-6 mr-2" 
              />
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
            >
              Dashboard
            </Button>
            <Button
              variant={currentTab === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-white/10 bg-background px-6 py-4">
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
              {currentTab === "dashboard" ? "Applications Dashboard" : "Settings"}
            </h1>
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
