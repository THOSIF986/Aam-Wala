import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Layout/Navbar";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tractor,
  Users,
  Receipt,
  FileText,
  List,
  TrendingUp,
  Settings,
  Database,
  BookOpen,
  Wallet,
  UserCheck,
  DollarSign
} from "lucide-react";

const Index = () => {
  const { companySettings } = useCompanySettings();
  const { currentUser, isAdmin } = useAuth();
  
  // menu items for dashboard
  const menuItems = [
    {
      title: "New Farm",
      description: "Register a new mango farm",
      icon: Tractor,
      link: "/new-farm",
      color: "bg-gradient-secondary",
      role: ["admin", "writer"]
    },
    {
      title: "New Agent",
      description: "Add a new business agent",
      icon: UserCheck,
      link: "/new-agent",
      color: "bg-gradient-primary",
      role: ["admin", "writer"]
    },
    {
      title: "New Voucher",
      description: "Create expense vouchers",
      icon: Receipt,
      link: "/new-voucher",
      color: "bg-gradient-secondary",
      role: ["admin", "writer"]
    },
    {
      title: "New Bill",
      description: "Generate sales bills",
      icon: DollarSign,
      link: "/new-bill",
      color: "bg-gradient-primary",
      role: ["admin", "writer"]
    },
    {
      title: "Voucher List",
      description: "View all vouchers",
      icon: List,
      link: "/voucher-list",
      color: "bg-gradient-secondary",
      role: ["admin", "writer"]
    },
    {
      title: "Sales List",
      description: "Manage sales bills",
      icon: FileText,
      link: "/sale-bill-list",
      color: "bg-gradient-primary",
      role: ["admin", "writer"]
    },
    {
      title: "Farmer Ledgers",
      description: "View farm ledgers & transactions",
      icon: BookOpen,
      link: "/farm-list",
      color: "bg-gradient-secondary",
      role: ["admin", "writer"]
    },
    {
      title: "Agent Ledgers",
      description: "View agent ledgers & commissions",
      icon: Wallet,
      link: "/agent-list",
      color: "bg-gradient-primary",
      role: ["admin", "writer"]
    },
    {
      title: "Farm List",
      description: "View all registered farms",
      icon: Tractor,
      link: "/farm-list",
      color: "bg-gradient-secondary",
      role: ["admin", "writer"]
    },
    {
      title: "Agent List",
      description: "View all business agents",
      icon: Users,
      link: "/agent-list",
      color: "bg-gradient-primary",
      role: ["admin", "writer"]
    },
    {
      title: "Reports",
      description: "Financial & business reports",
      icon: TrendingUp,
      link: "/reports",
      color: "bg-gradient-secondary",
      role: ["admin"]
    },
    {
      title: "Settings",
      description: "App configuration",
      icon: Settings,
      link: "/settings",
      color: "bg-gradient-primary",
      role: ["admin"]
    },
    {
      title: "Backup & Reset",
      description: "Data management",
      icon: Database,
      link: "/backup-reset",
      color: "bg-gradient-secondary",
      role: ["admin"]
    }
  ];

  // filter based on user role
  const visibleItems = menuItems.filter(item =>
    item.role.includes(currentUser?.role || 'writer')
  );

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            {companySettings.companyName}
          </h1>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {visibleItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} to={item.link} className="group">
                <Card className="h-full shadow-card hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-border/50">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;