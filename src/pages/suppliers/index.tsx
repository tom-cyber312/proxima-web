import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Building2, User } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, IconButton } from '../../components/ui';
import { cn } from '../../utils/helpers';

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  cuit: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export const SuppliersPage = () => {
  const { settings } = useStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '', cuit: '', notes: '' });

  const filtered = useMemo(() =>
    suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      s.cuit.includes(search)
    ), [suppliers, search]);

  const openNew = () => {
    setEditingSupplier(null);
    setForm({ name: '', contactName: '', phone: '', email: '', address: '', cuit: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({ name: s.name, contactName: s.contactName, phone: s.phone, email: s.email, address: s.address, cuit: s.cuit, notes: s.notes });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...form } : s));
    } else {
      setSuppliers(prev => [...prev, { id: `sup-${Date.now()}`, ...form, active: true, createdAt: new Date().toISOString() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const toggleActive = (id: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Proveedores</h1>
          <p className="text-white/50 text-sm mt-1">Gestiona tus proveedores y contactos</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-400">{suppliers.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Activos</p>
              <p className="text-2xl font-bold text-blue-400">{suppliers.filter(s => s.active).length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="h-6 w-6 text-white/60" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Inactivos</p>
              <p className="text-2xl font-bold text-white/80">{suppliers.filter(s => !s.active).length}</p>
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
          placeholder="Buscar por nombre, contacto o CUIT..."
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
          filtered.map((supplier) => (
            <Card key={supplier.id} className={cn(!supplier.active && 'opacity-50')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium">{supplier.name}</h3>
                      <Badge variant={supplier.active ? 'success' : 'default'}>
                        {supplier.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {supplier.contactName && (
                      <p className="text-white/70 text-sm">{supplier.contactName}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
                      {supplier.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {supplier.phone}
                        </span>
                      )}
                      {supplier.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {supplier.email}
                        </span>
                      )}
                      {supplier.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {supplier.address}
                        </span>
                      )}
                      {supplier.cuit && (
                        <span>CUIT: {supplier.cuit}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton onClick={() => toggleActive(supplier.id)} aria-label="Toggle activo">
                    <Badge variant={supplier.active ? 'success' : 'default'}>{supplier.active ? 'On' : 'Off'}</Badge>
                  </IconButton>
                  <IconButton onClick={() => openEdit(supplier)} aria-label="Editar">
                    <Edit2 className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(supplier.id)} aria-label="Eliminar" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay proveedores</h3>
            <p className="text-white/50 mb-4">Agrega tu primer proveedor para comenzar</p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </Card>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <IconButton onClick={() => setShowModal(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <Input label="Nombre *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del proveedor" />
              <Input label="Contacto" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Nombre del contacto" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Teléfono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+54 11 1234-5678" />
                <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="contacto@proveedor.com" />
              </div>
              <Input label="CUIT" value={form.cuit} onChange={e => setForm(p => ({ ...p, cuit: e.target.value }))} placeholder="20-12345678-9" />
              <Input label="Dirección" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Dirección completa" />
              <Input label="Notas" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
