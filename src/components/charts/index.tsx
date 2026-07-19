import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  Registry
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { cn } from '../../utils/helpers';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

const CHART_COLORS = [
  '#3b82f6', '#2563eb', '#84cc16', '#eab308', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4',
];

const CHART_GRADIENTS: Record<string, CanvasGradient> = {};

function getGradient(ctx: CanvasRenderingContext2D, color: string, id: string): CanvasGradient {
  if (!CHART_GRADIENTS[id]) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, `${color}CC`);
    gradient.addColorStop(1, `${color}00`);
    CHART_GRADIENTS[id] = gradient;
  }
  return CHART_GRADIENTS[id];
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(17, 17, 17, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      cornerRadius: 12,
      titleFont: { size: 13, weight: '600', family: 'Barlow' },
      bodyFont: { size: 12, family: 'Barlow' },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.4)',
        font: { size: 11, family: 'Barlow' },
        maxTicksLimit: 12,
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.4)',
        font: { size: 11, family: 'Barlow' },
        callback: (value: number | string) => {
          const num = typeof value === 'number' ? value : parseFloat(value as string);
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
          return num.toString();
        },
      },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeOutQuart',
  },
};

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export const BarChart = ({ 
  data, 
  title, 
  formatValue, 
  height = 300,
  className,
  showValues = false,
}: { 
  data: ChartDataPoint[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
  showValues?: boolean;
}) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: title || 'Valor',
        data: data.map(d => d.value),
        backgroundColor: data.map((d, i) => d.color || CHART_COLORS[i % CHART_COLORS.length]),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return formatValue ? formatValue(value) : value.toLocaleString('es-AR');
          },
        },
      },
    },
  };

  return (
    <div className={cn('chart-container', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const LineChart = ({ 
  data, 
  title, 
  formatValue,
  height = 300,
  className,
  showArea = true,
  multiLine = false,
}: { 
  data: TrendDataPoint[] | ChartDataPoint[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
  showArea?: boolean;
  multiLine?: boolean;
}) => {
  const isTrendData = 'income' in (data[0] || {});

  if (isTrendData && multiLine) {
    const trendData = data as TrendDataPoint[];
    const chartData = {
      labels: trendData.map(d => d.label),
      datasets: [
        {
          label: 'Ingresos',
          data: trendData.map(d => d.income),
          borderColor: '#3b82f6',
          backgroundColor: (ctx: any) => getGradient(ctx.chart.ctx, '#3b82f6', 'income'),
          fill: showArea,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Egresos',
          data: trendData.map(d => d.expense),
          borderColor: '#ef4444',
          backgroundColor: (ctx: any) => getGradient(ctx.chart.ctx, '#ef4444', 'expense'),
          fill: showArea,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#ef4444',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Balance',
          data: trendData.map(d => d.balance),
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    };

    const options = {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: { size: 11, family: 'Barlow' },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
          },
        },
        tooltip: {
          ...defaultOptions.plugins.tooltip,
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              return `${context.dataset.label}: ${formatValue ? formatValue(value) : value.toLocaleString('es-AR')}`;
            },
          },
        },
      },
    };

    return (
      <div className={cn('chart-container', className)} style={{ height }}>
        {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
        <Line data={chartData} options={options} />
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: title || 'Valor',
        data: data.map(d => d.value),
        borderColor: CHART_COLORS[0],
        backgroundColor: (ctx: any) => showArea ? getGradient(ctx.chart.ctx, CHART_COLORS[0], 'single') : 'transparent',
        fill: showArea,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: CHART_COLORS[0],
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return formatValue ? formatValue(value) : value.toLocaleString('es-AR');
          },
        },
      },
    },
  };

  return (
    <div className={cn('chart-container', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <Line data={chartData} options={options} />
    </div>
  );
};

export const DoughnutChart = ({ 
  data, 
  title, 
  formatValue,
  height = 300,
  className,
  centerLabel,
  cutout = '70%',
}: { 
  data: ChartDataPoint[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
  centerLabel?: string | { label: string; value: string };
  cutout?: string;
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map((d, i) => d.color || CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 0,
        borderRadius: 8,
        spacing: 2,
        cutout,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    cutout,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, family: 'Barlow' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                lineWidth: 0,
                hidden: false,
                index: i,
              }));
            }
            return [];
          },
        },
      },
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatValue ? formatValue(value) : value.toLocaleString('es-AR')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={cn('chart-container relative', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <div className="relative" style={{ height: '100%' }}>
        <Doughnut data={chartData} options={options} />
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {typeof centerLabel === 'string' ? (
              <span className="text-2xl font-bold text-white">{centerLabel}</span>
            ) : (
              <>
                <span className="text-xs text-white/50">{centerLabel.label}</span>
                <span className="text-2xl font-bold text-white">{centerLabel.value}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PieChart = ({ 
  data, 
  title, 
  formatValue,
  height = 300,
  className,
}: { 
  data: ChartDataPoint[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map((d, i) => d.color || CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 2,
        borderColor: '#000',
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, family: 'Barlow' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatValue ? formatValue(value) : value.toLocaleString('es-AR')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={cn('chart-container', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <Pie data={chartData} options={options} />
    </div>
  );
};

export const CategoryBarChart = ({ 
  data, 
  title, 
  formatValue,
  height = 300,
  className,
  horizontal = true,
  maxBars = 10,
}: { 
  data: ChartDataPoint[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
  horizontal?: boolean;
  maxBars?: number;
}) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars);
  const maxValue = Math.max(...sortedData.map(d => d.value), 1);

  const chartData = {
    labels: sortedData.map(d => d.label),
    datasets: [
      {
        label: title || 'Valor',
        data: sortedData.map(d => d.value),
        backgroundColor: sortedData.map((d, i) => d.color || CHART_COLORS[i % CHART_COLORS.length]),
        borderRadius: horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0],
        borderSkipped: false,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      ...defaultOptions.plugins,
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = maxValue > 0 ? ((value / maxValue) * 100).toFixed(1) : 0;
            return `${context.dataset.label}: ${formatValue ? formatValue(value) : value.toLocaleString('es-AR')} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      ...defaultOptions.scales,
      x: horizontal ? {
        ...defaultOptions.scales.x,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
      } : {
        ...defaultOptions.scales.x,
      },
      y: horizontal ? {
        ...defaultOptions.scales.y,
        grid: {
          display: false,
          drawBorder: false,
        },
      } : {
        ...defaultOptions.scales.y,
      },
    },
  };

  return (
    <div className={cn('chart-container', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const ComparisonBarChart = ({ 
  data, 
  title, 
  formatValue,
  height = 300,
  className,
}: { 
  data: { label: string; current: number; previous: number; color?: string }[]; 
  title?: string; 
  formatValue?: (value: number) => string;
  height?: number;
  className?: string;
}) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Período actual',
        data: data.map(d => d.current),
        backgroundColor: data.map(d => d.color || CHART_COLORS[0]),
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Período anterior',
        data: data.map(d => d.previous),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11, family: 'Barlow' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.dataset.label}: ${formatValue ? formatValue(value) : value.toLocaleString('es-AR')}`;
          },
        },
      },
    },
  };

  return (
    <div className={cn('chart-container', className)} style={{ height }}>
      {title && <h3 className="text-white font-medium mb-4 text-sm">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const SparklineChart = ({ 
  data, 
  color = '#3b82f6',
  height = 40,
  width = 120,
}: { 
  data: number[]; 
  color?: string;
  height?: number;
  width?: number;
}) => {
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data: data,
        borderColor: color,
        backgroundColor: (ctx: any) => getGradient(ctx.chart.ctx, color, 'sparkline'),
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: { borderWidth: 2 },
    },
    animation: { duration: 0 },
  };

  return (
    <div style={{ height, width }}>
      <Line data={chartData} options={options} />
    </div>
  );
};