import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Save, Calculator, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EditBill = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    billId: "",
    agent: "",
    farm: "",
    vehicle: "",
    unloadingAmount: "",
    advance: "",
    total: "",
    arrivalNumber: "",
    netPayment: ""
  });

  const [varieties, setVarieties] = useState([
    { id: 1, variety: "", quantity: "", rate: "", total: 0 }
  ]);

  const [agents, setAgents] = useState([]);
  const [farms, setFarms] = useState([]);

  // Fetch bill data and populate form
  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const { data: billData, error: billError } = await supabase
          .from('bills')
          .select('*')
          .eq('id', id)
          .single();

        if (billError) throw billError;

        if (billData) {
          setFormData({
            billId: billData.bill_id,
            agent: billData.agent_id,
            farm: billData.farm_id || "",
            vehicle: billData.vehicle_number,
            unloadingAmount: billData.unloading_amount.toString(),
            advance: billData.advance.toString(),
            total: billData.total.toString(),
            arrivalNumber: billData.arrival_number,
            netPayment: billData.net_payment.toString()
          });

          // Parse varieties from JSON
          try {
            const parsedVarieties = JSON.parse(billData.product_variety);
            if (Array.isArray(parsedVarieties)) {
              setVarieties(parsedVarieties);
            }
          } catch (e) {
            console.error('Error parsing varieties:', e);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bill:', error);
        toast({
          title: "Error",
          description: "Failed to load bill data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    const fetchAgents = async () => {
      const { data } = await supabase
        .from('agents')
        .select('agent_id, agent_name, company_name')
        .eq('status', 'active');
      
      setAgents(data || []);
    };

    const fetchFarms = async () => {
      const { data } = await supabase
        .from('farms')
        .select('farm_id, owner_name, location, crop_type')
        .eq('status', 'active');
      
      setFarms(data || []);
    };

    if (id) {
      fetchBillData();
      fetchAgents();
      fetchFarms();
    }
  }, [id]);

  // Calculate totals
  useEffect(() => {
    const updatedVarieties = varieties.map(variety => ({
      ...variety,
      total: (parseFloat(variety.quantity) || 0) * (parseFloat(variety.rate) || 0)
    }));
    
    if (JSON.stringify(updatedVarieties) !== JSON.stringify(varieties)) {
      setVarieties(updatedVarieties);
    }
    
    const totalAmount = updatedVarieties.reduce((sum, variety) => sum + variety.total, 0);
    const unloadingAmount = parseFloat(formData.unloadingAmount) || 0;
    const advance = parseFloat(formData.advance) || 0;
    const netPayment = totalAmount - (unloadingAmount + advance);

    setFormData(prev => ({
      ...prev,
      total: totalAmount > 0 ? totalAmount.toString() : "",
      netPayment: netPayment > 0 ? netPayment.toString() : ""
    }));
  }, [varieties, formData.unloadingAmount, formData.advance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validVarieties = varieties.filter(v => v.variety && v.quantity && v.rate);
    if (validVarieties.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product variety with quantity and rate.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const totalQuantity = validVarieties.reduce((sum, v) => sum + parseFloat(v.quantity), 0);
      const averageRate = parseFloat(formData.total) / totalQuantity;
      
      const { error } = await supabase
        .from('bills')
        .update({
          agent_id: formData.agent,
          farm_id: formData.farm,
          vehicle_number: formData.vehicle,
          arrival_number: formData.arrivalNumber,
          product_variety: JSON.stringify(validVarieties),
          unloading_amount: parseFloat(formData.unloadingAmount) || 0,
          advance: parseFloat(formData.advance) || 0,
          quantity: totalQuantity,
          rate: averageRate,
          total: parseFloat(formData.total),
          net_payment: parseFloat(formData.netPayment),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Bill Updated Successfully",
        description: `Bill ${formData.billId} has been updated`,
      });
      
      navigate('/sale-bill-list');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
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

  const handleVarietyChange = (id: number, field: string, value: string) => {
    setVarieties(prev => prev.map(variety => 
      variety.id === id 
        ? { ...variety, [field]: value }
        : variety
    ));
  };

  const addVariety = () => {
    const newId = Math.max(...varieties.map(v => v.id)) + 1;
    setVarieties(prev => [...prev, { id: newId, variety: "", quantity: "", rate: "", total: 0 }]);
  };

  const removeVariety = (id: number) => {
    if (varieties.length > 1) {
      setVarieties(prev => prev.filter(variety => variety.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bill data...</p>
          </div>
        </main>
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
            onClick={() => navigate('/sale-bill-list')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Bill</h1>
            <p className="text-muted-foreground">Update sales bill details</p>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <FileText className="h-6 w-6" />
              Sales Bill Edit Form - {formData.billId}
            </CardTitle>
            <CardDescription>
              Update the details below to modify the sales bill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billId">Bill ID</Label>
                  <Input
                    id="billId"
                    value={formData.billId}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent">Agent *</Label>
                  <Select
                    value={formData.agent}
                    onValueChange={(value) => handleInputChange("agent", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.length > 0 ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.agent_id} value={agent.agent_id}>
                            {agent.agent_id} - {agent.agent_name} ({agent.company_name})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-agents" disabled>No agents available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farm">Farm *</Label>
                  <Select
                    value={formData.farm}
                    onValueChange={(value) => handleInputChange("farm", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.length > 0 ? (
                        farms.map((farm) => (
                          <SelectItem key={farm.farm_id} value={farm.farm_id}>
                            {farm.farm_id} - {farm.owner_name} ({farm.location})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-farms" disabled>No farms available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Number *</Label>
                  <Input
                    id="vehicle"
                    value={formData.vehicle}
                    onChange={(e) => handleInputChange("vehicle", e.target.value)}
                    placeholder="e.g., MH12AB1234"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arrivalNumber">Arrival Number</Label>
                  <Input
                    id="arrivalNumber"
                    value={formData.arrivalNumber}
                    onChange={(e) => handleInputChange("arrivalNumber", e.target.value)}
                    placeholder="e.g., A001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unloadingAmount">Unloading Amount (₹)</Label>
                  <Input
                    id="unloadingAmount"
                    type="number"
                    value={formData.unloadingAmount}
                    onChange={(e) => handleInputChange("unloadingAmount", e.target.value)}
                    placeholder="Enter unloading charges"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advance">Advance (₹)</Label>
                  <Input
                    id="advance"
                    type="number"
                    value={formData.advance}
                    onChange={(e) => handleInputChange("advance", e.target.value)}
                    placeholder="Enter advance amount"
                  />
                </div>
              </div>

              {/* Product Varieties Section */}
              <Card className="border-primary/20 bg-accent/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Product Varieties & Calculation
                    </div>
                    <Button
                      type="button"
                      onClick={addVariety}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variety
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {varieties.map((variety, index) => (
                    <div key={variety.id} className="p-4 border border-border/50 rounded-lg bg-background/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">Variety {index + 1}</h4>
                        {varieties.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariety(variety.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`variety-${variety.id}`}>Product Variety *</Label>
                          <Input
                            id={`variety-${variety.id}`}
                            value={variety.variety}
                            onChange={(e) => handleVarietyChange(variety.id, "variety", e.target.value)}
                            placeholder="e.g., Alphonso, Kesar"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${variety.id}`}>Quantity (kg) *</Label>
                          <Input
                            id={`quantity-${variety.id}`}
                            type="number"
                            step="0.1"
                            value={variety.quantity}
                            onChange={(e) => handleVarietyChange(variety.id, "quantity", e.target.value)}
                            placeholder="Enter quantity"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`rate-${variety.id}`}>Rate per kg (₹) *</Label>
                          <Input
                            id={`rate-${variety.id}`}
                            type="number"
                            step="0.01"
                            value={variety.rate}
                            onChange={(e) => handleVarietyChange(variety.id, "rate", e.target.value)}
                            placeholder="Enter rate"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`total-${variety.id}`}>Total (₹)</Label>
                          <Input
                            id={`total-${variety.id}`}
                            value={variety.total.toFixed(2)}
                            disabled
                            className="bg-muted font-semibold text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalAmount" className="text-lg font-semibold">
                          Total Amount (₹)
                        </Label>
                        <Input
                          id="totalAmount"
                          value={formData.total}
                          disabled
                          className="bg-muted font-bold text-primary text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="netPayment" className="text-lg font-semibold">
                          Net Payment (₹)
                        </Label>
                        <Input
                          id="netPayment"
                          value={formData.netPayment}
                          disabled
                          className="bg-success/10 font-bold text-success text-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          Total Amount - (Unloading Amount + Advance)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/sale-bill-list')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-secondary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Bill
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditBill;
