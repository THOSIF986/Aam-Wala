import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Layout/Navbar";
import { ArrowLeft, Printer, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const AgentLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch agent details
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('*')
          .eq('agent_id', id)
          .maybeSingle();

        if (agentError) throw agentError;
        
        if (agentData) {
          setAgent(agentData);

          // Fetch ledger entries for this agent
          const { data: ledgerData, error: ledgerError } = await supabase
            .from('ledger_entries')
            .select('*')
            .eq('entity_type', 'agent')
            .eq('entity_id', agentData.agent_id)
            .order('date', { ascending: true });

          if (ledgerError) throw ledgerError;
          setLedgerEntries(ledgerData || []);
        } else {
          toast.error("Agent not found");
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
  const balance = totalDebit - totalCredit; // Debit - Credit (positive = agent owes us, negative = we owe)
  const totalVouchers = ledgerEntries.filter(entry => entry.transaction_type === 'voucher').length;
  const totalBills = ledgerEntries.filter(entry => entry.transaction_type === 'bill').length;

  const handlePrintAll = () => {
    window.print();
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
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
              <h1 className="text-3xl font-bold text-foreground">Agent: {agent.agent_name}</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Agent Details */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-border/50 sticky top-8">
              <CardHeader>
                <CardTitle className="text-primary">Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="font-semibold">{agent.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
                  <p className="font-semibold">{agent.agent_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                  <p className="font-mono">{agent.mobile || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Guarantor</label>
                  <p className="font-semibold">{agent.guarantor || 'N/A'}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Active</span>
                  {agent.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Balance Display */}
                <div className="border-t pt-4 mt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Agent Balance</p>
                    <div className={`text-2xl font-bold ${
                      balance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{Math.abs(balance).toLocaleString('en-IN')}
                      {balance > 0 ? ' (Agent Owes Us)' : ' (We Owe)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Ledger Table */}
          <div className="lg:col-span-3">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-secondary">Ledger Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/20">
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
                                <span className={`w-2 h-2 rounded-full ${
                                  entry.transaction_type === 'bill' ? 'bg-destructive' : 'bg-success'
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
                              <p className="text-sm">Transactions will appear here once bills and vouchers are created for this agent</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Row */}
                <div className="bg-primary/10 p-4 rounded-lg mt-6">
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
      </main>
    </div>
  );
};

export default AgentLedger;