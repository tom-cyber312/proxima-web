import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { TransactionsPage } from './pages/transactions';
import { AnalyticsPage } from './pages/analytics';
import { SettingsPage } from './pages/settings';
import { ReportsPage } from './pages/reports';
import { AdvertisingPage } from './pages/advertising';
import { SimulatorPage } from './pages/simulator';
import { StockPage } from './pages/stock';
import { AlertsPage } from './pages/alerts';
import { ExportPage } from './pages/export';
import { UsersPage } from './pages/users';
import { SuppliersPage } from './pages/suppliers';
import { DebtsPage } from './pages/debts';
import { InvoicesPage } from './pages/invoices';
import { EmployeesPage } from './pages/employees';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/advertising" element={<AdvertisingPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/export" element={<ExportPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/debts" element={<DebtsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;