import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, XCircle, Plus, Edit2, Trash2, Filter, ChevronDown, ChevronUp, Download, Upload, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, IconButton, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { cn, formatCurrency, formatDate, exportToCSV } from '../../utils/helpers';

export const StockPage = () => {
  const { 
    products, 
    businesses, 
    transactions,
    settings,
    checkStockAlerts,
    acknowledgeStockAlert,
    dismissStockAlert,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'alerts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'ok' | 'low' | 'critical' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'minStock' | 'value'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Run stock check on mount
  useEffect(() => {
    checkStockAlerts();
  }, []);

  const alerts = useStore.getState().stockAlerts;
  
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (businesses.find(b => b.id === p.businessId)?.name || '').toLowerCase().includes(query)
      );
    }

    if (stockFilter !== 'all') {
      result = result.filter(p => {
        if (p.stock === undefined || p.minStock === undefined) return stockFilter === 'ok';
        if (p.stock <= 0) return stockFilter === 'out';
        if (p.stock <= p.minStock * 0.5) return stockFilter === 'critical';
        if (p.stock <= p.minStock) return stockFilter === 'low';
        return stockFilter === 'ok';
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'minStock':
          comparison = (a.minStock || 0) - (b.minStock || 0);
          break;
        case 'value':
          comparison = ((a.stock || 0) * a.price) - ((b.stock || 0) * b.price);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, searchQuery, stockFilter, sortBy, sortOrder]);

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock !== undefined && p.minStock !== undefined && p.stock > 0 && p.stock <= p.minStock && p.stock > p.minStock * 0.5).length;
  const criticalStockCount = products.filter(p => p.stock !== undefined && p.minStock !== undefined && p.stock > 0 && p.stock <= p.minStock * 0.5).length;
  const outOfStockCount = products.filter(p => p.stock !== undefined && p.stock <= 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + ((p.stock || 0) * p.price), 0);

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const getStockStatus = (product: any) => {
    if (product.stock === undefined || product.minStock === undefined) return { label: 'Sin datos', variant: 'default' as const };
    if (product.stock <= 0) return { label: 'Agotado', variant: 'danger' as const };
    if (product.stock <= product.minStock * 0.5) return { label: 'Crítico', variant: 'danger' as const };
    if (product.stock <= product.minStock) return { label: 'Bajo', variant: 'warning' as const };
    return { label: 'OK', variant: 'success' as const };
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Control de Stock</h1>
          <p className="text-white/50 text-sm mt-1">
            Gestiona inventario, alertas de stock y valoración
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAddProduct} disabled={businesses.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
          <Button variant="outline" onClick={() => exportToCSV('stock')}>
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
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total productos</p>
              <p className="text-2xl font-bold text-white">{totalProducts}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Stock OK</p>
              <p className="text-2xl font-bold text-emerald-400">
                {totalProducts - lowStockCount - criticalStockCount - outOfStockCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
                <div>
                  <p className="text-white/60 text-sm">Bajo</p>
                  <p className="text-2xl font-bold text-amber-400">{lowStockCount}</p>
                </div>
          </div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Crítico</p>
              <p className="text-2xl font-bold text-red-400">{criticalStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gray-500/10 border-gray-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Agotado</p>
              <p className="text-2xl font-bold text-gray-400">{outOfStockCount}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-amber-400 font-medium">{alerts.length} alerta{alerts.length !== 1 ? 's' : ''} de stock activ{alerts.length !== 1 ? 'as' : 'a'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('alerts')}>
              Ver alertas
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="py-3">
            <Package className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="products" className="py-3">
            <Filter className="h-4 w-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="alerts" className="py-3">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Valoración del inventario por negocio</CardTitle>
              </CardHeader>
              <CardContent>
                {businesses.map(business => {
                  const bizProducts = products.filter(p => p.businessId === business.id);
                  const stockValue = bizProducts.reduce((sum, p) => sum + ((p.stock || 0) * p.price), 0);
                  const totalUnits = bizProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
                  
                  return (
                    <div key={business.id} className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: business.color + '20', color: business.color }}>
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{business.name}</p>
                            <p className="text-white/50 text-sm">{bizProducts.length} productos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/60 text-sm">Valor stock</p>
                          <p className="text-white font-bold">{formatValue(stockValue)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/60">Unidades</p>
                          <p className="text-white font-semibold">{totalUnits}</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/60">Productos</p>
                          <p className="text-white font-semibold">{bizProducts.length}</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          <p className="text-white/60">Promedio/unid</p>
                          <p className="text-white font-semibold">{totalUnits > 0 ? formatValue(stockValue / totalUnits) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 productos por valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products
                    .filter(p => p.stock !== undefined && p.stock > 0)
                    .sort((a, b) => ((b.stock || 0) * b.price) - ((a.stock || 0) * a.price))
                    .slice(0, 5)
                    .map((product, index) => {
                      const business = businesses.find(b => b.id === product.businessId);
                      const value = (product.stock || 0) * product.price;
                      const status = getStockStatus(product);
                      return (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{product.name}</p>
                            <p className="text-white/50 text-xs truncate">{business?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">{formatValue(value)}</p>
                            <Badge variant={status.variant} className="mt-1">{status.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="products">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="search"
                    placeholder="Buscar producto, negocio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <Select
                  value={stockFilter}
                  onChange={setStockFilter}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'ok', label: 'OK' },
                    { value: 'low', label: 'Bajo' },
                    { value: 'critical', label: 'Crítico' },
                    { value: 'out', label: 'Agotado' },
                  ]}
                />
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'stock', label: 'Stock' },
                    { value: 'name', label: 'Nombre' },
                    { value: 'minStock', label: 'Stock mín.' },
                    { value: 'value', label: 'Valor stock' },
                  ]}
                />
                <IconButton
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  aria-label={sortOrder === 'asc' ? 'Descendente' : 'Ascendente'}
                >
                  {sortOrder === 'asc' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </IconButton>
                <Button variant="outline" onClick={() => exportToCSV('stock')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </Card>

            {/* Products Table */}
            <Card>
              <CardContent className="p-0">
                {filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left p-4 text-white/50 text-sm font-medium">Producto</th>
                          <th className="text-left p-4 text-white/50 text-sm font-medium">Negocio</th>
                          <th className="text-right p-4 text-white/50 text-sm font-medium">Stock</th>
                          <th className="text-right p-4 text-white/50 text-sm font-medium">Mínimo</th>
                          <th className="text-right p-4 text-white/50 text-sm font-medium">Valor</th>
                          <th className="text-center p-4 text-white/50 text-sm font-medium">Estado</th>
                          <th className="text-right p-4 text-white/50 text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => {
                          const business = businesses.find(b => b.id === product.businessId);
                          const value = (product.stock || 0) * product.price;
                          const status = getStockStatus(product);
                          return (
                            <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p className="text-white font-medium">{product.name}</p>
                                    <p className="text-white/50 text-xs">{product.unit}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-white/80">{business?.name || 'Sin negocio'}</p>
                              </td>
                              <td className="p-4 text-right font-mono text-white">{product.stock !== undefined ? product.stock : 'N/A'}</td>
                              <td className="p-4 text-right text-white/60">{product.minStock !== undefined ? product.minStock : 'N/A'}</td>
                              <td className="p-4 text-right font-semibold text-white">{formatValue(value)}</td>
                              <td className="p-4 text-center">
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <IconButton onClick={() => handleEditProduct(product)} aria-label="Editar">
                                    <Edit2 className="h-4 w-4" />
                                  </IconButton>
                                  <IconButton variant="danger" onClick={() => {}} aria-label="Eliminar">
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg mb-2">No hay productos</p>
                    <Button onClick={handleAddProduct} disabled={businesses.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primer producto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="alerts">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <Card key={alert.id} className={cn('p-4', alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : alert.severity === 'low' ? 'border-amber-500/30 bg-amber-500/5' : '')}>
                    <div className="flex items-start gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', 
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'low' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      )}>
                        {alert.severity === 'critical' ? <AlertTriangle className="h-5 w-5" /> : 
                         alert.severity === 'low' ? <AlertTriangle className="h-5 w-5" /> :
                         <XCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-white font-medium">{alert.productName}</p>
                          <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'low' ? 'warning' : 'default'}>
                            {alert.severity === 'out_of_stock' ? 'Agotado' : alert.severity === 'critical' ? 'Crítico' : 'Bajo'}
                          </Badge>
                          {alert.acknowledged && <Badge variant="info">Revisado</Badge>}
                        </div>
                        <p className="text-white/70 text-sm">
                          Stock actual: <span className="font-semibold text-white">{alert.currentStock}</span> / Mínimo: <span className="font-semibold text-white">{alert.minStock}</span>
                        </p>
                        <p className="text-white/50 text-xs mt-1">{businesses.find(b => b.id === alert.businessId)?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.acknowledged && (
                          <Button variant="ghost" size="sm" onClick={() => acknowledgeStockAlert(alert.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar revisado
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => dismissStockAlert(alert.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Descartar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay alertas de stock</h3>
                <p className="text-white/50 mb-4">Todos los productos tienen stock suficiente</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {showProductForm && (
        <ProductForm
          initialData={editingProduct}
          businesses={businesses}
          onSuccess={handleCloseForm}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

const ProductForm = ({ 
  initialData, 
  businesses, 
  onSuccess, 
  onCancel 
}: { 
  initialData?: any; 
  businesses: any[];
  onSuccess: () => void; 
  onCancel: () => void;
}) => {
  const { products, addProduct, updateProduct } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#22c55e');
  const [selectedIcon, setSelectedIcon] = useState('shopping-bag');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      price: '',
      cost: '',
      stock: 0,
      minStock: 5,
      unit: 'unidad',
      businessId: businesses[0]?.id || '',
      color: '#22c55e',
      icon: 'shopping-bag',
      ...initialData,
    },
  });

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  ];

  const ICONS = [
    'shopping-bag', 'package', 'box', 'truck', 'coffee', 'pizza',
    'shirt', 'smartphone', 'laptop', 'book', 'pill', 'dumbbell',
    'gift', 'credit-card', 'banknote', 'coins', 'piggy-bank', 'receipt',
  ];

  const price = parseFloat(watch('price')) || 0;
  const cost = parseFloat(watch('cost')) || 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock) || 0,
        minStock: parseInt(data.minStock) || 5,
        icon: selectedIcon,
        color: selectedColor,
      };
      if (initialData?.id) {
        updateProduct(initialData.id, productData);
      } else {
        addProduct(productData);
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
            {initialData?.id ? 'Editar producto/servicio' : 'Nuevo producto/servicio'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre"
            placeholder="Ej: Hamburguesa clásica, Corte de pelo..."
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('price', { required: 'El precio es requerido', min: { value: 0.01, message: 'Debe ser mayor a 0' } })}
              label="Precio de venta"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              error={errors.price?.message}
            />
            <Input
              {...register('cost', { required: 'El costo es requerido', min: { value: 0, message: 'No puede ser negativo' } })}
              label="Costo unitario"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              error={errors.cost?.message}
            />
          </div>

          {initialData && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-white/60 text-sm">Margen estimado</p>
              <p className="text-2xl font-bold text-emerald-400">{margin.toFixed(1)}%</p>
              <p className="text-white/50 text-xs">Ganancia por unidad: ${margin > 0 ? (price - cost).toFixed(2) : '0.00'}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('stock')}
              label="Stock inicial"
              type="number"
              min="0"
              placeholder="0"
            />
            <Input
              {...register('minStock')}
              label="Stock mínimo (alerta)"
              type="number"
              min="0"
              placeholder="5"
            />
          </div>

          <Input
            {...register('unit')}
            label="Unidad"
            placeholder="unidad, kg, hora, servicio..."
          />

          <Select
            {...register('businessId', { required: 'Selecciona un negocio' })}
            label="Negocio"
            options={businesses.map(b => ({ value: b.id, label: b.name }))}
            error={errors.businessId?.message}
          />

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-10 h-10 rounded-xl border-2 transition-all',
                    selectedColor === color
                      ? 'border-white scale-110 shadow-lg shadow-emerald-500/30'
                      : 'border-white/10 hover:border-white/30'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                  aria-pressed={selectedColor === color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">Icono</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                    selectedIcon === icon
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  )}
                  aria-label={icon}
                  aria-pressed={selectedIcon === icon}
                >
                  <span className="text-xl">{getIconEmoji(icon)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const getIconEmoji = (name: string): string => {
  const icons: Record<string, string> = {
    'briefcase': '💼', 'trending-up': '📈', 'plus-circle': '➕',
    'home': '🏠', 'utensils': '🍽️', 'car': '🚗',
    'heart-pulse': '💊', 'film': '🎬', 'shopping-bag': '🛍️',
    'graduation-cap': '🎓', 'more-horizontal': '⋯', 'gift': '🎁',
    'credit-card': '💳', 'wallet': '👛', 'banknote': '💵',
    'coins': '🪙', 'piggy-bank': '🐷', 'receipt': '🧾',
    'file-text': '📄', 'calendar': '📅', 'clock': '🕐',
    'map-pin': '📍', 'phone': '📱', 'building': '🏢',
    'store': '🏪', 'factory': '🏭', 'coffee': '☕', 'pizza': '🍕',
    'shirt': '👕', 'scissors': '✂️', 'wrench': '🔧', 'paintbrush': '🎨',
    'camera': '📷', 'music': '🎵', 'truck': '🚚', 'plane': '✈️',
    'ship': '🚢', 'gem': '💎', 'crown': '👑', 'package': '📦',
  };
  return icons[name] || '📦';
};

import { useForm } from 'react-hook-form';
import { X, Save, Package, CheckCircle, XCircle, AlertTriangle, AlertCircle, Plus, Minus, Download, Upload, Filter, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';