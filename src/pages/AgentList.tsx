import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Layout/Navbar";
import { Eye, Edit, Trash2, UserCheck, Plus, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Agent } from "@/lib/supabase";

const AgentList = () => {
  const navigate = useNavigate();
  
  // Agent data - will be populated from API
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Button
            onClick={() => navigate("/new-agent")}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Agent
          </Button>
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
                    <TableHead>Mobile</TableHead>
                    <TableHead>Guarantor</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Business Volume</TableHead>
                    <TableHead>Status</TableHead>
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
                        <TableCell className="font-mono">{agent.mobile}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                            {agent.guarantor}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell>₹0</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'active' 
                              ? 'bg-success/20 text-success' 
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {agent.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
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
                              onClick={() => handleEdit(agent.id)}
                              className="h-8 w-8 p-0"
                              title="Edit Agent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {loading ? (
                            <p>Loading agents...</p>
                          ) : (
                            <>
                              <p className="mb-2">No agents registered yet</p>
                              <p className="text-sm">Click "Add New Agent" to register your first business agent</p>
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
    </div>
  );
};

export default AgentList;