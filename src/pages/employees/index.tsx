import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit2, Trash2, X, Mail, Phone, Briefcase, UserCheck, UserX } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, IconButton } from '../../components/ui';
import { cn } from '../../utils/helpers';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  active: boolean;
  startDate: string;
  notes: string;
  createdAt: string;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

export const EmployeesPage = () => {
  const { settings } = useStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', salary: '', startDate: '', notes: '' });

  const filtered = useMemo(() =>
    employees.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    ), [employees, search]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.active).length,
    inactive: employees.filter(e => !e.active).length,
    totalSalary: employees.filter(e => e.active).reduce((sum, e) => sum + e.salary, 0),
  }), [employees]);

  const openNew = () => {
    setEditingEmployee(null);
    setForm({ name: '', role: '', email: '', phone: '', salary: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({ name: emp.name, role: emp.role, email: emp.email, phone: emp.phone, salary: String(emp.salary), startDate: emp.startDate, notes: emp.notes });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id
        ? { ...e, ...form, salary: parseFloat(form.salary) || 0 }
        : e
      ));
    } else {
      setEmployees(prev => [...prev, {
        id: `emp-${Date.now()}`,
        ...form,
        salary: parseFloat(form.salary) || 0,
        active: true,
        createdAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const toggleActive = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Empleados</h1>
          <p className="text-white/50 text-sm mt-1">Gestiona tu equipo de trabajo</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Activos</p>
              <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <UserX className="h-6 w-6 text-white/60" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Inactivos</p>
              <p className="text-2xl font-bold text-white/80">{stats.inactive}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Nómina Mensual</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.totalSalary)}</p>
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
          placeholder="Buscar por nombre, rol o email..."
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
          filtered.map((employee) => (
            <Card key={employee.id} className={cn(!employee.active && 'opacity-50')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium">{employee.name}</h3>
                      <Badge variant={employee.active ? 'success' : 'default'}>
                        {employee.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      {employee.role}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
                      {employee.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {employee.email}
                        </span>
                      )}
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {employee.phone}
                        </span>
                      )}
                      {employee.salary > 0 && (
                        <span>Sueldo: {formatCurrency(employee.salary)}</span>
                      )}
                      {employee.startDate && (
                        <span>Desde: {new Date(employee.startDate).toLocaleDateString('es-AR')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton onClick={() => toggleActive(employee.id)} aria-label="Toggle activo">
                    {employee.active
                      ? <UserCheck className="h-4 w-4 text-blue-400" />
                      : <UserX className="h-4 w-4 text-white/40" />
                    }
                  </IconButton>
                  <IconButton onClick={() => openEdit(employee)} aria-label="Editar">
                    <Edit2 className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(employee.id)} aria-label="Eliminar" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hay empleados</h3>
            <p className="text-white/50 mb-4">Agrega tu primer empleado para comenzar</p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Empleado
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
              <h2 className="text-xl font-bold text-white">{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <IconButton onClick={() => setShowModal(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="space-y-4">
              <Input label="Nombre *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre completo" />
              <Input label="Rol / Cargo" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Ej: Desarrollador, Gerente" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="empleado@empresa.com" />
                <Input label="Teléfono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+54 11 1234-5678" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Sueldo" type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="0.00" />
                <Input label="Fecha de ingreso" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <Input label="Notas" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
