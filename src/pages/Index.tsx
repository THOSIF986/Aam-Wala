import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Layout/Navbar";
import { useCompanySettings } from "@/hooks/useCompanySettings";
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
  console.log('Index component loaded successfully');
  const { companySettings } = useCompanySettings();
  
  const cardData = [
    {
      title: "New Farm",
      description: "Register a new mango farm",
      icon: Tractor,
      link: "/new-farm",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
    },
    {
      title: "New Agent",
      description: "Add a new business agent",
      icon: UserCheck,
      link: "/new-agent",
      color: "bg-gradient-primary",
      role: ["admin", "clerk"]
    },
    {
      title: "New Voucher",
      description: "Create expense vouchers",
      icon: Receipt,
      link: "/new-voucher",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
    },
    {
      title: "New Bill",
      description: "Generate sales bills",
      icon: DollarSign,
      link: "/new-bill",
      color: "bg-gradient-primary",
      role: ["admin", "clerk"]
    },
    {
      title: "Voucher List",
      description: "View all vouchers",
      icon: List,
      link: "/voucher-list",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
    },
    {
      title: "Sales List",
      description: "Manage sales bills",
      icon: FileText,
      link: "/sale-bill-list",
      color: "bg-gradient-primary",
      role: ["admin", "clerk"]
    },
    {
      title: "Farmer Ledgers",
      description: "View farm ledgers & transactions",
      icon: BookOpen,
      link: "/farm-list",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
    },
    {
      title: "Agent Ledgers",
      description: "View agent ledgers & commissions",
      icon: Wallet,
      link: "/agent-list",
      color: "bg-gradient-primary",
      role: ["admin", "clerk"]
    },
    {
      title: "Farm List",
      description: "View all registered farms",
      icon: Tractor,
      link: "/farm-list",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
    },
    {
      title: "Agent List",
      description: "View all business agents",
      icon: Users,
      link: "/agent-list",
      color: "bg-gradient-primary",
      role: ["admin", "clerk"]
    },
    {
      title: "Reports",
      description: "Financial & business reports",
      icon: TrendingUp,
      link: "/reports",
      color: "bg-gradient-secondary",
      role: ["admin", "clerk"]
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

  // Simulate current user role - in real app this would come from auth context
  const currentUserRole = "admin";

  const filteredCards = cardData.filter(card => 
    card.role.includes(currentUserRole)
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
          {filteredCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link key={index} to={card.link} className="group">
                <Card className="h-full shadow-card hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-border/50">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-xl ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {card.title}
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