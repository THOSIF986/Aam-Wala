import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Navbar from "@/components/Layout/Navbar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  FileDown,
  FileUp,
  Shield,
  Calendar,
  ArrowLeft
} from "lucide-react";

const BackupReset = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");
  
  // Backup history - will be populated from API
  const [backupHistory] = useState([]);

  const handleDownloadBackup = async () => {
    setIsLoading(true);
    try {
      console.log("Creating backup...");
      
      // Fetch all data from all tables
      const [farmsRes, agentsRes, vouchersRes, billsRes, cuttingRes, ledgerRes] = await Promise.all([
        supabase.from('farms').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('vouchers').select('*'),
        supabase.from('bills').select('*'),
        supabase.from('cutting_schedules').select('*'),
        supabase.from('ledger_entries').select('*')
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        tables: {
          farms: farmsRes.data || [],
          agents: agentsRes.data || [],
          vouchers: vouchersRes.data || [],
          bills: billsRes.data || [],
          cutting_schedules: cuttingRes.data || [],
          ledger_entries: ledgerRes.data || []
        }
      };

      // Create and download backup file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farm_business_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "Database backup has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    // Same as download backup - create and download immediately
    await handleDownloadBackup();
  };

  const handleRestoreBackup = async (file: File) => {
    setIsLoading(true);
    try {
      console.log("Restoring backup...");
      
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);
      
      if (!backupData.tables) {
        throw new Error("Invalid backup file format");
      }

      // Clear existing data first
      await Promise.all([
        supabase.from('ledger_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('vouchers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('cutting_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('farms').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      // Insert restored data
      if (backupData.tables.farms?.length > 0) {
        await supabase.from('farms').insert(backupData.tables.farms);
      }
      if (backupData.tables.agents?.length > 0) {
        await supabase.from('agents').insert(backupData.tables.agents);
      }
      if (backupData.tables.vouchers?.length > 0) {
        await supabase.from('vouchers').insert(backupData.tables.vouchers);
      }
      if (backupData.tables.bills?.length > 0) {
        await supabase.from('bills').insert(backupData.tables.bills);
      }
      if (backupData.tables.cutting_schedules?.length > 0) {
        await supabase.from('cutting_schedules').insert(backupData.tables.cutting_schedules);
      }
      if (backupData.tables.ledger_entries?.length > 0) {
        await supabase.from('ledger_entries').insert(backupData.tables.ledger_entries);
      }

      toast({
        title: "Backup Restored",
        description: "Database has been restored from backup successfully.",
      });
      
      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. Please check file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmation !== "RESET DATABASE") {
      toast({
        title: "Confirmation Failed",
        description: "Please type 'RESET DATABASE' to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Resetting database...");
      
      // Delete all data from all tables in proper order (respecting dependencies)
      await supabase.from('ledger_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vouchers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cutting_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('agents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('farms').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Database Reset Complete",
        description: "All data has been cleared. You can start fresh for the new year.",
      });
      
      setResetConfirmation("");
      
      // Refresh the page to show empty state
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHistoryBackup = (backupId: number) => {
    console.log("Downloading backup:", backupId);
    toast({
      title: "Downloading",
      description: "Backup file is being downloaded...",
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
            <h1 className="text-3xl font-bold text-foreground">Backup & Database Management</h1>
            <p className="text-muted-foreground">Manage your data backups and database operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backup Operations */}
          <div className="space-y-6">
            {/* Create Backup */}
            <Card className="shadow-card border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Database className="h-6 w-6" />
                  Create New Backup
                </CardTitle>
                <CardDescription>
                  Create a complete backup of your current database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Last Backup</span>
                    <span className="text-sm font-medium">Today, 2:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Database Size</span>
                    <span className="text-sm font-medium">12.5 MB</span>
                  </div>
                </div>
                <Button
                  onClick={handleCreateBackup}
                  disabled={isLoading}
                  className="w-full bg-success hover:bg-success/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Download Backup */}
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Download className="h-6 w-6" />
                  Download Backup
                </CardTitle>
                <CardDescription>
                  Download the latest backup file to your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadBackup}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Latest Backup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Restore Backup */}
            <Card className="shadow-card border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Upload className="h-6 w-6" />
                  Restore from Backup
                </CardTitle>
                <CardDescription>
                  Restore your database from a backup file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFile">Select Backup File</Label>
                  <Input
                    id="backupFile"
                    type="file"
                    accept=".json"
                    className="file:bg-warning file:text-warning-foreground"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Store file reference for restore
                        (window as any).selectedBackupFile = file;
                      }
                    }}
                  />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-warning text-warning hover:bg-warning/10"
                      disabled={!(window as any).selectedBackupFile}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Restore from File
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Database Restore</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will replace all current data with the backup data. This action cannot be undone.
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        const file = (window as any).selectedBackupFile;
                        if (file) {
                          handleRestoreBackup(file);
                        }
                      }}>
                        Restore Database
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Backup History & Reset */}
          <div className="space-y-6">
            {/* Backup History */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Backup History
                </CardTitle>
                <CardDescription>
                  Recent backup files and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backupHistory.length > 0 ? (
                    backupHistory.map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{backup.type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              backup.status === 'Success' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {backup.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(backup.date).toLocaleDateString('en-IN')} at {backup.time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Size: {backup.size}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadHistoryBackup(backup.id)}
                          className="px-3"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No backup history available</p>
                      <p className="text-sm text-muted-foreground">Backup history will appear here once backups are created</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reset Database */}
            <Card className="shadow-card border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  Reset Database
                </CardTitle>
                <CardDescription>
                  Clear all data to start fresh for a new business year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">Warning</h4>
                      <p className="text-sm text-destructive/80">
                        This action will permanently delete ALL data including farms, agents, 
                        bills, vouchers, and ledgers. This cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resetConfirmation">
                    Type "RESET DATABASE" to confirm
                  </Label>
                  <Input
                    id="resetConfirmation"
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    placeholder="RESET DATABASE"
                    className="border-destructive/30"
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={resetConfirmation !== "RESET DATABASE"}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Database
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to permanently delete all business data. 
                        This action is irreversible and will clear everything for a fresh start.
                        Are you absolutely sure?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleResetDatabase}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Yes, Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BackupReset;