import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const aisleVolumeData = [
  {
    aisle: 'E-Bikes',
    revenue: 48200,
    orders: 37,
  },
  {
    aisle: 'Apparel',
    revenue: 29400,
    orders: 172,
  },
  {
    aisle: 'Footwear',
    revenue: 34100,
    orders: 168,
  },
  {
    aisle: 'Appliances',
    revenue: 41800,
    orders: 194,
  },
  {
    aisle: 'Perfumes',
    revenue: 22600,
    orders: 215,
  },
];

const RechartsBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={aisleVolumeData}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 21, 22, 0.08)" />
        <XAxis
          dataKey="aisle"
          tickLine={false}
          axisLine={{ stroke: 'rgba(18, 21, 22, 0.12)' }}
          tick={{ fontSize: 12, fill: '#50565a' }}
        />
        <YAxis
          tickLine={false}
          axisLine={{ stroke: 'rgba(18, 21, 22, 0.12)' }}
          tick={{ fontSize: 12, fill: '#50565a' }}
          tickFormatter={(v) => `$${v / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          formatter={(value) => (value === 'revenue' ? 'Gross Volume ($)' : 'Fulfilled Units')}
        />
        <Bar dataKey="revenue" fill="#124330" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RechartsBarChart;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[#121516] text-[#fbfaf8] border border-white/10 rounded-lg shadow-lg text-xs font-sans">
        <p className="font-semibold text-sm mb-1">{label} Aisle</p>
        <p className="text-[#8cd6b5] font-mono">
          Gross Volume: <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};
