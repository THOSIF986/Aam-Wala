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
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Palette, 
  Bell, 
  Shield, 
  Save,
  Upload,
  ArrowLeft
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { companySettings, updateCompanySettings } = useCompanySettings();

  const [appSettings, setAppSettings] = useState({
    theme: "light",
    language: "en",
    dateFormat: "dd/mm/yyyy",
    numberFormat: "en-IN",
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    passwordExpiry: "90",
    twoFactorAuth: false,
    loginAttempts: "3"
  });

  const handleCompanySettingsChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
  };

  const handleAppSettingsChange = (field: string, value: string | boolean) => {
    setAppSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingsChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // In real app, save to backend
    console.log("Saving settings:", {
      company: companySettings,
      app: appSettings,
      security: securitySettings
    });
    
    toast({
      title: "Settings Saved",
      description: "All settings have been updated successfully.",
    });
  };

  const handleLogoUpload = () => {
    // In real app, handle file upload
    console.log("Upload logo");
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality will be implemented.",
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Information */}
          <Card className="lg:col-span-2 shadow-card border-border/50">
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

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🥭</span>
                  </div>
                  <Button variant="outline" onClick={handleLogoUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - App & Security Settings */}
          <div className="space-y-8">
            {/* Application Settings */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Palette className="h-6 w-6" />
                  Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appSettings.theme}
                    onValueChange={(value) => handleAppSettingsChange("theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={appSettings.language}
                    onValueChange={(value) => handleAppSettingsChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={appSettings.dateFormat}
                    onValueChange={(value) => handleAppSettingsChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Bell className="h-6 w-6" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Auto Backup</Label>
                    <p className="text-xs text-muted-foreground">Daily automatic backups</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={appSettings.autoBackup}
                    onCheckedChange={(checked) => handleAppSettingsChange("autoBackup", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive email alerts</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={appSettings.emailNotifications}
                    onCheckedChange={(checked) => handleAppSettingsChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive SMS alerts</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={appSettings.smsNotifications}
                    onCheckedChange={(checked) => handleAppSettingsChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="h-6 w-6" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Extra security layer</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecuritySettingsChange("twoFactorAuth", checked)}
                  />
                </div>

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
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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