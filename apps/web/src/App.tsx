import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ComposePage from "@/pages/compose/ComposePage";
import BulkSendPage from "@/pages/bulk/BulkSendPage";
import MessagesPage from "@/pages/messages/MessagesPage";
import ContactsPage from "@/pages/contacts/ContactsPage";
import TemplatesPage from "@/pages/templates/TemplatesPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import SettingsPage from "@/pages/settings/SettingsPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/compose" element={<ComposePage />} />
            <Route path="/bulk" element={<BulkSendPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
            color: "var(--color-text-primary)",
            fontFamily: "DM Mono, monospace",
            fontSize: "13px",
          },
        }}
      />
    </QueryClientProvider>
  );
}