import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, FileText, BarChart3, TrendingUp, Filter, ChevronDown } from 'lucide-react';
import { useStore } from '../../store';
import { 
  BarChart, LineChart, DoughnutChart, CategoryBarChart 
} from '../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Input, Badge } from '../../components/ui';
import { cn, formatCurrency, getDateRange, formatDate, exportToCSV } from '../../utils/helpers';

export const ReportsPage = () => {
  const { 
    transactions, 
    categories, 
    settings,
    getCategoryBreakdown,
    getTrendData,
  } = useStore();

  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'category' | 'trend'>('summary');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'category'>('month');

  const filteredTransactions = transactions.filter(
    t => t.date >= dateRange.start && t.date <= dateRange.end
  );

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const expenseBreakdown = getCategoryBreakdown('expense', dateRange.start, dateRange.end);
  const incomeBreakdown = getCategoryBreakdown('income', dateRange.start, dateRange.end);
  const trendData = getTrendData(12);

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const handleExport = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'transactions':
        data = filteredTransactions.map(t => ({
          Fecha: formatDate(t.date, 'DD/MM/YYYY'),
          Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
          Categoría: categories.find(c => c.id === t.category)?.name || t.category,
          Subcategoría: t.subcategory || '',
          Descripción: t.description || '',
          Monto: t.amount,
          'Método de pago': t.paymentMethod || '',
        }));
        filename = `movimientos-${formatDate(dateRange.start, 'YYYY-MM-DD')}-${formatDate(dateRange.end, 'YYYY-MM-DD')}.csv`;
        break;
      case 'categories':
        data = [...expenseBreakdown, ...incomeBreakdown].map(c => ({
          Categoría: c.category,
          Tipo: expenseBreakdown.some(e => e.category === c.category) ? 'Gasto' : 'Ingreso',
          Monto: c.amount,
          Porcentaje: c.percentage.toFixed(2) + '%',
        }));
        filename = `categorias-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
        break;
      case 'monthly':
        data = trendData.map(d => ({
          Mes: d.label,
          Ingresos: d.income,
          Egresos: d.expense,
          Balance: d.balance,
        }));
        filename = `mensual-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
        break;
    }

    if (data.length > 0) {
      exportToCSV(data, filename);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="text-white/50 text-sm mt-1">
            Genera y exporta reportes financieros detallados
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={dateRange.start === getDateRange('month').start && dateRange.end === getDateRange('month').end ? 'month' : 'custom'}
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
          <Select
            value={reportType}
            onChange={setReportType}
            options={[
              { value: 'summary', label: 'Resumen ejecutivo' },
              { value: 'detailed', label: 'Detallado' },
              { value: 'category', label: 'Por categoría' },
              { value: 'trend', label: 'Tendencias' },
            ]}
            className="w-48"
          />
          <Button variant="outline" onClick={() => handleExport('transactions')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Ingresos totales</p>
              <p className="text-2xl font-bold text-emerald-400">{formatValue(income)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Egresos totales</p>
              <p className="text-2xl font-bold text-red-400">{formatValue(expense)}</p>
            </div>
          </div>
        </Card>
        <Card className={cn(balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: balance >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}>
              <Filter className="h-6 w-6" style={{ color: balance >= 0 ? '#3b82f6' : '#f59e0b' }} />
            </div>
            <div>
              <p className="text-white/60 text-sm">Balance neto</p>
              <p className="text-2xl font-bold" style={{ color: balance >= 0 ? '#3b82f6' : '#f59e0b' }}>
                {formatValue(balance)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {reportType === 'summary' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Evolución financiera (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={trendData} formatValue={formatValue} multiLine height={350} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de gastos e ingresos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white/60 text-sm mb-3">Gastos</h4>
                {expenseBreakdown.length > 0 ? (
                  <DoughnutChart
                    data={expenseBreakdown.slice(0, 6)}
                    formatValue={formatValue}
                    height={250}
                    centerLabel={{ label: 'Total gastos', value: formatValue(expense) }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay gastos</div>
                )}
              </div>

              <div>
                <h4 className="text-white/60 text-sm mb-3">Ingresos</h4>
                {incomeBreakdown.length > 0 ? (
                  <DoughnutChart
                    data={incomeBreakdown.slice(0, 6)}
                    formatValue={formatValue}
                    height={250}
                    centerLabel={{ label: 'Total ingresos', value: formatValue(income) }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay ingresos</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {reportType === 'detailed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Movimientos detallados</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('transactions')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/50 border-b border-white/10">
                        <th className="pb-3 pr-4">Fecha</th>
                        <th className="pb-3 pr-4">Tipo</th>
                        <th className="pb-3 pr-4">Categoría</th>
                        <th className="pb-3 pr-4">Descripción</th>
                        <th className="pb-3 pr-4 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((t) => (
                          <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-white/70">{formatDate(t.date, 'DD/MM/YYYY')}</td>
                            <td className="py-3 pr-4">
                              <Badge variant={t.type === 'income' ? 'success' : 'danger'}>
                                {t.type === 'income' ? 'Ingreso' : 'Egreso'}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-white/80">
                              {categories.find(c => c.id === t.category)?.name || t.category}
                            </td>
                            <td className="py-3 pr-4 text-white/70">{t.description || '-'}</td>
                            <td className="py-3 pr-4 text-right font-semibold" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                              {t.type === 'income' ? '+' : '−'}{formatValue(t.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">No hay movimientos en este período</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {reportType === 'category' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {reportType === 'trend' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
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
      )}
    </div>
  );
};