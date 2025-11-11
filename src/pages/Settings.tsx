import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import {
  Settings as SettingsIcon,
  Building2,
  Shield,
  Save,
  ArrowLeft,
  Users,
  Trash2,
  Key
} from "lucide-react";
import { useAuth, getAllUsers, createWriter, deleteWriter, changePassword, User } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { companySettings, updateCompanySettings } = useCompanySettings();
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [newWriter, setNewWriter] = useState({
    fullName: "",
    phone: "",
    password: ""
  });
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    twoFactorAuth: false,
    loginAttempts: "3",
    autoLockout: true,
    lockoutDuration: "30"
  });

  useEffect(() => {
    if (isAdmin) {
      setUsers(getAllUsers());
      
      // Load security settings from localStorage
      const savedSecuritySettings = localStorage.getItem('securitySettings');
      if (savedSecuritySettings) {
        try {
          const parsed = JSON.parse(savedSecuritySettings);
          setSecuritySettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error parsing security settings:', error);
        }
      }
    }
  }, [isAdmin]);

  // Update users when they change
  useEffect(() => {
    if (isAdmin) {
      setUsers(getAllUsers());
    }
  }, [isAdmin]);

  const handleCompanySettingsChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
  };

  const handleSecuritySettingsChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    
    console.log("Saving settings:", {
      company: companySettings,
      security: securitySettings
    });
    
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated successfully.",
    });
  };

  const handleCreateWriter = () => {
    if (!newWriter.fullName || !newWriter.phone || !newWriter.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields to create a writer account.",
        variant: "destructive",
      });
      return;
    }

    if (newWriter.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser) {
      try {
        const writer = createWriter(newWriter.fullName, newWriter.phone, newWriter.password, currentUser.id);
        setUsers(getAllUsers());
        setNewWriter({ fullName: "", phone: "", password: "" });

        toast({
          title: "Writer Created",
          description: `Writer account ${writer.id} has been created successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create writer account.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteWriter = (userId: string) => {
    const success = deleteWriter(userId);
    if (success) {
      setUsers(getAllUsers());
      toast({
        title: "Writer Deleted",
        description: "Writer account has been removed successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete writer account.",
        variant: "destructive",
      });
    }
  };

  const handleChangeAdminPassword = () => {
    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser) {
      const success = changePassword(currentUser.id, newAdminPassword);
      if (success) {
        setNewAdminPassword("");
        toast({
          title: "Password Changed",
          description: "Admin password has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to change password.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-foreground">Application Settings</h1>
            <p className="text-muted-foreground">Configure your business application preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Building2 className="h-6 w-6" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => handleCompanySettingsChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={companySettings.currency}
                    onValueChange={(value) => handleCompanySettingsChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => handleCompanySettingsChange("address", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => handleCompanySettingsChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => handleCompanySettingsChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    value={companySettings.gst}
                    onChange={(e) => handleCompanySettingsChange("gst", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                  <Select
                    value={companySettings.fiscalYearStart}
                    onValueChange={(value) => handleCompanySettingsChange("fiscalYearStart", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="january">January</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings - Simplified */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-6 w-6" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure session and login security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Session Management</h3>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) => handleSecuritySettingsChange("sessionTimeout", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                </div>
              </div>

              {/* Login Security */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Login Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Select
                    value={securitySettings.loginAttempts}
                    onValueChange={(value) => handleSecuritySettingsChange("loginAttempts", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Lock account after failed attempts</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoLockout">Auto Account Lockout</Label>
                    <p className="text-xs text-muted-foreground">Lock on suspicious activity</p>
                  </div>
                  <Switch
                    id="autoLockout"
                    checked={securitySettings.autoLockout}
                    onCheckedChange={(checked) => handleSecuritySettingsChange("autoLockout", checked)}
                  />
                </div>

                {securitySettings.autoLockout && (
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Lockout Duration</Label>
                    <Select
                      value={securitySettings.lockoutDuration}
                      onValueChange={(value) => handleSecuritySettingsChange("lockoutDuration", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                        <SelectItem value="permanent">Permanent (Admin unlock required)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management - Admin Only */}
        {isAdmin && (
          <div className="mt-8">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-6 w-6" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Create and manage writer accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Create Writer Account</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="writerName">Full Name</Label>
                        <Input
                          id="writerName"
                          value={newWriter.fullName}
                          onChange={(e) => setNewWriter({ ...newWriter, fullName: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="writerPhone">Phone</Label>
                        <Input
                          id="writerPhone"
                          value={newWriter.phone}
                          onChange={(e) => setNewWriter({ ...newWriter, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="writerPassword">Password</Label>
                        <Input
                          id="writerPassword"
                          type="password"
                          value={newWriter.password}
                          onChange={(e) => setNewWriter({ ...newWriter, password: e.target.value })}
                          placeholder="Enter password (min 6 characters)"
                        />
                      </div>
                      <Button onClick={handleCreateWriter} className="w-full bg-gradient-primary">
                        <Users className="h-4 w-4 mr-2" />
                        Create Writer
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Existing Writers</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {users.filter(u => u.role === 'writer').length === 0 ? (
                        <p className="text-sm text-muted-foreground">No writer accounts created yet.</p>
                      ) : (
                        users.filter(u => u.role === 'writer').map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{user.id}</p>
                              <p className="text-xs text-muted-foreground">{user.phone}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteWriter(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Admin Password
                  </h3>
                  <div className="flex gap-4 items-end max-w-md">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="newAdminPassword">New Password</Label>
                      <Input
                        id="newAdminPassword"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <Button onClick={handleChangeAdminPassword} className="bg-gradient-secondary">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;