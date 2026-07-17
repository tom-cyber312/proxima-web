import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { formatCurrency } from '../utils/helpers';
import type {
  Transaction,
  Category,
  Product,
  Business,
  Budget,
  Goal,
  AppSettings,
  TransactionType,
  CategoryStat,
  DashboardStats,
  TrendDataPoint,
  CategoryBreakdown,
  BudgetStatus,
  GoalProgress,
  BackupData,
  ProductMargin,
  BreakEvenAnalysis,
  PeriodComparison,
  CategoryComparison,
  RecurringTransaction,
  ReceiptImage,
  User,
  UserRole,
  AdvertisingCampaign,
  ROIMetric,
  SimulatorScenario,
  StockAlert,
  AutomaticAlert,
  ExportOptions,
  Permission,
  ROLE_PERMISSIONS,
  BudgetAlert,
} from '../types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salario', type: 'income', icon: 'briefcase', color: '#22c55e', subcategories: ['Sueldo', 'Freelance', 'Bonos', 'Inversiones'] },
  { id: 'investments', name: 'Inversiones', type: 'income', icon: 'trending-up', color: '#16a34a', subcategories: ['Dividendos', 'Ganancias de capital', 'Intereses'] },
  { id: 'other_income', name: 'Otros ingresos', type: 'income', icon: 'plus-circle', color: '#84cc16', subcategories: ['Regalos', 'Ventas', 'Reembolsos'] },
  { id: 'housing', name: 'Vivienda', type: 'expense', icon: 'home', color: '#ef4444', subcategories: ['Alquiler', 'Hipoteca', 'Servicios', 'Mantenimiento', 'Internet'] },
  { id: 'food', name: 'Alimentación', type: 'expense', icon: 'utensils', color: '#f97316', subcategories: ['Supermercado', 'Restaurantes', 'Delivery', 'Café'] },
  { id: 'transport', name: 'Transporte', type: 'expense', icon: 'car', color: '#eab308', subcategories: ['Combustible', 'Transporte público', 'Mantenimiento', 'Estacionamiento', 'Seguro'] },
  { id: 'health', name: 'Salud', type: 'expense', icon: 'heart-pulse', color: '#ec4899', subcategories: ['Médico', 'Medicamentos', 'Seguro médico', 'Gimnasio', 'Terapia'] },
  { id: 'entertainment', name: 'Entretenimiento', type: 'expense', icon: 'film', color: '#a855f7', subcategories: ['Streaming', 'Videojuegos', 'Cine', 'Eventos', 'Hobbies'] },
  { id: 'shopping', name: 'Compras', type: 'expense', icon: 'shopping-bag', color: '#ec4899', subcategories: ['Ropa', 'Electrónica', 'Hogar', 'Regalos', 'Cuidado personal'] },
  { id: 'education', name: 'Educación', type: 'expense', icon: 'graduation-cap', color: '#3b82f6', subcategories: ['Cursos', 'Libros', 'Certificaciones', 'Idiomas'] },
  { id: 'other_expense', name: 'Otros gastos', type: 'expense', icon: 'more-horizontal', color: '#6b7280', subcategories: ['Impuestos', 'Donaciones', 'Multas', 'Imprevistos'] },
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'ARS',
  currencySymbol: '$',
  dateFormat: 'DD/MM/YYYY',
  firstDayOfWeek: 0,
  theme: 'system',
  language: 'es',
  defaultView: 'dashboard',
  currencyPosition: 'before',
  decimalPlaces: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  budgetAlerts: true,
  goalAlerts: true,
  autoBackup: true,
  backupFrequency: 'weekly',
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface StoreState {
  transactions: Transaction[];
  categories: Category[];
  products: Product[];
  businesses: Business[];
  budgets: Budget[];
  goals: Goal[];
  recurringTransactions: RecurringTransaction[];
  receiptImages: ReceiptImage[];
  settings: AppSettings;
  budgetAlerts: BudgetAlert[];
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  // Part 3
  users: User[];
  currentUser: User | null;
  advertisingCampaigns: AdvertisingCampaign[];
  simulatorScenarios: SimulatorScenario[];
  stockAlerts: StockAlert[];
  automaticAlerts: AutomaticAlert[];

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactions: (filters?: { type?: TransactionType; startDate?: string; endDate?: string; category?: string }) => Transaction[];

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategories: (type?: TransactionType) => Category[];

  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProducts: (businessId?: string) => Product[];
  getProductMargins: (businessId?: string, startDate?: string, endDate?: string) => ProductMargin[];

  addBusiness: (business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  getBusinesses: () => Business[];
  getBreakEvenAnalysis: (businessId: string) => BreakEvenAnalysis | null;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgets: () => Budget[];
  getBudgetStatus: () => BudgetStatus[];

  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getGoals: () => Goal[];
  getGoalProgress: () => GoalProgress[];

  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  getDashboardStats: (startDate?: string, endDate?: string) => DashboardStats;
  getTrendData: (months?: number) => TrendDataPoint[];
  getCategoryBreakdown: (type: TransactionType, startDate?: string, endDate?: string) => CategoryBreakdown[];
  getCategoryStats: (type: TransactionType, startDate?: string, endDate?: string) => CategoryStat[];
  getPeriodComparison: (currentStart: string, currentEnd: string, previousStart: string, previousEnd: string) => PeriodComparison;

  addBudgetAlert: (alert: BudgetAlert) => void;
  dismissBudgetAlert: (id: string) => void;
  getActiveAlerts: () => BudgetAlert[];
  checkBudgetAlerts: (transaction: Transaction) => void;

  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  getRecurringTransactions: () => RecurringTransaction[];
  processRecurringTransactions: () => void;

  addReceiptImage: (image: Omit<ReceiptImage, 'id' | 'uploadedAt'>) => void;
  deleteReceiptImage: (id: string) => void;
  getReceiptImage: (transactionId: string) => ReceiptImage | undefined;

  // Part 3: Users & Auth
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsers: () => User[];
  setCurrentUser: (user: User | null) => void;
  hasPermission: (resource: string, action: string) => boolean;

  // Part 3: Advertising & ROI
  addAdvertisingCampaign: (campaign: Omit<AdvertisingCampaign, 'id' | 'createdAt'>) => void;
  updateAdvertisingCampaign: (id: string, updates: Partial<AdvertisingCampaign>) => void;
  deleteAdvertisingCampaign: (id: string) => void;
  getAdvertisingCampaigns: (businessId?: string) => AdvertisingCampaign[];
  calculateROI: (businessId?: string) => ROIMetric[];

  // Part 3: Simulator
  addSimulatorScenario: (scenario: Omit<SimulatorScenario, 'id' | 'createdAt'>) => void;
  updateSimulatorScenario: (id: string, updates: Partial<SimulatorScenario>) => void;
  deleteSimulatorScenario: (id: string) => void;
  getSimulatorScenarios: (businessId?: string) => SimulatorScenario[];
  runSimulation: (scenario: SimulatorScenario) => { revenue: number; expense: number; profit: number; margin: number };

  // Part 3: Stock Alerts
  checkStockAlerts: () => StockAlert[];
  acknowledgeStockAlert: (id: string) => void;
  dismissStockAlert: (id: string) => void;

  // Part 3: Automatic Alerts
  generateAutomaticAlerts: () => AutomaticAlert[];
  markAlertAsRead: (id: string) => void;
  dismissAutomaticAlert: (id: string) => void;
  getUnreadAlerts: () => AutomaticAlert[];

  // Part 3: Export
  exportToPDF: (options: ExportOptions) => Promise<Blob>;
  exportToExcel: (options: ExportOptions) => Promise<Blob>;
  exportToCSV: (options: ExportOptions) => string;

  exportData: () => BackupData;
  importData: (data: BackupData) => void;
  clearAllData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      products: [],
      businesses: [],
      budgets: [],
      goals: [],
      recurringTransactions: [],
      receiptImages: [],
      settings: DEFAULT_SETTINGS,
      budgetAlerts: [],
      currentRoute: 'dashboard',
      setCurrentRoute: (route) => set({ currentRoute: route }),
      // Part 3
      users: [],
      currentUser: null,
      advertisingCampaigns: [],
      simulatorScenarios: [],
      stockAlerts: [],
      automaticAlerts: [],

      addTransaction: (tx) => {
        const now = new Date().toISOString();
        const newTx: Transaction = {
          ...tx,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        get().checkBudgetAlerts(newTx);
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      getTransactions: (filters) => {
        let txs = get().transactions;
        if (filters?.type) txs = txs.filter((t) => t.type === filters.type);
        if (filters?.startDate) txs = txs.filter((t) => t.date >= filters.startDate!);
        if (filters?.endDate) txs = txs.filter((t) => t.date <= filters.endDate!);
        if (filters?.category) txs = txs.filter((t) => t.category === filters.category);
        return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      addCategory: (cat) => {
        set((state) => ({
          categories: [...state.categories, { ...cat, id: generateId() }],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          transactions: state.transactions.map((t) =>
            t.category === id ? { ...t, category: 'other_expense' } : t
          ),
        }));
      },

      getCategories: (type) => {
        return get().categories.filter((c) => !type || c.type === type);
      },

      addProduct: (product) => {
        const now = new Date().toISOString();
        set((state) => ({
          products: [...state.products, { ...product, id: generateId(), createdAt: now, updatedAt: now }],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getProducts: (businessId) => {
        return businessId
          ? get().products.filter((p) => p.businessId === businessId)
          : get().products;
      },

      getProductMargins: (businessId, startDate, endDate) => {
        const { transactions, products } = get();
        const filteredTx = transactions.filter((t) => {
          if (t.type !== 'income') return false;
          if (businessId) {
            const product = products.find((p) => p.id === t.category);
            if (!product || product.businessId !== businessId) return false;
          }
          if (startDate && t.date < startDate) return false;
          if (endDate && t.date > endDate) return false;
          return true;
        });

        const productMap = new Map<string, { revenue: number; units: number }>();
        filteredTx.forEach((t) => {
          const existing = productMap.get(t.category) || { revenue: 0, units: 0 };
          existing.revenue += t.amount;
          existing.units += 1;
          productMap.set(t.category, existing);
        });

        return products
          .filter((p) => !businessId || p.businessId === businessId)
          .map((p) => {
            const sales = productMap.get(p.id) || { revenue: 0, units: 0 };
            const totalCost = p.cost * sales.units;
            const margin = sales.revenue - totalCost;
            return {
              product: p,
              revenue: sales.revenue,
              cost: totalCost,
              margin,
              marginPercent: sales.revenue > 0 ? (margin / sales.revenue) * 100 : 0,
              unitsSold: sales.units,
            };
          })
          .filter((m) => m.unitsSold > 0)
          .sort((a, b) => b.margin - a.margin);
      },

      addBusiness: (business) => {
        const now = new Date().toISOString();
        set((state) => ({
          businesses: [...state.businesses, { ...business, id: generateId(), createdAt: now, updatedAt: now }],
        }));
      },

      updateBusiness: (id, updates) => {
        set((state) => ({
          businesses: state.businesses.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      deleteBusiness: (id) => {
        set((state) => ({
          businesses: state.businesses.filter((b) => b.id !== id),
          products: state.products.filter((p) => p.businessId !== id),
        }));
      },

      getBusinesses: () => get().businesses,

      getBreakEvenAnalysis: (businessId) => {
        const { businesses, products, transactions } = get();
        const business = businesses.find((b) => b.id === businessId);
        if (!business) return null;

        const businessProducts = products.filter((p) => p.businessId === businessId);
        if (businessProducts.length === 0) return null;

        const totalFixedCosts = business.fixedCosts;
        let totalRevenue = 0;
        let totalVariableCosts = 0;
        let totalUnits = 0;

        businessProducts.forEach((p) => {
          const sales = transactions.filter((t) => t.type === 'income' && t.category === p.id);
          const units = sales.length;
          const revenue = sales.reduce((sum, t) => sum + t.amount, 0);
          const variableCosts = p.cost * units;
          totalRevenue += revenue;
          totalVariableCosts += variableCosts;
          totalUnits += units;
        });

        if (totalRevenue === 0) return null;

        const variableCostRatio = totalVariableCosts / totalRevenue;
        const contributionMarginRatio = 1 - variableCostRatio;
        const breakEvenRevenue = contributionMarginRatio > 0 ? totalFixedCosts / contributionMarginRatio : 0;

        const breakEvenUnits: Record<string, number> = {};
        businessProducts.forEach((p) => {
          const contributionPerUnit = p.price - p.cost;
          breakEvenUnits[p.name] = contributionPerUnit > 0 ? Math.ceil(totalFixedCosts / contributionPerUnit) : 0;
        });

        return {
          businessId,
          businessName: business.name,
          fixedCosts: totalFixedCosts,
          variableCostRatio,
          breakEvenRevenue,
          breakEvenUnits,
          marginOfSafety: totalRevenue > 0 ? ((totalRevenue - breakEvenRevenue) / totalRevenue) * 100 : 0,
        };
      },

      addBudget: (budget) => {
        set((state) => ({
          budgets: [...state.budgets, { ...budget, id: generateId() }],
        }));
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      getBudgets: () => get().budgets,

      getBudgetStatus: () => {
        const { budgets, transactions, categories } = get();
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        return budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          const monthTransactions = transactions.filter(
            (t) =>
              t.category === budget.categoryId &&
              t.type === 'expense' &&
              t.date >= currentMonthStart &&
              t.date <= currentMonthEnd
          );
          const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          return {
            budget,
            spent,
            remaining: budget.amount - spent,
            percentage,
            isOverBudget: spent > budget.amount,
            alertTriggered: percentage >= (budget.alertThreshold || 80),
          };
        });
      },

      addGoal: (goal) => {
        set((state) => ({
          goals: [...state.goals, { ...goal, id: generateId() }],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      getGoals: () => get().goals,

      getGoalProgress: () => {
        const { goals } = get();
        return goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = goal.targetAmount - goal.currentAmount;
          const targetDate = new Date(goal.targetDate);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          const monthsRemaining = Math.max(1, daysRemaining / 30);
          const monthlyRequired = remaining / monthsRemaining;
          return {
            goal,
            progress,
            remaining,
            daysRemaining,
            monthlyRequired,
            onTrack: goal.currentAmount >= (goal.targetAmount / (365 / (365 - daysRemaining))) * (365 / 12),
          };
        });
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },

      getDashboardStats: (startDate, endDate) => {
        const { transactions, categories } = get();
        const now = new Date();
        const defaultStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const defaultEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

        const currentMonthTxs = transactions.filter(
          (t) => t.date >= defaultStart && t.date <= defaultEnd
        );
        const prevMonthTxs = transactions.filter(
          (t) => t.date >= prevMonthStart && t.date <= prevMonthEnd
        );

        const currentIncome = currentMonthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentExpense = currentMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const prevIncome = prevMonthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const prevExpense = prevMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
        const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;
        const balanceChange = prevIncome - prevExpense !== 0
          ? ((currentIncome - currentExpense) - (prevIncome - prevExpense)) / Math.abs(prevIncome - prevExpense) * 100
          : 0;

        const expenseByCategory = currentMonthTxs
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
        const topCategories: CategoryStat[] = Object.entries(expenseByCategory)
          .map(([category, amount]) => {
            const cat = categories.find((c) => c.id === category);
            return {
              category: cat?.name || category,
              amount,
              percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
              count: currentMonthTxs.filter((t) => t.category === category && t.type === 'expense').length,
              color: cat?.color || '#6b7280',
            };
          })
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        return {
          totalIncome: currentIncome,
          totalExpense: currentExpense,
          balance: currentIncome - currentExpense,
          incomeChange,
          expenseChange,
          balanceChange,
          topCategories,
          recentTransactions: currentMonthTxs.slice(0, 10),
        };
      },

      getTrendData: (months = 6) => {
        const { transactions } = get();
        const data: TrendDataPoint[] = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = date.toISOString().split('T')[0];
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
          const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

          const monthTxs = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
          const income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

          data.push({ date: monthStart, label, income, expense, balance: income - expense });
        }
        return data;
      },

      getCategoryBreakdown: (type, startDate, endDate) => {
        const { transactions, categories } = get();
        const now = new Date();
        const defaultStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const defaultEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const filtered = transactions.filter(
          (t) =>
            t.type === type &&
            t.date >= defaultStart &&
            t.date <= defaultEnd
        );

        const byCategory = filtered.reduce((acc, t) => {
          if (!acc[t.category]) acc[t.category] = { amount: 0, subcategories: {} };
          acc[t.category].amount += t.amount;
          const sub = t.subcategory || 'General';
          acc[t.category].subcategories[sub] = (acc[t.category].subcategories[sub] || 0) + t.amount;
          return acc;
        }, {} as Record<string, { amount: number; subcategories: Record<string, number> }>);

        const total = Object.values(byCategory).reduce((sum, c) => sum + c.amount, 0);

        return Object.entries(byCategory).map(([category, data]) => {
          const cat = categories.find((c) => c.id === category);
          const subcategories: CategoryBreakdown['subcategories'] = Object.entries(data.subcategories).map(
            ([subcategory, amount]) => ({
              subcategory,
              amount,
              percentage: data.amount > 0 ? (amount / data.amount) * 100 : 0,
            })
          );
          return {
            category: cat?.name || category,
            amount: data.amount,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
            color: cat?.color || '#6b7280',
            subcategories,
          };
        }).sort((a, b) => b.amount - a.amount);
      },

      getCategoryStats: (type, startDate, endDate) => {
        const breakdown = get().getCategoryBreakdown(type, startDate, endDate);
        return breakdown.map((b) => ({
          category: b.category,
          amount: b.amount,
          percentage: b.percentage,
          count: 0,
          color: b.color,
        }));
      },

      getPeriodComparison: (currentStart, currentEnd, previousStart, previousEnd) => {
        const { transactions, categories } = get();

        const currentTx = transactions.filter((t) => t.date >= currentStart && t.date <= currentEnd);
        const previousTx = transactions.filter((t) => t.date >= previousStart && t.date <= previousEnd);

        const currentIncome = currentTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const currentExpense = currentTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const previousIncome = previousTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const previousExpense = previousTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
        const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;
        const balanceChange = (previousIncome - previousExpense) !== 0
          ? ((currentIncome - currentExpense) - (previousIncome - previousExpense)) / Math.abs(previousIncome - previousExpense) * 100
          : 0;

        const allCategories = new Set([
          ...currentTx.map((t) => t.category),
          ...previousTx.map((t) => t.category),
        ]);

        const categoryChanges: CategoryComparison[] = Array.from(allCategories).map((catId) => {
          const cat = categories.find((c) => c.id === catId);
          const current = currentTx.filter((t) => t.category === catId).reduce((s, t) => s + t.amount, 0);
          const previous = previousTx.filter((t) => t.category === catId).reduce((s, t) => s + t.amount, 0);
          const change = current - previous;
          const changePercent = previous > 0 ? (change / previous) * 100 : 0;
          return {
            category: cat?.name || catId,
            current,
            previous,
            change,
            changePercent,
          };
        }).filter((c) => c.current > 0 || c.previous > 0);

        return {
          current: { start: currentStart, end: currentEnd },
          previous: { start: previousStart, end: previousEnd },
          incomeChange,
          expenseChange,
          balanceChange,
          categoryChanges,
        };
      },

      addBudgetAlert: (alert) => {
        set((state) => ({ budgetAlerts: [...state.budgetAlerts, alert] }));
      },

      dismissBudgetAlert: (id) => {
        set((state) => ({ budgetAlerts: state.budgetAlerts.filter((a) => a.id !== id) }));
      },

      getActiveAlerts: () => {
        return get().budgetAlerts.filter((a) => !a.dismissed);
      },

      checkBudgetAlerts: (transaction: Transaction) => {
        const { budgets, settings, addBudgetAlert } = get();
        if (!settings.budgetAlerts || transaction.type !== 'expense') return;

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const relevantBudgets = budgets.filter((b) => b.categoryId === transaction.category);
        relevantBudgets.forEach((budget) => {
          const spent = get()
            .transactions.filter(
              (t) =>
                t.category === budget.categoryId &&
                t.type === 'expense' &&
                t.date >= monthStart &&
                t.date <= monthEnd
            )
            .reduce((sum, t) => sum + t.amount, 0);
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const threshold = budget.alertThreshold || 80;

          if (percentage >= threshold && percentage < 100) {
            const existing = get().budgetAlerts.find(
              (a) => a.budgetId === budget.id && !a.dismissed && a.percentage === Math.floor(percentage / 10) * 10
            );
            if (!existing) {
              addBudgetAlert({
                id: generateId(),
                budgetId: budget.id,
                categoryId: budget.categoryId,
                categoryName: get().categories.find((c) => c.id === budget.categoryId)?.name || '',
                spent,
                budget: budget.amount,
                percentage: Math.floor(percentage / 10) * 10,
                triggered: true,
                triggeredAt: new Date().toISOString(),
                dismissed: false,
              });
            }
          } else if (percentage >= 100) {
            const existing = get().budgetAlerts.find((a) => a.budgetId === budget.id && !a.dismissed);
            if (!existing) {
              addBudgetAlert({
                id: generateId(),
                budgetId: budget.id,
                categoryId: budget.categoryId,
                categoryName: get().categories.find((c) => c.id === budget.categoryId)?.name || '',
                spent,
                budget: budget.amount,
                percentage: 100,
                triggered: true,
                triggeredAt: new Date().toISOString(),
                dismissed: false,
              });
            }
          }
        });
      },

      addRecurringTransaction: (recurring) => {
        const now = new Date().toISOString();
        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, { ...recurring, id: generateId(), createdAt: now }],
        }));
      },

      updateRecurringTransaction: (id, updates) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecurringTransaction: (id) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
        }));
      },

      getRecurringTransactions: () => get().recurringTransactions,

      processRecurringTransactions: () => {
        const { recurringTransactions, addTransaction } = get();
        const today = new Date().toISOString().split('T')[0];

        recurringTransactions.forEach((recurring) => {
          if (!recurring.isActive) return;
          if (recurring.nextDate <= today) {
            addTransaction({
              ...recurring.template,
              date: recurring.nextDate,
              recurring: true,
              recurringId: recurring.id,
            });

            let nextDate = new Date(recurring.nextDate);
            switch (recurring.frequency) {
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            }
            const nextDateStr = nextDate.toISOString().split('T')[0];
            get().updateRecurringTransaction(recurring.id, { nextDate: nextDateStr, lastGenerated: today });
          }
        });
      },

      addReceiptImage: (image) => {
        const now = new Date().toISOString();
        set((state) => ({
          receiptImages: [...state.receiptImages, { ...image, id: generateId(), uploadedAt: now }],
        }));
      },

      deleteReceiptImage: (id) => {
        set((state) => ({
          receiptImages: state.receiptImages.filter((img) => img.id !== id),
        }));
      },

      getReceiptImage: (transactionId) => {
        return get().receiptImages.find((img) => img.transactionId === transactionId);
      },

      // Part 3: Users & Auth
      addUser: (user) => {
        const now = new Date().toISOString();
        set((state) => ({
          users: [...state.users, { ...user, id: generateId(), createdAt: now }],
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser,
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
        }));
      },

      getUsers: () => get().users,

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      hasPermission: (resource, action) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
        const resourcePerm = permissions.find((p) => p.resource === resource);
        return resourcePerm?.actions.includes(action as any) || false;
      },

      // Part 3: Advertising & ROI
      addAdvertisingCampaign: (campaign) => {
        const now = new Date().toISOString();
        set((state) => ({
          advertisingCampaigns: [...state.advertisingCampaigns, { ...campaign, id: generateId(), createdAt: now }],
        }));
      },

      updateAdvertisingCampaign: (id, updates) => {
        set((state) => ({
          advertisingCampaigns: state.advertisingCampaigns.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteAdvertisingCampaign: (id) => {
        set((state) => ({
          advertisingCampaigns: state.advertisingCampaigns.filter((c) => c.id !== id),
        }));
      },

      getAdvertisingCampaigns: (businessId) => {
        const { advertisingCampaigns } = get();
        return businessId
          ? advertisingCampaigns.filter((c) => c.businessId === businessId)
          : advertisingCampaigns;
      },

      calculateROI: (businessId) => {
        const { advertisingCampaigns, transactions, businesses } = get();
        const campaigns = businessId
          ? advertisingCampaigns.filter((c) => c.businessId === businessId)
          : advertisingCampaigns;

        return campaigns.map((campaign) => {
          // Find transactions that could be attributed to this campaign
          // Simplified: all income during campaign period for the business
          const businessProducts = get().products.filter((p) => p.businessId === campaign.businessId);
          const productIds = businessProducts.map((p) => p.id);
          
          const attributedIncome = transactions
            .filter((t) => 
              t.type === 'income' && 
              productIds.includes(t.category) &&
              t.date >= campaign.startDate &&
              (!campaign.endDate || t.date <= campaign.endDate)
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const invested = campaign.spent;
          const revenueGenerated = attributedIncome;
          const roi = invested > 0 ? ((revenueGenerated - invested) / invested) * 100 : 0;
          const roas = invested > 0 ? revenueGenerated / invested : 0;
          const conversions = campaign.conversions || 0;
          const costPerConversion = conversions > 0 ? invested / conversions : 0;

          return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            platform: campaign.platform,
            invested,
            revenueGenerated,
            roi,
            roas,
            conversions,
            costPerConversion,
          };
        });
      },

      // Part 3: Simulator
      addSimulatorScenario: (scenario) => {
        const now = new Date().toISOString();
        set((state) => ({
          simulatorScenarios: [...state.simulatorScenarios, { ...scenario, id: generateId(), createdAt: now }],
        }));
      },

      updateSimulatorScenario: (id, updates) => {
        set((state) => ({
          simulatorScenarios: state.simulatorScenarios.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSimulatorScenario: (id) => {
        set((state) => ({
          simulatorScenarios: state.simulatorScenarios.filter((s) => s.id !== id),
        }));
      },

      getSimulatorScenarios: (businessId) => {
        const { simulatorScenarios } = get();
        return businessId
          ? simulatorScenarios.filter((s) => s.businessId === businessId)
          : simulatorScenarios;
      },

      runSimulation: (scenario) => {
        const { transactions, products, businesses } = get();
        const business = businesses.find((b) => b.id === scenario.businessId);
        const businessProducts = products.filter((p) => p.businessId === scenario.businessId);
        
        // Get current baseline
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const currentMonthTxs = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
        const currentRevenue = currentMonthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentExpense = currentMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const currentProfit = currentRevenue - currentExpense;
        const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;

        let projectedRevenue = currentRevenue;
        let projectedExpense = currentExpense;

        // Apply scenario parameters
        if (scenario.parameters.priceChangePercent) {
          // Price change affects revenue
          projectedRevenue *= (1 + scenario.parameters.priceChangePercent / 100);
        }

        if (scenario.parameters.adInvestmentChange) {
          // Ad investment change affects expense (marketing category)
          const marketingExpense = currentMonthTxs
            .filter((t) => t.type === 'expense' && t.category === 'advertising')
            .reduce((sum, t) => sum + t.amount, 0);
          projectedExpense = projectedExpense - marketingExpense + (marketingExpense * (1 + scenario.parameters.adInvestmentChange / 100));
        }

        if (scenario.parameters.costReductionPercent) {
          // Cost reduction affects COGS
          const cogsExpense = businessProducts.reduce((sum, p) => {
            const sales = currentMonthTxs.filter((t) => t.type === 'income' && t.category === p.id).length;
            return sum + (p.cost * sales);
          }, 0);
          projectedExpense = projectedExpense - cogsExpense + (cogsExpense * (1 - scenario.parameters.costReductionPercent / 100));
        }

        // Add fixed costs
        if (business) {
          projectedExpense += business.fixedCosts;
        }

        const projectedProfit = projectedRevenue - projectedExpense;
        const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

        return {
          revenue: projectedRevenue,
          expense: projectedExpense,
          profit: projectedProfit,
          margin: projectedMargin,
        };
      },

      // Part 3: Stock Alerts
      checkStockAlerts: () => {
        const { products, businesses } = get();
        const alerts: StockAlert[] = [];

        products.forEach((product) => {
          if (product.stock !== undefined && product.minStock !== undefined) {
            let severity: 'low' | 'critical' | 'out_of_stock' = 'low';
            
            if (product.stock <= 0) {
              severity = 'out_of_stock';
            } else if (product.stock <= product.minStock * 0.5) {
              severity = 'critical';
            } else if (product.stock <= product.minStock) {
              severity = 'low';
            } else {
              return; // No alert needed
            }

            const business = businesses.find((b) => b.id === product.businessId);
            
            alerts.push({
              id: generateId(),
              productId: product.id,
              productName: product.name,
              businessId: product.businessId || '',
              businessName: business?.name || 'Sin negocio',
              currentStock: product.stock,
              minStock: product.minStock,
              severity,
              createdAt: new Date().toISOString(),
              acknowledged: false,
            });
          }
        });

        // Update stock alerts
        set({ stockAlerts: alerts });
        return alerts;
      },

      acknowledgeStockAlert: (id) => {
        set((state) => ({
          stockAlerts: state.stockAlerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },

      dismissStockAlert: (id) => {
        set((state) => ({
          stockAlerts: state.stockAlerts.filter((a) => a.id !== id),
        }));
      },

      // Part 3: Automatic Alerts
      generateAutomaticAlerts: () => {
        const { transactions, budgets, goals, categories } = get();
        const alerts: AutomaticAlert[] = [];
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

        const currentMonthTxs = transactions.filter((t) => t.date >= currentMonthStart && t.date <= currentMonthEnd);
        const prevMonthTxs = transactions.filter((t) => t.date >= prevMonthStart && t.date <= prevMonthEnd);

        // 1. Expense spike detection
        const expenseByCategory = currentMonthTxs
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const prevExpenseByCategory = prevMonthTxs
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        Object.entries(expenseByCategory).forEach(([categoryId, currentAmount]) => {
          const prevAmount = prevExpenseByCategory[categoryId] || 0;
          if (prevAmount > 0) {
            const changePercent = ((currentAmount - prevAmount) / prevAmount) * 100;
            if (changePercent >= 40) {
              const cat = categories.find((c) => c.id === categoryId);
              alerts.push({
                id: generateId(),
                type: 'expense_spike',
                title: `Gasto inusual en ${cat?.name || categoryId}`,
                message: `Gastaste ${changePercent.toFixed(0)}% más que el mes anterior (${formatCurrency(currentAmount, { currency: 'ARS', symbol: '$' })})`,
                severity: changePercent >= 100 ? 'critical' : 'warning',
                relatedEntityId: categoryId,
                relatedEntityType: 'category',
                value: currentAmount,
                threshold: prevAmount * 1.4,
                period: `${currentMonthStart} - ${currentMonthEnd}`,
                createdAt: new Date().toISOString(),
                read: false,
                dismissed: false,
              });
            }
          }
        });

        // 2. Income drop detection
        const incomeByCategory = currentMonthTxs
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const prevIncomeByCategory = prevMonthTxs
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        Object.entries(incomeByCategory).forEach(([categoryId, currentAmount]) => {
          const prevAmount = prevIncomeByCategory[categoryId] || 0;
          if (prevAmount > 0) {
            const changePercent = ((currentAmount - prevAmount) / prevAmount) * 100;
            if (changePercent <= -30) {
              const cat = categories.find((c) => c.id === categoryId);
              alerts.push({
                id: generateId(),
                type: 'income_drop',
                title: `Caída de ingresos en ${cat?.name || categoryId}`,
                message: `Los ingresos bajaron ${Math.abs(changePercent).toFixed(0)}% vs mes anterior`,
                severity: changePercent <= -50 ? 'critical' : 'warning',
                relatedEntityId: categoryId,
                relatedEntityType: 'category',
                value: currentAmount,
                threshold: prevAmount * 0.7,
                period: `${currentMonthStart} - ${currentMonthEnd}`,
                createdAt: new Date().toISOString(),
                read: false,
                dismissed: false,
              });
            }
          }
        });

        // 3. Budget exceeded
        get().getBudgetStatus().forEach((bs) => {
          if (bs.isOverBudget) {
            alerts.push({
              id: generateId(),
              type: 'budget_exceeded',
              title: `Presupuesto excedido: ${bs.budget.categoryId}`,
              message: `Gastaste ${formatCurrency(bs.spent, { currency: 'ARS', symbol: '$' })} de ${formatCurrency(bs.budget.amount, { currency: 'ARS', symbol: '$' })} (${bs.percentage.toFixed(0)}%)`,
              severity: 'critical',
              relatedEntityId: bs.budget.id,
              relatedEntityType: 'budget',
              value: bs.spent,
              threshold: bs.budget.amount,
              period: `${currentMonthStart} - ${currentMonthEnd}`,
              createdAt: new Date().toISOString(),
              read: false,
              dismissed: false,
            });
          }
        });

        // 4. Goal off track
        get().getGoalProgress().forEach((gp) => {
          if (!gp.onTrack && gp.goal.targetAmount > 0) {
            alerts.push({
              id: generateId(),
              type: 'goal_off_track',
              title: `Meta en riesgo: ${gp.goal.name}`,
              message: `Llevas ${gp.progress.toFixed(1)}% y necesitas ${formatCurrency(gp.monthlyRequired, { currency: 'ARS', symbol: '$' })}/mes para cumplir`,
              severity: 'warning',
              relatedEntityId: gp.goal.id,
              relatedEntityType: 'goal',
              value: gp.progress,
              threshold: 100,
              period: `${currentMonthStart} - ${currentMonthEnd}`,
              createdAt: new Date().toISOString(),
              read: false,
              dismissed: false,
            });
          }
        });

        // 5. Stock low
        get().checkStockAlerts().forEach((stockAlert) => {
          if (stockAlert.severity === 'critical' || stockAlert.severity === 'out_of_stock') {
            alerts.push({
              id: generateId(),
              type: 'stock_low',
              title: `Stock ${stockAlert.severity === 'out_of_stock' ? 'agotado' : 'crítico'}: ${stockAlert.productName}`,
              message: `Quedan ${stockAlert.currentStock} unidades (mínimo: ${stockAlert.minStock})`,
              severity: stockAlert.severity === 'out_of_stock' ? 'critical' : 'warning',
              relatedEntityId: stockAlert.productId,
              relatedEntityType: 'product',
              value: stockAlert.currentStock,
              threshold: stockAlert.minStock,
              period: 'Actual',
              createdAt: new Date().toISOString(),
              read: false,
              dismissed: false,
            });
          }
        });

        // 6. ROI negative
        get().calculateROI().forEach((roi) => {
          if (roi.roi < 0) {
            alerts.push({
              id: generateId(),
              type: 'roi_negative',
              title: `ROI negativo en campaña: ${roi.campaignName}`,
              message: `Perdiste ${formatCurrency(Math.abs(roi.invested - roi.revenueGenerated), { currency: 'ARS', symbol: '$' })} (ROI: ${roi.roi.toFixed(1)}%)`,
              severity: 'critical',
              relatedEntityId: roi.campaignId,
              relatedEntityType: 'campaign',
              value: roi.roi,
              threshold: 0,
              period: 'Campaña activa',
              createdAt: new Date().toISOString(),
              read: false,
              dismissed: false,
            });
          }
        });

        // Merge with existing alerts (avoid duplicates)
        set((state) => {
          const existingIds = new Set(state.automaticAlerts.map((a) => a.id));
          const newAlerts = alerts.filter((a) => !existingIds.has(a.id));
          return { automaticAlerts: [...newAlerts, ...state.automaticAlerts] };
        });

        return alerts;
      },

      markAlertAsRead: (id) => {
        set((state) => ({
          automaticAlerts: state.automaticAlerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        }));
      },

      dismissAutomaticAlert: (id) => {
        set((state) => ({
          automaticAlerts: state.automaticAlerts.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          ),
        }));
      },

      getUnreadAlerts: () => {
        return get().automaticAlerts.filter((a) => !a.read && !a.dismissed);
      },

      // Part 3: Export
      exportToPDF: async (options) => {
        // This would use a library like jsPDF or pdfmake
        // For now, return a simple blob
        const data = get().exportToCSV(options);
        return new Blob([data], { type: 'application/pdf' });
      },

      exportToExcel: async (options) => {
        // This would use a library like xlsx
        const data = get().exportToCSV(options);
        return new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      },

      exportToCSV: (options) => {
        const { transactions, categories, products, businesses } = get();
        let data: any[] = [];

        const filteredTx = transactions.filter(
          (t) => t.date >= options.startDate && t.date <= options.endDate &&
          (!options.businessId || products.find((p) => p.id === t.category)?.businessId === options.businessId)
        );

        switch (options.type) {
          case 'transactions':
            data = filteredTx.map((t) => ({
              Fecha: formatDate(t.date, 'DD/MM/YYYY'),
              Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
              Categoría: categories.find((c) => c.id === t.category)?.name || t.category,
              Subcategoría: t.subcategory || '',
              Descripción: t.description || '',
              Monto: t.amount,
              'Método de pago': t.paymentMethod || '',
            }));
            break;
          case 'summary':
            const income = filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            data = [
              { Concepto: 'Ingresos totales', Valor: income },
              { Concepto: 'Egresos totales', Valor: expense },
              { Concepto: 'Balance neto', Valor: income - expense },
            ];
            break;
          case 'category':
            const expenseByCat = filteredTx.filter((t) => t.type === 'expense').reduce((acc, t) => {
              acc[t.category] = (acc[t.category] || 0) + t.amount;
              return acc;
            }, {} as Record<string, number>);
            data = Object.entries(expenseByCat).map(([catId, amount]) => ({
              Categoría: categories.find((c) => c.id === catId)?.name || catId,
              Monto: amount,
            }));
            break;
          case 'trend':
            // Simplified trend export
            break;
          case 'roi':
            data = get().calculateROI(options.businessId).map((r) => ({
              Campaña: r.campaignName,
              Plataforma: r.platform,
              Invertido: r.invested,
              'Ingresos generados': r.revenueGenerated,
              'ROI %': r.roi.toFixed(2),
              ROAS: r.roas.toFixed(2),
              Conversiones: r.conversions,
              'Costo por conversión': r.costPerConversion.toFixed(2),
            }));
            break;
          case 'stock':
            const bizProducts = products.filter((p) => !options.businessId || p.businessId === options.businessId);
            data = bizProducts.map((p) => ({
              Producto: p.name,
              Negocio: businesses.find((b) => b.id === p.businessId)?.name || '',
              Precio: p.price,
              Costo: p.cost,
              'Margen %': p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : 0,
              Stock: p.stock || 0,
              'Stock mínimo': p.minStock || 0,
            }));
            break;
          case 'full_report':
            // Combine all
            break;
        }

        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map((row) =>
            headers.map((h) => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              const str = String(val);
              return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(',')
          ),
        ].join('\n');

        return csv;
      },

      exportData: () => {
        const { transactions, categories, products, businesses, budgets, goals, recurringTransactions, receiptImages, settings } = get();
        return {
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          transactions,
          categories,
          products,
          businesses,
          budgets,
          goals,
          recurringTransactions,
          receiptImages,
          settings,
        };
      },

      importData: (data) => {
        if (data.version && data.transactions && data.categories) {
          set({
            transactions: data.transactions || [],
            categories: data.categories || DEFAULT_CATEGORIES,
            products: data.products || [],
            businesses: data.businesses || [],
            budgets: data.budgets || [],
            goals: data.goals || [],
            recurringTransactions: data.recurringTransactions || [],
            receiptImages: data.receiptImages || [],
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
          });
        }
      },

      clearAllData: () => {
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          products: [],
          businesses: [],
          budgets: [],
          goals: [],
          recurringTransactions: [],
          receiptImages: [],
          budgetAlerts: [],
          settings: DEFAULT_SETTINGS,
        });
      },
    }),
    {
      name: 'proxima-finance-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          return {
            ...persistedState,
            products: persistedState.products || [],
            businesses: persistedState.businesses || [],
            recurringTransactions: persistedState.recurringTransactions || [],
            receiptImages: persistedState.receiptImages || [],
            settings: { ...DEFAULT_SETTINGS, ...persistedState.settings },
            categories: persistedState.categories?.length ? persistedState.categories : DEFAULT_CATEGORIES,
          };
        }
        return persistedState as StoreState;
      },
    }
  )
);