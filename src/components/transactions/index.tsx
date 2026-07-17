import { cn } from '../../utils/helpers';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Target, AlertTriangle, Clock, DollarSign, PiggyBank } from 'lucide-react';
import { BarChart, LineChart, DoughnutChart, formatCurrency } from '../charts';

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  iconColor, 
  trend, 
  formatValue,
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  formatValue?: (val: number) => string;
}) => {
  const formattedValue = formatValue ? formatValue(value) : value.toLocaleString('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{formattedValue}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-emerald-400" />
              ) : trend === 'down' ? (
                <ArrowDown className="h-4 w-4 text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-white/40" />
              )}
              <span className={cn(
                'text-sm font-medium',
                trend === 'up' && 'text-emerald-400',
                trend === 'down' && 'text-red-400',
                trend === 'neutral' && 'text-white/40'
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs mes anterior
              </span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const CategoryProgressBar = ({ 
  category, 
  amount, 
  percentage, 
  color, 
  budget,
  showBudget = false,
}: {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  budget?: number;
  showBudget?: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-white/80 text-sm truncate pr-2">{category}</span>
      <span className="text-white font-medium text-sm whitespace-nowrap">
        {amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
      </span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 800, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
    {showBudget && budget && (
      <div className="flex justify-between text-xs text-white/40">
        <span>Gastado: {percentage.toFixed(0)}%</span>
        <span>Presupuesto: {budget.toLocaleString('es-AR')}</span>
      </div>
    )}
  </div>
);

export const TransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  categories,
  settings,
}: { 
  transaction: any; 
  onEdit: (tx: any) => void; 
  onDelete: (id: string) => void;
  categories: any[];
  settings: any;
}) => {
  const category = categories.find(c => c.id === transaction.category);
  const isIncome = transaction.type === 'income';
  const amount = isIncome ? transaction.amount : -transaction.amount;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', isIncome ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
        <span className="text-xl">{category ? getIconEmoji(category.icon) : '📦'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium truncate">{transaction.description || category?.name || 'Sin descripción'}</p>
          {transaction.recurring && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
              Recurrente
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
          <span>{formatDate(transaction.date, 'DD/MM/YYYY')}</span>
          {transaction.subcategory && <span>· {transaction.subcategory}</span>}
          {transaction.paymentMethod && <span>· {getPaymentMethodLabel(transaction.paymentMethod)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          'font-semibold text-lg tabular-nums',
          isIncome ? 'text-emerald-400' : 'text-red-400'
        )}>
          {isIncome ? '+' : '−'}{formatCurrency(Math.abs(amount), { currency: settings.currency, symbol: settings.currencySymbol })}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton size="sm" onClick={() => onEdit(transaction)} aria-label="Editar">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </IconButton>
          <IconButton size="sm" variant="danger" onClick={() => onDelete(transaction.id)} aria-label="Eliminar">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
};

export const BudgetAlertCard = ({ alert, onDismiss }: { alert: any; onDismiss: (id: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
  >
    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <AlertTriangle className="h-5 w-5 text-amber-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-white font-medium">{alert.categoryName}</p>
        <IconButton size="sm" onClick={() => onDismiss(alert.id)}><X className="h-4 w-4" /></IconButton>
      </div>
      <p className="text-white/70 text-sm mt-1">
        Has gastado <strong className="text-amber-400">{formatCurrency(alert.spent, { currency: 'ARS', symbol: '$' })}</strong> 
        de <strong className="text-white">{formatCurrency(alert.budget, { currency: 'ARS', symbol: '$' })}</strong> 
        ({alert.percentage}% del presupuesto)
      </p>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
        <div 
          className="h-full rounded-full bg-amber-500" 
          style={{ width: `${Math.min(alert.percentage, 100)}%` }}
        />
      </div>
    </div>
  </motion.div>
);

export const GoalProgressCard = ({ goal, progress }: { goal: any; progress: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <span className="text-xl">{getIconEmoji(goal.icon)}</span>
        </div>
        <div>
          <p className="text-white font-semibold">{goal.name}</p>
          <p className="text-white/50 text-sm">
            {progress.daysRemaining} días restantes
          </p>
        </div>
      </div>
      <span className={cn('text-lg font-bold', progress.onTrack ? 'text-emerald-400' : 'text-red-400')}>
        {progress.progress.toFixed(1)}%
      </span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress.progress, 100)}%` }}
        transition={{ duration: 800, ease: 'easeOut' }}
        className="h-full rounded-full bg-emerald-500"
      />
    </div>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-2xl font-bold text-white">{formatCurrency(goal.currentAmount, { currency: 'ARS', symbol: '$' })}</p>
        <p className="text-white/50 text-xs">Actual</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{formatCurrency(goal.targetAmount, { currency: 'ARS', symbol: '$' })}</p>
        <p className="text-white/50 text-xs">Meta</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(progress.monthlyRequired, { currency: 'ARS', symbol: '$' })}</p>
        <p className="text-white/50 text-xs">/mes necesario</p>
      </div>
    </div>
  </motion.div>
);

export const InsightCard = ({ title, description, icon, iconColor, action }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  iconColor: string;
  action?: { label: string; onClick: () => void };
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconColor)}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">{title}</h4>
          <p className="text-white/70 text-sm">{description}</p>
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick} className="mt-3">
              {action.label}
              <ArrowUp className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PeriodComparison = ({ 
  current, 
  previous, 
  label, 
  formatValue,
}: { 
  current: number; 
  previous: number; 
  label: string; 
  formatValue?: (val: number) => string;
}) => {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white/70 text-sm font-medium">{label}</h4>
        <div className={cn('flex items-center gap-1.5 text-sm font-medium', trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40')}>
          {trend === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4" />}
          <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-white/50 text-xs mb-1">Período actual</p>
          <p className="text-2xl font-bold text-white">{formatValue ? formatValue(current) : current.toLocaleString('es-AR')}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-1">Período anterior</p>
          <p className="text-2xl font-bold text-white/70">{formatValue ? formatValue(previous) : previous.toLocaleString('es-AR')}</p>
        </div>
      </div>
    </div>
  );
};

export const QuickStatsGrid = ({ stats }: { stats: { label: string; value: string | number; icon: React.ReactNode; color: string }[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {stats.map((stat, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
            <span style={{ color: stat.color }}>{stat.icon}</span>
          </div>
        </div>
        <p className="text-white font-semibold text-lg">{stat.value}</p>
        <p className="text-white/50 text-xs mt-1">{stat.label}</p>
      </motion.div>
    ))}
  </div>
);

const getIconEmoji = (name: string): string => {
  const icons: Record<string, string> = {
    'briefcase': '💼', 'trending-up': '📈', 'plus-circle': '➕',
    'home': '🏠', 'utensils': '🍽️', 'car': '🚗',
    'heart-pulse': '💊', 'film': '🎬', 'shopping-bag': '🛍️',
    'graduation-cap': '🎓', 'more-horizontal': '⋯', 'gift': '🎁',
    'credit-card': '💳', 'wallet': '👛', 'banknote': '💵',
    'coins': '🪙', 'piggy-bank': '🐷', 'receipt': '🧾',
    'file-text': '📄', 'calendar': '📅', 'clock': '🕐',
    'map-pin': '📍', 'phone': '📱',
  };
  return icons[name] || '📦';
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: 'Efectivo', card_debit: 'Débito', card_credit: 'Crédito',
    transfer: 'Transferencia', qr: 'QR', other: 'Otro',
  };
  return labels[method] || method;
};

const formatDate = (date: string | Date, format: string): string => {
  const d = new Date(date);
  return format
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'));
};

const formatCurrency = (amount: number, options: { currency: string; symbol: string }): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: 2,
  }).format(amount);
};