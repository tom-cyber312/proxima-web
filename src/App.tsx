import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store';
import { MainLayout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { TransactionsPage } from './pages/transactions';
import { AnalyticsPage } from './pages/analytics';
import { ReportsPage } from './pages/reports';
import { SettingsPage } from './pages/settings';

const routes = [
  { path: '/', label: 'Inicio', icon: 'LayoutDashboard' },
  { path: '/transactions', label: 'Movimientos', icon: 'ShoppingBag' },
  { path: '/analytics', label: 'Análisis', icon: 'BarChart3' },
  { path: '/reports', label: 'Reportes', icon: 'FileText' },
  { path: '/settings', label: 'Configuración', icon: 'Settings' },
];

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentRoute } = useStore();

  const currentRoute = routes.find(r => location.pathname.startsWith(r.path))?.path || '/';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoute}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="p-4 sm:p-6 lg:p-8"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageWrapper><DashboardPage /></PageWrapper>} />
      <Route path="/transactions" element={<PageWrapper><TransactionsPage /></PageWrapper>} />
      <Route path="/analytics" element={<PageWrapper><AnalyticsPage /></PageWrapper>} />
      <Route path="/reports" element={<PageWrapper><ReportsPage /></PageWrapper>} />
      <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      <Route path="*" element={<Navigate to="/" replace />} />
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