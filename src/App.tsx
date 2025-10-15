import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/new-farm" element={<NewFarm />} />
          <Route path="/new-agent" element={<NewAgent />} />
          <Route path="/new-voucher" element={<NewVoucher />} />
          <Route path="/new-bill" element={<NewBill />} />
          <Route path="/edit-bill/:id" element={<EditBill />} />
          <Route path="/voucher-list" element={<VoucherList />} />
          <Route path="/sale-bill-list" element={<SaleBillList />} />
          <Route path="/farmer-ledger/:id" element={<FarmerLedger />} />
          <Route path="/agent-ledger/:id" element={<AgentLedger />} />
          <Route path="/farm-list" element={<FarmList />} />
          <Route path="/agent-list" element={<AgentList />} />
          <Route path="/cutting" element={<Cutting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/backup-reset" element={<BackupReset />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
