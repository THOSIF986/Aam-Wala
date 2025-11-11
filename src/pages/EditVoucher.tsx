import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditVoucher = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
  const [farms, setFarms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Fetch voucher data when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the voucher data
        const { data: voucherData, error: voucherError } = await supabase
          .from('vouchers')
          .select('*')
          .eq('id', id)
          .single();

        if (voucherError) throw voucherError;

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
        
        if (voucherData) {
          setFormData({
            voucherId: voucherData.voucher_id,
            linkedTo: voucherData.linked_to,
            linkedId: voucherData.linked_id,
            type: voucherData.type,
            reason: voucherData.reason,
            reasonDescription: voucherData.description || "",
            mode: voucherData.payment_mode,
            amount: voucherData.amount.toString(),
            date: voucherData.date
          });
        }
        
        setFarms(farmsData || []);
        setAgents(agentsData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load voucher data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Voucher ${formData.voucherId} has been updated`,
      });
      
      navigate('/voucher-list');
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to update voucher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading voucher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-foreground">Edit Voucher</h1>
            <p className="text-muted-foreground">Update voucher details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Receipt className="h-6 w-6" />
                Voucher Information
              </CardTitle>
              <CardDescription>
                Edit the voucher details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voucher ID - Read only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="voucherId">Voucher ID</Label>
                  <Input
                    id="voucherId"
                    name="voucherId"
                    value={formData.voucherId}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Linked To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedTo">Linked To</Label>
                  <Select 
                    value={formData.linkedTo} 
                    onValueChange={(value) => handleSelectChange("linkedTo", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farm">Farm</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedId">Linked Entity</Label>
                  <Select 
                    value={formData.linkedId} 
                    onValueChange={(value) => handleSelectChange("linkedId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.linkedTo === "farm" && farms.map(farm => (
                        <SelectItem key={farm.farm_id} value={farm.farm_id}>
                          {farm.owner_name} ({farm.farm_id})
                        </SelectItem>
                      ))}
                      {formData.linkedTo === "agent" && agents.map(agent => (
                        <SelectItem key={agent.agent_id} value={agent.agent_id}>
                          {agent.company_name} - {agent.agent_name} ({agent.agent_id})
                        </SelectItem>
                      ))}
                      {!formData.linkedTo && (
                        <SelectItem value="" disabled>
                          Select entity type first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type and Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange("type", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode">Payment Mode</Label>
                  <Select 
                    value={formData.mode} 
                    onValueChange={(value) => handleSelectChange("mode", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., Advance Payment, Unloading Charges"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="reasonDescription">Description</Label>
                <Textarea
                  id="reasonDescription"
                  name="reasonDescription"
                  value={formData.reasonDescription}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Additional details about this voucher"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/voucher-list')}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Voucher
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default EditVoucher;