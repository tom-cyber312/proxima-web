import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Printer, Download, X, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, IconButton } from '../../components/ui';
import { cn } from '../../utils/helpers';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientCuit: string;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

export const InvoicesPage = () => {
  const { settings } = useStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ clientName: '', clientCuit: '', issueDate: '', dueDate: '', notes: '' });
  const [items, setItems] = useState<InvoiceItem[]>([{ id: 'item-1', description: '', quantity: 1, unitPrice: 0 }]);

  const filtered = useMemo(() =>
    invoices.filter(inv =>
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase())
    ), [invoices, search]);

  const stats = useMemo(() => ({
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), 0),
  }), [invoices]);

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const openNew = () => {
    setEditingInvoice(null);
    setForm({ clientName: '', clientCuit: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', notes: '' });
    setItems([{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
    setShowModal(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setForm({ clientName: inv.clientName, clientCuit: inv.clientCuit, issueDate: inv.issueDate, dueDate: inv.dueDate, notes: inv.notes });
    setItems([...inv.items]);
    setShowModal(true);
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const handleSave = () => {
    if (!form.clientName.trim()) return;
    const validItems = items.filter(it => it.description.trim());
    if (validItems.length === 0) return;

    const num = `F-${String(invoices.length + 1).padStart(4, '0')}`;

    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id
        ? { ...inv, ...form, items: validItems }
        : inv
      ));
    } else {
      setInvoices(prev => [...prev, {
        id: `inv-${Date.now()}`,
        number: num,
        ...form,
        items: validItems,
        status: 'draft',
        createdAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const statusConfig = {
    draft: { label: 'Borrador', variant: 'default' as const, icon: Edit2 },
    sent: { label: 'Enviada', variant: 'info' as const, icon: Clock },
    paid: { label: 'Pagada', variant: 'success' as const, icon: CheckCircle },
    overdue: { label: 'Vencida', variant: 'danger' as const, icon: AlertCircle },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Comprobantes</h1>
          <p className="text-white/50 text-sm mt-1">Gestiona tus facturas y comprobantes</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Comprobante
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Edit2 className="h-6 w-6 text-white/60" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Borradores</p>
              <p className="text-2xl font-bold text-white/80">{stats.draft}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Enviadas</p>
              <p className="text-2xl font-bold text-blue-400">{stats.sent}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pagadas</p>
              <p className="text-2xl font-bold text-blue-400">{stats.paid}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Monto Total</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Input
          placeholder="Buscar por número o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filtered.length > 0 ? (
          filtered.map((invoice) => {
            const st = statusConfig[invoice.status];
            const total = invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
            return (
              <Card key={invoice.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium">{invoice.number}</h3>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <p className="text-white/70 text-sm">{invoice.clientName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                        <span>Fecha: {new Date(invoice.issueDate).toLocaleDateString('es-AR')}</span>
                        <span>Vence: {new Date(invoice.dueDate).toLocaleDateString('es-AR')}</span>
                        <span>Items: {invoice.items.length}</span>
                        <span className="text-blue-400 font-medium">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton onClick={() => openEdit(invoice)} aria-label="Editar">
                      <Edit2 className="h-4 w-4" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(invoice.id)} aria-label="Eliminar" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay comprobantes</h3>
            <p className="text-white/50 mb-4">Crea tu primer comprobante para comenzar</p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Comprobante
            </Button>
          </Card>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingInvoice ? 'Editar Comprobante' : 'Nuevo Comprobante'}</h2>
              <IconButton onClick={() => setShowModal(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cliente *" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Nombre del cliente" />
                <Input label="CUIT" value={form.clientCuit} onChange={e => setForm(p => ({ ...p, clientCuit: e.target.value }))} placeholder="20-12345678-9" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Fecha de emisión" type="date" value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
                <Input label="Fecha de vencimiento" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/80">Ítems</h3>
                  <Button variant="ghost" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar ítem
                  </Button>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Input
                        placeholder="Descripción"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Cant."
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/70 text-sm py-3">{formatCurrency(item.quantity * item.unitPrice)}</p>
                    </div>
                    <div className="col-span-1">
                      <IconButton onClick={() => removeItem(item.id)} aria-label="Eliminar" className="text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <p className="text-white font-bold">Total: {formatCurrency(totalAmount)}</p>
                </div>
              </div>

              <Input label="Notas" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingInvoice ? 'Guardar Cambios' : 'Crear Comprobante'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
