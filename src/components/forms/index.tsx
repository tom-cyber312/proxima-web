import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate, formatCurrency, getIconEmoji } from '../../utils/helpers';
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, Badge, IconButton, Switch } from '../ui';
import { useStore } from '../../store';
import { X, Calendar, CreditCard, Tag, Save, Loader2, Plus, Trash2, Edit2, ChevronDown, Image, Camera, Upload, Trash } from 'lucide-react';

export const TransactionForm = ({ 
  initialData, 
  onSuccess, 
  onCancel,
  mode = 'create',
}: { 
  initialData?: any; 
  onSuccess?: () => void; 
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}) => {
  const { 
    categories, 
    addTransaction, 
    updateTransaction, 
    transactions,
    settings 
  } = useStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quickAmounts, setQuickAmounts] = useState<number[]>([]);

  useEffect(() => {
    if (initialData?.amount) {
      const amounts = [...new Set(
        transactions
          .filter(t => t.category === initialData.category && t.type === initialData.type)
          .map(t => t.amount)
          .slice(0, 5)
      )];
      setQuickAmounts(amounts);
    }
  }, [initialData, transactions]);

  const typeOptions = [
    { value: 'income', label: 'Ingreso' },
    { value: 'expense', label: 'Egreso' },
  ];

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      subcategory: '',
      description: '',
      date: formatDate(new Date(), 'YYYY-MM-DD'),
      paymentMethod: '',
      recurring: false,
      receiptImage: undefined,
      ...initialData,
    },
  });

  const watchedType = watch('type');
  const watchedCategory = watch('category');
  const availableCategories = watchedType === 'income' ? incomeCategories : expenseCategories;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const transactionData = {
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        subcategory: data.subcategory || undefined,
        description: data.description,
        date: data.date,
        paymentMethod: data.paymentMethod || undefined,
        recurring: data.recurring || false,
        receiptImage: data.receiptImage || undefined,
      };

      if (mode === 'edit' && initialData?.id) {
        updateTransaction(initialData.id, transactionData);
      } else {
        addTransaction(transactionData);
      }
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setValue('amount', amount.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 id="form-title" className="text-lg font-semibold text-white">
            {mode === 'edit' ? 'Editar movimiento' : 'Nuevo movimiento'}
          </h2>
          <IconButton onClick={onCancel} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('type', opt.value)}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium text-sm transition-all',
                  watch('type') === opt.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-white/80 mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg font-medium">
                {settings.currencySymbol}
              </span>
              <input
                {...register('amount', { 
                  required: 'El monto es requerido',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Máximo 2 decimales' },
                })}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                className={cn(
                  'w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'error:border-red-500 error:focus:ring-red-500',
                  errors.amount && 'border-red-500'
                )}
              />
            </div>
            {errors.amount && (
              <p className="mt-1.5 text-sm text-red-400" role="alert">{errors.amount.message}</p>
            )}
            {quickAmounts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                  >
                    {formatCurrency(amt, { symbol: settings.currencySymbol })}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            {...register('category', { required: 'Selecciona una categoría' })}
            label="Categoría"
            error={errors.category?.message}
            options={availableCategories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Selecciona una categoría"
          />

          {watchedCategory && (
            <Select
              {...register('subcategory')}
              label="Subcategoría"
              options={categories.find(c => c.id === watchedCategory)?.subcategories?.map(s => ({ value: s, label: s })) || []}
              placeholder="Opcional: selecciona una subcategoría"
            />
          )}

          <Input
            {...register('description')}
            label="Descripción (opcional)"
            placeholder="Ej: Compra semanal, pago de servicios..."
            maxLength={100}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('date', { required: 'La fecha es requerida' })}
              label="Fecha"
              type="date"
              error={errors.date?.message}
              max={formatDate(new Date(), 'YYYY-MM-DD')}
            />
            <Select
              {...register('paymentMethod')}
              label="Método de pago"
              options={[
                { value: 'cash', label: 'Efectivo' },
                { value: 'card_debit', label: 'Tarjeta débito' },
                { value: 'card_credit', label: 'Tarjeta crédito' },
                { value: 'transfer', label: 'Transferencia' },
                { value: 'qr', label: 'QR / Billetera' },
                { value: 'other', label: 'Otro' },
              ]}
              placeholder="Opcional"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              {...register('recurring')}
              label="Gasto recurrente"
              description="Se repetirá automáticamente cada mes"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-white/80 mb-1.5">Comprobante (opcional)</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setValue('receiptImage', event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="sr-only"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white cursor-pointer transition-all"
              >
                <Camera className="h-5 w-5 mr-2" />
                <span>Subir foto del comprobante</span>
              </label>
            </div>
            {watch('receiptImage') && (
              <div className="mt-2 relative w-full max-w-xs">
                <img src={watch('receiptImage')} alt="Comprobante" className="w-full rounded-lg border border-white/10" />
                <button
                  type="button"
                  onClick={() => setValue('receiptImage', undefined)}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4" />
              {mode === 'edit' ? 'Guardar cambios' : 'Guardar movimiento'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const CategoryForm = ({ 
  initialData, 
  onSuccess, 
  onCancel,
}: { 
  initialData?: any; 
  onSuccess?: () => void; 
  onCancel?: () => void;
}) => {
  const { categories, addCategory, updateCategory } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState('plus-circle');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'plus-circle',
      color: '#3b82f6',
      subcategories: [],
      ...initialData,
    },
  });

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#3b82f6',
    '#60a5fa', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  ];

  const ICONS = [
    'briefcase', 'trending-up', 'plus-circle', 'home', 'utensils', 'car',
    'heart-pulse', 'film', 'shopping-bag', 'graduation-cap', 'more-horizontal',
    'gift', 'credit-card', 'wallet', 'banknote', 'coins', 'piggy-bank',
    'receipt', 'file-text', 'calendar', 'clock', 'map-pin', 'phone',
  ];

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const categoryData = {
        ...data,
        icon: selectedIcon,
        color: selectedColor,
        subcategories: data.subcategories?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      };
      if (initialData?.id) {
        updateCategory(initialData.id, categoryData);
      } else {
        addCategory(categoryData);
      }
      onSuccess?.();
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
        className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData?.id ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('name', { required: 'El nombre es requerido' })}
              label="Nombre"
              placeholder="Ej: Alimentación, Transporte..."
              error={errors.name?.message}
            />
            <Select
              {...register('type', { required: true })}
              label="Tipo"
              options={[
                { value: 'income', label: 'Ingreso' },
                { value: 'expense', label: 'Egreso' },
              ]}
            />
          </div>

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
                      ? 'border-white scale-110 shadow-lg shadow-blue-500/30'
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
            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                    selectedIcon === icon
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
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

          <Textarea
            {...register('subcategories')}
            label="Subcategorías (separadas por coma, opcional)"
            placeholder="Ej: Supermercado, Restaurantes, Delivery, Café"
            rows={3}
          />

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const ProductForm = ({ 
  initialData, 
  business,
  onSuccess, 
  onCancel,
}: { 
  initialData?: any; 
  business?: any;
  onSuccess?: () => void; 
  onCancel?: () => void;
}) => {
  const { products, addProduct, updateProduct } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState('shopping-bag');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      price: '',
      cost: '',
      stock: 0,
      minStock: 5,
      unit: 'unidad',
      businessId: business?.id || '',
      color: '#3b82f6',
      icon: 'shopping-bag',
      ...initialData,
    },
  });

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#3b82f6',
    '#60a5fa', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  ];

  const ICONS = [
    'briefcase', 'trending-up', 'shopping-bag', 'home', 'utensils', 'car',
    'heart-pulse', 'film', 'shopping-bag', 'graduation-cap', 'gift',
    'credit-card', 'wallet', 'banknote', 'coins', 'piggy-bank',
    'receipt', 'scissors', 'wrench', 'paintbrush', 'camera', 'music',
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
      onSuccess?.();
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
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData?.id ? 'Editar producto/servicio' : 'Nuevo producto/servicio'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {business && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-sm font-medium">Negocio: {business.name}</p>
            </div>
          )}

          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre"
            placeholder="Ej: Hamburguesa clásica, Corte de pelo, Consultoría..."
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
              <p className="text-2xl font-bold text-blue-400">{margin.toFixed(1)}%</p>
              <p className="text-white/50 text-xs">Ganancia por unidad: {formatCurrency(initialData.price - initialData.cost, { symbol: '$' })}</p>
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
                      ? 'border-white scale-110 shadow-lg shadow-blue-500/30'
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
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
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
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
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

export const BusinessForm = ({ 
  initialData, 
  onSuccess, 
  onCancel,
}: { 
  initialData?: any; 
  onSuccess?: () => void; 
  onCancel?: () => void;
}) => {
  const { addBusiness, updateBusiness } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState('briefcase');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: '',
      color: '#3b82f6',
      icon: 'briefcase',
      fixedCosts: 0,
      ...initialData,
    },
  });

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#3b82f6',
    '#60a5fa', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  ];

  const ICONS = [
    'briefcase', 'building', 'store', 'factory', 'coffee', 'pizza',
    'shirt', 'scissors', 'wrench', 'paintbrush', 'camera', 'music',
    'truck', 'plane', 'ship', 'gem', 'crown', 'graduation-cap',
  ];

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const businessData = {
        ...data,
        fixedCosts: parseFloat(data.fixedCosts) || 0,
        icon: selectedIcon,
        color: selectedColor,
      };
      if (initialData?.id) {
        updateBusiness(initialData.id, businessData);
      } else {
        addBusiness(businessData);
      }
      onSuccess?.();
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
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData?.id ? 'Editar negocio' : 'Nuevo negocio'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre del negocio"
            placeholder="Ej: Cafetería Central, Taller Mecánico..."
            error={errors.name?.message}
          />

          <Input
            {...register('category')}
            label="Rubro/Categoría"
            placeholder="Ej: Gastronomía, Servicios, Comercio..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('fixedCosts', { required: 'Los costos fijos son requeridos' })}
              label="Costos fijos mensuales"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              error={errors.fixedCosts?.message}
            />
          </div>

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
                      ? 'border-white scale-110 shadow-lg shadow-blue-500/30'
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
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
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
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Crear negocio'}
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

export const QuickTransactionButtons = () => {
  const { transactions, categories, addTransaction, settings } = useStore();
  const [expanded, setExpanded] = useState(false);

  const recentExpenses = transactions
    .filter(t => t.type === 'expense')
    .slice(0, 6);

  const categoryCounts = recentExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([catId]) => categories.find(c => c.id === catId))
    .filter(Boolean);

  if (topCategories.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-white/60 hover:text-white"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-4"
          >
            <div className="flex flex-wrap gap-2">
              {topCategories.map((cat) => (
                <button
                  key={cat!.id}
                  onClick={() => {
                    addTransaction({
                      type: 'expense',
                      amount: 0,
                      category: cat!.id,
                      description: '',
                      date: formatDate(new Date(), 'YYYY-MM-DD'),
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-sm"
                >
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: cat!.color + '20', color: cat!.color }}
                  >
                    {getIconEmoji(cat!.icon)}
                  </span>
                  <span>{cat!.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};