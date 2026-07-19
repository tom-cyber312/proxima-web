export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  paymentMethod?: string;
  recurring?: boolean;
  recurringId?: string;
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  subcategories?: string[];
  budget?: number;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  unit: string;
  stock?: number;
  minStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  fixedCosts: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  spent: number;
  budget: number;
  percentage: number;
  triggered: boolean;
  triggeredAt?: string;
  dismissed: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  icon: string;
  color: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'balance' | 'category' | 'trend';
  filters: ReportFilters;
  generatedAt: string;
  data: any;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: TransactionType;
  categories?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'category' | 'subcategory';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  topCategories: CategoryStat[];
  recentTransactions: Transaction[];
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  subcategories?: SubcategoryBreakdown[];
}

export interface SubcategoryBreakdown {
  subcategory: string;
  amount: number;
  percentage: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  alertTriggered: boolean;
}

export interface GoalProgress {
  goal: Goal;
  progress: number;
  remaining: number;
  daysRemaining: number;
  monthlyRequired: number;
  onTrack: boolean;
}

export interface ProductMargin {
  product: Product;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  unitsSold: number;
}

export interface BreakEvenAnalysis {
  businessId: string;
  businessName: string;
  fixedCosts: number;
  variableCostRatio: number;
  breakEvenRevenue: number;
  breakEvenUnits: Record<string, number>;
  marginOfSafety: number;
}

export interface PeriodComparison {
  current: { start: string; end: string };
  previous: { start: string; end: string };
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  categoryChanges: CategoryComparison[];
}

export interface CategoryComparison {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface RecurringTransaction {
  id: string;
  template: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'date'>;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDate: string;
  lastGenerated?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReceiptImage {
  id: string;
  transactionId: string;
  dataUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  firstDayOfWeek: 0 | 1;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  defaultView: 'dashboard' | 'transactions';
  currencyPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  budgetAlerts: boolean;
  goalAlerts: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface BackupData {
  version: string;
  timestamp: string;
  transactions: Transaction[];
  categories: Category[];
  products: Product[];
  businesses: Business[];
  budgets: Budget[];
  goals: Goal[];
  recurringTransactions: RecurringTransaction[];
  receiptImages: ReceiptImage[];
  settings: AppSettings;
}

// Part 3: Advanced features
export type UserRole = 'owner' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessIds?: string[]; // For employees/managers - restricted access
  createdAt: string;
  lastLogin?: string;
}

export interface AdvertisingCampaign {
  id: string;
  businessId: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'other';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface ROIMetric {
  campaignId: string;
  campaignName: string;
  platform: string;
  invested: number;
  revenueGenerated: number;
  roi: number;
  roas: number; // Return on Ad Spend
  conversions: number;
  costPerConversion: number;
}

export interface SimulatorScenario {
  id: string;
  name: string;
  businessId: string;
  type: 'price_change' | 'ad_investment' | 'cost_reduction' | 'custom';
  parameters: {
    priceChangePercent?: number;
    adInvestmentChange?: number;
    costReductionPercent?: number;
    customFormula?: string;
  };
  projectedRevenue: number;
  projectedExpense: number;
  projectedProfit: number;
  projectedMargin: number;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  businessId: string;
  businessName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical' | 'out_of_stock';
  createdAt: string;
  acknowledged: boolean;
}

export interface AutomaticAlert {
  id: string;
  type: 'expense_spike' | 'income_drop' | 'budget_exceeded' | 'goal_off_track' | 'stock_low' | 'roi_negative';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  relatedEntityId?: string; // category, product, business, campaign
  relatedEntityType?: 'category' | 'product' | 'business' | 'campaign' | 'goal' | 'budget';
  value: number;
  threshold: number;
  period: string;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  type: 'transactions' | 'summary' | 'category' | 'trend' | 'roi' | 'stock' | 'full_report';
  startDate: string;
  endDate: string;
  businessId?: string;
  includeCharts: boolean;
}

export interface Permission {
  resource: 'dashboard' | 'transactions' | 'analytics' | 'reports' | 'settings' | 'businesses' | 'products' | 'users';
  actions: ('read' | 'write' | 'delete')[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    { resource: 'dashboard', actions: ['read', 'write', 'delete'] },
    { resource: 'transactions', actions: ['read', 'write', 'delete'] },
    { resource: 'analytics', actions: ['read', 'write', 'delete'] },
    { resource: 'reports', actions: ['read', 'write', 'delete'] },
    { resource: 'settings', actions: ['read', 'write', 'delete'] },
    { resource: 'businesses', actions: ['read', 'write', 'delete'] },
    { resource: 'products', actions: ['read', 'write', 'delete'] },
    { resource: 'users', actions: ['read', 'write', 'delete'] },
  ],
  manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'transactions', actions: ['read', 'write'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'businesses', actions: ['read'] },
    { resource: 'products', actions: ['read', 'write'] },
    { resource: 'users', actions: ['read'] },
  ],
  employee: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'transactions', actions: ['read', 'write'] },
    { resource: 'analytics', actions: [] },
    { resource: 'reports', actions: [] },
    { resource: 'settings', actions: [] },
    { resource: 'businesses', actions: [] },
    { resource: 'products', actions: ['read'] },
    { resource: 'users', actions: [] },
  ],
};

// New types for Treinta-style features
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  type: 'receivable' | 'payable';
  clientId?: string;
  clientName: string;
  supplierId?: string;
  supplierName?: string;
  amount: number;
  paidAmount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  payments: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId?: string;
  clientName: string;
  clientDocument?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  salary?: number;
  startDate: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}