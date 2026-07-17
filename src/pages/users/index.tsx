import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Eye, Edit2, Trash2, Mail, Key, Crown, Briefcase, UserX, CheckCircle, XCircle, Plus, Save, X, Loader2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Switch, Tabs, TabsList, TabsTrigger, TabsContent, IconButton } from '../../components/ui';
import { cn, formatDate } from '../../utils/helpers';
import { ROLE_PERMISSIONS, UserRole } from '../../types';

export const UsersPage = () => {
  const { 
    users, 
    currentUser, 
    businesses,
    addUser, 
    updateUser, 
    deleteUser, 
    setCurrentUser,
  } = useStore();

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'permissions'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, searchQuery, roleFilter]);

  const currentUserRole = currentUser?.role || 'owner';
  const canManageUsers = ROLE_PERMISSIONS[currentUserRole]?.some(p => p.resource === 'users' && p.actions.includes('write')) || false;

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleCloseForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role: UserRole) => {
    const config = {
      owner: { label: 'Propietario', variant: 'info' as const, color: 'text-purple-400' },
      manager: { label: 'Gerente', variant: 'warning' as const, color: 'text-amber-400' },
      employee: { label: 'Empleado', variant: 'success' as const, color: 'text-emerald-400' },
    };
    return config[role];
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      owner: 'Acceso total a todos los negocios y configuraciones',
      manager: 'Gestiona movimientos, productos y ve reportes de sus negocios',
      employee: 'Solo puede registrar movimientos en negocios asignados',
    };
    return descriptions[role];
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-white/50 text-sm mt-1">
            Controla accesos y permisos por rol y negocio
          </p>
        </div>
        {canManageUsers && (
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Invitar usuario
          </Button>
        )}
      </motion.div>

      {users.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <Users className="h-16 w-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay usuarios registrados</h3>
          <p className="text-white/50 mb-4">Eres el primer usuario (propietario). Puedes invitar a tu equipo.</p>
          {canManageUsers && (
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar primer usuario
            </Button>
          )}
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="list" className="py-3">
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="py-3">
            <Shield className="h-4 w-4 mr-2" />
            Matriz de permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="search"
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { value: 'all', label: 'Todos los roles' },
                    { value: 'owner', label: 'Propietarios' },
                    { value: 'manager', label: 'Gerentes' },
                    { value: 'employee', label: 'Empleados' },
                  ]}
                />
              </div>
            </Card>

            {/* Users List */}
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-white font-semibold">{user.name}</p>
                            {user.id === currentUser?.id && (
                              <Badge variant="info">Tú</Badge>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-white/50 text-xs">Último acceso</p>
                          <p className="text-white/70 text-sm">
                            {user.lastLogin ? formatRelativeDate(user.lastLogin) : 'Nunca'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadge(user.role).variant}>
                            {getRoleBadge(user.role).label}
                          </Badge>

                          {canManageUsers && user.id !== currentUser?.id && (
                            <>
                              <IconButton onClick={() => handleEditUser(user)} aria-label="Editar">
                                <Edit2 className="h-4 w-4" />
                              </IconButton>
                              <IconButton variant="danger" onClick={() => {
                                if (confirm(`¿Eliminar a ${user.name}?`)) deleteUser(user.id);
                              }} aria-label="Eliminar">
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Access */}
                    {user.businessIds && user.businessIds.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/50 text-xs mb-2">Negocios asignados:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.businessIds.map((bizId: string) => {
                            const biz = businesses.find(b => b.id === bizId);
                            return (
                              <Badge key={bizId} variant="default" className="bg-white/10">
                                {biz?.name || bizId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Permissions Summary */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/50 text-xs mb-2">Permisos:</p>
                      <div className="flex flex-wrap gap-1">
                        {ROLE_PERMISSIONS[user.role]?.map(p => (
                          <Badge key={p.resource} variant="default" className="bg-white/5 text-xs">
                            {p.resource}: {p.actions.join(', ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No se encontraron usuarios</h3>
                <p className="text-white/50 mb-4">Intenta cambiar los filtros de búsqueda</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="permissions">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de permisos por rol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/50 border-b border-white/10">
                        <th className="pb-3 pr-4 w-40">Recurso</th>
                        <th className="pb-3 pr-4 text-center">Propietario</th>
                        <th className="pb-3 pr-4 text-center">Gerente</th>
                        <th className="pb-3 pr-4 text-center">Empleado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['dashboard', 'transactions', 'analytics', 'reports', 'settings', 'businesses', 'products', 'users'].map(resource => {
                        const ownerPerm = ROLE_PERMISSIONS.owner.find(p => p.resource === resource);
                        const managerPerm = ROLE_PERMISSIONS.manager.find(p => p.resource === resource);
                        const employeePerm = ROLE_PERMISSIONS.employee.find(p => p.resource === resource);

                        return (
                          <tr key={resource} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-white font-medium capitalize">{resource}</td>
                            <td className="py-3 pr-4 text-center">
                              {renderPermissionBadge(ownerPerm)}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              {renderPermissionBadge(managerPerm)}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              {renderPermissionBadge(employeePerm)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción de roles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['owner', 'manager', 'employee'] as UserRole[]).map(role => (
                  <Card key={role} className="p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                        backgroundColor: role === 'owner' ? '#a855f720' : role === 'manager' ? '#f59e0b20' : '#22c55e20',
                        color: role === 'owner' ? '#a855f7' : role === 'manager' ? '#f59e0b' : '#22c55e'
                      }}>
                        {role === 'owner' && <Crown className="h-5 w-5" />}
                        {role === 'manager' && <Briefcase className="h-5 w-5" />}
                        {role === 'employee' && <UserX className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold capitalize">{role}</p>
                        <Badge variant={getRoleBadge(role).variant}>{getRoleBadge(role).label}</Badge>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">{getRoleDescription(role)}</p>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {showUserForm && (
        <UserForm
          initialData={editingUser}
          businesses={businesses}
          currentUserRole={currentUserRole}
          onSuccess={handleCloseForm}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

const renderPermissionBadge = (perm: any) => {
  if (!perm) return <Badge variant="default" className="bg-gray-500/20">Sin acceso</Badge>;
  
  const actions = perm.actions;
  if (actions.includes('read') && actions.includes('write') && actions.includes('delete')) {
    return <Badge variant="info">Lectura, Escritura, Eliminar</Badge>;
  } else if (actions.includes('read') && actions.includes('write')) {
    return <Badge variant="success">Lectura, Escritura</Badge>;
  } else if (actions.includes('read')) {
    return <Badge variant="warning">Solo lectura</Badge>;
  }
  return <Badge variant="default">Sin acceso</Badge>;
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

const getRoleBadge = (role: string) => {
  const config = {
    owner: { label: 'Propietario', variant: 'info' as const },
    manager: { label: 'Gerente', variant: 'warning' as const },
    employee: { label: 'Empleado', variant: 'success' as const },
  };
  return config[role as keyof typeof config];
};

const getRoleDescription = (role: string) => {
  const descriptions = {
    owner: 'Acceso total a todos los negocios y configuraciones',
    manager: 'Gestiona movimientos, productos y ve reportes de sus negocios',
    employee: 'Solo puede registrar movimientos en negocios asignados',
  };
  return descriptions[role as keyof typeof descriptions];
};

const UserForm = ({ 
  initialData, 
  businesses, 
  currentUserRole,
  onSuccess, 
  onCancel 
}: { 
  initialData?: any; 
  businesses: any[];
  currentUserRole: string;
  onSuccess: () => void; 
  onCancel: () => void;
}) => {
  const { addUser, updateUser } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const availableRoles = currentUserRole === 'owner' 
    ? ['owner', 'manager', 'employee'] 
    : currentUserRole === 'manager'
      ? ['manager', 'employee']
      : ['employee'];

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'employee',
      password: '',
      businessIds: [],
      ...initialData,
    },
  });

  const watchedRole = watch('role');
  const isOwner = watchedRole === 'owner';

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const userData = {
        ...data,
        role: data.role as 'owner' | 'manager' | 'employee',
        businessIds: isOwner ? [] : data.businessIds,
      };
      if (initialData?.id) {
        updateUser(initialData.id, userData);
      } else {
        addUser(userData);
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
            {initialData?.id ? 'Editar usuario' : 'Invitar usuario'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre completo"
            placeholder="Juan Pérez"
            error={errors.name?.message}
          />

          <Input
            {...register('email', { required: 'El email es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
            label="Email"
            type="email"
            placeholder="juan@ejemplo.com"
            error={errors.email?.message}
          />

          <div className="relative">
            <label className="block text-sm font-medium text-white/80 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                {...register('password', initialData ? {} : { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                type={showPassword ? 'text' : 'password'}
                placeholder={initialData ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-400" role="alert">{errors.password.message}</p>
            )}
            {!initialData && <p className="mt-1 text-xs text-white/50">Mínimo 6 caracteres</p>}
          </div>

          <Select
            {...register('role')}
            label="Rol"
            options={availableRoles.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
          />

          {!isOwner && businesses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Negocios asignados</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {businesses.map(biz => (
                  <label key={biz.id} className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      {...register('businessIds')}
                      value={biz.id}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: biz.color + '20', color: biz.color }}>
                        <span className="text-xs">{getIconEmoji(biz.icon)}</span>
                      </div>
                      <span className="text-white/80 text-sm">{biz.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isOwner && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <Crown className="h-4 w-4 text-purple-400 mr-2 inline" />
              <span className="text-purple-400 text-sm">Los propietarios tienen acceso a todos los negocios automáticamente</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Invitar usuario'}
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
import { Search, Edit2, Trash2, Crown, Briefcase, UserX, ShieldCheck, Shield } from 'lucide-react';