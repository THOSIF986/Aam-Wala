import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Navbar from "@/components/Layout/Navbar";
import { Eye, Edit, Trash2, UserCheck, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Agent } from "@/lib/supabase";

const AgentList = () => {
  const navigate = useNavigate();
  
  // Agent data - will be populated from API
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAgents(data || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleEdit = (id: string) => {
    // In real app, navigate to edit agent page
    console.log("Edit agent:", id);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state
      setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  // For now, we'll show 0 for transactions and business value since we don't have that data yet
  const totalTransactions = 0;
  const totalBusinessValue = 0;

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
              <h1 className="text-3xl font-bold text-foreground">Agent Management</h1>
              <p className="text-muted-foreground">Manage all business agents and partners</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">{activeAgents}</div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">{totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                ₹{(totalBusinessValue / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">Business Volume</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <UserCheck className="h-6 w-6" />
              All Agents ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Agent Name</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <TableRow key={agent.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">{agent.agent_id}</TableCell>
                        <TableCell className="font-semibold">{agent.company_name}</TableCell>
                        <TableCell>{agent.agent_name}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setIsViewOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link to={`/agent-ledger/${agent.agent_id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="View Ledger"
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(agent.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete Agent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {loading ? (
                            <p>Loading agents...</p>
                          ) : (
                            <>
                              <p className="mb-2">No agents registered yet</p>
                              <p className="text-sm">Go to home page to add a new agent</p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* View Agent Details Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Agent Details</SheetTitle>
          </SheetHeader>
          {selectedAgent && (
            <div className="mt-6 space-y-6">
              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Agent ID</p>
                    <p className="font-mono font-bold text-lg">{selectedAgent.agent_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedAgent.status === 'active'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {selectedAgent.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Company Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Company Name</span>
                    <span className="font-semibold">{selectedAgent.company_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Agent Name</span>
                    <span className="font-semibold">{selectedAgent.agent_name}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Mobile</span>
                    <span className="font-mono font-semibold">{selectedAgent.mobile}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Alternate Mobile</span>
                    <span className="font-mono font-semibold">{selectedAgent.alternate_mobile || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="font-semibold text-right">{selectedAgent.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Guarantor Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Guarantor Name</span>
                    <span className="font-semibold">{selectedAgent.guarantor}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Guarantor Mobile</span>
                    <span className="font-mono font-semibold">{selectedAgent.guarantor_mobile}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Guarantor Village</span>
                    <span className="font-semibold">{selectedAgent.guarantor_village}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setIsViewOpen(false);
                    navigate(`/agent-ledger/${selectedAgent.agent_id}`);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Ledger
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AgentList;