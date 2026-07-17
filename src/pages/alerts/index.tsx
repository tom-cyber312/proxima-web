import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Bell, CheckCircle, XCircle, Filter, ChevronDown, ChevronUp, Eye, Trash2, Download, RefreshCw, MessageSquare } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Badge, IconButton, Tabs, TabList, TabTrigger, TabContent } from '../../components/ui';
import { cn, formatCurrency, formatDate, formatRelativeDate, exportToCSV } from '../../utils/helpers';

export const AlertsPage = () => {
  const { 
    transactions, 
    categories, 
    budgets, 
    goals, 
    settings,
    generateAutomaticAlerts,
    markAlertAsRead,
    dismissAutomaticAlert,
    getUnreadAlerts,
    checkStockAlerts,
    acknowledgeStockAlert,
    dismissStockAlert,
    calculateROI,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'automatic' | 'stock' | 'budget' | 'goal' | 'roi' | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  // Generate alerts on mount
  useEffect(() => {
    generateAutomaticAlerts();
    checkStockAlerts();
    setLastGenerated(new Date().toISOString());
  }, []);

  // Get all alerts from different sources
  const automaticAlerts = useStore.getState().automaticAlerts;
  const stockAlerts = useStore.getState().stockAlerts;
  const budgetStatus = useStore.getState().getBudgetStatus();
  const goalProgress = useStore.getState().getGoalProgress();
  const roiMetrics = useStore.getState().calculateROI();

  // Convert budget status to alerts
  const budgetAlerts = useMemo(() => 
    budgetStatus
      .filter(b => b.isOverBudget || b.alertTriggered)
      .map(b => ({
        id: `budget-${b.budget.id}`,
        type: 'budget_exceeded' as const,
        title: `Presupuesto ${b.isOverBudget ? 'excedido' : 'en alerta'}: ${b.budget.categoryId}`,
        message: `Gastaste ${formatCurrency(b.spent, { currency: settings.currency, symbol: settings.currencySymbol })} de ${formatCurrency(b.budget.amount, { currency: settings.currency, symbol: settings.currencySymbol })} (${b.percentage.toFixed(0)}%)`,
        severity: b.isOverBudget ? 'critical' as const : 'warning' as const,
        relatedEntityId: b.budget.id,
        relatedEntityType: 'budget' as const,
        value: b.spent,
        threshold: b.budget.amount,
        period: 'Mes actual',
        createdAt: new Date().toISOString(),
        read: false,
        dismissed: false,
      }))
  , [budgetStatus, settings]);

  // Convert goal progress to alerts
  const goalAlerts = useMemo(() =>
    goalProgress
      .filter(g => !g.onTrack)
      .map(g => ({
        id: `goal-${g.goal.id}`,
        type: 'goal_off_track' as const,
        title: `Meta en riesgo: ${g.goal.name}`,
        message: `Llevas ${g.progress.toFixed(1)}% y necesitas ${formatCurrency(g.monthlyRequired, { currency: settings.currency, symbol: settings.currencySymbol })}/mes para cumplir`,
        severity: 'warning' as const,
        relatedEntityId: g.goal.id,
        relatedEntityType: 'goal' as const,
        value: g.progress,
        threshold: 100,
        period: 'Hasta ' + formatDate(g.goal.targetDate, 'DD/MM/YYYY'),
        createdAt: new Date().toISOString(),
        read: false,
        dismissed: false,
      }))
  , [goalProgress, settings]);

  // Convert ROI negative to alerts
  const roiAlerts = useMemo(() =>
    roiMetrics
      .filter(r => r.roi < 0)
      .map(r => ({
        id: `roi-${r.campaignId}`,
        type: 'roi_negative' as const,
        title: `ROI negativo: ${r.campaignName}`,
        message: `Perdiste ${formatCurrency(Math.abs(r.invested - r.revenueGenerated), { currency: settings.currency, symbol: settings.currencySymbol })} (ROI: ${r.roi.toFixed(1)}%)`,
        severity: 'critical' as const,
        relatedEntityId: r.campaignId,
        relatedEntityType: 'campaign' as const,
        value: r.roi,
        threshold: 0,
        period: 'Campaña activa',
        createdAt: new Date().toISOString(),
        read: false,
        dismissed: false,
      }))
  , [roiMetrics, settings]);

  // Combine all alerts
  const allAlerts = useMemo(() => {
    const alerts = [
      ...automaticAlerts,
      ...stockAlerts.map(a => ({
        id: a.id,
        type: a.severity === 'out_of_stock' ? 'stock_low' : 'stock_low',
        title: `Stock ${a.severity === 'out_of_stock' ? 'agotado' : a.severity === 'critical' ? 'crítico' : 'bajo'}: ${a.productName}`,
        message: `Stock actual: ${a.currentStock} / Mínimo: ${a.minStock}`,
        severity: a.severity === 'out_of_stock' ? 'critical' : a.severity === 'critical' ? 'critical' : 'warning',
        relatedEntityId: a.productId,
        relatedEntityType: 'product' as const,
        value: a.currentStock,
        threshold: a.minStock,
        period: 'Actual',
        createdAt: a.createdAt,
        read: a.acknowledged,
        dismissed: false,
      })),
      ...budgetAlerts,
      ...goalAlerts,
      ...roiAlerts,
    ];

    // Filter
    let filtered = alerts.filter(a => !a.dismissed);
    if (activeTab !== 'all') {
      filtered = filtered.filter(a => a.type === activeTab);
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }
    if (readFilter !== 'all') {
      filtered = filtered.filter(a => readFilter === 'read' ? a.read : !a.read);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [activeTab, severityFilter, readFilter, sortBy, sortOrder, automaticAlerts, stockAlerts, budgetAlerts, goalAlerts, roiAlerts]);

  const unreadCount = allAlerts.filter(a => !a.read).length;

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const handleRegenerate = () => {
    generateAutomaticAlerts();
    checkStockAlerts();
    setLastGenerated(new Date().toISOString());
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Alertas</h1>
          <p className="text-white/50 text-sm mt-1">
            Monitorea variaciones importantes, stock, presupuestos y metas automáticamente
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRegenerate} disabled={lastGenerated && Date.now() - new Date(lastGenerated).getTime() < 30000}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {lastGenerated && Date.now() - new Date(lastGenerated).getTime() < 30000 
              ? `Esperar ${Math.ceil((30000 - (Date.now() - new Date(lastGenerated).getTime())) / 1000)}s`
              : 'Regenerar alertas'}
          </Button>
          <Button variant="outline" onClick={() => exportToCSV('alerts')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <Card className={unreadCount > 0 ? 'bg-red-500/10 border-red-500/20' : ''}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Bell className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Alertas sin leer</p>
              <p className="text-2xl font-bold" style={{ color: unreadCount > 0 ? '#ef4444' : '#22c55e' }}>{unreadCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Advertencias</p>
              <p className="text-2xl font-bold text-amber-400">
                {allAlerts.filter(a => a.severity === 'warning' && !a.dismissed).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Críticas</p>
              <p className="text-2xl font-bold text-red-400">
                {allAlerts.filter(a => a.severity === 'critical' && !a.dismissed).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Stock bajo</p>
              <p className="text-2xl font-bold text-blue-400">
                {allAlerts.filter(a => a.type === 'stock_low' && !a.dismissed).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Presupuesto</p>
              <p className="text-2xl font-bold text-purple-400">
                {allAlerts.filter(a => a.type === 'budget_exceeded' && !a.dismissed).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Resueltas</p>
              <p className="text-2xl font-bold text-emerald-400">
                {allAlerts.filter(a => a.read && !a.dismissed).length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:col-span-2">
            <TabsList className="grid grid-cols-6 bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="py-2 text-xs">Todas</TabsTrigger>
              <TabsTrigger value="expense_spike" className="py-2 text-xs">Gastos</TabsTrigger>
              <TabsTrigger value="income_drop" className="py-2 text-xs">Ingresos</TabsTrigger>
              <TabsTrigger value="stock_low" className="py-2 text-xs">Stock</TabsTrigger>
              <TabsTrigger value="budget_exceeded" className="py-2 text-xs">Presupuesto</TabsTrigger>
              <TabsTrigger value="goal_off_track" className="py-2 text-xs">Metas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'critical', label: 'Críticas' },
              { value: 'warning', label: 'Advertencias' },
              { value: 'info', label: 'Info' },
            ]}
            className="w-full"
          />
          <Select
            value={readFilter}
            onChange={setReadFilter}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'unread', label: 'No leídas' },
              { value: 'read', label: 'Leídas' },
            ]}
            className="w-full"
          />
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'date', label: 'Fecha' },
                { value: 'severity', label: 'Severidad' },
                { value: 'type', label: 'Tipo' },
              ]}
              className="w-32"
            />
            <IconButton
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? 'Descendente' : 'Ascendente'}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {allAlerts.length > 0 ? (
          allAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onRead={() => markAlertAsRead(alert.id)}
              onDismiss={() => dismissAutomaticAlert(alert.id)}
              onAction={() => handleAlertAction(alert)}
            />
          ))
        ) : (
          <Card className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay alertas</h3>
            <p className="text-white/50 mb-4">
              {activeTab !== 'all' ? `No hay alertas de tipo "${activeTab}"` : 'Todo tranquilo por ahora'}
            </p>
            <Button variant="ghost" onClick={() => setActiveTab('all')}>
              Ver todas las alertas
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

const AlertCard = ({ 
  alert, 
  onRead, 
  onDismiss, 
  onAction 
}: { 
  alert: any; 
  onRead: () => void; 
  onDismiss: () => void;
  onAction: () => void;
}) => {
  const severityColors = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  const severityIcons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  };

  const Icon = severityIcons[alert.severity] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn('p-4 rounded-xl border transition-colors', alert.read ? 'opacity-70' : '', severityColors[alert.severity])}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-white font-medium">{alert.title}</h4>
            <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
              {alert.severity}
            </Badge>
            {!alert.read && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {alert.read && !alert.dismissed && (
              <Badge variant="info">Leída</Badge>
            )}
          </div>
          <p className="text-white/70 text-sm mb-2">{alert.message}</p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>{formatRelativeDate(alert.createdAt)}</span>
            {alert.period && <span>· Período: {alert.period}</span>}
            {alert.relatedEntityType && <span>· {alert.relatedEntityType}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!alert.read && (
            <Button variant="ghost" size="sm" onClick={onRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Marcar leída
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onAction}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Ver detalle
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss} className="text-red-400 hover:text-red-300">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
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

import { useForm } from 'react-hook-form';