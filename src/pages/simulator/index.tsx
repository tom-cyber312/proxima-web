import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, Target, BarChart3, TrendingUp, Plus, Edit2, Trash2, Eye, Minus, ChevronDown, ChevronUp, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../../store';
import { 
  BarChart, LineChart, ComparisonBarChart 
} from '../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Tabs, TabList, TabTrigger, TabContent, IconButton } from '../../components/ui';
import { cn, formatCurrency, getDateRange, formatDate } from '../../utils/helpers';

export const SimulatorPage = () => {
  const { 
    businesses, 
    products, 
    transactions, 
    settings,
    addSimulatorScenario,
    updateSimulatorScenario,
    deleteSimulatorScenario,
    getSimulatorScenarios,
    runSimulation,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'create' | 'scenarios' | 'results'>('create');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const scenarios = getSimulatorScenarios(selectedBusiness);

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const getCurrentBaseline = () => {
    if (!selectedBusiness) return null;
    
    const business = businesses.find(b => b.id === selectedBusiness);
    const businessProducts = products.filter(p => p.businessId === selectedBusiness);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const currentMonthTxs = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
    
    const currentRevenue = currentMonthTxs
      .filter(t => t.type === 'income' && businessProducts.some(p => p.id === t.category))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpense = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (business) {
      // Add fixed costs
    }

    return {
      revenue: currentRevenue,
      expense: currentExpense,
      profit: currentRevenue - currentExpense,
      margin: currentRevenue > 0 ? ((currentRevenue - currentExpense) / currentRevenue) * 100 : 0,
      business,
    };
  };

  const baseline = getCurrentBaseline();

  const handleRunSimulation = (scenario: any) => {
    const result = runSimulation(scenario);
    setSimulationResult({ ...result, scenarioName: scenario.name });
    setActiveTab('results');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Simulador de Escenarios</h1>
          <p className="text-white/50 text-sm mt-1">
            Prueba escenarios "what-if" para tomar decisiones de inversión informadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedBusiness}
            onChange={setSelectedBusiness}
            options={[
              { value: '', label: 'Selecciona un negocio' },
              ...businesses.map(b => ({ value: b.id, label: b.name })),
            ]}
            className="w-56"
          />
          <Button onClick={() => { setEditingScenario(null); setShowScenarioForm(true); }} disabled={!selectedBusiness}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo escenario
          </Button>
        </div>
      </motion.div>

      {baseline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Ingresos actuales</p>
                <p className="text-2xl font-bold text-emerald-400">{formatValue(baseline.revenue)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-400 rotate-180" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Egresos actuales</p>
                <p className="text-2xl font-bold text-red-400">{formatValue(baseline.expense)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Ganancia neta</p>
                <p className="text-2xl font-bold" style={{ color: baseline.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                  {baseline.profit >= 0 ? '+' : ''}{formatValue(baseline.profit)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Margen actual</p>
                <p className="text-2xl font-bold text-purple-400">{baseline.margin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="create" className="py-3" disabled={!selectedBusiness}>
            <Calculator className="h-4 w-4 mr-2" />
            Crear escenario
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="py-3">
            <BarChart3 className="h-4 w-4 mr-2" />
            Mis escenarios
          </TabsTrigger>
          <TabsTrigger value="results" className="py-3" disabled={!simulationResult}>
            <Zap className="h-4 w-4 mr-2" />
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          {!selectedBusiness ? (
            <Card className="py-12 text-center">
              <Calculator className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Selecciona un negocio</h3>
              <p className="text-white/50 mb-4">Elige un negocio en el selector superior para crear escenarios</p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Configurar escenario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Nombre del escenario</label>
                    <Input
                      placeholder="Ej: Subida de precios 10%, Black Friday, Recorte de costos..."
                      onChange={(e) => {}}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Zap className="h-4 w-4 inline mr-1 text-yellow-400" />
                        Cambio de precios (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 10 (subida) o -5 (bajada)"
                        onChange={(e) => {}}
                      />
                      <p className="text-white/50 text-xs mt-1">Afecta ingresos directamente</p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Target className="h-4 w-4 inline mr-1 text-blue-400" />
                        Cambio inversión publicitaria (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 50 (aumentar) o -30 (reducir)"
                        onChange={(e) => {}}
                      />
                      <p className="text-white/50 text-xs mt-1">Afecta gasto en marketing</p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Minus className="h-4 w-4 inline mr-1 text-red-400" />
                        Reducción de costos (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ej: 15"
                        onChange={(e) => {}}
                      />
                      <p className="text-white/50 text-xs mt-1">Afecta costos variables (COGS)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-400 text-sm font-medium mb-2">Cómo funciona:</p>
                    <ul className="text-emerald-400/80 text-sm space-y-1">
                      <li>• <strong>Precio +10%</strong>: Ingresos aumentan ~10% (asumiendo demanda inelástica)</li>
                      <li>• <strong>Publicidad +50%</strong>: Gasto marketing aumenta, potenciales más ventas</li>
                      <li>• <strong>Costos -15%</strong>: Mejora margen directo en cada venta</li>
                      <li>• <strong>Costos fijos</strong>: Se mantienen igual (alquiler, sueldos, etc.)</li>
                    </ul>
                  </div>

                  <Button onClick={() => setShowScenarioForm(true)} className="w-full" size="lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Ejecutar simulación
                  </Button>
                </CardContent>
              </Card>

              {baseline && (
                <Card>
                  <CardHeader>
                    <CardTitle>Situación actual (baseline)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-white/60 text-sm">Ingresos mes actual</p>
                        <p className="text-xl font-bold text-emerald-400">{formatValue(baseline.revenue)}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-white/60 text-sm">Egresos mes actual</p>
                        <p className="text-xl font-bold text-red-400">{formatValue(baseline.expense)}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-white/60 text-sm">Ganancia neta</p>
                        <p className="text-xl font-bold" style={{ color: baseline.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                          {baseline.profit >= 0 ? '+' : ''}{formatValue(baseline.profit)}
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-white/60 text-sm">Margen neto</p>
                        <p className="text-xl font-bold text-purple-400">{baseline.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="scenarios">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {scenarios.length > 0 ? (
              scenarios.map((scenario) => (
                <Card key={scenario.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{scenario.name}</p>
                        <p className="text-white/50 text-sm">
                          {scenario.type === 'price_change' && 'Cambio de precios'}
                          {scenario.type === 'ad_investment' && 'Inversión publicitaria'}
                          {scenario.type === 'cost_reduction' && 'Reducción de costos'}
                          {scenario.type === 'custom' && 'Personalizado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleRunSimulation(scenario)}>
                        <Zap className="h-4 w-4 mr-1" />
                        Simular
                      </Button>
                      <IconButton onClick={() => { setEditingScenario(scenario); setShowScenarioForm(true); }} aria-label="Editar">
                        <Edit2 className="h-4 w-4" />
                      </IconButton>
                      <IconButton variant="danger" onClick={() => deleteSimulatorScenario(scenario.id)} aria-label="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-white/60">Cambio precios</p>
                      <p className="text-white font-semibold">{scenario.parameters.priceChangePercent >= 0 ? '+' : ''}{scenario.parameters.priceChangePercent}%</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-white/60">Cambio publicidad</p>
                      <p className="text-white font-semibold">{scenario.parameters.adInvestmentChange >= 0 ? '+' : ''}{scenario.parameters.adInvestmentChange}%</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-white/60">Reducción costos</p>
                      <p className="text-white font-semibold">{scenario.parameters.costReductionPercent}%</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="py-12 text-center">
                <Zap className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay escenarios guardados</h3>
                <p className="text-white/50 mb-4">Crea tu primer escenario en la pestaña "Crear escenario"</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="results">
          {simulationResult && baseline ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Resultado: {simulationResult.scenarioName}</CardTitle>
                  <Badge variant="info">Proyección</Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-white/60 text-sm">Ingresos proyectados</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatValue(simulationResult.revenue)}</p>
                    <p className={`text-sm font-medium ${simulationResult.revenue >= baseline.revenue ? 'text-emerald-400' : 'text-red-400'}`}>
                      {simulationResult.revenue >= baseline.revenue ? '+' : ''}{((simulationResult.revenue - baseline.revenue) / baseline.revenue * 100).toFixed(1)}% vs actual
                    </p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-white/60 text-sm">Egresos proyectados</p>
                    <p className="text-2xl font-bold text-red-400">{formatValue(simulationResult.expense)}</p>
                    <p className={`text-sm font-medium ${simulationResult.expense <= baseline.expense ? 'text-emerald-400' : 'text-red-400'}`}>
                      {simulationResult.expense <= baseline.expense ? '-' : '+'}{((simulationResult.expense - baseline.expense) / baseline.expense * 100).toFixed(1)}% vs actual
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-white/60 text-sm">Ganancia neta proyectada</p>
                    <p className="text-2xl font-bold" style={{ color: simulationResult.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                      {simulationResult.profit >= 0 ? '+' : ''}{formatValue(simulationResult.profit)}
                    </p>
                    <p className={`text-sm font-medium ${simulationResult.profit >= baseline.profit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {simulationResult.profit >= baseline.profit ? '+' : ''}{((simulationResult.profit - baseline.profit) / Math.abs(baseline.profit || 1) * 100).toFixed(1)}% vs actual
                    </p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-white/60 text-sm">Margen neto proyectado</p>
                    <p className="text-2xl font-bold text-purple-400">{simulationResult.margin.toFixed(1)}%</p>
                    <p className={`text-sm font-medium ${simulationResult.margin >= baseline.margin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {simulationResult.margin >= baseline.margin ? '+' : ''}{(simulationResult.margin - baseline.margin).toFixed(1)}pp vs actual
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparativa visual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonBarChart
                    data={[
                      { label: 'Ingresos', current: simulationResult.revenue, previous: baseline.revenue, color: '#22c55e' },
                      { label: 'Egresos', current: simulationResult.expense, previous: baseline.expense, color: '#ef4444' },
                      { label: 'Ganancia', current: simulationResult.profit, previous: baseline.profit, color: '#3b82f6' },
                    ]}
                    formatValue={formatValue}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desglose de cambios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white/60 text-sm">Impacto en ingresos</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {simulationResult.revenue >= baseline.revenue ? '+' : ''}{formatValue(simulationResult.revenue - baseline.revenue)}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white/60 text-sm">Impacto en egresos</p>
                      <p className="text-2xl font-bold" style={{ color: simulationResult.expense <= baseline.expense ? '#22c55e' : '#ef4444' }}>
                        {simulationResult.expense <= baseline.expense ? '-' : '+'}{formatValue(Math.abs(simulationResult.expense - baseline.expense))}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white/60 text-sm">Impacto en ganancia</p>
                      <p className="text-2xl font-bold" style={{ color: simulationResult.profit >= baseline.profit ? '#22c55e' : '#ef4444' }}>
                        {simulationResult.profit >= baseline.profit ? '+' : ''}{formatValue(simulationResult.profit - baseline.profit)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-400 font-medium mb-2">
                      {simulationResult.profit > baseline.profit 
                        ? '✅ Este escenario mejora la rentabilidad' 
                        : simulationResult.profit === baseline.profit
                        ? '⚖️ Este escenario mantiene la rentabilidad actual'
                        : '❌ Este escenario reduce la rentabilidad'}
                    </p>
                    <p className="text-emerald-400/80 text-sm">
                      {simulationResult.profit > baseline.profit 
                        ? `Se proyecta una mejora de ${formatValue(simulationResult.profit - baseline.profit)} en ganancia neta (${((simulationResult.profit - baseline.profit) / Math.abs(baseline.profit || 1) * 100).toFixed(1)}%). Vale la pena considerar la implementación.`
                        : simulationResult.profit === baseline.profit
                        ? 'No hay cambios significativos en la rentabilidad. Considera ajustar los parámetros para ver mayor impacto.'
                        : `Se proyecta una caída de ${formatValue(baseline.profit - simulationResult.profit)} en ganancia neta. Revisa los parámetros antes de implementar.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="py-12 text-center">
              <Zap className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No hay resultados de simulación</h3>
              <p className="text-white/50 mb-4">Ejecuta una simulación desde la pestaña "Mis escenarios" o crea uno nuevo</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {showScenarioForm && (
        <ScenarioForm
          initialData={editingScenario}
          businesses={businesses}
          selectedBusiness={selectedBusiness}
          onSuccess={() => { setShowScenarioForm(false); setEditingScenario(null); }}
          onCancel={() => { setShowScenarioForm(false); setEditingScenario(null); }}
        />
      )}
    </div>
  );
};

const ScenarioForm = ({ 
  initialData, 
  businesses, 
  selectedBusiness,
  onSuccess, 
  onCancel 
}: { 
  initialData?: any; 
  businesses: any[];
  selectedBusiness: string;
  onSuccess: () => void; 
  onCancel: () => void;
}) => {
  const { addSimulatorScenario, updateSimulatorScenario } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'custom',
      priceChangePercent: 0,
      adInvestmentChange: 0,
      costReductionPercent: 0,
      ...initialData,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const scenarioData = {
        ...data,
        businessId: selectedBusiness,
        parameters: {
          priceChangePercent: parseFloat(data.priceChangePercent) || 0,
          adInvestmentChange: parseFloat(data.adInvestmentChange) || 0,
          costReductionPercent: parseFloat(data.costReductionPercent) || 0,
        },
      };
      if (initialData?.id) {
        updateSimulatorScenario(initialData.id, scenarioData);
      } else {
        addSimulatorScenario(scenarioData);
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData?.id ? 'Editar escenario' : 'Nuevo escenario'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre del escenario"
            placeholder="Ej: Subida de precios 10%, Black Friday..."
            error={errors.name?.message}
          />

          <Select
            {...register('type')}
            label="Tipo de escenario"
            options={[
              { value: 'custom', label: 'Personalizado (combinado)' },
              { value: 'price_change', label: 'Cambio de precios' },
              { value: 'ad_investment', label: 'Inversión publicitaria' },
              { value: 'cost_reduction', label: 'Reducción de costos' },
            ]}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              {...register('priceChangePercent')}
              label="Cambio precios (%)"
              type="number"
              step="0.1"
              placeholder="Ej: 10 o -5"
              error={errors.priceChangePercent?.message}
            />
            <Input
              {...register('adInvestmentChange')}
              label="Cambio publicidad (%)"
              type="number"
              step="0.1"
              placeholder="Ej: 50 o -30"
              error={errors.adInvestmentChange?.message}
            />
            <Input
              {...register('costReductionPercent')}
              label="Reducción costos (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Ej: 15"
              error={errors.costReductionPercent?.message}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Crear escenario'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

import { useForm } from 'react-hook-form';
import { X, Save, Zap, Calculator, BarChart3, TrendingUp, Plus, Edit2, Trash2, Target, Minus, Package, Download, Download as DownloadIcon, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';