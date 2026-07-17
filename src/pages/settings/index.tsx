import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Palette, Bell, Download, Upload, Trash2, Shield, Globe, Moon, Sun, Monitor, Database, Save, Loader2, X, Check, AlertTriangle, Target, PiggyBank, Plus, Edit2, Trash2 as TrashIcon } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Switch, Textarea, Badge, Tabs, TabList, TabTrigger, TabContent, IconButton } from '../../components/ui';
import { cn, formatCurrency, formatDate, exportToCSV, downloadFile, parseCSV, ICONS, COLORS, getIconEmoji } from '../../utils/helpers';
import { CategoryForm } from '../../components/forms';

export const SettingsPage = () => {
  const { 
    settings, 
    updateSettings, 
    categories, 
    budgets, 
    goals, 
    transactions,
    addCategory, 
    updateCategory, 
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    exportData,
    importData,
    clearAllData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'budgets' | 'goals' | 'data'>('general');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(URL.createObjectURL(blob), `proxima-backup-${formatDate(new Date(), 'YYYY-MM-DD')}.json`);
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importData(data);
    } catch (error) {
      alert('Error al importar el archivo');
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  const handleCategorySubmit = (data: any) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleBudgetSubmit = (data: any) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, data);
    } else {
      addBudget(data);
    }
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleGoalSubmit = (data: any) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setShowGoalForm(false);
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-white/50 text-sm mt-1">Personaliza tu experiencia</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="general" className="px-4 py-2">General</TabsTrigger>
          <TabsTrigger value="categories" className="px-4 py-2">Categorías</TabsTrigger>
          <TabsTrigger value="budgets" className="px-4 py-2">Presupuestos</TabsTrigger>
          <TabsTrigger value="goals" className="px-4 py-2">Metas</TabsTrigger>
          <TabsTrigger value="data" className="px-4 py-2">Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moneda y formato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    value={settings.currency}
                    onChange={(v) => updateSettings({ currency: v, currencySymbol: v === 'ARS' ? '$' : v === 'USD' ? 'US$' : v })}
                    options={[
                      { value: 'ARS', label: 'Peso Argentino (ARS)' },
                      { value: 'USD', label: 'Dólar Estadounidense (USD)' },
                      { value: 'EUR', label: 'Euro (EUR)' },
                      { value: 'BRL', label: 'Real Brasileño (BRL)' },
                      { value: 'MXN', label: 'Peso Mexicano (MXN)' },
                    ]}
                    label="Moneda"
                  />
                  <Input
                    value={settings.currencySymbol}
                    onChange={(e) => updateSettings({ currencySymbol: e.target.value })}
                    label="Símbolo de moneda"
                    placeholder="$"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    value={settings.currencyPosition}
                    onChange={(v) => updateSettings({ currencyPosition: v })}
                    options={[
                      { value: 'before', label: 'Antes ($ 1.000)' },
                      { value: 'after', label: 'Después (1.000 $)' },
                    ]}
                    label="Posición del símbolo"
                  />
                  <Select
                    value={settings.thousandSeparator}
                    onChange={(v) => updateSettings({ thousandSeparator: v })}
                    options={[
                      { value: '.', label: 'Punto (1.000)' },
                      { value: ',', label: 'Coma (1,000)' },
                      { value: ' ', label: 'Espacio (1 000)' },
                    ]}
                    label="Separador de miles"
                  />
                  <Select
                    value={settings.decimalSeparator}
                    onChange={(v) => updateSettings({ decimalSeparator: v })}
                    options={[
                      { value: ',', label: 'Coma (1.000,00)' },
                      { value: '.', label: 'Punto (1,000.00)' },
                    ]}
                    label="Separador de decimales"
                  />
                </div>
                <Select
                  value={settings.decimalPlaces}
                  onChange={(v) => updateSettings({ decimalPlaces: parseInt(v) })}
                  options={[
                    { value: '0', label: 'Sin decimales' },
                    { value: '2', label: '2 decimales' },
                    { value: '3', label: '3 decimales' },
                  ]}
                  label="Decimales a mostrar"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={settings.theme}
                  onChange={(v) => updateSettings({ theme: v })}
                  options={[
                    { value: 'system', label: 'Sistema' },
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Oscuro' },
                  ]}
                  label="Tema"
                />
                <Select
                  value={settings.language}
                  onChange={(v) => updateSettings({ language: v })}
                  options={[
                    { value: 'es', label: 'Español' },
                    { value: 'en', label: 'English' },
                  ]}
                  label="Idioma"
                />
                <Select
                  value={settings.dateFormat}
                  onChange={(v) => updateSettings({ dateFormat: v })}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                  label="Formato de fecha"
                />
                <Select
                  value={settings.firstDayOfWeek}
                  onChange={(v) => updateSettings({ firstDayOfWeek: parseInt(v) })}
                  options={[
                    { value: '0', label: 'Domingo' },
                    { value: '1', label: 'Lunes' },
                  ]}
                  label="Primer día de la semana"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={settings.budgetAlerts}
                  onChange={(e) => updateSettings({ budgetAlerts: e.target.checked })}
                  label="Alertas de presupuesto"
                  description="Recibir notificaciones al acercarse al límite de gasto"
                />
                <Switch
                  checked={settings.goalAlerts}
                  onChange={(e) => updateSettings({ goalAlerts: e.target.checked })}
                  label="Alertas de metas"
                  description="Recordatorios para cumplir tus metas financieras"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Respaldos automáticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={settings.autoBackup}
                  onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
                  label="Respaldo automático"
                  description="Guardar una copia de seguridad periódicamente"
                />
                {settings.autoBackup && (
                  <Select
                    value={settings.backupFrequency}
                    onChange={(v) => updateSettings({ backupFrequency: v })}
                    options={[
                      { value: 'daily', label: 'Diario' },
                      { value: 'weekly', label: 'Semanal' },
                      { value: 'monthly', label: 'Mensual' },
                    ]}
                    label="Frecuencia"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Gestionar categorías</h2>
              <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva categoría
              </Button>
            </div>

            <div className="space-y-4">
              {categories.map(cat => (
                <Card key={cat.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                      {getIconEmoji(cat.icon)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{cat.name}</p>
                      <p className="text-white/50 text-sm capitalize">{cat.type === 'income' ? 'Ingreso' : 'Egreso'}</p>
                    </div>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <Badge variant="info">{cat.subcategories.length} subcategorías</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} aria-label="Editar">
                      <Edit2 className="h-4 w-4" />
                    </IconButton>
                    <IconButton variant="danger" onClick={() => deleteCategory(cat.id)} aria-label="Eliminar">
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="budgets">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Presupuestos mensuales</h2>
              <Button onClick={() => { setEditingBudget(null); setShowBudgetForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo presupuesto
              </Button>
            </div>

            {budgets.length === 0 ? (
              <Card className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay presupuestos configurados</h3>
                <p className="text-white/50 mb-4">Crea un presupuesto para controlar tus gastos por categoría</p>
                <Button onClick={() => { setEditingBudget(null); setShowBudgetForm(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer presupuesto
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {budgets.map(budget => {
                  const cat = categories.find(c => c.id === budget.categoryId);
                  return (
                    <Card key={budget.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat?.color + '20', color: cat?.color }}>
                            <span className="text-xl">{cat ? getIconEmoji(cat.icon) : '📦'}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{cat?.name || budget.categoryId}</p>
                            <p className="text-white/50 text-sm">{formatCurrency(budget.amount, { currency: settings.currency, symbol: settings.currencySymbol })} / mes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton onClick={() => { setEditingBudget(budget); setShowBudgetForm(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </IconButton>
                          <IconButton variant="danger" onClick={() => deleteBudget(budget.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: '60%' }} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="goals">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Metas financieras</h2>
              <Button onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva meta
              </Button>
            </div>

            {goals.length === 0 ? (
              <Card className="py-12 text-center">
                <PiggyBank className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay metas configuradas</h3>
                <p className="text-white/50 mb-4">Define una meta de ahorro para mantenerte motivado</p>
                <Button onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera meta
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-xl">{getIconEmoji(goal.icon)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{goal.name}</p>
                          <p className="text-white/50 text-sm">Meta: {formatCurrency(goal.targetAmount, { currency: settings.currency, symbol: settings.currencySymbol })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconButton onClick={() => { setEditingGoal(goal); setShowGoalForm(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="danger" onClick={() => deleteGoal(goal.id)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }} />
                    </div>
                    <p className="text-white/50 text-sm mt-2">
                      {(goal.currentAmount / goal.targetAmount * 100).toFixed(1)}% completado
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="data">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">Descarga una copia de seguridad completa de todos tus datos.</p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar JSON (completo)
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const data = transactions.map(t => ({
                      Fecha: formatDate(t.date, 'DD/MM/YYYY'),
                      Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
                      Categoría: categories.find(c => c.id === t.category)?.name || t.category,
                      Subcategoría: t.subcategory || '',
                      Descripción: t.description || '',
                      Monto: t.amount,
                    }));
                    exportToCSV(data, `movimientos-${formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV (solo movimientos)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Importar datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">Restaura tus datos desde un archivo de respaldo JSON.</p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && setImportFile(e.target.files[0])}
                  label="Archivo de respaldo (.json)"
                />
                {importFile && (
                  <Button onClick={() => handleImport(importFile)} loading={isImporting} variant="primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar respaldo
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  Zona de peligro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">Esta acción eliminará TODOS tus datos permanentemente.</p>
                {confirmDelete ? (
                  <div className="flex gap-3">
                    <Button variant="danger" onClick={() => { clearAllData(); setConfirmDelete(false); }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Confirmar eliminación total
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar todos los datos
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {showCategoryForm && (
        <CategoryForm
          initialData={editingCategory}
          onSuccess={() => { setShowCategoryForm(false); setEditingCategory(null); }}
          onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
        />
      )}

      {showBudgetForm && (
        <BudgetForm
          initialData={editingBudget}
          categories={categories}
          settings={settings}
          onSuccess={() => { setShowBudgetForm(false); setEditingBudget(null); }}
          onCancel={() => { setShowBudgetForm(false); setEditingBudget(null); }}
        />
      )}

      {showGoalForm && (
        <GoalForm
          initialData={editingGoal}
          settings={settings}
          onSuccess={() => { setShowGoalForm(false); setEditingGoal(null); }}
          onCancel={() => { setShowGoalForm(false); setEditingGoal(null); }}
        />
      )}
    </div>
  );
};

const BudgetForm = ({ initialData, categories, settings, onSuccess, onCancel }: any) => {
  const expenseCategories = categories.filter(c => c.type === 'expense');
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
          <h2 className="text-lg font-semibold text-white">{initialData ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>
        <div className="p-4 space-y-4">
          <Select
            label="Categoría"
            options={expenseCategories.map(c => ({ value: c.id, label: c.name }))}
            defaultValue={initialData?.categoryId || ''}
          />
          <Input
            label="Monto mensual"
            type="number"
            step="0.01"
            placeholder="0,00"
            defaultValue={initialData?.amount || ''}
          />
          <Input
            label="Umbral de alerta (%)"
            type="number"
            min="1"
            max="100"
            defaultValue={initialData?.alertThreshold || '80'}
          />
          <Select
            label="Período"
            options={[
              { value: 'monthly', label: 'Mensual' },
              { value: 'weekly', label: 'Semanal' },
              { value: 'yearly', label: 'Anual' },
            ]}
            defaultValue={initialData?.period || 'monthly'}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
            <Button onClick={() => onSuccess()} className="flex-1">
              <Save className="h-4 w-4" /> {initialData ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GoalForm = ({ initialData, settings, onSuccess, onCancel }: any) => (
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
        <h2 className="text-lg font-semibold text-white">{initialData ? 'Editar meta' : 'Nueva meta'}</h2>
        <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
      </div>
      <div className="p-4 space-y-4">
        <Input label="Nombre" placeholder="Ej: Fondo de emergencia, Vacaciones..." defaultValue={initialData?.name || ''} />
        <Input label="Monto objetivo" type="number" step="0.01" placeholder="0,00" defaultValue={initialData?.targetAmount || ''} />
        <Input label="Monto actual" type="number" step="0.01" placeholder="0,00" defaultValue={initialData?.currentAmount || '0'} />
        <Input label="Fecha objetivo" type="date" defaultValue={initialData?.targetDate || ''} />
        <Select
          label="Icono"
          options={ICONS.map(i => ({ value: i, label: getIconEmoji(i) + ' ' + i }))}
          defaultValue={initialData?.icon || 'target'}
        />
        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button onClick={() => onSuccess()} className="flex-1">
            <Save className="h-4 w-4" /> {initialData ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const formatDate = (date: string | Date, format: string): string => {
  const d = new Date(date);
  return format.replace('DD', String(d.getDate()).padStart(2, '0'))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('YYYY', String(d.getFullYear()));
};

const formatCurrency = (amount: number, options: { currency: string; symbol: string }): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: 2,
  }).format(amount);
};