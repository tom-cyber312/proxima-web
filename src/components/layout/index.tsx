import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import { Button, IconButton, Avatar, Badge } from '../ui';
import { useStore } from '../../store';
import { 
  Menu, X, Sun, Moon, Bell, User, Settings, 
  ChevronDown, Search, Plus, LayoutDashboard,
  ShoppingBag, BarChart3, FileText, Settings as SettingsIcon,
  CreditCard, AlertTriangle, Target, ArrowDown,
  Users, Package, Zap, Shield, AlertCircle, TrendingUp, Download
} from 'lucide-react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    let resolved: 'light' | 'dark' = 'dark';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }
    
    root.classList.add(resolved);
    setResolvedTheme(resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
        setResolvedTheme(resolved);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const Header = () => {
  const { settings, updateSettings } = useStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const alerts = useStore.getState().getActiveAlerts();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-medium text-white hidden sm:block">
                Proxima
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="search"
                placeholder="Buscar movimientos, categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {(alerts.length > 0) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs font-bold rounded-full flex items-center justify-center">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-4 top-full mt-2 w-80 sm:w-96 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-4 shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Alertas</h3>
                    <Button variant="ghost" size="sm" onClick={() => setNotificationsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="text-white/50 text-sm text-center py-4">No hay alertas activas</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                        >
                          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">{alert.categoryName}</p>
                            <p className="text-white/60 text-xs mt-0.5">
                              Has gastado {formatCurrency(alert.spent, { symbol: settings.currencySymbol })} de {formatCurrency(alert.budget, { symbol: settings.currencySymbol })} ({alert.percentage}%)
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => useStore.getState().dismissBudgetAlert(alert.id)}>
                            <X className="h-4 w-4 text-white/50" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-3"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Avatar size="sm" fallback="U" />
                <ChevronDown className="h-4 w-4" />
              </Button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl py-2 shadow-2xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-medium text-white">Usuario</p>
                      <p className="text-white/50 text-sm">usuario@ejemplo.com</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      Mi perfil
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      Configuración
                    </button>
                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => { setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <ArrowDown className="h-5 w-5" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl px-4 py-4"
          >
            <div className="flex flex-col gap-2">
              <nav className="flex flex-col gap-1">
                {['dashboard', 'transactions', 'analytics', 'advertising', 'simulator', 'stock', 'alerts', 'export', 'users', 'settings'].map((route) => (
                  <button
                    key={route}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    {getNavIcon(route)}
                    <span className="font-medium">{getNavLabel(route)}</span>
                  </button>
                ))}
              </nav>
              <div className="pt-4 border-t border-white/10 flex gap-2">
                <Button variant="primary" className="flex-1" size="sm">
                  <Plus className="h-4 w-4" />
                  Nuevo movimiento
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </header>
  );
};

const getNavIcon = (route: string) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard className="h-5 w-5" />,
    transactions: <ShoppingBag className="h-5 w-5" />,
    analytics: <BarChart3 className="h-5 w-5" />,
    advertising: <TrendingUp className="h-5 w-5" />,
    simulator: <Zap className="h-5 w-5" />,
    stock: <Package className="h-5 w-5" />,
    alerts: <AlertCircle className="h-5 w-5" />,
    export: <Download className="h-5 w-5" />,
    users: <Users className="h-5 w-5" />,
    settings: <SettingsIcon className="h-5 w-5" />,
  };
  return icons[route];
};

const getNavLabel = (route: string) => {
  const labels: Record<string, string> = {
    dashboard: 'Inicio',
    transactions: 'Movimientos',
    analytics: 'Análisis',
    advertising: 'Publicidad',
    simulator: 'Simulador',
    stock: 'Stock',
    alerts: 'Alertas',
    export: 'Exportar',
    users: 'Usuarios',
    settings: 'Configuración',
  };
  return labels[route];
};



export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useStore((state) => state.currentRoute) || 'dashboard';
  const { transactions, categories } = useStore();
  const { settings } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'transactions', label: 'Movimientos', icon: ShoppingBag },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'advertising', label: 'Publicidad', icon: TrendingUp },
    { id: 'simulator', label: 'Simulador', icon: Zap },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'alerts', label: 'Alertas', icon: AlertCircle },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isOpen ? 0 : -300 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 lg:w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col lg:relative lg:z-auto lg:h-auto lg:border-r"
        >
          <div className="flex flex-col h-full p-4 lg:p-6">
            <nav className="flex-1 space-y-1 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { 
                      useStore.getState().setCurrentRoute(item.id);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black',
                      isActive && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Balance</span>
                  <span className={cn('font-semibold', balance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {formatCurrency(balance, { currency: settings.currency, symbol: settings.currencySymbol })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Ingresos</span>
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(income, { currency: settings.currency, symbol: settings.currencySymbol })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Egresos</span>
                  <span className="font-medium text-red-400">
                    {formatCurrency(expense, { currency: settings.currency, symbol: settings.currencySymbol })}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => { useStore.getState().setCurrentRoute('transactions'); onClose(); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo movimiento
              </Button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={useStore((state) => state.currentRoute) || 'dashboard'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="pt-16 min-h-screen"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <Sidebar isOpen={sidebarOpen || !isMobile} onClose={() => setSidebarOpen(false)} />
        <main className="lg:ml-72 min-h-screen">
          <PageTransition>{children}</PageTransition>
        </main>
        {isMobile && (
          <Button
            variant="primary"
            size="lg"
            className="fixed bottom-6 right-6 z-40 lg:hidden shadow-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo movimiento
          </Button>
        )}
      </div>
    </ThemeProvider>
  );
};

declare module '../../store' {
  interface StoreState {
    currentRoute: string;
    setCurrentRoute: (route: string) => void;
  }
}