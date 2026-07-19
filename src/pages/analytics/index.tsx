import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, BarChart3, TrendingUp, Target, AlertTriangle, Filter } from 'lucide-react';
import { useStore } from '../../store';
import { 
  BarChart, LineChart, DoughnutChart, CategoryBarChart, ComparisonBarChart 
} from '../../components/charts';
import { Card, Select, Button, Input, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { cn, formatCurrency, getDateRange, exportToCSV } from '../../utils/helpers';

export const AnalyticsPage = () => {
  const { 
    transactions, 
    categories, 
    budgets, 
    goals, 
    settings,
    getTrendData,
    getCategoryBreakdown,
    getCategoryStats,
  } = useStore();

  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [compareRange, setCompareRange] = useState<{ start: string; end: string } | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'trends' | 'comparison'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentRange = dateRange;
  const previousRange = useMemo(() => {
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);
    const diff = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - diff);
    return {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0],
    };
  }, [currentRange]);

  const currentTransactions = useMemo(() => 
    transactions.filter(t => t.date >= currentRange.start && t.date <= currentRange.end), 
    [transactions, currentRange]
  );

  const previousTransactions = useMemo(() => 
    transactions.filter(t => t.date >= previousRange.start && t.date <= previousRange.end), 
    [transactions, previousRange]
  );

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const currentIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const currentExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const previousIncome = previousTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const previousExpense = previousTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
  const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;
  const balanceChange = (previousIncome - previousExpense) !== 0 
    ? ((currentIncome - currentExpense) - (previousIncome - previousExpense)) / Math.abs(previousIncome - previousExpense) * 100 
    : 0;

  const expenseBreakdown = getCategoryBreakdown('expense', currentRange.start, currentRange.end);
  const incomeBreakdown = getCategoryBreakdown('income', currentRange.start, currentRange.end);
  const trendData = getTrendData(6);

  const topExpenseCategories = expenseBreakdown.slice(0, 5);
  const topIncomeCategories = incomeBreakdown.slice(0, 5);

  const comparisonData = expenseBreakdown.map(cat => {
    const prevCat = previousTransactions
      .filter(t => t.type === 'expense' && t.category === cat.category)
      .reduce((s, t) => s + t.amount, 0);
    return {
      label: cat.category,
      current: cat.amount,
      previous: prevCat,
      color: cat.color,
    };
  }).filter(d => d.current > 0 || d.previous > 0).slice(0, 8);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Análisis financiero</h1>
          <p className="text-white/50 text-sm mt-1">
            Período: {formatDate(currentRange.start, 'DD/MM/YYYY')} - {formatDate(currentRange.end, 'DD/MM/YYYY')}
            {compareRange && ` | Comparando con: ${formatDate(compareRange.start, 'DD/MM/YYYY')} - ${formatDate(compareRange.end, 'DD/MM/YYYY')}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={currentRange.start === getDateRange('month').start && currentRange.end === getDateRange('month').end ? 'month' : 'custom'}
            onChange={(v) => v !== 'custom' && setDateRange(getDateRange(v as any))}
            options={[
              { value: 'today', label: 'Hoy' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'quarter', label: 'Este trimestre' },
              { value: 'year', label: 'Este año' },
              { value: 'custom', label: 'Personalizado' },
            ]}
            className="w-40"
          />
          <Button variant="outline" onClick={() => setCompareRange(previousRange)}>
            <Filter className="h-4 w-4 mr-2" />
            Comparar período anterior
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </motion.div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="py-3">Visión general</TabsTrigger>
          <TabsTrigger value="categories" className="py-3">Categorías</TabsTrigger>
          <TabsTrigger value="trends" className="py-3">Tendencias</TabsTrigger>
          <TabsTrigger value="comparison" className="py-3">Comparativa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Ingresos" value={currentIncome} change={incomeChange} trend={incomeChange >= 0 ? 'up' : 'down'} formatValue={formatValue} icon={<TrendingUp className="h-6 w-6" />} iconColor="bg-blue-500/20 text-blue-400" />
            <StatCard title="Egresos" value={currentExpense} change={expenseChange} trend={expenseChange >= 0 ? 'down' : 'up'} formatValue={formatValue} icon={<BarChart3 className="h-6 w-6" />} iconColor="bg-red-500/20 text-red-400" />
            <StatCard title="Balance" value={currentIncome - currentExpense} change={balanceChange} trend={balanceChange >= 0 ? 'up' : 'down'} formatValue={formatValue} icon={<Target className="h-6 w-6" />} iconColor="bg-blue-500/20 text-blue-400" />
            <StatCard title="Transacciones" value={currentTransactions.length} formatValue={v => v.toString()} icon={<BarChart3 className="h-6 w-6" />} iconColor="bg-purple-500/20 text-purple-400" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Evolución mensual (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={trendData} formatValue={formatValue} multiLine height={300} />
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
                    centerLabel={{ label: 'Total gastos', value: formatValue(currentExpense) }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay gastos</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 gastos por categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBarChart data={topExpenseCategories} formatValue={formatValue} height={300} horizontal />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 ingresos por categoría</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeBreakdown.length > 0 ? (
                  <DoughnutChart
                    data={topIncomeCategories}
                    formatValue={formatValue}
                    height={280}
                    centerLabel={{ label: 'Total ingresos', value: formatValue(currentIncome) }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay ingresos</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...categories.map(c => ({ value: c.id, label: c.name })),
                ]}
                className="w-64"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBarChart data={expenseBreakdown} formatValue={formatValue} height={400} horizontal maxBars={15} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  {incomeBreakdown.length > 0 ? (
                    <CategoryBarChart data={incomeBreakdown} formatValue={formatValue} height={400} horizontal maxBars={10} />
                  ) : (
                    <div className="flex items-center justify-center h-80 text-white/40">No hay ingresos</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por subcategoría</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.subcategories && (
                  <SubcategoryBreakdown 
                    categoryId={selectedCategory} 
                    transactions={currentTransactions} 
                    categories={categories} 
                    formatValue={formatValue} 
                  />
                )}
                {selectedCategory === 'all' && (
                  <div className="space-y-4">
                    {expenseBreakdown.map(cat => (
                      cat.subcategories && cat.subcategories.length > 0 && (
                        <div key={cat.category} className="border-t border-white/10 pt-4">
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            {cat.category}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {cat.subcategories.map((sub: any) => (
                              <div key={sub.subcategory} className="bg-white/5 p-3 rounded-xl">
                                <p className="text-white/70 text-sm">{sub.subcategory}</p>
                                <p className="text-white font-semibold">{formatValue(sub.amount)}</p>
                                <p className="text-white/40 text-xs">{sub.percentage.toFixed(1)}% de la categoría</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="trends">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de ingresos vs egresos</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={trendData} formatValue={formatValue} multiLine height={350} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance neto mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={trendData} formatValue={formatValue} height={300} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Variación mensual de ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={trendData.map(d => ({ label: d.label, value: d.income }))}
                    formatValue={formatValue}
                    height={280}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variación mensual de egresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={trendData.map(d => ({ label: d.label, value: d.expense }))}
                    formatValue={formatValue}
                    height={280}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="comparison">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {compareRange ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ComparisonStatCard label="Ingresos" current={currentIncome} previous={previousIncome} formatValue={formatValue} />
                  <ComparisonStatCard label="Egresos" current={currentExpense} previous={previousExpense} formatValue={formatValue} />
                  <ComparisonStatCard label="Balance" current={currentIncome - currentExpense} previous={previousIncome - previousExpense} formatValue={formatValue} />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparativa de gastos por categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComparisonBarChart data={comparisonData} formatValue={formatValue} height={350} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparativa de ingresos por categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ComparisonBarChart 
                      data={incomeBreakdown.map(cat => {
                        const prev = previousTransactions.filter(t => t.type === 'income' && t.category === cat.category).reduce((s, t) => s + t.amount, 0);
                        return { label: cat.category, current: cat.amount, previous: prev, color: cat.color };
                      }).filter(d => d.current > 0 || d.previous > 0)} 
                      formatValue={formatValue} 
                      height={300} 
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="py-12 text-center">
                <Filter className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Selecciona un período para comparar</h3>
                <p className="text-white/50 mb-4">Usa el botón "Comparar período anterior" en la cabecera para ver la evolución</p>
                <Button onClick={() => setCompareRange(previousRange)}>
                  Comparar con período anterior
                </Button>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ title, value, change, trend, formatValue, icon, iconColor }: any) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/60 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{formatValue(value)}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend === 'up' ? <TrendingUp className="h-4 w-4 text-blue-400" /> : <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />}
            <span className={cn('text-sm font-medium', trend === 'up' ? 'text-blue-400' : 'text-red-400')}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
        {icon}
      </div>
    </div>
  </Card>
);

const ComparisonStatCard = ({ label, current, previous, formatValue }: any) => {
  const change = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;
  return (
    <Card>
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{formatValue(current)}</p>
      <div className="flex items-center gap-1.5 mt-2">
        {change >= 0 ? <TrendingUp className="h-4 w-4 text-blue-400" /> : <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />}
        <span className={cn('text-sm font-medium', change >= 0 ? 'text-blue-400' : 'text-red-400')}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
        <span className="text-white/40 text-sm">({formatValue(previous)})</span>
      </div>
    </Card>
  );
};

const SubcategoryBreakdown = ({ categoryId, transactions, categories, formatValue }: any) => {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat?.subcategories) return null;

  const subData = cat.subcategories.map(sub => {
    const amount = transactions
      .filter(t => t.type === cat.type && t.subcategory === sub)
      .reduce((s, t) => s + t.amount, 0);
    return { subcategory: sub, amount, percentage: 0 };
  }).filter(d => d.amount > 0);

  const total = subData.reduce((s, d) => s + d.amount, 0);
  subData.forEach(d => d.percentage = total > 0 ? (d.amount / total) * 100 : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {subData.map(d => (
        <div key={d.subcategory} className="bg-white/5 p-3 rounded-xl">
          <p className="text-white/70 text-sm">{d.subcategory}</p>
          <p className="text-white font-semibold">{formatValue(d.amount)}</p>
          <p className="text-white/40 text-xs">{d.percentage.toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
};

const formatDate = (date: string, format: string) => {
  const d = new Date(date);
  return format.replace('DD', String(d.getDate()).padStart(2, '0'))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('YYYY', String(d.getFullYear()));
};

const handleExport = () => {
  // Export functionality
};

const getDateRange = (period: string) => {
  const now = new Date();
  let start: Date, end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  switch (period) {
    case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); break;
    case 'week': start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59); break;
    case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    case 'quarter': start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); end = new Date(start.getFullYear(), start.getMonth() + 3, 0, 23, 59, 59); break;
    case 'year': start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31, 23, 59, 59); break;
    default: start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
};