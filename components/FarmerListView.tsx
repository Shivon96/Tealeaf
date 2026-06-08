
import React, { useState, useMemo } from 'react';
import { Farmer, CollectionRecord, MonthlySummary, TeaGrade, AdvancePayment, FertilizerIssue, AppSettings } from '../types';
import { translations } from '../translations';
import { 
  Search, 
  UserPlus, 
  X, 
  BookOpen, 
  Calendar,
  Printer,
  ArrowDownCircle,
  ArrowUpCircle,
  Phone,
  Hash,
  FileText
} from 'lucide-react';

interface Props {
  farmers: Farmer[];
  collections: CollectionRecord[];
  advances: AdvancePayment[];
  fertilizerIssues: FertilizerIssue[];
  onAddFarmer: (farmer: any) => void;
  onRemoveFarmer: (id: number) => void;
  onToggleStatus: (id: number) => void;
  settings: AppSettings;
}

const FarmerListView: React.FC<Props> = ({ farmers, collections, advances, fertilizerIssues, onAddFarmer, onRemoveFarmer, onToggleStatus, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const t = translations[settings.language];
  
  // Registration Form State
  const [newFarmer, setNewFarmer] = useState({
    name: '',
    phone: '',
    notes: '',
    manualId: ''
  });

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmer_id_at_center.toString().includes(searchTerm)
  );

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId);

  const getFarmerStats = (id: number | null) => {
    if (id === null) return { totalWeight: 0, totalEarned: 0, totalAdvanced: 0, totalFertilizer: 0, netPayout: 0 };
    const fCols = collections.filter(c => c.farmer_id === id);
    const fAdvs = advances.filter(a => a.farmer_id === id);
    const fFert = fertilizerIssues.filter(f => f.farmer_id === id);
    
    const totalEarned = fCols.reduce((acc, c) => acc + c.total_amount, 0);
    const totalAdvanced = fAdvs.reduce((acc, a) => acc + a.amount, 0);
    const totalFertilizer = fFert.reduce((acc, f) => acc + f.total_cost, 0);
    
    return {
      totalWeight: fCols.reduce((acc, c) => acc + c.weight, 0),
      totalEarned,
      totalAdvanced,
      totalFertilizer,
      netPayout: totalEarned - totalAdvanced - totalFertilizer
    };
  };

  const selectedStats = useMemo(() => getFarmerStats(selectedFarmerId), [collections, advances, fertilizerIssues, selectedFarmerId]);

  const monthlyLedger = useMemo(() => {
    if (selectedFarmerId === null) return [];
    const summary: Record<string, MonthlySummary> = {};
    collections.filter(c => c.farmer_id === selectedFarmerId).forEach(c => {
      const date = new Date(c.timestamp);
      const key = `${date.toLocaleString(settings.language === 'si' ? 'si-LK' : 'en-US', { month: 'long' })} ${date.getFullYear()}`;
      if (!summary[key]) summary[key] = { month: date.toLocaleString(settings.language === 'si' ? 'si-LK' : 'en-US', { month: 'long' }), year: date.getFullYear(), totalWeight: 0, totalAmount: 0, count: 0 };
      summary[key].totalWeight += c.weight;
      summary[key].totalAmount += c.total_amount;
      summary[key].count += 1;
    });
    return Object.values(summary).sort((a, b) => new Date(`${b.month} 1, ${b.year}`).getTime() - new Date(`${a.month} 1, ${a.year}`).getTime());
  }, [collections, selectedFarmerId, settings.language]);

  const handlePrint = () => window.print();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFarmer({
      ...newFarmer,
      manualId: newFarmer.manualId ? parseInt(newFarmer.manualId) : null
    });
    setShowRegModal(false);
    setNewFarmer({ name: '', phone: '', notes: '', manualId: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.farmers}</h1>
          <p className="text-slate-500">Manage growers and view detailed settlement ledgers</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handlePrint} className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
            <Printer size={20} />
            <span>{t.print_list}</span>
          </button>
          <button onClick={() => setShowRegModal(true)} className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-colors active:scale-95">
            <UserPlus size={20} />
            <span>{t.register_farmer}</span>
          </button>
        </div>
      </div>

      <div className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ${selectedFarmer ? 'no-print' : ''}`}>
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 no-print">
          <Search className="text-slate-400" size={20} />
          <input type="text" placeholder="Search..." className="flex-1 outline-none text-slate-700 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">{t.id}</th>
                <th className="px-6 py-5">{t.name}</th>
                <th className="px-6 py-5">{t.contact}</th>
                <th className="px-6 py-5 no-print">{t.status}</th>
                <th className="px-6 py-5">{t.balance}</th>
                <th className="px-6 py-5 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarmers.map((f) => {
                const fStats = getFarmerStats(f.id);
                return (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-black text-emerald-600">#{f.farmer_id_at_center}</td>
                    <td className="px-6 py-5 font-bold text-slate-900">{f.name}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">{f.phone}</td>
                    <td className="px-6 py-5 no-print">
                      <button 
                        onClick={() => onToggleStatus(f.id)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-colors ${f.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        {f.is_active ? t.active : t.inactive}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        {fStats.netPayout >= 0 ? <ArrowUpCircle size={14} className="text-emerald-500" /> : <ArrowDownCircle size={14} className="text-rose-500" />}
                        <span className={`font-black ${fStats.netPayout >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Rs. {Math.abs(fStats.netPayout).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right no-print">
                      <button onClick={() => setSelectedFarmerId(f.id)} className="p-3 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-90"><BookOpen size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">{t.register_farmer}</h3>
              <button onClick={() => setShowRegModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t.name}</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      required 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold"
                      value={newFarmer.name}
                      onChange={e => setNewFarmer({...newFarmer, name: e.target.value})}
                      placeholder="Ex: K.A. Perera"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t.contact}</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input 
                        type="tel" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold"
                        value={newFarmer.phone}
                        onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})}
                        placeholder="077..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t.id}</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold"
                        value={newFarmer.manualId}
                        onChange={e => setNewFarmer({...newFarmer, manualId: e.target.value})}
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t.notes}</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <textarea 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium h-24"
                      value={newFarmer.notes}
                      onChange={e => setNewFarmer({...newFarmer, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-2 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all px-8">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFarmer && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-[0] md:rounded-[3rem] w-full max-w-4xl max-h-screen md:max-h-[95vh] overflow-hidden flex flex-col shadow-2xl print-container">
            <div className="bg-emerald-800 p-8 md:p-12 text-white relative no-print">
              <div className="absolute top-8 right-8 flex space-x-3">
                <button onClick={handlePrint} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex items-center space-x-2 active:scale-95">
                  <Printer size={22} />
                  <span className="font-black text-sm uppercase">{t.print_report}</span>
                </button>
                <button onClick={() => setSelectedFarmerId(null)} className="p-4 hover:bg-white/10 rounded-2xl transition-all active:scale-90"><X size={26} /></button>
              </div>
              <div className="mb-10">
                <h2 className="text-4xl font-black mb-1">{selectedFarmer.name}</h2>
                <div className="flex items-center space-x-4 opacity-80 text-xs font-bold uppercase tracking-widest">
                   <span>ID: #{selectedFarmer.farmer_id_at_center}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatBox label={t.weight} value={`${selectedStats.totalWeight.toFixed(1)}kg`} />
                <StatBox label={t.earnings} value={`Rs.${selectedStats.totalEarned.toLocaleString()}`} />
                <StatBox label={t.advances} value={`Rs.${selectedStats.totalAdvanced.toLocaleString()}`} />
                <StatBox label={t.fertilizer} value={`Rs.${selectedStats.totalFertilizer.toLocaleString()}`} />
                <div className="col-span-2 md:col-span-1 bg-white/20 p-5 rounded-[1.5rem] border border-white/10 flex flex-col justify-center">
                  <p className="text-[9px] font-black uppercase text-emerald-100 mb-1">
                    {selectedStats.netPayout >= 0 ? t.net_payout : t.due_amount}
                  </p>
                  <p className={`text-xl font-black ${selectedStats.netPayout < 0 ? 'text-rose-300' : 'text-amber-300'}`}>Rs. {Math.abs(selectedStats.netPayout).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
              <section>
                <div className="flex items-center space-x-2 mb-8 no-print">
                  <Calendar className="text-emerald-600" size={22} />
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.history}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {monthlyLedger.length === 0 ? (
                    <div className="col-span-2 py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 italic text-slate-400">No transactions recorded yet.</div>
                  ) : monthlyLedger.map((m) => (
                    <div key={`${m.month}-${m.year}`} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center transition-all hover:border-emerald-200">
                      <div>
                        <span className="font-black text-slate-900 text-xl block leading-tight">{m.month} {m.year}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{m.count} Shipments</span>
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 text-2xl">Rs. {m.totalAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/10">
    <p className="text-[9px] font-black uppercase text-emerald-100 mb-1">{label}</p>
    <p className="text-xl font-black truncate">{value}</p>
  </div>
);

export default FarmerListView;
