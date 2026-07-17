import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target, AlertTriangle, Filter, BarChart3, Settings, Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useStore } from '../../store';
import { 
  BarChart, LineChart, DoughnutChart, CategoryBarChart, ComparisonBarChart 
} from '../../components/charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Input, Badge, Tabs, TabsList, TabsTrigger, TabsContent, IconButton } from '../../components/ui';
import { cn, formatCurrency, formatDate, getDateRange, exportToCSV } from '../../utils/helpers';

export const AdvertisingPage = () => {
  const { 
    transactions, 
    categories, 
    businesses, 
    products, 
    settings,
    getAdvertisingCampaigns,
    calculateROI,
    addAdvertisingCampaign,
    updateAdvertisingCampaign,
    deleteAdvertisingCampaign,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'roi'>('overview');
  const [dateRange, setDateRange] = useState(() => getDateRange('month'));
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  const campaigns = getAdvertisingCampaigns();
  const roiMetrics = calculateROI();

  const currentRange = dateRange;
  const currentTransactions = transactions.filter(t => t.date >= currentRange.start && t.date <= currentRange.end);
  const adExpense = currentTransactions
    .filter(t => t.type === 'expense' && t.category === 'advertising')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvested = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = roiMetrics.reduce((sum, r) => sum + r.revenueGenerated, 0);
  const avgROI = roiMetrics.length > 0 ? roiMetrics.reduce((sum, r) => sum + r.roi, 0) / roiMetrics.length : 0;
  const avgROAS = roiMetrics.length > 0 ? roiMetrics.reduce((sum, r) => sum + r.roas, 0) / roiMetrics.length : 0;

  const formatValue = (val: number) => formatCurrency(val, { currency: settings.currency, symbol: settings.currencySymbol });

  const handleCampaignSubmit = (data: any) => {
    if (editingCampaign) {
      updateAdvertisingCampaign(editingCampaign.id, data);
    } else {
      addAdvertisingCampaign({ ...data, spent: 0, impressions: 0, clicks: 0, conversions: 0, status: 'active' });
    }
    setShowCampaignForm(false);
    setEditingCampaign(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Publicidad y ROI</h1>
          <p className="text-white/50 text-sm mt-1">
            Analiza el retorno de tu inversión publicitaria por campaña y plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange.start === getDateRange('month').start && dateRange.end === getDateRange('month').end ? 'month' : 'custom'}
            onChange={(v) => v !== 'custom' && setDateRange(getDateRange(v as any))}
            options={[
              { value: 'today', label: 'Hoy' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'quarter', label: 'Este trimestre' },
              { value: 'year', label: 'Este año' },
              { value: 'custom', label: 'Personalizado' },
            ]}
            className="w-40"
          />
          <Button onClick={() => { setEditingCampaign(null); setShowCampaignForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva campaña
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total invertido</p>
              <p className="text-2xl font-bold text-blue-400">{formatValue(totalInvested)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Ingresos atribuidos</p>
              <p className="text-2xl font-bold text-emerald-400">{formatValue(totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">ROI promedio</p>
              <p className="text-2xl font-bold text-purple-400">{avgROI >= 0 ? '+' : ''}{avgROI.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">ROAS promedio</p>
              <p className="text-2xl font-bold text-amber-400">{avgROAS.toFixed(2)}x</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="py-3">Resumen</TabsTrigger>
          <TabsTrigger value="campaigns" className="py-3">Campañas</TabsTrigger>
          <TabsTrigger value="roi" className="py-3">ROI Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI por plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                {roiMetrics.length > 0 ? (
                  <CategoryBarChart
                    data={roiMetrics.map(r => ({ 
                      label: r.platform, 
                      value: r.roi, 
                      color: r.roi >= 0 ? '#22c55e' : '#ef4444' 
                    }))}
                    formatValue={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                    height={300}
                    horizontal
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay datos de ROI</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROAS por campaña</CardTitle>
              </CardHeader>
              <CardContent>
                {roiMetrics.length > 0 ? (
                  <CategoryBarChart
                    data={roiMetrics.map(r => ({ 
                      label: r.campaignName, 
                      value: r.roas, 
                      color: r.roas >= 1 ? '#22c55e' : '#ef4444' 
                    }))}
                    formatValue={(v) => `${v.toFixed(2)}x`}
                    height={300}
                    horizontal
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/40">No hay campañas</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inversión vs Ingresos por mes</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={roiMetrics.flatMap(r => [
                    { label: r.campaignName + ' Inv.', value: r.invested, color: '#ef4444' },
                    { label: r.campaignName + ' Ing.', value: r.revenueGenerated, color: '#22c55e' }
                  ])}
                  formatValue={formatValue}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de campañas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => {
                      const roi = roiMetrics.find(r => r.campaignId === campaign.id);
                      return (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: getPlatformColor(campaign.platform) + '20', color: getPlatformColor(campaign.platform) }}>
                              {getPlatformIcon(campaign.platform)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{campaign.name}</p>
                              <p className="text-white/50 text-sm capitalize">{campaign.platform} · {campaign.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">{formatValue(campaign.spent)}</p>
                            {roi && (
                              <p className={`text-sm font-medium ${roi.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ROI: {roi.roi >= 0 ? '+' : ''}{roi.roi.toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-white/40">
                      <BarChart3 className="h-12 w-12 mx-auto text-white/20 mb-4" />
                      <h4 className="text-lg font-medium text-white mb-2">No hay campañas aún</h4>
                      <p className="text-white/50 mb-4">Crea tu primera campaña publicitaria</p>
                      <Button onClick={() => { setEditingCampaign(null); setShowCampaignForm(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear campaña
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="campaigns">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: getPlatformColor(campaign.platform) + '20', color: getPlatformColor(campaign.platform) }}>
                        {getPlatformIcon(campaign.platform)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-white/50 text-sm capitalize">{campaign.platform} · {campaign.status} · {formatValue(campaign.budget)} presupuesto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Gastado</p>
                        <p className="text-white font-semibold">{formatValue(campaign.spent)} / {formatValue(campaign.budget)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconButton onClick={() => { setEditingCampaign(campaign); setShowCampaignForm(true); }} aria-label="Editar">
                          <Edit2 className="h-4 w-4" />
                        </IconButton>
                        <IconButton variant="danger" onClick={() => deleteAdvertisingCampaign(campaign.id)} aria-label="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }} />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay campañas</h3>
                <p className="text-white/50 mb-4">Crea tu primera campaña para trackear ROI</p>
                <Button onClick={() => { setEditingCampaign(null); setShowCampaignForm(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear campaña
                </Button>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="roi">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalle de ROI por campaña</CardTitle>
              </CardHeader>
              <CardContent>
                {roiMetrics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                          <th className="pb-3 pr-4">Campaña</th>
                          <th className="pb-3 pr-4">Plataforma</th>
                          <th className="pb-3 pr-4 text-right">Invertido</th>
                          <th className="pb-3 pr-4 text-right">Ingresos</th>
                          <th className="pb-3 pr-4 text-right">ROI</th>
                          <th className="pb-3 pr-4 text-right">ROAS</th>
                          <th className="pb-3 pr-4 text-right">Conversiones</th>
                          <th className="pb-3 pr-4 text-right">Costo/Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roiMetrics.map((roi) => (
                          <tr key={roi.campaignId} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-white/80">{roi.campaignName}</td>
                            <td className="py-3 pr-4">
                              <Badge variant="info">{roi.platform}</Badge>
                            </td>
                            <td className="py-3 pr-4 text-right text-red-400">{formatValue(roi.invested)}</td>
                            <td className="py-3 pr-4 text-right text-emerald-400">{formatValue(roi.revenueGenerated)}</td>
                            <td className={`py-3 pr-4 text-right font-semibold ${roi.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {roi.roi >= 0 ? '+' : ''}{roi.roi.toFixed(1)}%
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold">{roi.roas.toFixed(2)}x</td>
                            <td className="py-3 pr-4 text-right text-white/70">{roi.conversions}</td>
                            <td className="py-3 pr-4 text-right text-white/70">{formatValue(roi.costPerConversion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/40">No hay datos de ROI</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativa de plataformas</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBarChart
                  data={roiMetrics.reduce((acc, r) => {
                    const existing = acc.find(a => a.label === r.platform);
                    if (existing) {
                      existing.current += r.revenueGenerated;
                      existing.previous += r.invested;
                    } else {
                      acc.push({ label: r.platform, current: r.revenueGenerated, previous: r.invested, color: getPlatformColor(r.platform) });
                    }
                    return acc;
                  }, [] as { label: string; current: number; previous: number; color: string }[])}
                  formatValue={formatValue}
                  height={300}
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {showCampaignForm && (
        <CampaignForm
          initialData={editingCampaign}
          businesses={businesses}
          onSuccess={() => { setShowCampaignForm(false); setEditingCampaign(null); }}
          onCancel={() => { setShowCampaignForm(false); setEditingCampaign(null); }}
        />
      )}
    </div>
  );
};

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    google: '#4285F4',
    tiktok: '#000000',
    other: '#6b7280',
  };
  return colors[platform] || '#6b7280';
};

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    facebook: '📘',
    instagram: '📷',
    google: '🔍',
    tiktok: '🎵',
    other: '📢',
  };
  return icons[platform] || '📢';
};

const CampaignForm = ({ 
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
  const { addAdvertisingCampaign, updateAdvertisingCampaign } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      businessId: '',
      platform: 'facebook',
      budget: '',
      startDate: formatDate(new Date(), 'YYYY-MM-DD'),
      endDate: '',
      ...initialData,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const campaignData = {
        ...data,
        budget: parseFloat(data.budget) || 0,
        spent: initialData?.spent || 0,
        impressions: initialData?.impressions || 0,
        clicks: initialData?.clicks || 0,
        conversions: initialData?.conversions || 0,
        status: initialData?.status || 'active',
      };
      if (initialData?.id) {
        updateAdvertisingCampaign(initialData.id, campaignData);
      } else {
        addAdvertisingCampaign(campaignData);
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
            {initialData?.id ? 'Editar campaña' : 'Nueva campaña'}
          </h2>
          <IconButton onClick={onCancel}><X className="h-5 w-5" /></IconButton>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            {...register('name', { required: 'El nombre es requerido' })}
            label="Nombre de la campaña"
            placeholder="Ej: Black Friday 2024, Lanzamiento Verano..."
            error={errors.name?.message}
          />

          <Select
            {...register('businessId', { required: 'Selecciona un negocio' })}
            label="Negocio"
            error={errors.businessId?.message}
            options={businesses.map(b => ({ value: b.id, label: b.name }))}
            placeholder="Selecciona un negocio"
          />

          <Select
            {...register('platform')}
            label="Plataforma"
            options={[
              { value: 'facebook', label: 'Facebook' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'google', label: 'Google Ads' },
              { value: 'tiktok', label: 'TikTok' },
              { value: 'other', label: 'Otro' },
            ]}
          />

          <Input
            {...register('budget', { required: 'El presupuesto es requerido', min: { value: 0.01, message: 'Debe ser mayor a 0' } })}
            label="Presupuesto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            error={errors.budget?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('startDate', { required: 'La fecha de inicio es requerida' })}
              label="Fecha de inicio"
              type="date"
              error={errors.startDate?.message}
            />
            <Input
              {...register('endDate')}
              label="Fecha de fin (opcional)"
              type="date"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="h-4 w-4" />
              {initialData?.id ? 'Guardar cambios' : 'Crear campaña'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

import { useForm } from 'react-hook-form';
import { X, Save, BarChart3 } from 'lucide-react';