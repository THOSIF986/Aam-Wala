import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import NewFarm from "./pages/NewFarm";
import NewAgent from "./pages/NewAgent";
import NewVoucher from "./pages/NewVoucher";
import NewBill from "./pages/NewBill";
import EditBill from "./pages/EditBill";
import VoucherList from "./pages/VoucherList";
import SaleBillList from "./pages/SaleBillList";
import FarmerLedger from "./pages/FarmerLedger";
import AgentLedger from "./pages/AgentLedger";
import FarmList from "./pages/FarmList";
import AgentList from "./pages/AgentList";
import Cutting from "./pages/Cutting";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import BackupReset from "./pages/BackupReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/new-farm" element={<ProtectedRoute><NewFarm /></ProtectedRoute>} />
            <Route path="/new-agent" element={<ProtectedRoute><NewAgent /></ProtectedRoute>} />
            <Route path="/new-voucher" element={<ProtectedRoute><NewVoucher /></ProtectedRoute>} />
            <Route path="/new-bill" element={<ProtectedRoute><NewBill /></ProtectedRoute>} />
            <Route path="/edit-bill/:id" element={<ProtectedRoute><EditBill /></ProtectedRoute>} />
            <Route path="/voucher-list" element={<ProtectedRoute><VoucherList /></ProtectedRoute>} />
            <Route path="/sale-bill-list" element={<ProtectedRoute><SaleBillList /></ProtectedRoute>} />
            <Route path="/farmer-ledger/:id" element={<ProtectedRoute><FarmerLedger /></ProtectedRoute>} />
            <Route path="/agent-ledger/:id" element={<ProtectedRoute><AgentLedger /></ProtectedRoute>} />
            <Route path="/farm-list" element={<ProtectedRoute><FarmList /></ProtectedRoute>} />
            <Route path="/agent-list" element={<ProtectedRoute><AgentList /></ProtectedRoute>} />
            <Route path="/cutting" element={<ProtectedRoute><Cutting /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/backup-reset" element={<ProtectedRoute><BackupReset /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
