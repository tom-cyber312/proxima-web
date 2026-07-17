import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, TrendingUp, Calendar, Filter, Database, Cloud, HardDrive, Save, Loader2, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import { 
  BarChart, LineChart, DoughnutChart, CategoryBarChart 
} from '../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Input, Badge, Tabs, TabList, TabTrigger, TabContent } from '../../components/ui';
import { cn, formatCurrency, getDateRange, formatDate, exportToCSV, downloadFile } from '../../utils/helpers';

export const ExportPage = () => {
  const { 
    transactions, 
    categories, 
    businesses, 
    products, 
    settings,
    advertisingCampaigns,
    getCategoryBreakdown,
    getTrendData,
  } = useStore();

  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [exportType, setExportType] = useState<'transactions' | 'summary' | 'category' | 'trend' | 'roi' | 'stock' | 'full_report'>('transactions');
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => 
    transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end), 
    [transactions, dateRange]
  );

  const expenseBreakdown = getCategoryBreakdown('expense', dateRange.start, dateRange.end);
  const incomeBreakdown = getCategoryBreakdown('income', dateRange.start, dateRange.end);
  const trendData = getTrendData(12);

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      let data: string;
      let filename: string;

      switch (exportType) {
        case 'transactions':
          data = generateTransactionsCSV();
          filename = `movimientos-${formatDate(dateRange.start, 'YYYY-MM-DD')}-${formatDate(dateRange.end, 'YYYY-MM-DD')}.csv`;
          break;
        case 'summary':
          data = generateSummaryCSV();
          filename = `resumen-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        case 'category':
          data = generateCategoryCSV();
          filename = `categorias-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        case 'trend':
          data = generateTrendCSV();
          filename = `tendencias-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        case 'roi':
          data = generateROICSV();
          filename = `roi-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        case 'stock':
          data = generateStockCSV();
          filename = `stock-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        case 'full_report':
          data = generateFullReportCSV();
          filename = `reporte-completo-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
          break;
        default:
          data = generateTransactionsCSV();
          filename = `export-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 50));
        setExportProgress(i);
      }

      if (format === 'csv') {
        downloadFile(data, filename, 'text/csv');
      } else if (format === 'excel') {
        // Would need xlsx library
        downloadFile(data, filename.replace('.csv', '.xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === 'pdf') {
        // Would need jsPDF
        downloadFile(data, filename.replace('.csv', '.pdf'), 'application/pdf');
      }

      setLastExport(new Date().toISOString());
      setExportProgress(100);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };

  const generateTransactionsCSV = () => {
    const data = filteredTransactions
      .filter(t => businessFilter === 'all' || products.find(p => p.id === t.category)?.businessId === businessFilter)
      .map(t => ({
        Fecha: formatDate(t.date, 'DD/MM/YYYY'),
        Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
        Categoría: categories.find(c => c.id === t.category)?.name || t.category,
        Subcategoría: t.subcategory || '',
        Descripción: t.description || '',
        Monto: t.amount,
        'Método de pago': t.paymentMethod ? getPaymentMethodLabel(t.paymentMethod) : '',
        Recurrente: t.recurring ? 'Sí' : 'No',
      }));

    return arrayToCSV(data);
  };

  const generateSummaryCSV = () => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    const data = [
      { Concepto: 'Ingresos totales', Valor: income },
      { Concepto: 'Egresos totales', Valor: expense },
      { Concepto: 'Balance neto', Valor: balance },
      { Concepto: 'Total transacciones', Valor: filteredTransactions.length },
      { Concepto: 'Período', Valor: `${formatDate(dateRange.start, 'DD/MM/YYYY')} - ${formatDate(dateRange.end, 'DD/MM/YYYY')}` },
    ];

    return arrayToCSV(data);
  };

  const generateCategoryCSV = () => {
    const data = [...expenseBreakdown, ...incomeBreakdown].map(c => ({
      Categoría: c.category,
      Tipo: expenseBreakdown.some(e => e.category === c.category) ? 'Gasto' : 'Ingreso',
      Monto: c.amount,
      Porcentaje: c.percentage.toFixed(2) + '%',
    }));

    return arrayToCSV(data);
  };

  const generateTrendCSV = () => {
    const data = trendData.map(d => ({
      Mes: d.label,
      Ingresos: d.income,
      Egresos: d.expense,
      Balance: d.balance,
    }));

    return arrayToCSV(data);
  };

  const generateROICSV = () => {
    const roiMetrics = useStore.getState().calculateROI();
    const data = roiMetrics.map(r => ({
      Campaña: r.campaignName,
      Plataforma: r.platform,
      Invertido: r.invested,
      'Ingresos generados': r.revenueGenerated,
      'ROI %': r.roi.toFixed(2),
      ROAS: r.roas.toFixed(2),
      Conversiones: r.conversions,
      'Costo por conversión': r.costPerConversion.toFixed(2),
    }));

    return arrayToCSV(data);
  };

  const generateStockCSV = () => {
    const bizProducts = businessFilter === 'all' 
      ? products 
      : products.filter(p => p.businessId === businessFilter);
    
    const data = bizProducts.map(p => ({
      Producto: p.name,
      Negocio: businesses.find(b => b.id === p.businessId)?.name || '',
      Precio: p.price,
      Costo: p.cost,
      'Margen %': p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : 0,
      Stock: p.stock || 0,
      'Stock mínimo': p.minStock || 0,
      Estado: p.stock !== undefined && p.minStock !== undefined 
        ? p.stock <= 0 ? 'Agotado' : p.stock <= (p.minStock * 0.5) ? 'Crítico' : p.stock <= p.minStock ? 'Bajo' : 'OK'
        : 'Sin datos',
    }));

    return arrayToCSV(data);
  };

  const generateFullReportCSV = () => {
    // Combine multiple sections with separators
    const sections = [
      ['=== RESUMEN EJECUTIVO ==='],
      generateSummaryCSV().split('\n'),
      ['', '=== MOVIMIENTOS ==='],
      generateTransactionsCSV().split('\n'),
      ['', '=== CATEGORÍAS ==='],
      generateCategoryCSV().split('\n'),
      ['', '=== TENDENCIAS ==='],
      generateTrendCSV().split('\n'),
      ['', '=== ROI PUBLICIDAD ==='],
      generateROICSV().split('\n'),
      ['', '=== STOCK ==='],
      generateStockCSV().split('\n'),
    ].flat();

    return arrayToCSV([{ data: sections.join('\n') }]);
  };

  const arrayToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    return [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n') 
            ? `"${str.replace(/"/g, '""')}"` 
            : str;
        }).join(',')
      )
    ].join('\n');
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo', card_debit: 'Débito', card_credit: 'Crédito',
      transfer: 'Transferencia', qr: 'QR', other: 'Otro',
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Exportar Datos</h1>
          <p className="text-white/50 text-sm mt-1">
            Genera reportes en CSV, Excel o PDF con los filtros que necesites
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Movimientos</p>
              <p className="text-2xl font-bold text-emerald-400">{filteredTransactions.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Categorías</p>
              <p className="text-2xl font-bold text-blue-400">{expenseBreakdown.length + incomeBreakdown.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Meses de tendencia</p>
              <p className="text-2xl font-bold text-purple-400">{trendData.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Database className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total registros</p>
              <p className="text-2xl font-bold text-amber-400">
                {filteredTransactions.length + products.length + businesses.length + advertisingCampaigns.length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar exportación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Tipo de reporte</label>
                <Select
                  value={exportType}
                  onChange={setExportType}
                  options={[
                    { value: 'transactions', label: 'Movimientos detallados' },
                    { value: 'summary', label: 'Resumen ejecutivo' },
                    { value: 'category', label: 'Por categorías' },
                    { value: 'trend', label: 'Tendencias temporales' },
                    { value: 'roi', label: 'ROI publicidad' },
                    { value: 'stock', label: 'Inventario/Stock' },
                    { value: 'full_report', label: 'Reporte completo (todo)' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Formato</label>
                <Select
                  value={format}
                  onChange={setFormat}
                  options={[
                    { value: 'csv', label: 'CSV (recomendado)' },
                    { value: 'excel', label: 'Excel (requiere librería)' },
                    { value: 'pdf', label: 'PDF (requiere librería)' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Negocio</label>
                <Select
                  value={businessFilter}
                  onChange={setBusinessFilter}
                  options={[
                    { value: 'all', label: 'Todos los negocios' },
                    ...businesses.map(b => ({ value: b.id, label: b.name })),
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white/80 text-sm">Incluir gráficos (solo PDF/Excel)</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleExport} 
                loading={isExporting}
                className="flex-1 sm:flex-none"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                {isExporting ? `Exportando... ${exportProgress}%` : `Exportar ${format.toUpperCase()}`}
              </Button>
              {lastExport && (
                <Badge variant="info">
                  Último: {formatRelativeDate(lastExport)}
                </Badge>
              )}
            </div>

            {isExporting && exportProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Progreso</span>
                  <span className="text-white font-medium">{exportProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Sections */}
        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="preview" className="py-3">Vista previa</TabsTrigger>
            <TabsTrigger value="templates" className="py-3">Plantillas rápidas</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Muestra de datos ({filteredTransactions.length} registros)</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = generateTransactionsCSV();
                  downloadFile(csv, `preview-movimientos-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`, 'text/csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar muestra
                </Button>
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
                        {filteredTransactions.slice(0, 10).map(t => (
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
                            <td className="py-3 pr-4 text-right font-medium" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
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

            {exportType === 'summary' && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen ejecutivo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(() => {
                    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                    return [
                      { label: 'Ingresos', value: income, color: 'text-emerald-400' },
                      { label: 'Egresos', value: expense, color: 'text-red-400' },
                      { label: 'Balance', value: income - expense, color: (income - expense) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    ].map((item, i) => (
                      <Card key={i} className="p-4 bg-white/5 border border-white/10">
                        <p className="text-white/60 text-sm">{item.label}</p>
                        <p className={`text-2xl font-bold ${item.color}`}>{formatValue(item.value)}</p>
                      </Card>
                    ));
                  })()}
                </CardContent>
              </Card>
            )}

            {exportType === 'category' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBarChart data={expenseBreakdown} formatValue={formatValue} height={300} horizontal maxBars={15} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {incomeBreakdown.length > 0 ? (
                      <DoughnutChart
                        data={incomeBreakdown.slice(0, 6)}
                        formatValue={formatValue}
                        height={280}
                        centerLabel={{ label: 'Total ingresos', value: formatValue(incomeBreakdown.reduce((s, c) => s + c.amount, 0)) }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-white/40">No hay ingresos</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {exportType === 'trend' && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolución financiera (12 meses)</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={trendData} formatValue={formatValue} multiLine height={350} />
                </CardContent>
              </Card>
            )}

            {exportType === 'roi' && (
              <Card>
                <CardHeader>
                  <CardTitle>ROI de campañas publicitarias</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const roiMetrics = useStore.getState().calculateROI();
                    return roiMetrics.length > 0 ? (
                      <CategoryBarChart
                        data={roiMetrics.map(r => ({ label: r.campaignName, value: r.roi, color: r.roi >= 0 ? '#22c55e' : '#ef4444' }))}
                        formatValue={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                        height={300}
                        horizontal
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-white/40">No hay datos de ROI</div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {exportType === 'stock' && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventario actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBarChart
                    data={products.filter(p => businessFilter === 'all' || p.businessId === businessFilter)
                      .map(p => ({ 
                        label: p.name, 
                        value: p.stock || 0, 
                        color: p.stock !== undefined && p.minStock !== undefined
                          ? p.stock <= 0 ? '#ef4444' : p.stock <= p.minStock * 0.5 ? '#f97316' : p.stock <= p.minStock ? '#f59e0b' : '#22c55e'
                          : '#6b7280'
                      }))
                      .filter(d => d.value > 0 || true)}
                    formatValue={(v) => `${v} unid.`}
                    height={300}
                    horizontal
                    maxBars={15}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'transactions', label: 'Movimientos', icon: FileText, desc: 'Todos los movimientos con filtros', color: 'bg-emerald-500/10 border-emerald-500/20' },
                { id: 'summary', label: 'Resumen ejecutivo', icon: BarChart3, desc: 'KPIs principales del período', color: 'bg-blue-500/10 border-blue-500/20' },
                { id: 'category', label: 'Por categorías', icon: Filter, desc: 'Desglose gastos/ingresos', color: 'bg-purple-500/10 border-purple-500/20' },
                { id: 'trend', label: 'Tendencias', icon: TrendingUp, desc: 'Evolución 12 meses', color: 'bg-amber-500/10 border-amber-500/20' },
                { id: 'roi', label: 'ROI publicidad', icon: TrendingUp, desc: 'Retorno de inversión', color: 'bg-pink-500/10 border-pink-500/20' },
                { id: 'stock', label: 'Inventario', icon: Database, desc: 'Stock y alertas', color: 'bg-teal-500/10 border-teal-500/20' },
                { id: 'full_report', label: 'Reporte completo', icon: HardDrive, desc: 'Todo en un archivo', color: 'bg-indigo-500/10 border-indigo-500/20' },
              ].map(template => (
                <Card key={template.id} className={`${template.color} p-6 cursor-pointer hover:border-white/30 transition-colors`} onClick={() => { setExportType(template.id as any); setActiveTab('preview'); }}>
                  <div className="flex items-center gap-4 mb-3">
                    <template.icon className="h-8 w-8 text-white/80" />
                    <div>
                      <p className="text-white font-semibold">{template.label}</p>
                      <p className="text-white/50 text-sm">{template.desc}</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => { setExportType(template.id as any); setActiveTab('preview'); }}>
                    Seleccionar
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Export History */}
      {lastExport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="text-emerald-400 font-medium">Última exportación completada</p>
              <p className="text-emerald-400/80 text-sm">
                {formatRelativeDate(lastExport)} • {exportType} • {format.toUpperCase()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString('es-ES');
};

const formatDate = (date: string | Date, fmt: string): string => {
  const d = new Date(date);
  return fmt
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'));
};

const downloadFile = (data: string, filename: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

import { useForm } from 'react-hook-form';
import { useStore } from '../../store';