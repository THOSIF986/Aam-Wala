import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Tractor, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NewFarm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmId: `FARM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
    ownerName: "",
    location: "",
    cropType: "Mango",
    area: "",
    farmPrice: "",
    leaseYears: "",
    guarantor: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate lease dates from current date + years
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(formData.leaseYears))).toISOString().split('T')[0];

      const { error } = await supabase
        .from('farms')
        .insert([{
          farm_id: formData.farmId,
          owner_name: formData.ownerName,
          location: formData.location,
          area: parseFloat(formData.area),
          price: parseFloat(formData.farmPrice),
          lease_start_date: startDate,
          lease_end_date: endDate,
          guarantor: formData.guarantor,
          crop_type: formData.cropType,
          status: 'active'
        }]);

      if (error) throw error;
      
      toast({
        title: "Farm Registered Successfully",
        description: `Farm ${formData.farmId} has been registered for ${formData.ownerName}`,
      });
      
      // Reset form instead of navigating
      setFormData({
        farmId: `FARM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
        ownerName: "",
        location: "",
        cropType: "Mango",
        area: "",
        farmPrice: "",
        leaseYears: "",
        guarantor: ""
      });
    } catch (error) {
      console.error('Error registering farm:', error);
      toast({
        title: "Error",
        description: "Failed to register farm. Please try again.",
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Register New Farm</h1>
            <p className="text-muted-foreground">Add a new mango farm to the system</p>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Tractor className="h-6 w-6" />
              Farm Registration Form
            </CardTitle>
            <CardDescription>
              Fill in the details below to register a new farm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Farm ID - Auto Generated */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmId">Farm ID</Label>
                  <Input
                    id="farmId"
                    value={formData.farmId}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated unique ID</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Input
                    id="cropType"
                    value={formData.cropType}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Owner Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    placeholder="Enter owner's full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Farm location/address"
                    required
                  />
                </div>
              </div>

              {/* Farm Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (Acres) *</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="e.g., 5.5"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmPrice">Farm Price (₹) *</Label>
                  <Input
                    id="farmPrice"
                    type="number"
                    value={formData.farmPrice}
                    onChange={(e) => handleInputChange("farmPrice", e.target.value)}
                    placeholder="e.g., 500000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leaseYears">Lease Years *</Label>
                  <Input
                    id="leaseYears"
                    type="number"
                    min="1"
                    value={formData.leaseYears}
                    onChange={(e) => handleInputChange("leaseYears", e.target.value)}
                    placeholder="e.g., 5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guarantor">Guarantor *</Label>
                <Select
                  value={formData.guarantor}
                  onValueChange={(value) => handleInputChange("guarantor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guarantor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Register Farm
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewFarm;