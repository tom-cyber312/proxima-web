import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Search, Clock, CheckCircle, AlertTriangle, CreditCard, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, IconButton, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { cn } from '../../utils/helpers';

interface Debt {
  id: string;
  type: 'receivable' | 'payable';
  description: string;
  counterparty: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  notes: string;
  createdAt: string;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

export const DebtsPage = () => {
  const { settings } = useStore();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [form, setForm] = useState({ type: 'receivable' as 'receivable' | 'payable', description: '', counterparty: '', amount: '', dueDate: '', notes: '' });

  const filtered = useMemo(() =>
    debts.filter(d => d.type === activeTab && (
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.counterparty.toLowerCase().includes(search.toLowerCase())
    )), [debts, activeTab, search]);

  const stats = useMemo(() => {
    const byType = debts.filter(d => d.type === activeTab);
    return {
      total: byType.reduce((sum, d) => sum + d.amount, 0),
      pending: byType.filter(d => d.status === 'pending').reduce((sum, d) => sum + (d.amount - d.paidAmount), 0),
      overdue: byType.filter(d => d.status === 'overdue').reduce((sum, d) => sum + (d.amount - d.paidAmount), 0),
      paid: byType.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
    };
  }, [debts, activeTab]);

  const handleSave = () => {
    if (!form.description.trim() || !form.amount) return;
    const amount = parseFloat(form.amount);
    const dueDate = form.dueDate || new Date().toISOString().split('T')[0];
    const isOverdue = new Date(dueDate) < new Date();
    setDebts(prev => [...prev, {
      id: `debt-${Date.now()}`,
      type: form.type,
      description: form.description,
      counterparty: form.counterparty,
      amount,
      paidAmount: 0,
      dueDate,
      status: isOverdue ? 'overdue' : 'pending',
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }]);
    setShowModal(false);
    setForm({ type: activeTab, description: '', counterparty: '', amount: '', dueDate: '', notes: '' });
  };

  const openPayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (!selectedDebt || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    setDebts(prev => prev.map(d => {
      if (d.id !== selectedDebt.id) return d;
      const newPaid = d.paidAmount + amount;
      return { ...d, paidAmount: newPaid, status: newPaid >= d.amount ? 'paid' : d.status };
    }));
    setShowPaymentModal(false);
  };

  const handleDelete = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Deudas</h1>
          <p className="text-white/50 text-sm mt-1">Controla tus deudas por cobrar y por pagar</p>
        </div>
        <Button onClick={() => { setForm(f => ({ ...f, type: activeTab })); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Deuda
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.total)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pendiente</p>
              <p className="text-xl font-bold text-amber-400">{formatCurrency(stats.pending)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Vencida</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(stats.overdue)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pagada</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.paid)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'receivable' | 'payable')}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="receivable" className="gap-2">
                <ArrowDownRight className="h-4 w-4" />
                Por cobrar
              </TabsTrigger>
              <TabsTrigger value="payable" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Por pagar
              </TabsTrigger>
            </TabsList>
            <div className="flex-1">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filtered.length > 0 ? (
          filtered.map((debt) => (
            <Card key={debt.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    debt.type === 'receivable' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                  )}>
                    {debt.type === 'receivable'
                      ? <ArrowDownRight className="h-6 w-6 text-blue-400" />
                      : <ArrowUpRight className="h-6 w-6 text-amber-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium">{debt.description}</h3>
                      <Badge variant={debt.status === 'paid' ? 'success' : debt.status === 'overdue' ? 'danger' : 'warning'}>
                        {debt.status === 'paid' ? 'Pagada' : debt.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm">{debt.counterparty}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                      <span>Vence: {new Date(debt.dueDate).toLocaleDateString('es-AR')}</span>
                      <span>Pagado: {formatCurrency(debt.paidAmount)} / {formatCurrency(debt.amount)}</span>
                    </div>
                    <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                      <div
                        className={cn("h-2 rounded-full transition-all", debt.status === 'paid' ? 'bg-blue-500' : 'bg-amber-500')}
                        style={{ width: `${Math.min((debt.paidAmount / debt.amount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {debt.status !== 'paid' && (
                    <Button variant="ghost" size="sm" onClick={() => openPayment(debt)}>
                      <CreditCard className="h-4 w-4 mr-1" />
                      Pagar
                    </Button>
                  )}
                  <IconButton onClick={() => handleDelete(debt.id)} aria-label="Eliminar" className="text-red-400 hover:text-red-300">
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay deudas</h3>
            <p className="text-white/50 mb-4">
              {activeTab === 'receivable' ? 'No tienes deudas por cobrar' : 'No tienes deudas por pagar'}
            </p>
          </Card>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nueva Deuda</h2>
              <IconButton onClick={() => setShowModal(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={form.type === 'receivable' ? 'primary' : 'outline'}
                  onClick={() => setForm(p => ({ ...p, type: 'receivable' }))}
                >
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Por cobrar
                </Button>
                <Button
                  variant={form.type === 'payable' ? 'primary' : 'outline'}
                  onClick={() => setForm(p => ({ ...p, type: 'payable' }))}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Por pagar
                </Button>
              </div>
              <Input label="Descripción *" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción de la deuda" />
              <Input label="Contraparte" value={form.counterparty} onChange={e => setForm(p => ({ ...p, counterparty: e.target.value }))} placeholder="Nombre de la persona o empresa" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Monto *" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                <Input label="Fecha de vencimiento" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <Input label="Notas" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Crear Deuda</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Registrar Pago</h2>
              <IconButton onClick={() => setShowPaymentModal(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Deuda: <span className="text-white font-medium">{selectedDebt.description}</span>
              </p>
              <p className="text-white/70 text-sm">
                Pendiente: <span className="text-white font-medium">{formatCurrency(selectedDebt.amount - selectedDebt.paidAmount)}</span>
              </p>
              <Input
                label="Monto a pagar *"
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
              <Button onClick={handlePayment}>Registrar Pago</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
