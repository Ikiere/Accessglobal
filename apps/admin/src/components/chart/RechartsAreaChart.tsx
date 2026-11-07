import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const financialTelemetry = [
  {
    name: 'Jan',
    LandedVolume: 38400,
    WorkshopSettlement: 31200,
  },
  {
    name: 'Feb',
    LandedVolume: 42100,
    WorkshopSettlement: 34500,
  },
  {
    name: 'Mar',
    LandedVolume: 48900,
    WorkshopSettlement: 39800,
  },
  {
    name: 'Apr',
    LandedVolume: 54200,
    WorkshopSettlement: 44100,
  },
  {
    name: 'May',
    LandedVolume: 61800,
    WorkshopSettlement: 50400,
  },
  {
    name: 'Jun',
    LandedVolume: 68500,
    WorkshopSettlement: 55900,
  },
];

const RechartsAreaChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={financialTelemetry}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 21, 22, 0.08)" />
        <XAxis
          dataKey="name"
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
          formatter={(value) => (value === 'LandedVolume' ? 'Landed Volume (USD)' : 'Workshop Settlements (USD)')}
        />

        <Area
          type="monotone"
          dataKey="LandedVolume"
          name="LandedVolume"
          stroke="#124330"
          strokeWidth={2}
          fill="rgba(18, 67, 48, 0.12)"
        />

        <Area
          type="monotone"
          dataKey="WorkshopSettlement"
          name="WorkshopSettlement"
          stroke="#3a6953"
          strokeWidth={1.75}
          fill="rgba(58, 105, 83, 0.08)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[#121516] text-[#fbfaf8] border border-white/10 rounded-lg shadow-lg text-xs font-sans">
        <p className="font-semibold text-sm mb-2 border-b border-white/10 pb-1">{label} Telemetry</p>
        <div className="space-y-1 font-mono">
          <p className="flex justify-between gap-4 text-[#8cd6b5]">
            <span>Landed Volume:</span>
            <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
          </p>
          <p className="flex justify-between gap-4 text-[#a3b8af]">
            <span>Workshop Settlements:</span>
            <span className="font-semibold">${payload[1]?.value?.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default RechartsAreaChart;
