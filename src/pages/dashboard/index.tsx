import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Target, AlertTriangle, Clock, Plus, Filter, Calendar, BarChart3, Building2, Package, DollarSign, Trash2, Edit2, Scissors } from 'lucide-react';
import { useStore } from '../../store';
import { StatCard, CategoryProgressBar, TransactionItem, BudgetAlertCard, GoalProgressCard, InsightCard, PeriodComparison, QuickStatsGrid } from '../../components/transactions';
import { BarChart, LineChart, DoughnutChart, CategoryBarChart } from '../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Input, Badge, Tabs, TabList, TabTrigger, TabContent, IconButton } from '../../components/ui';
import { cn, formatDate, getDateRange, formatCurrency, getIconEmoji } from '../../utils/helpers';
import { TransactionForm, QuickTransactionButtons, ProductForm, BusinessForm } from '../../components/forms';

export const DashboardPage = () => {
  const { 
    transactions, 
    categories, 
    budgets, 
    goals, 
    businesses,
    products,
    settings, 
    getDashboardStats, 
    getTrendData, 
    getCategoryBreakdown,
    getBudgetStatus,
    getGoalProgress,
    getActiveAlerts,
    getBreakEvenAnalysis,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteBusiness,
    deleteProduct,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedBusinessForProducts, setSelectedBusinessForProducts] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    return getDateRange('month');
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories' | 'business'>('overview');

  const stats = getDashboardStats(dateRange.start, dateRange.end);
  const trendData = getTrendData(6);
  const expenseBreakdown = getCategoryBreakdown('expense', dateRange.start, dateRange.end);
  const incomeBreakdown = getCategoryBreakdown('income', dateRange.start, dateRange.end);
  const budgetStatus = getBudgetStatus();
  const goalProgress = getGoalProgress();
  const alerts = getActiveAlerts();

  const recentTransactions = stats.recentTransactions.slice(0, 5);

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const handleDateRangeChange = (value: string) => {
    if (value !== 'custom') {
      setDateRange(getDateRange(value as any));
    }
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

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowBusinessForm(true);
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
    setShowBusinessForm(true);
  };

  const handleCloseBusinessForm = () => {
    setShowBusinessForm(false);
    setEditingBusiness(null);
  };

  const handleAddProduct = (business: any) => {
    setEditingProduct(null);
    setSelectedBusinessForProducts(business);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setSelectedBusinessForProducts(product);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setSelectedBusinessForProducts(null);
  };

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">
            {formatDate(dateRange.start, 'DD/MM/YYYY')} - {formatDate(dateRange.end, 'DD/MM/YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRangeOptions.find(o => o.value === (dateRange.start === getDateRange('month').start && dateRange.end === getDateRange('month').end ? 'month' : 'custom'))?.value || 'month'}
            onChange={handleDateRangeChange}
            options={dateRangeOptions}
            className="w-40"
          />
          <Button onClick={handleAddTransaction} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo movimiento
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Ingresos totales"
          value={stats.totalIncome}
          change={stats.incomeChange}
          trend={stats.incomeChange >= 0 ? 'up' : 'down'}
          icon={<LayoutDashboard className="h-6 w-6" />}
          iconColor="bg-emerald-500/20 text-emerald-400"
          formatValue={formatValue}
        />
        <StatCard
          title="Egresos totales"
          value={stats.totalExpense}
          change={stats.expenseChange}
          trend={stats.expenseChange >= 0 ? 'down' : 'up'}
          icon={<TrendingUp className="h-6 w-6" />}
          iconColor="bg-red-500/20 text-red-400"
          formatValue={formatValue}
        />
        <StatCard
          title="Balance neto"
          value={stats.balance}
          change={stats.balanceChange}
          trend={stats.balanceChange >= 0 ? 'up' : 'down'}
          icon={<Target className="h-6 w-6" />}
          iconColor="bg-blue-500/20 text-blue-400"
          formatValue={formatValue}
        />
        <StatCard
          title="Transacciones"
          value={transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end).length}
          icon={<BarChart3 className="h-6 w-6" />}
          iconColor="bg-purple-500/20 text-purple-400"
        />
      </motion.div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-white">Alertas de presupuesto</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <BudgetAlertCard key={alert.id} alert={alert} onDismiss={useStore.getState().dismissBudgetAlert} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evolución financiera</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-auto">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="overview" className="text-xs px-3">Visión general</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs px-3">Tendencias</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === 'overview' && (
              <LineChart
                data={trendData}
                formatValue={formatValue}
                multiLine
                height={300}
              />
            )}
            {activeTab === 'trends' && (
              <LineChart
                data={trendData}
                formatValue={formatValue}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length > 0 ? (
              <DoughnutChart
                data={expenseBreakdown.slice(0, 6)}
                formatValue={formatValue}
                height={280}
                centerLabel={{
                  label: 'Total gastos',
                  value: formatValue(stats.totalExpense),
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-white/40">
                No hay gastos en este período
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Top categorías de gasto</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length > 0 ? (
              <CategoryBarChart
                data={expenseBreakdown.slice(0, 8)}
                formatValue={formatValue}
                height={300}
                horizontal
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-white/40">
                No hay datos de gastos
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeBreakdown.length > 0 ? (
              <DoughnutChart
                data={incomeBreakdown.slice(0, 6)}
                formatValue={formatValue}
                height={280}
                centerLabel={{
                  label: 'Total ingresos',
                  value: formatValue(stats.totalIncome),
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-white/40">
                No hay ingresos en este período
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {budgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Estado de presupuestos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetStatus.slice(0, 6).map((bs) => (
              <Card key={bs.budget.id} className={bs.isOverBudget ? 'border-red-500/30' : ''}>
                <CardContent className="p-4">
                  <CategoryProgressBar
                    category={bs.budget.categoryId}
                    amount={bs.spent}
                    percentage={bs.percentage}
                    color={categories.find(c => c.id === bs.budget.categoryId)?.color || '#6b7280'}
                    budget={bs.budget.amount}
                    showBudget
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Metas financieras</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalProgress.slice(0, 6).map((gp) => (
              <GoalProgressCard key={gp.goal.id} goal={gp.goal} progress={gp} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Movimientos recientes</h2>
          <Button variant="ghost" size="sm" onClick={() => useStore.getState().setCurrentRoute('transactions')}>
            Ver todos
          </Button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={handleEditTransaction}
                onDelete={deleteTransaction}
                categories={categories}
                settings={settings}
              />
            ))
          ) : (
            <div className="text-center py-12 text-white/40">
              <p className="text-lg mb-2">No hay movimientos aún</p>
              <Button onClick={handleAddTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer movimiento
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <QuickTransactionButtons />

      {/* Gestión de Negocios y Productos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="businesses" className="py-3">Negocios</TabsTrigger>
            <TabsTrigger value="products" className="py-3">Productos/Servicios</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Mis Negocios</h3>
              <Button onClick={() => setShowBusinessForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo negocio
              </Button>
            </div>
            {businesses.length === 0 ? (
              <Card className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">No hay negocios configurados</h4>
                <p className="text-white/50 mb-4">Crea tu primer negocio para organizar tus productos y ver el punto de equilibrio</p>
                <Button onClick={() => setShowBusinessForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer negocio
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <Card key={business.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: business.color + '20', color: business.color }}>
                          {getIconEmoji(business.icon)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{business.name}</p>
                          <p className="text-white/50 text-sm">{business.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton onClick={() => setShowBusinessForm(business)} aria-label="Editar">
                          <Edit2 className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="danger" onClick={() => deleteBusiness(business.id)} aria-label="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Costos fijos mensuales</span>
                        <span className="text-white font-medium">{formatCurrency(business.fixedCosts, { currency: settings.currency, symbol: settings.currencySymbol })}</span>
                      </div>
                      {(() => {
                        const analysis = getBreakEvenAnalysis(business.id);
                        if (analysis) {
                          return (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-400">Punto de equilibrio</span>
                                <span className="text-emerald-400 font-bold">{formatCurrency(analysis.breakEvenRevenue, { currency: settings.currency, symbol: settings.currencySymbol })}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/60">Margen de seguridad</span>
                                <span className="text-white font-medium">{analysis.marginOfSafety.toFixed(1)}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Productos y Servicios</h3>
              <Button onClick={() => businesses.length > 0 && setShowProductForm({ businessId: businesses[0].id })}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo producto
              </Button>
            </div>
            {businesses.length === 0 ? (
              <Card className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Primero crea un negocio</h4>
                <p className="text-white/50 mb-4">Los productos pertenecen a un negocio. Ve a la pestaña "Negocios" para crear uno.</p>
              </Card>
            ) : products.length === 0 ? (
              <Card className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">No hay productos aún</h4>
                <p className="text-white/50 mb-4">Agrega tus productos o servicios con precio y costo para ver márgenes reales</p>
                <Button onClick={() => setShowProductForm({ businessId: businesses[0].id })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer producto
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;
                  const business = businesses.find(b => b.id === product.businessId);
                  return (
                    <Card key={product.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: product.color + '20', color: product.color }}>
                            {getIconEmoji(product.icon)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-white/50 text-xs">{business?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconButton onClick={() => setShowProductForm(product)} aria-label="Editar">
                            <Edit2 className="h-4 w-4" />
                          </IconButton>
                          <IconButton variant="danger" onClick={() => deleteProduct(product.id)} aria-label="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Precio</span>
                          <span className="text-white font-medium">{formatCurrency(product.price, { currency: settings.currency, symbol: settings.currencySymbol })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Costo</span>
                          <span className="text-white font-medium">{formatCurrency(product.cost, { currency: settings.currency, symbol: settings.currencySymbol })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Margen</span>
                          <span className={`font-bold ${margin >= 30 ? 'text-emerald-400' : margin >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Stock</span>
                          <span className={`font-medium ${product.stock !== undefined && product.stock <= (product.minStock || 5) ? 'text-red-400' : 'text-white'}`}>
                            {product.stock || 0} {product.unit}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {showForm && (
        <TransactionForm
          initialData={editingTransaction}
          onSuccess={handleCloseForm}
          onCancel={handleCloseForm}
          mode={editingTransaction ? 'edit' : 'create'}
        />
      )}

      {showBusinessForm && (
        <BusinessForm
          initialData={editingBusiness}
          onSuccess={handleCloseBusinessForm}
          onCancel={handleCloseBusinessForm}
        />
      )}

      {showProductForm && (
        <ProductForm
          initialData={editingProduct}
          business={selectedBusinessForProducts}
          onSuccess={handleCloseProductForm}
          onCancel={handleCloseProductForm}
        />
      )}
    </div>
  );
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