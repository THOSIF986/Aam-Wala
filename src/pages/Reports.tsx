import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Layout/Navbar";
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  DollarSign,
  Users,
  Tractor,
  ArrowLeft
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [reportFilters, setReportFilters] = useState({
    reportType: "",
    dateFrom: "",
    dateTo: "",
    farmId: "",
    agentId: ""
  });

  const reportTypes = [
    {
      id: "monthly-sales",
      title: "Monthly Sales Report",
      description: "Comprehensive sales analysis by month",
      icon: BarChart3,
      color: "text-primary"
    },
    {
      id: "farm-reports",
      title: "Farm Performance Report",
      description: "Individual farm productivity and profitability",
      icon: Tractor,
      color: "text-secondary"
    },
    {
      id: "agent-reports",
      title: "Agent Performance Report",
      description: "Agent-wise transaction and commission analysis",
      icon: Users,
      color: "text-success"
    },
    {
      id: "financial-reports",
      title: "Financial Summary Report",
      description: "Complete financial overview with profit/loss",
      icon: DollarSign,
      color: "text-warning"
    },
    {
      id: "voucher-reports",
      title: "Voucher Analysis Report",
      description: "Detailed expense tracking and categorization",
      icon: FileText,
      color: "text-destructive"
    },
    {
      id: "custom-ledger",
      title: "Custom Ledger Report",
      description: "Customizable ledger with date range filters",
      icon: PieChart,
      color: "text-purple-600"
    }
  ];

  // Report filter data - will be populated from API
  const farms = [];

  const agents = [];

  const handleGenerateReport = (reportId: string) => {
    console.log("Generating report:", reportId, "with filters:", reportFilters);
    // In real app, this would generate and display the report
  };

  const handlePrintReport = (reportId: string) => {
    console.log("Printing report:", reportId);
    window.print();
  };

  const handleDownloadPDF = (reportId: string) => {
    console.log("Downloading PDF for report:", reportId);
    // In real app, this would generate and download PDF
  };

  const handleFilterChange = (field: string, value: string) => {
    setReportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Reports</h1>
            <p className="text-muted-foreground">Generate comprehensive business reports and analytics</p>
          </div>
        </div>

        {/* Report Filters */}
        <Card className="shadow-card border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Set date range and specific filters for detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={reportFilters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={reportFilters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmId">Specific Farm</Label>
                <Select
                  value={reportFilters.farmId}
                  onValueChange={(value) => handleFilterChange("farmId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All farms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Farms</SelectItem>
                    {farms.length > 0 ? (
                      farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No farms available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentId">Specific Agent</Label>
                <Select
                  value={reportFilters.agentId}
                  onValueChange={(value) => handleFilterChange("agentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Agents</SelectItem>
                    {agents.length > 0 ? (
                      agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No agents available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="2025" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="shadow-card border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-3 ${report.color}`}>
                    <Icon className="h-8 w-8" />
                    <div>
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Quick Preview Stats */}
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Records</p>
                        <p className="font-semibold">
                          {report.id === 'monthly-sales' ? '0' : 
                           report.id === 'farm-reports' ? '0' :
                           report.id === 'agent-reports' ? '0' :
                           report.id === 'financial-reports' ? '0' :
                           report.id === 'voucher-reports' ? '0' : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-semibold">₹0</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateReport(report.id)}
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        size="sm"
                      >
                        Generate
                      </Button>
                      <Button
                        onClick={() => handlePrintReport(report.id)}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDownloadPDF(report.id)}
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats Summary */}
        <Card className="shadow-card border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Report Summary Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">₹0</div>
                <div className="text-sm text-muted-foreground">Total Sales This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">₹0</div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">₹0</div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-2">0%</div>
                <div className="text-sm text-muted-foreground">Profit Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;