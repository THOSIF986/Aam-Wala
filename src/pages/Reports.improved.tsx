import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Layout/Navbar";
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart3, 
  PieChart, 
  Calendar,
  DollarSign,
  Users,
  Tractor,
  ArrowLeft,
  Receipt,
  Wallet,
  Activity,
  ShoppingCart
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companySettings } = useCompanySettings();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bills, setBills] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vouchers, setVouchers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [farms, setFarms] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agents, setAgents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalBills: 0,
    totalVouchers: 0,
    activeFarms: 0,
    activeAgents: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: billsData } = await supabase.from('bills').select('*');
        const { data: vouchersData } = await supabase.from('vouchers').select('*');
        const { data: farmsData } = await supabase.from('farms').select('*');
        const { data: agentsData } = await supabase.from('agents').select('*');
        const { data: ledgerData } = await supabase.from('ledger_entries').select('*');

        setBills(billsData || []);
        setVouchers(vouchersData || []);
        setFarms(farmsData || []);
        setAgents(agentsData || []);
        setLedgerEntries(ledgerData || []);

        const totalSales = billsData?.reduce((sum, b) => sum + (Number(b.net_payment) || 0), 0) || 0;
        const totalExp = vouchersData?.filter(v => v.type === 'expense').reduce((sum, v) => sum + (Number(v.amount) || 0), 0) || 0;

        setStats({
          totalSales: totalSales,
          totalExpenses: totalExp,
          netProfit: totalSales - totalExp,
          profitMargin: totalSales > 0 ? ((totalSales - totalExp) / totalSales * 100) : 0,
          totalBills: billsData?.length || 0,
          totalVouchers: vouchersData?.length || 0,
          activeFarms: farmsData?.filter(f => f.status === 'active').length || 0,
          activeAgents: agentsData?.filter(a => a.status === 'active').length || 0
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateReport = (reportTitle: string) => {
    if (reportTitle === 'Farm Performance' || reportTitle === 'Agent Performance' || reportTitle === 'Voucher Analysis' || reportTitle === 'Bills Analysis' || reportTitle === 'Farm-wise Quantity Supply Report' || reportTitle === 'Agent-wise Quantity Distribution Report') {
      setSelectedReport(reportTitle);
      // scroll to report section
      setTimeout(() => {
        const reportSection = document.getElementById('detailed-report-section');
        if (reportSection) {
          reportSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    toast({
      title: "Report Generated",
      description: `${reportTitle} has been generated successfully.`,
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPDF = (reportTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportTitle} as PDF. This feature will be available soon.`,
    });
  };

  // Function to format currency for printing
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          /* Hide everything except the report being printed */
          nav, .no-print, .stats-grid, .report-types-card {
            display: none !important;
          }
          
          /* Show only the print header and report content */
          .print-header {
            display: block !important;
          }
          
          .report-content-printable {
            display: block !important;
          }
          
          /* Hide action buttons in print view */
          .report-content-printable button,
          .report-content-printable .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .print-table th,
          .print-table td {
            padding: 10px 12px;
            border: 1px solid #000;
            text-align: left;
            font-size: 13px;
            color: #000;
          }
          
          .print-table th {
            background-color: #f0f0f0;
            font-weight: 600;
          }
          
          .print-table th.text-right,
          .print-table td.text-right {
            text-align: right;
          }
          
          .print-table th.text-center,
          .print-table td.text-center {
            text-align: center;
          }
          
          .print-table tfoot {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          * {
            box-shadow: none !important;
            background: none !important;
            color: #000 !important;
          }
          
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #000;
          }
          
          h4 {
            font-size: 18px;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #000;
          }
          
          .print-plain-text {
            background: none !important;
            color: #000 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            font-weight: normal !important;
            font-size: 13px !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Print header */
          .print-report-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .print-report-header h1 {
            margin: 0;
            font-size: 24px;
          }
          
          .print-report-header p {
            margin: 5px 0 0 0;
            font-size: 14px;
          }
        }
        
        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>
      
      {/* Print Header (only visible when printing) */}
      <div className="print-header">
        <div className="print-title">{companySettings.companyName}</div>
        <div className="print-subtitle">
          {companySettings.address && `${companySettings.address} | `}
          {companySettings.phone && `Phone: ${companySettings.phone} | `}
          {companySettings.email && `Email: ${companySettings.email}`}
        </div>
        <div className="print-subtitle" style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
          Business Reports & Analytics
        </div>
        <div className="print-subtitle">Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      
      <div className="no-print">
        <Navbar />
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }} className="no-print">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Back
          </Button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Reports Dashboard</h1>
            <p style={{ color: '#6b7280' }}>Business insights and analytics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {/* Sales Card */}
          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                  <ShoppingCart style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '12px' }}>
                  Sales
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Sales</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                {loading ? '-' : `₹${(stats.totalSales / 100000).toFixed(2)}L`}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>{stats.totalBills} bills</p>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                  <Receipt style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '12px' }}>
                  Expenses
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Expenses</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {loading ? '-' : `₹${(stats.totalExpenses / 100000).toFixed(2)}L`}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>{stats.totalVouchers} vouchers</p>
            </CardContent>
          </Card>

          {/* Profit Card */}
          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                  <Wallet style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
                  Profit
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Net Profit</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                {loading ? '-' : `₹${(stats.netProfit / 100000).toFixed(2)}L`}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                {stats.activeFarms} farms · {stats.activeAgents} agents
              </p>
            </CardContent>
          </Card>

          {/* Margin Card */}
          <Card>
            <CardContent style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <Activity style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#fef3c7', color: '#f59e0b', borderRadius: '12px' }}>
                  Margin
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Profit Margin</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {loading ? '-' : `${stats.profitMargin.toFixed(1)}%`}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Types */}
        <Card className="report-types-card">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '24px', height: '24px' }} />
              Available Reports
            </CardTitle>
            <CardDescription>Generate, print, or download business reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Voucher Analysis', icon: Receipt, color: '#8b5cf6' },
                { title: 'Bills Analysis', icon: FileText, color: '#2563eb' },
                { title: 'Farm Performance', icon: Tractor, color: '#16a34a' },
                { title: 'Agent Performance', icon: Users, color: '#dc2626' },
                { title: 'Farm-wise Quantity Supply Report', icon: Tractor, color: '#f59e0b' },
                { title: 'Agent-wise Quantity Distribution Report', icon: Users, color: '#06b6d4' }
              ].map((report, idx) => {
                const Icon = report.icon;
                return (
                  <div key={idx} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <Icon style={{ width: '32px', height: '32px', color: report.color }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{report.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" style={{ flex: 1 }} onClick={() => handleGenerateReport(report.title)}>
                        <FileText style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Generate
                      </Button>
                      <Button size="sm" variant="outline" onClick={handlePrintReport} title="Print Report">
                        <Printer style={{ width: '14px', height: '14px' }} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(report.title)} title="Download PDF">
                        <Download style={{ width: '14px', height: '14px' }} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Report Section */}
        <div id="detailed-report-section" style={{ marginTop: '40px' }}>
          {selectedReport === 'Voucher Analysis' && (
            <Card className="report-content-printable">
              {/* Print Header - Only visible when printing */}
              <div className="print-report-header hidden print:block">
                <h1>Voucher Analysis Report</h1>
                <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt style={{ width: '24px', height: '24px' }} />
                  Voucher Analysis
                </CardTitle>
                <CardDescription>Farm-wise and Agent-wise voucher summaries</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Farm-wise Voucher Summary */}
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>Farm-wise Voucher Summary</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Farm ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Farmer Name</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Number of Vouchers</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farms.map((farm, idx) => {
                          const farmVouchers = vouchers.filter(v => v.linked_to === 'farm' && v.linked_id === farm.farm_id);
                          const totalAmount = farmVouchers.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);
                          
                          if (farmVouchers.length === 0) return null;
                          
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '12px', fontWeight: '600' }}>{farm.farm_id}</td>
                              <td style={{ padding: '12px' }}>{farm.owner_name}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{farmVouchers.length}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Agent-wise Voucher Summary */}
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>Agent-wise Voucher Summary</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Agent ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Agent Name</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Number of Vouchers</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent, idx) => {
                          const agentVouchers = vouchers.filter(v => v.linked_to === 'agent' && v.linked_id === agent.agent_id);
                          const totalAmount = agentVouchers.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);
                          
                          if (agentVouchers.length === 0) return null;
                          
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '12px', fontWeight: '600' }}>{agent.agent_id}</td>
                              <td style={{ padding: '12px' }}>{agent.agent_name}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{agentVouchers.length}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button onClick={handlePrintReport}>
                    <Printer style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Print Report
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Close Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedReport === 'Bills Analysis' && (
            <Card className="report-content-printable">
              {/* Print Header - Only visible when printing */}
              <div className="print-report-header hidden print:block">
                <h1>Bills Analysis Report</h1>
                <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText style={{ width: '24px', height: '24px' }} />
                  Bills Analysis
                </CardTitle>
                <CardDescription>Farm-wise and Agent-wise bill summaries</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Farm-wise Bill Summary */}
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>Farm-wise Bill Summary</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Farm ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Farmer Name</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Number of Bills</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farms.map((farm, idx) => {
                          const farmBills = bills.filter(b => b.farm_id === farm.farm_id);
                          const totalAmount = farmBills.reduce((sum, b) => sum + parseFloat(b.net_payment || 0), 0);
                          
                          if (farmBills.length === 0) return null;
                          
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '12px', fontWeight: '600' }}>{farm.farm_id}</td>
                              <td style={{ padding: '12px' }}>{farm.owner_name}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{farmBills.length}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Agent-wise Bill Summary */}
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>Agent-wise Bill Summary</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Agent ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Agent Name</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Number of Bills</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent, idx) => {
                          const agentBills = bills.filter(b => b.agent_id === agent.agent_id);
                          const totalAmount = agentBills.reduce((sum, b) => sum + parseFloat(b.net_payment || 0), 0);
                          
                          if (agentBills.length === 0) return null;
                          
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '12px', fontWeight: '600' }}>{agent.agent_id}</td>
                              <td style={{ padding: '12px' }}>{agent.agent_name}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{agentBills.length}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button onClick={handlePrintReport}>
                    <Printer style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Print Report
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Close Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedReport === 'Farm Performance' && (
            <Card className="report-content-printable">
              {/* Print Header - Only visible when printing */}
              <div className="print-report-header hidden print:block">
                <h1>Farm Performance Report</h1>
                <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
