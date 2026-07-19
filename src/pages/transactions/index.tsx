import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Download, Plus, ChevronDown, ChevronUp, Edit2, Trash2, CreditCard, Tag, DollarSign, ArrowUpDown } from 'lucide-react';
import { useStore } from '../../store';
import { TransactionItem } from '../../components/transactions';
import { TransactionForm } from '../../components/forms';
import { Card, Button, Input, Select, Badge, IconButton, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { cn, formatDate, formatCurrency, getDateRange, exportToCSV } from '../../utils/helpers';

export const TransactionsPage = () => {
  const { 
    transactions, 
    categories, 
    settings, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction 
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.subcategory?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    const start = customDateRange?.start || dateRange.start;
    const end = customDateRange?.end || dateRange.end;
    result = result.filter(t => t.date >= start && t.date <= end);

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRange, customDateRange, sortBy, sortOrder]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const handleExport = () => {
    const data = filteredTransactions.map(t => ({
      Fecha: formatDate(t.date, 'DD/MM/YYYY'),
      Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
      Categoría: categories.find(c => c.id === t.category)?.name || t.category,
      Subcategoría: t.subcategory || '',
      Descripción: t.description || '',
      Monto: t.amount,
      'Método de pago': t.paymentMethod ? getPaymentMethodLabel(t.paymentMethod) : '',
    }));
    exportToCSV(data, `movimientos-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (tx: any) => {
    setEditingTransaction(tx);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Movimientos</h1>
          <p className="text-white/50 text-sm mt-1">
            {filteredTransactions.length} movimiento{filteredTransactions.length !== 1 ? 's' : ''} encontrado{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Ingresos</p>
              <p className="text-2xl font-bold text-blue-400">{formatValue(totalIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Egresos</p>
              <p className="text-2xl font-bold text-red-400">{formatValue(totalExpense)}</p>
            </div>
          </div>
        </Card>
        <Card className={cn('border-white/10', balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: balance >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}>
              <ArrowUpDown className="h-6 w-6" style={{ color: balance >= 0 ? '#3b82f6' : '#f59e0b' }} />
            </div>
            <div>
              <p className="text-white/60 text-sm">Balance</p>
              <p className="text-2xl font-bold" style={{ color: balance >= 0 ? '#3b82f6' : '#f59e0b' }}>
                {formatValue(balance)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="search"
              placeholder="Buscar descripción, categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'income', label: 'Ingresos' },
              { value: 'expense', label: 'Egresos' },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...categories.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            value={dateRangeOptions.find(o => 
              o.value === (dateRange.start === getDateRange('month').start && dateRange.end === getDateRange('month').end ? 'month' : 'custom')
            )?.value || 'month'}
            onChange={(value) => {
              if (value !== 'custom') {
                setDateRange(getDateRange(value as any));
                setCustomDateRange(null);
              }
            }}
            options={dateRangeOptions}
          />
          {customDateRange && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="w-full"
              />
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-white/50">
          <span>{filteredTransactions.length} resultados</span>
          <div className="flex items-center gap-4">
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'date', label: 'Fecha' },
                { value: 'amount', label: 'Monto' },
                { value: 'category', label: 'Categoría' },
              ]}
              className="w-auto"
            />
            <IconButton
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? 'Orden descendente' : 'Orden ascendente'}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={handleEditTransaction}
                onDelete={deleteTransaction}
                categories={categories}
                settings={settings}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay movimientos</h3>
            <p className="text-white/50 mb-4">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda' 
                : 'Aún no has registrado ningún movimiento'}
            </p>
            {!searchQuery && typeFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={handleAddTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer movimiento
              </Button>
            )}
          </Card>
        )}
      </motion.div>

      {showForm && (
        <TransactionForm
          initialData={editingTransaction}
          onSuccess={handleCloseForm}
          onCancel={handleCloseForm}
          mode={editingTransaction ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: 'Efectivo', card_debit: 'Débito', card_credit: 'Crédito',
    transfer: 'Transferencia', qr: 'QR', other: 'Otro',
  };
  return labels[method] || method;
};

const getDateRange = (period: string) => {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      end = new Date(start.getFullYear(), start.getMonth() + 3, 0, 23, 59, 59);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
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