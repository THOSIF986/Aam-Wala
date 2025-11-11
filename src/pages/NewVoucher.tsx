import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Receipt, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NewVoucher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editVoucher = location.state?.voucher;
  const isEditMode = !!editVoucher;
  const [nextFarmNumber, setNextFarmNumber] = useState(1);
  const [nextAgentNumber, setNextAgentNumber] = useState(1);

  const [formData, setFormData] = useState({
    voucherId: "",
    linkedTo: "",
    linkedId: "",
    type: "",
    reason: "",
    reasonDescription: "",
    mode: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });

  // State for farms and agents data
  const [farms, setFarms] = useState([]);
  const [agents, setAgents] = useState([]);

  // Fetch farms, agents, and next voucher numbers when component loads
  useEffect(() => {
    const fetchData = async () => {
      const year = new Date().getFullYear();
      
      // get farms from db
      const { data: farmsData } = await supabase
        .from('farms')
        .select('farm_id, owner_name')
        .eq('status', 'active');
      
      // get agents from db
      const { data: agentsData } = await supabase
        .from('agents')
        .select('agent_id, agent_name, company_name')
        .eq('status', 'active');
      
      // get last farm voucher number
      const { data: lastFarmVoucher } = await supabase
        .from('vouchers')
        .select('voucher_id')
        .like('voucher_id', `VC-F-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (lastFarmVoucher && lastFarmVoucher.length > 0) {
        const lastNum = parseInt(lastFarmVoucher[0].voucher_id.split('-')[3]) || 0;
        setNextFarmNumber(lastNum + 1);
      }
      
      // get last agent voucher number
      const { data: lastAgentVoucher } = await supabase
        .from('vouchers')
        .select('voucher_id')
        .like('voucher_id', `VC-A-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (lastAgentVoucher && lastAgentVoucher.length > 0) {
        const lastNum = parseInt(lastAgentVoucher[0].voucher_id.split('-')[3]) || 0;
        setNextAgentNumber(lastNum + 1);
      }
      
      setFarms(farmsData || []);
      setAgents(agentsData || []);
    };

    fetchData();
  }, []);

  // load form if editing
  useEffect(() => {
    if (editVoucher) {
      setFormData({
        voucherId: editVoucher.voucher_id,
        linkedTo: editVoucher.linked_to,
        linkedId: editVoucher.linked_id,
        type: editVoucher.type,
        reason: editVoucher.reason,
        reasonDescription: editVoucher.description || "",
        mode: editVoucher.payment_mode,
        amount: editVoucher.amount.toString(),
        date: editVoucher.date
      });
    }
  }, [editVoucher]);

  const generateVoucherId = (linkedTo: string, num: number) => {
    const year = new Date().getFullYear();
    const prefix = linkedTo === "farm" ? "VC-F" : "VC-A";
    return `${prefix}-${year}-${String(num).padStart(3, '0')}`;
  };

  const handleLinkedToChange = (value: string) => {
    const num = value === "farm" ? nextFarmNumber : nextAgentNumber;
    setFormData(prev => ({
      ...prev,
      linkedTo: value,
      linkedId: "",
      type: value === "farm" ? "expense" : "income",
      voucherId: generateVoucherId(value, num)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // update existing voucher
        const { error } = await supabase
          .from('vouchers')
          .update({
            linked_to: formData.linkedTo,
            linked_id: formData.linkedId,
            type: formData.type,
            date: formData.date,
            reason: formData.reason,
            description: formData.reasonDescription,
            payment_mode: formData.mode,
            amount: parseFloat(formData.amount)
          })
          .eq('id', editVoucher.id);

        if (error) throw error;
        
        toast({
          title: "Success!",
          description: `Voucher ${formData.voucherId} has been updated`,
        });
        
        navigate('/voucher-list');
      } else {
        // create new voucher
        const { error } = await supabase
          .from('vouchers')
          .insert([{
            voucher_id: formData.voucherId,
            linked_to: formData.linkedTo,
            linked_id: formData.linkedId,
            type: formData.type,
            date: formData.date,
            reason: formData.reason,
            description: formData.reasonDescription,
            payment_mode: formData.mode,
            amount: parseFloat(formData.amount)
          }]);

        if (error) throw error;
        
        toast({
          title: "Success!",
          description: `Voucher ${formData.voucherId} created`,
        });
        
        // increment the appropriate counter
        if (formData.linkedTo === "farm") {
          setNextFarmNumber(prev => prev + 1);
        } else {
          setNextAgentNumber(prev => prev + 1);
        }
        
        // reset form
        setFormData({
          voucherId: "",
          linkedTo: "",
          linkedId: "",
          type: "",
          reason: "",
          reasonDescription: "",
          mode: "",
          amount: "",
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} voucher:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} voucher. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit Voucher' : 'Create New Voucher'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update voucher details' : 'Create expense vouchers for farms or agents'}
            </p>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Receipt className="h-6 w-6" />
              {isEditMode ? 'Edit Voucher Form' : 'Voucher Creation Form'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the voucher information below' : 'Fill in the details below to create a new voucher'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedTo">Linked To *</Label>
                  <Select
                    value={formData.linkedTo}
                    onValueChange={handleLinkedToChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select farm or agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farm">Farm</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voucherId">Voucher ID</Label>
                  <Input
                    id="voucherId"
                    value={formData.voucherId}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated based on selection</p>
                </div>
              </div>

              {formData.linkedTo && (
                <div className="space-y-2">
                  <Label htmlFor="linkedId">
                    Select {formData.linkedTo === "farm" ? "Farm" : "Agent"} *
                  </Label>
                  <Select
                    value={formData.linkedId}
                    onValueChange={(value) => handleInputChange("linkedId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a ${formData.linkedTo}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.linkedTo === "farm" ? (
                        farms.length > 0 ? (
                          farms.map((item) => (
                            <SelectItem key={item.farm_id} value={item.farm_id}>
                              {item.farm_id} - {item.owner_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-farms" disabled>No farms available</SelectItem>
                        )
                      ) : (
                        agents.length > 0 ? (
                          agents.map((item) => (
                            <SelectItem key={item.agent_id} value={item.agent_id}>
                              {item.agent_id} - {item.agent_name} ({item.company_name})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-agents" disabled>No agents available</SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => handleInputChange("reason", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason for voucher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="other-expenses">Other Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.reason === "other-expenses" && (
                <div className="space-y-2">
                  <Label htmlFor="reasonDescription">Description *</Label>
                  <Textarea
                    id="reasonDescription"
                    value={formData.reasonDescription}
                    onChange={(e) => handleInputChange("reasonDescription", e.target.value)}
                    placeholder="Describe the expense..."
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mode">Payment Mode *</Label>
                  <Select
                    value={formData.mode}
                    onValueChange={(value) => handleInputChange("mode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Voucher' : 'Create Voucher'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewVoucher;