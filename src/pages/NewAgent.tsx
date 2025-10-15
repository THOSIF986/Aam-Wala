import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, UserCheck, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NewAgent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    agentId: `AGNT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
    companyName: "",
    agentName: "",
    mobile: "",
    guarantor: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('agents')
        .insert([{
          agent_id: formData.agentId,
          company_name: formData.companyName,
          agent_name: formData.agentName,
          mobile: formData.mobile,
          guarantor: formData.guarantor,
          status: 'active'
        }]);

      if (error) throw error;
      
      toast({
        title: "Agent Registered Successfully",
        description: `Agent ${formData.agentId} has been registered for ${formData.companyName}`,
      });
      
      // Reset form instead of navigating
      setFormData({
        agentId: `AGNT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
        companyName: "",
        agentName: "",
        mobile: "",
        guarantor: ""
      });
    } catch (error) {
      console.error('Error registering agent:', error);
      toast({
        title: "Error",
        description: "Failed to register agent. Please try again.",
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
            <h1 className="text-3xl font-bold text-foreground">Add New Agent</h1>
            <p className="text-muted-foreground">Register a new business agent</p>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <UserCheck className="h-6 w-6" />
              Agent Registration Form
            </CardTitle>
            <CardDescription>
              Fill in the details below to register a new business agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input
                    id="agentId"
                    value={formData.agentId}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated unique ID</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name *</Label>
                  <Input
                    id="agentName"
                    value={formData.agentName}
                    onChange={(e) => handleInputChange("agentName", e.target.value)}
                    placeholder="Enter agent's full name"
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
                    <SelectItem value="other-company-member">Other Company Member</SelectItem>
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
                  className="bg-gradient-secondary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Register Agent
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewAgent;