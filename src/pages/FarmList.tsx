import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Layout/Navbar";
import { Eye, Edit, Trash2, Tractor, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Farm } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const FarmList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Farm data - will be populated from API
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Farm | null>(null);

  // Fetch farms from Supabase
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFarms(data || []);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleEdit = (farm: Farm) => {
    setEditForm(farm);
    setIsEditOpen(true);
  };

  const handleUpdateFarm = async () => {
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from('farms')
        .update({
          owner_name: editForm.owner_name,
          area: editForm.area,
          price: editForm.price,
          location: editForm.location,
          status: editForm.status,
        })
        .eq('id', editForm.id);

      if (error) throw error;

      setFarms(prev => prev.map(f => f.id === editForm.id ? editForm : f));
      setIsEditOpen(false);
      setEditForm(null);
      toast({
        title: "Farm Updated",
        description: "Farm details have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating farm:', error);
      toast({
        title: "Error",
        description: "Failed to update farm. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, farmId: string) => {
    if (!confirm(`Are you sure you want to delete farm ${farmId}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state
      setFarms(prev => prev.filter(farm => farm.id !== id));
    } catch (error) {
      console.error('Error deleting farm:', error);
    }
  };

  const handleView = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsViewOpen(true);
  };

  const activeFarms = farms.filter(farm => farm.status === 'active').length;
  const totalArea = farms.reduce((sum, farm) => sum + farm.area, 0);
  const totalValue = farms.reduce((sum, farm) => sum + farm.price, 0);

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
            <h1 className="text-3xl font-bold text-foreground">Farm Management</h1>
            <p className="text-muted-foreground">Manage all registered mango farms</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">{farms.length}</div>
              <div className="text-sm text-muted-foreground">Total Farms</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">{activeFarms}</div>
              <div className="text-sm text-muted-foreground">Active Farms</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalArea.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Total Acres</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                ₹{(totalValue / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Tractor className="h-6 w-6" />
              All Farms ({farms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm ID</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farms.length > 0 ? (
                    farms.map((farm) => (
                      <TableRow key={farm.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">{farm.farm_id}</TableCell>
                        <TableCell className="font-semibold">{farm.owner_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            farm.status === 'active' 
                              ? 'bg-success/20 text-success' 
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {farm.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(farm)}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link to={`/farmer-ledger/${farm.farm_id}`}>
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
                              onClick={() => handleEdit(farm)}
                              className="h-8 w-8 p-0"
                              title="Edit Farm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(farm.id, farm.farm_id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete Farm"
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
                            <p>Loading farms...</p>
                          ) : (
                            <>
                              <p className="mb-2">No farms registered yet</p>
                              <p className="text-sm">Click "Add New Farm" to register your first farm</p>
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

      {/* View Farm Details Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Farm Details</SheetTitle>
          </SheetHeader>
          {selectedFarm && (
            <div className="mt-6 space-y-6">
              {/* Header Info */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Farm ID</p>
                    <p className="font-mono font-bold text-lg">{selectedFarm.farm_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedFarm.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {selectedFarm.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Owner Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Owner Name</span>
                    <span className="font-semibold">{selectedFarm.owner_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Guarantor</span>
                    <span className="font-semibold">{selectedFarm.guarantor}</span>
                  </div>
                </div>
              </div>

              {/* Location & Area */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Location & Area</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="font-semibold">{selectedFarm.location}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Area</span>
                    <span className="font-semibold">{selectedFarm.area} acres</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Crop Type</span>
                    <span className="font-semibold">{selectedFarm.crop_type}</span>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financial Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded border border-primary/20">
                    <span className="font-medium">Lease Price</span>
                    <span className="font-bold text-lg">₹{selectedFarm.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Lease Period */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Lease Period</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="font-semibold">{new Date(selectedFarm.lease_start_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="font-semibold">{new Date(selectedFarm.lease_end_date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <Button
                  onClick={() => {
                    setIsViewOpen(false);
                    navigate(`/farmer-ledger/${selectedFarm.farm_id}`);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Ledger
                </Button>
                <Button
                  onClick={() => {
                    setIsViewOpen(false);
                    handleEdit(selectedFarm);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Farm
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Farm Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Farm Details</SheetTitle>
          </SheetHeader>
          {editForm && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-owner">Owner Name</Label>
                <Input
                  id="edit-owner"
                  value={editForm.owner_name}
                  onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Area (acres)</Label>
                  <Input
                    id="edit-area"
                    type="number"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Lease Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateFarm} className="flex-1">Save Changes</Button>
                <Button onClick={() => setIsEditOpen(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FarmList;