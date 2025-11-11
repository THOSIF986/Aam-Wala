import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Layout/Navbar";
import { ArrowLeft, Printer, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const FarmerLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [farm, setFarm] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch farm details
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('*')
          .eq('farm_id', id)
          .maybeSingle();

        if (farmError) throw farmError;
        
        if (farmData) {
          setFarm(farmData);

          // Fetch ledger entries for this farm
          const { data: ledgerData, error: ledgerError } = await supabase
            .from('ledger_entries')
            .select('*')
            .eq('entity_type', 'farm')
            .eq('entity_id', farmData.farm_id)
            .order('date', { ascending: true });

          if (ledgerError) throw ledgerError;
          setLedgerEntries(ledgerData || []);
        } else {
          toast.error("Farm not found");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load ledger data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const totalDebit = ledgerEntries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
  const totalCredit = ledgerEntries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
  const balance = totalCredit - totalDebit;
  const totalVouchers = ledgerEntries.filter(entry => entry.transaction_type === 'voucher').length;
  const totalBills = ledgerEntries.filter(entry => entry.transaction_type === 'bill').length;

  const handlePrintAll = () => {
    window.print();
  };

  // Function to format currency for printing
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading ledger data...</p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Farm not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <style>{`
        @import url('@/lib/print-styles.css');
        
        @media print {
          /* Remove all colors for black and white printing */
          .print-table th,
          .print-table td,
          .print-summary > div,
          .print-summary .summary-label,
          .print-summary .summary-value {
            color: black !important;
            background: white !important;
          }
          
          .print-table th {
            background-color: #f0f0f0 !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>
      
      {/* Print Header - Only visible when printing */}
      <div className="print-header hidden print:block">
        <h1>Farm Ledger: {farm.owner_name}</h1>
        <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print-container">
        <div className="flex justify-between items-start mb-8 no-print">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Farm: {farm.owner_name}</h1>
              <p className="text-muted-foreground">Ledger details and transaction history</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePrintAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print All Bills
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Ledger
            </Button>
          </div>
        </div>

        {/* Print-only Farm Details - Simplified for printing */}
        <div className="print-farm-details hidden print:block">
          <div className="print-detail-row">
            <span className="print-detail-label">Farm ID:</span>
            <span className="print-detail-value">{farm.farm_id}</span>
          </div>
          <div className="print-detail-row">
            <span className="print-detail-label">Area:</span>
            <span className="print-detail-value">{farm.area} acres</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Farm Details (Screen only) */}
          <div className="lg:col-span-1 print:hidden">
            <Card className="shadow-card border-border/50 sticky top-8">
              <CardHeader>
                <CardTitle className="text-secondary">Farm Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Farmer Name</label>
                  <p className="font-semibold">{farm.owner_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Area</label>
                  <p className="font-semibold">{farm.area} acres</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                  <p className="font-semibold">{farm.mobile || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Guarantor</label>
                  <p className="font-semibold">{farm.guarantor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Farm ID</label>
                  <p className="font-semibold">{farm.farm_id}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Active</span>
                  {farm.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Balance Display */}
                <div className="border-t pt-4 mt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Farmer Balance</p>
                    <div className={`text-2xl font-bold ${
                      balance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{Math.abs(balance).toLocaleString('en-IN')}
                      {balance > 0 ? ' (Profit)' : ' (Loss)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Ledger Table */}
          <div className="lg:col-span-3">
            <Card className="shadow-card border-border/50 print:shadow-none print:border-0">
              <CardHeader className="print:hidden">
                <CardTitle className="text-primary">Ledger Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="print-table">
                    <TableHeader>
                      <TableRow className="bg-secondary/20">
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Debit (₹)</TableHead>
                        <TableHead className="text-right">Credit (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.length > 0 ? (
                        ledgerEntries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-muted/50">
                            <TableCell>{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full print:hidden ${
                                  entry.transaction_type === 'voucher' ? 'bg-destructive' : 'bg-success'
                                }`}></span>
                                {entry.description}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-destructive">
                              {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString('en-IN')}` : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-success">
                              {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString('en-IN')}` : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <p className="mb-2">No transactions found</p>
                              <p className="text-sm">Transactions will appear here once bills and vouchers are created for this farm</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Row - Screen Version */}
                <div className="bg-secondary/10 p-4 rounded-lg mt-6 print:hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debit</p>
                      <p className="text-xl font-bold text-destructive">
                        ₹{totalDebit.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credit</p>
                      <p className="text-xl font-bold text-success">
                        ₹{totalCredit.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vouchers</p>
                      <p className="text-xl font-bold text-primary">{totalVouchers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bills</p>
                      <p className="text-xl font-bold text-secondary">{totalBills}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Row - Print Version (Properly aligned in rows and columns) */}
        <div className="print-summary hidden print:grid print:grid-cols-4 print:gap-4 print:border print:border-black print:p-4">
          <div className="print:text-center print:border print:border-black print:p-2">
            <div className="print:font-normal print:text-sm print:mb-1">Total Debit</div>
            <div className="print:font-bold print:text-base">₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
          <div className="print:text-center print:border print:border-black print:p-2">
            <div className="print:font-normal print:text-sm print:mb-1">Total Credit</div>
            <div className="print:font-bold print:text-base">₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div className="print:text-center print:border print:border-black print:p-2">
            <div className="print:font-normal print:text-sm print:mb-1">Total Vouchers</div>
            <div className="print:font-bold print:text-base">{totalVouchers}</div>
          </div>
          <div className="print:text-center print:border print:border-black print:p-2">
            <div className="print:font-normal print:text-sm print:mb-1">Total Bills</div>
            <div className="print:font-bold print:text-base">{totalBills}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerLedger;