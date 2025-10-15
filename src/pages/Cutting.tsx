import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Scissors, Save, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const Cutting = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    farmId: "",
    cuttingType: "",
    expectedQuantity: "",
    notes: ""
  });
  const [farms, setFarms] = useState<any[]>([]);
  const [cuttingSchedule, setCuttingSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFarms();
    fetchCuttingSchedule();
  }, []);

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('status', 'active')
        .order('farm_id');
      
      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: "Error",
        description: "Failed to load farms",
        variant: "destructive",
      });
    }
  };

  const fetchCuttingSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('cutting_schedules')
        .select(`
          *,
          farms (
            farm_id,
            owner_name,
            location
          )
        `)
        .order('cutting_date', { ascending: true });
      
      if (error) throw error;
      setCuttingSchedule(data || []);
    } catch (error) {
      console.error('Error fetching cutting schedule:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.farmId || !formData.cuttingType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cutting_schedules')
        .insert({
          farm_id: formData.farmId,
          cutting_date: format(selectedDate, "yyyy-MM-dd"),
          crop_type: formData.cuttingType,
          expected_quantity: formData.expectedQuantity ? parseFloat(formData.expectedQuantity) : null,
          notes: formData.notes || null,
          status: 'scheduled'
        });
      
      if (error) throw error;
      
      toast({
        title: "Cutting Scheduled Successfully",
        description: `Cutting scheduled for ${format(selectedDate, "PPP")}`,
      });
      
      // Reset form
      setFormData({
        farmId: "",
        cuttingType: "",
        expectedQuantity: "",
        notes: ""
      });
      setSelectedDate(undefined);
      
      // Refresh the schedule
      fetchCuttingSchedule();
    } catch (error) {
      console.error('Error scheduling cutting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule cutting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-warning/20 text-warning";
      case "In Progress": return "bg-primary/20 text-primary";
      case "Completed": return "bg-success/20 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-foreground">Cutting Schedule Management</h1>
            <p className="text-muted-foreground">Plan and manage harvesting dates for all farms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule New Cutting */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Scissors className="h-6 w-6" />
                Schedule New Cutting
              </CardTitle>
              <CardDescription>
                Plan harvesting dates for your mango farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farmId">Select Farm *</Label>
                  <Select
                    value={formData.farmId}
                    onValueChange={(value) => handleInputChange("farmId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.length > 0 ? (
                        farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.farm_id}>
                            {farm.farm_id} - {farm.owner_name} ({farm.location})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">No farms available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cutting Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuttingType">Cutting Type *</Label>
                  <Select
                    value={formData.cuttingType}
                    onValueChange={(value) => handleInputChange("cuttingType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cutting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Harvest">First Harvest</SelectItem>
                      <SelectItem value="Second Harvest">Second Harvest</SelectItem>
                      <SelectItem value="Final Harvest">Final Harvest</SelectItem>
                      <SelectItem value="Quality Check">Quality Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedQuantity">Expected Quantity (kg)</Label>
                  <Input
                    id="expectedQuantity"
                    type="number"
                    value={formData.expectedQuantity}
                    onChange={(e) => handleInputChange("expectedQuantity", e.target.value)}
                    placeholder="Enter expected quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes or instructions"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-secondary hover:opacity-90"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Scheduling..." : "Schedule Cutting"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Schedule */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CalendarIcon className="h-6 w-6" />
                Cutting Schedule ({cuttingSchedule.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cuttingSchedule.length > 0 ? (
                  cuttingSchedule.map((cutting) => (
                    <div
                      key={cutting.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{cutting.farms?.owner_name}</h4>
                          <p className="text-sm text-muted-foreground">{cutting.farm_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cutting.status)}`}>
                          {cutting.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Date:</span> {new Date(cutting.cutting_date).toLocaleDateString('en-IN')}</p>
                        <p><span className="font-medium">Type:</span> {cutting.crop_type}</p>
                        {cutting.expected_quantity && (
                          <p><span className="font-medium">Expected:</span> {cutting.expected_quantity} kg</p>
                        )}
                        {cutting.notes && (
                          <p><span className="font-medium">Notes:</span> {cutting.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No cuttings scheduled</p>
                    <p className="text-sm text-muted-foreground">Schedule your first cutting using the form</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Schedule Table */}
        <Card className="shadow-card border-border/50 mt-8">
          <CardHeader>
            <CardTitle>Complete Cutting Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expected Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuttingSchedule.length > 0 ? (
                    cuttingSchedule.map((cutting) => (
                      <TableRow key={cutting.id} className="hover:bg-muted/50">
                        <TableCell>{new Date(cutting.cutting_date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cutting.farms?.owner_name}</p>
                            <p className="text-xs text-muted-foreground">{cutting.farm_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cutting.crop_type}</TableCell>
                        <TableCell>{cutting.expected_quantity ? `${cutting.expected_quantity} kg` : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cutting.status)}`}>
                            {cutting.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{cutting.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <p className="mb-2">No cutting schedule available</p>
                          <p className="text-sm">Schedule your first cutting using the form above</p>
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

export default Cutting;