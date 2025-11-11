import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Navbar from "@/components/Layout/Navbar";
import { Eye, FileText, ArrowLeft, Trash2, Printer, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Bill } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const SaleBillList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bills, setBills] = useState<Bill[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [farms, setFarms] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Fetch bills, farms, and agents from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });

        if (billsError) throw billsError;

        // Fetch bill items for each bill
        const billsWithItems = await Promise.all(
          (billsData || []).map(async (bill) => {
                        const { data: itemsData, error: itemsError } = await supabase
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .from('bill_items' as any)
              .select('*')
              .eq('bill_id', bill.bill_id)
              .order('created_at', { ascending: true});

            if (itemsError) console.error('Error fetching bill items:', itemsError);

            return {
              ...bill,
              bill_items: itemsData || []
            };
          })
        );

        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('farm_id, owner_name');

        if (farmsError) throw farmsError;

        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('agent_id, agent_name');

        if (agentsError) throw agentsError;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBills(billsWithItems as any);
        setFarms(farmsData || []);
        setAgents(agentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.agent_id === agentId);
    return agent ? agent.agent_name : agentId;
  };

  const getFarmName = (farmId: string | null | undefined) => {
    if (!farmId) return 'N/A';
    const farm = farms.find(f => f.farm_id === farmId);
    return farm ? farm.owner_name : farmId;
  };

  const handleDeleteBill = async (bill: Bill) => {
    if (!confirm(`Are you sure you want to delete bill ${bill.bill_id}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', bill.id);

      if (error) throw error;

      setBills(bills.filter(b => b.id !== bill.id));
      
      toast({
        title: "Bill Deleted",
        description: `Bill ${bill.bill_id} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = (bill: Bill) => {
    toast({
      title: "Download Started",
      description: `Downloading bill ${bill.bill_id}...`,
    });
    // In real app, generate and download PDF
    console.log("Download PDF for bill:", bill.bill_id);
  };

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setIsViewOpen(true);
  };

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

  return (
    <div className="min-h-screen bg-background font-poppins">
      <style>{`
        @import url('@/lib/print-styles.css');
        
        @media print {
          .actions-column {
            display: none !important;
          }
          
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
        <h1>Sales Bill List</h1>
        <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print-container">
        <div className="flex justify-between items-start mb-8 no-print">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales Bill List</h1>
              <p className="text-muted-foreground">Manage all sales bills and transactions</p>
            </div>
          </div>
          <Button
            onClick={handlePrintAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print All Bills
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-6 hidden print:block">Sales Bill List</h1>

        <Card className="shadow-card border-border/50 print:shadow-none print:border-0">
          <CardHeader className="print:hidden">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <FileText className="h-6 w-6" />
              All Sales Bills ({bills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="print-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Linked Agent</TableHead>
                    <TableHead>Linked Farm</TableHead>
                    <TableHead className="text-right">Quantity (kg)</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                    <TableHead className="text-center actions-column no-print">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.length > 0 ? (
                    bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(bill.created_at).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="font-mono font-medium">{bill.bill_id}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary print-plain-text">
                            {getAgentName(bill.agent_id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary/20 text-secondary print-plain-text">
                            {getFarmName(bill.farm_id)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {bill.quantity.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{bill.total.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="actions-column no-print">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(bill)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/edit-bill/${bill.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBill(bill)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <p className="mb-2">No sales bills created yet</p>
                          <p className="text-sm">Create bills from the home page</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹{bills.reduce((sum, bill) => sum + bill.net_payment, 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Payments</div>
                </CardContent>
              </Card>
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {bills.reduce((sum, bill) => sum + bill.quantity, 0)} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Total Quantity</div>
                </CardContent>
              </Card>
              <Card className="border-secondary/20 bg-secondary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {bills.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Bills</div>
                </CardContent>
              </Card>
            </div>

            {/* Print Summary - Removed Total Quantity and Total Bills as per requirements */}
            <div className="print-summary hidden print:flex" style={{ display: 'none' }}>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* View Bill Details Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bill Details</SheetTitle>
          </SheetHeader>
          {selectedBill && (
            <div className="mt-6 space-y-6">
              {/* Header Info */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Bill ID</p>
                    <p className="font-mono font-bold text-lg">{selectedBill.bill_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                    <p className="font-semibold text-lg">{new Date(selectedBill.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Party Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Party Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Agent</span>
                    <span className="font-semibold">{getAgentName(selectedBill.agent_id)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Farm</span>
                    <span className="font-semibold">{getFarmName(selectedBill.farm_id)}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vehicle Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Vehicle Number</span>
                    <span className="font-mono font-semibold">{selectedBill.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Arrival Number</span>
                    <span className="font-semibold">{selectedBill.arrival_number}</span>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financial Details</h3>
                <div className="space-y-3">
                  {/* Total Varieties Summary */}
                  {selectedBill.bill_items && selectedBill.bill_items.length > 0 && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Total Varieties Included</span>
                      <span className="font-bold text-lg text-blue-900 dark:text-blue-100">{selectedBill.bill_items.length}</span>
                    </div>
                  )}

                  {/* Variety-wise breakdown */}
                  {selectedBill.bill_items && selectedBill.bill_items.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-muted-foreground">Variety Breakdown</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variety</TableHead>
                            <TableHead className="text-right">Quantity (kg)</TableHead>
                            <TableHead className="text-right">Rate (₹/kg)</TableHead>
                            <TableHead className="text-right">Total (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBill.bill_items.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{item.product_variety}</div>
                                <div className="text-xs text-muted-foreground">Item #{index + 1}</div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">{item.quantity.toLocaleString('en-IN')}</div>
                                <div className="text-xs text-muted-foreground">kg</div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium">₹{item.rate.toLocaleString('en-IN')}</div>
                                <div className="text-xs text-muted-foreground">per kg</div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                <div>₹{item.total.toLocaleString('en-IN')}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.quantity > 0 ? `₹${(item.total / item.quantity).toFixed(2)}/kg` : 'N/A'}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="bg-muted/20 p-3 rounded-lg">
                        <div className="flex justify-between font-semibold">
                          <span>Total Varieties:</span>
                          <span>{selectedBill.bill_items.length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No variety details available</p>
                  )}

                  {/* Financial Summary */}
                  <div className="border rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-muted-foreground mb-3">Financial Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground">Unloading Charges:</span>
                          <span className="font-medium">₹{selectedBill.unloading_amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground">Advance:</span>
                          <span className="font-medium">₹{selectedBill.advance.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="text-muted-foreground">Total Quantity:</span>
                          <span className="font-medium">{selectedBill.quantity.toLocaleString('en-IN')} kg</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-primary/10 rounded border border-primary/20">
                          <span className="font-semibold">Gross Total:</span>
                          <span className="font-bold text-lg">₹{selectedBill.total.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-success/10 rounded border border-success/20">
                          <span className="font-bold text-success">Net Payment:</span>
                          <span className="font-bold text-success text-lg">₹{selectedBill.net_payment.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SaleBillList;