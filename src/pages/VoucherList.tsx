import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Layout/Navbar";
import { Eye, Printer, Edit, Trash2, Receipt, Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Voucher } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const VoucherList = () => {
  const navigate = useNavigate();
  
  // Voucher data - will be populated from API
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Fetch vouchers, farms, and agents from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vouchers
        const { data: vouchersData, error: vouchersError } = await supabase
          .from('vouchers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (vouchersError) throw vouchersError;
        
        // Fetch farms
        const { data: farmsData, error: farmsError } = await supabase
          .from('farms')
          .select('farm_id, owner_name');
        
        if (farmsError) throw farmsError;
        
        // Fetch agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('agent_id, agent_name');
        
        if (agentsError) throw agentsError;
        
        setVouchers(vouchersData || []);
        setFarms(farmsData || []);
        setAgents(agentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Helper function to get linked entity name
  const getLinkedEntityName = (voucher: Voucher) => {
    if (voucher.linked_to === 'farm') {
      const farm = farms.find(f => f.farm_id === voucher.linked_id);
      return farm ? farm.owner_name : 'Unknown Farm';
    } else {
      const agent = agents.find(a => a.agent_id === voucher.linked_id);
      return agent ? agent.agent_name : 'Unknown Agent';
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsViewOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setIsViewOpen(false);
    navigate("/new-voucher", { state: { voucher } });
  };

  const handleDelete = (id: string) => {
    setVoucherToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', voucherToDelete);

      if (error) throw error;

      // Update local state
      setVouchers(vouchers.filter(v => v.id !== voucherToDelete));
      
      toast({
        title: "Voucher Deleted",
        description: "The voucher has been successfully deleted.",
      });

      setDeleteDialogOpen(false);
      setVoucherToDelete(null);
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        title: "Error",
        description: "Failed to delete voucher. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Voucher List</h1>
              <p className="text-muted-foreground">Manage all expense and income vouchers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePrintAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print All
            </Button>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Receipt className="h-6 w-6" />
              All Vouchers ({vouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher ID</TableHead>
                    <TableHead>Linked To</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length > 0 ? (
                    vouchers.map((voucher) => (
                      <TableRow key={voucher.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(voucher.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="font-mono font-medium">{voucher.voucher_id}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            voucher.linked_to === 'farm' 
                              ? 'bg-secondary/20 text-secondary' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {voucher.linked_to === 'farm' ? 'Farm: ' : 'Agent: '}
                            {getLinkedEntityName(voucher)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{voucher.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(voucher)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(voucher.id)}
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
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <p className="mb-2">No vouchers created yet</p>
                          <p className="text-sm">Create vouchers from the home page</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-success/20 bg-success/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    ₹{vouchers.filter(v => v.type === 'income').reduce((sum, v) => sum + v.amount, 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                </CardContent>
              </Card>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    ₹{vouchers.filter(v => v.type === 'expense').reduce((sum, v) => sum + v.amount, 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Debits</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {vouchers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Vouchers</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* View Voucher Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Voucher Details</SheetTitle>
            <SheetDescription>
              Complete voucher information
            </SheetDescription>
          </SheetHeader>
          
          {selectedVoucher && (
            <div className="space-y-4 py-6">
              <Card className="border-primary/20">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Voucher ID</span>
                    <span className="font-mono font-semibold text-primary">{selectedVoucher.voucher_id}</span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(selectedVoucher.date).toLocaleDateString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Linked To</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedVoucher.linked_to === 'farm' 
                        ? 'bg-secondary/20 text-secondary' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {selectedVoucher.linked_to === 'farm' ? 'Farm' : 'Agent'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Linked ID</span>
                    <span className="font-medium">{selectedVoucher.linked_id}</span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedVoucher.type === 'expense' 
                        ? 'bg-destructive/20 text-destructive' 
                        : 'bg-success/20 text-success'
                    }`}>
                      {selectedVoucher.type === 'expense' ? 'Expense' : 'Income'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Reason</span>
                    <span className="font-medium text-right max-w-[60%]">{selectedVoucher.reason}</span>
                  </div>

                  {selectedVoucher.description && (
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-sm text-muted-foreground">Description</span>
                      <span className="font-medium text-right max-w-[60%]">{selectedVoucher.description}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm text-muted-foreground">Payment Mode</span>
                    <span className="font-medium uppercase">{selectedVoucher.payment_mode}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold">Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{selectedVoucher.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleEdit(selectedVoucher)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Voucher
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the voucher from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoucherList;