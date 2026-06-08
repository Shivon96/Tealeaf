
import React, { useMemo } from 'react';
import { CollectionRecord, AdvancePayment, FertilizerIssue, Farmer, AppSettings } from '../types';
import { translations } from '../translations';
import { Printer, Calendar, TrendingUp, Download, Users, Sprout, Landmark, Scale } from 'lucide-react';
import { 
  exportFarmersToExcel,
  exportCollectionsToExcel,
  exportAdvancesToExcel,
  exportFertilizersToExcel,
  exportAggregatedSummaryToExcel 
} from '../lib/exportUtils';

interface Props {
  collections: CollectionRecord[];
  advances: AdvancePayment[];
  fertilizers: FertilizerIssue[];
  farmers: Farmer[];
  settings: AppSettings;
}

const ReportsView: React.FC<Props> = ({ collections, advances, fertilizers, farmers, settings }) => {
  const now = new Date();
  const t = translations[settings.language];
  const langTag = settings.language === 'si' ? 'si-LK' : 'en-US';

  const calculateReport = (start: Date, end: Date) => {
    const filteredCols = collections.filter(c => {
      const d = new Date(c.timestamp);
      return d >= start && d <= end;
    });
    const filteredAdvs = advances.filter(a => {
      const d = new Date(a.timestamp);
      return d >= start && d <= end;
    });
    const filteredFerts = fertilizers.filter(f => {
      const d = new Date(f.timestamp);
      return d >= start && d <= end;
    });

    const totalWeight = filteredCols.reduce((acc, c) => acc + c.weight, 0);
    const grossEarnings = filteredCols.reduce((acc, c) => acc + c.total_amount, 0);
    const totalAdvances = filteredAdvs.reduce((acc, a) => acc + a.amount, 0);
    const totalFertilizers = filteredFerts.reduce((acc, f) => acc + f.total_cost, 0);
    const netTotal = grossEarnings - totalAdvances - totalFertilizers;

    return { totalWeight, grossEarnings, totalAdvances, totalFertilizers, netTotal };
  };

  const getWeeklyRange = () => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const weekly = useMemo(() => {
    const range = getWeeklyRange();
    return calculateReport(range.start, range.end);
  }, [collections, advances, fertilizers]);

  const monthly = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return calculateReport(start, end);
  }, [collections, advances, fertilizers]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-2xl font-bold text-slate-900">{t.reports}</h1>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2">
          <Printer size={20} />
          <span>{t.print_report}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReportCard title={t.weekly_report} stats={weekly} t={t} icon={<Calendar size={48}/>} accent="emerald" />
        <ReportCard title={t.monthly_report} stats={monthly} t={t} icon={<TrendingUp size={48}/>} accent="slate" />
      </div>

      {/* Microsoft Excel Data Export Hub */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Download size={22} className="text-emerald-600" />
            </span>
            <span>Microsoft Excel Export Hub</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Export your center's tables to download and open natively inside Microsoft Excel. All files are prepended with an official UTF-8 signature to ensure flawless compatibility with names and labels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Main featured Aggregated Sheets */}
          <div className="md:col-span-12 p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="bg-emerald-700/60 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Highly Recommended</span>
              <h3 className="text-lg font-black mt-1">Export Complete Balance Sheet</h3>
              <p className="text-xs text-emerald-100 max-w-xl">Generates an consolidated excel spreadsheet matching each farmer with their total leaf intakes (kg), gross earnings, deducted cash advances, issued fertilizers, and final Net Due Payout.</p>
            </div>
            <button 
              onClick={() => exportAggregatedSummaryToExcel(farmers, collections, advances, fertilizers)}
              className="bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95 shrink-0"
            >
              <Scale size={18} />
              <span>Download Balance Sheet</span>
            </button>
          </div>

          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <button 
              onClick={() => exportFarmersToExcel(farmers)}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl transition-all group text-left active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Farmers Directory</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{farmers.length} active growers</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button 
              onClick={() => exportCollectionsToExcel(collections)}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl transition-all group text-left active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200">
                  <Scale size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Leaf Collection Records</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{collections.length} historical intakes</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button 
              onClick={() => exportAdvancesToExcel(advances)}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl transition-all group text-left active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200">
                  <Landmark size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Cash Advances Paid</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{advances.length} advance logs</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button 
              onClick={() => exportFertilizersToExcel(fertilizers)}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl transition-all group text-left active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200">
                  <Sprout size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Fertilizer Issuances</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{fertilizers.length} handouts</p>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, stats, t, icon, accent }: any) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
    <div className={`p-8 border-b relative ${accent === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-900 border-slate-800 text-white'}`}>
      <div className="absolute top-8 right-8 opacity-20">{icon}</div>
      <h2 className="text-2xl font-black">{title}</h2>
    </div>
    <div className="p-8 space-y-4">
      <Row label={t.total_weight} value={`${stats.totalWeight.toFixed(1)} kg`} />
      <Row label={t.gross_earnings} value={`Rs. ${stats.grossEarnings.toLocaleString()}`} />
      <Row label={t.total_advances} value={`Rs. ${stats.totalAdvances.toLocaleString()}`} neg />
      <Row label={t.total_fertilizer} value={`Rs. ${stats.totalFertilizers.toLocaleString()}`} neg />
      <div className="pt-6 border-t-2 border-slate-900">
        <p className="text-xs font-black uppercase text-slate-400">{t.net_payout}</p>
        <p className={`text-3xl font-black ${stats.netTotal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Rs. {stats.netTotal.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const Row = ({ label, value, neg }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50">
    <span className="text-slate-600 font-medium">{label}</span>
    <span className={`font-black ${neg ? 'text-rose-600' : 'text-slate-900'}`}>{neg ? '-' : ''} {value}</span>
  </div>
);

export default ReportsView;
