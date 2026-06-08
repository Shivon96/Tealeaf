
import React, { useMemo } from 'react';
import { CollectionRecord, Farmer, TeaGrade, AppSettings } from '../types';
import { translations } from '../translations';
import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Scale, Banknote, Users, TrendingUp, Bell, Printer } from 'lucide-react';

interface Props {
  collections: CollectionRecord[];
  farmers: Farmer[];
  onNavigateToReports: () => void;
  settings: AppSettings;
}

const DashboardView: React.FC<Props> = ({ collections, farmers, onNavigateToReports, settings }) => {
  const t = translations[settings.language];
  
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCols = collections.filter(c => c.timestamp.startsWith(today));
    
    return {
      totalWeight: todayCols.reduce((acc, curr) => acc + curr.weight, 0),
      totalPayout: todayCols.reduce((acc, curr) => acc + curr.total_amount, 0),
      activeFarmersToday: new Set(todayCols.map(c => c.farmer_id)).size,
      avgWeight: todayCols.length > 0 ? todayCols.reduce((acc, curr) => acc + curr.weight, 0) / todayCols.length : 0
    };
  }, [collections]);

  const showWeeklyNotification = useMemo(() => {
    const today = new Date();
    return today.getDay() === 0 || today.getDay() === 1;
  }, []);

  const chartData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    const days = 7;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = 0;
    }

    collections.forEach(c => {
      const key = c.timestamp.split('T')[0];
      if (dailyData.hasOwnProperty(key)) {
        dailyData[key] += c.weight;
      }
    });

    return Object.entries(dailyData)
      .map(([name, weight]) => ({ name: name.split('-').slice(1).join('/'), weight }))
      .reverse();
  }, [collections]);

  const gradeData = useMemo(() => {
    const counts: Record<string, number> = {
      [TeaGrade.SUPER_FINE]: 0,
      [TeaGrade.GRADE_A]: 0,
      [TeaGrade.GRADE_B]: 0,
      [TeaGrade.GRADE_C]: 0
    };
    
    collections.forEach(c => counts[c.grade]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [collections]);

  const COLORS = ['#059669', '#10b981', '#6ee7b7', '#d1fae5'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showWeeklyNotification && (
        <div className="bg-slate-900 text-white p-4 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-lg">Weekly Settlement Alert</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">New report ready for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToReports}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm"
          >
            <Printer size={18} />
            <span>{t.print_report}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Overview</h1>
          <p className="text-slate-500">Real-time stats for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Scale className="text-emerald-600" />} 
          label={t.weight + " Today"} 
          value={`${stats.totalWeight.toFixed(1)} kg`} 
          subValue="Total intake"
        />
        <StatCard 
          icon={<Banknote className="text-emerald-600" />} 
          label="Est. Payout" 
          value={`Rs. ${stats.totalPayout.toLocaleString()}`} 
          subValue="Daily total"
        />
        <StatCard 
          icon={<Users className="text-emerald-600" />} 
          label={t.active + " " + t.farmers} 
          value={stats.activeFarmersToday} 
          subValue="Delivered today"
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          label="Avg Load" 
          value={`${stats.avgWeight.toFixed(1)} kg`} 
          subValue="Per bag"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Collection Trend (7 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#059669', fontWeight: 600 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quality Distribution</h3>
          <div className="h-[300px] relative flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 w-full space-y-2">
              {gradeData.map((g, idx) => (
                <div key={g.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-wider">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                    <span>{g.name}</span>
                  </div>
                  <span className="font-black text-slate-800">{g.value} batches</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subValue: string }> = ({ icon, label, value, subValue }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-start space-x-4 hover:border-emerald-200 transition-all group">
    <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 my-1">{value}</h4>
      <p className="text-[10px] text-slate-400 font-bold">{subValue}</p>
    </div>
  </div>
);

export default DashboardView;
