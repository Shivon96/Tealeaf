
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
  const [modalTab, setModalTab] = useState<'overview' | 'collections' | 'advances' | 'fertilizers'>('overview');
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

  const farmerCollections = useMemo(() => {
    if (!selectedFarmer) return [];
    return collections.filter(c => c.farmer_id === selectedFarmer.id || (selectedFarmer.farmer_id_at_center && c.farmer_id_at_center === selectedFarmer.farmer_id_at_center));
  }, [collections, selectedFarmer]);

  const farmerAdvances = useMemo(() => {
    if (!selectedFarmer) return [];
    return advances.filter(a => a.farmer_id === selectedFarmer.id || (selectedFarmer.farmer_id_at_center && a.farmer_id_at_center === selectedFarmer.farmer_id_at_center));
  }, [advances, selectedFarmer]);

  const farmerFertilizers = useMemo(() => {
    if (!selectedFarmer) return [];
    return fertilizerIssues.filter(f => f.farmer_id === selectedFarmer.id || (selectedFarmer.farmer_id_at_center && f.farmer_id_at_center === selectedFarmer.farmer_id_at_center));
  }, [fertilizerIssues, selectedFarmer]);

  const getFarmerStats = (id: number | null) => {
    if (id === null) return { totalWeight: 0, totalEarned: 0, totalAdvanced: 0, totalFertilizer: 0, netPayout: 0 };
    const currFarmer = farmers.find(x => x.id === id);
    const centerId = currFarmer?.farmer_id_at_center;

    const fCols = collections.filter(c => c.farmer_id === id || (centerId && c.farmer_id_at_center === centerId));
    const fAdvs = advances.filter(a => a.farmer_id === id || (centerId && a.farmer_id_at_center === centerId));
    const fFert = fertilizerIssues.filter(f => f.farmer_id === id || (centerId && f.farmer_id_at_center === centerId));
    
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm print:relative print:bg-white print:p-0">
          <div className="bg-white rounded-[0] md:rounded-[3rem] w-full max-w-4xl max-h-screen md:max-h-[95vh] overflow-hidden flex flex-col shadow-2xl print-container print:shadow-none print:max-h-none print:overflow-visible">
            
            {/* SCREEN-ONLY UPPER HEADER */}
            <div className="bg-emerald-800 p-8 md:p-12 text-white relative no-print shrink-0">
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
                   {selectedFarmer.phone && <span>• {selectedFarmer.phone}</span>}
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

            {/* SCREEN-ONLY TABS */}
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex flex-wrap gap-2 no-print shrink-0">
              <button 
                onClick={() => setModalTab('overview')} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${modalTab === 'overview' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Monthly Summary
              </button>
              <button 
                onClick={() => setModalTab('collections')} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${modalTab === 'collections' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Leaf Intakes ({farmerCollections.length})
              </button>
              <button 
                onClick={() => setModalTab('advances')} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${modalTab === 'advances' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Cash Advances ({farmerAdvances.length})
              </button>
              <button 
                onClick={() => setModalTab('fertilizers')} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${modalTab === 'fertilizers' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Fertilizers Issued ({farmerFertilizers.length})
              </button>
            </div>

            {/* SCREEN-ONLY TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white no-print">
              
              {/* OVERVIEW TAB */}
              {modalTab === 'overview' && (
                <section className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-emerald-600" size={22} />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Monthly Performance</h3>
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
              )}

              {/* COLLECTIONS TAB */}
              {modalTab === 'collections' && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Leaf Collections Intake Log</h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-4 border-b border-slate-100">Date/Time</th>
                          <th className="p-4 border-b border-slate-100">Grade</th>
                          <th className="p-4 border-b border-slate-100 text-right">Weight</th>
                          <th className="p-4 border-b border-slate-100 text-right">Price/kg</th>
                          <th className="p-4 border-b border-slate-100 text-right">Gross Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {farmerCollections.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No collections found.</td>
                          </tr>
                        ) : farmerCollections.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-medium text-slate-500 font-mono text-xs">{new Date(c.timestamp).toLocaleString()}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tight">
                                {c.grade}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-slate-700">{c.weight.toFixed(1)} kg</td>
                            <td className="p-4 text-right text-slate-500 font-mono text-xs">Rs. {c.price_per_kg}</td>
                            <td className="p-4 text-right font-black text-emerald-600 font-mono font-bold">Rs. {c.total_amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* ADVANCES TAB */}
              {modalTab === 'advances' && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Cash Advances Deductions</h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-4 border-b border-slate-100">Date/Time</th>
                          <th className="p-4 border-b border-slate-100">Description / Reason</th>
                          <th className="p-4 border-b border-slate-100 text-right">Paid Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {farmerAdvances.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-400 italic">No advance payments recorded.</td>
                          </tr>
                        ) : farmerAdvances.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-medium text-slate-500 font-mono text-xs">{new Date(a.timestamp).toLocaleString()}</td>
                            <td className="p-4 font-bold text-slate-700">{a.reason || "Festival Advance"}</td>
                            <td className="p-4 text-right font-black text-rose-600 font-mono font-bold">Rs. {a.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* FERTILIZERS TAB */}
              {modalTab === 'fertilizers' && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Fertilizer Handouts Issues</h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-4 border-b border-slate-100">Date/Time</th>
                          <th className="p-4 border-b border-slate-100">Fertilizer Type</th>
                          <th className="p-4 border-b border-slate-100 text-right">Quantity</th>
                          <th className="p-4 border-b border-slate-100 text-right">Cost Per Bag</th>
                          <th className="p-4 border-b border-slate-100 text-right">Total Debit Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {farmerFertilizers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No fertilizer issuances found.</td>
                          </tr>
                        ) : farmerFertilizers.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-medium text-slate-500 font-mono text-xs">{new Date(f.timestamp).toLocaleString()}</td>
                            <td className="p-4 font-bold text-slate-700">{f.type}</td>
                            <td className="p-4 text-right font-medium text-slate-600">{f.quantity} bags</td>
                            <td className="p-4 text-right text-slate-400 font-mono text-xs">Rs. {f.cost_per_unit.toLocaleString()}</td>
                            <td className="p-4 text-right font-black text-rose-600 font-mono font-bold">Rs. {f.total_cost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>

            {/* ====== EXTREMELY BEAUTIFUL PRINT-ONLY DOCUMENT LAYOUT ====== */}
            <div className="hidden print:block w-full p-10 bg-white text-slate-800 font-sans text-xs leading-relaxed print-document border border-slate-400 rounded-none shadow-none">
              
              {/* BRAND HEADER */}
              <div className="border-b-4 border-double border-slate-800 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">{settings.appName}</h1>
                  <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5 tracking-widest">Tea Leaves Collection Center</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Registration: Tea Board Sri Lanka • Ref #TL10-{selectedFarmer.farmer_id_at_center}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-white text-[10px] font-black tracking-widest px-3 py-1 uppercase rounded-sm inline-block">Farmer Account Ledger</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-2">Statement Generated On: {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* FARMER METADATA CARD */}
              <div className="grid grid-cols-2 gap-8 bg-slate-50 p-5 border border-slate-200 rounded-xl mb-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Grower Profile Details</p>
                  <h2 className="text-base font-black text-slate-900 mt-1">{selectedFarmer.name}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1">Phone Number: {selectedFarmer.phone || "Not Specified"}</p>
                  {selectedFarmer.notes && <p className="text-xs text-slate-500 italic mt-2">Registered Notes: {selectedFarmer.notes}</p>}
                </div>
                <div className="border-l border-slate-200 pl-6 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Farmer Center ID:</span>
                    <span className="font-extrabold text-slate-900">#{selectedFarmer.farmer_id_at_center}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Joined Date:</span>
                    <span className="font-semibold text-slate-700">{new Date(selectedFarmer.joined_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Account Status:</span>
                    <span className="font-black text-emerald-600 uppercase text-[10px]">{selectedFarmer.is_active ? "Active" : "Suspended"}</span>
                  </div>
                </div>
              </div>

              {/* SUMMARY BALANCE BOX SHEET */}
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Overall Balance Sheet</h3>
              <div className="grid grid-cols-5 border border-slate-300 rounded-lg overflow-hidden divide-x divide-slate-300 text-center mb-8">
                <div className="p-3 bg-slate-50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Weight</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">{selectedStats.totalWeight.toFixed(1)} kg</span>
                </div>
                <div className="p-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gross Earnings +</span>
                  <span className="text-sm font-black text-emerald-700 block mt-0.5 font-bold">Rs. {selectedStats.totalEarned.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Cash Advances -</span>
                  <span className="text-sm font-black text-rose-700 block mt-0.5 font-bold">Rs. {selectedStats.totalAdvanced.toLocaleString()}</span>
                </div>
                <div className="p-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fertilizers Qty -</span>
                  <span className="text-sm font-black text-rose-700 block mt-0.5 font-bold">Rs. {selectedStats.totalFertilizer.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-800 text-white font-bold">
                  <span className="text-[9px] font-black text-emerald-200 uppercase tracking-wider block">Net Due Payout</span>
                  <span className="text-base font-black tracking-tight block font-bold">Rs. {selectedStats.netPayout.toLocaleString()}</span>
                </div>
              </div>

              {/* SECTION 1: DETAILED LEAF INTAKES */}
              <div className="mb-8 break-inside-avoid">
                <div className="flex justify-between items-center border-b border-slate-300 pb-1.5 mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-bold">1. Detailed Leaf Intakes (Collections Log)</h4>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">{farmerCollections.length} entries matches</span>
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                      <th className="p-2">Intake Date / Time</th>
                      <th className="p-2">Leaf Grade</th>
                      <th className="p-2 text-right">Delivered Weight</th>
                      <th className="p-2 text-right">Price rate Per kg</th>
                      <th className="p-2 text-right">Gross Earnings (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerCollections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">No tea leaf intake shipments logs found.</td>
                      </tr>
                    ) : farmerCollections.map((c) => (
                      <tr key={c.id} className="border-b border-slate-200 font-medium text-slate-700">
                        <td className="p-2 font-mono text-[9px]">{new Date(c.timestamp).toLocaleString()}</td>
                        <td className="p-2 uppercase font-bold text-slate-900">{c.grade}</td>
                        <td className="p-2 text-right">{c.weight.toFixed(1)} kg</td>
                        <td className="p-2 text-right font-mono text-[9px]">Rs. {c.price_per_kg}</td>
                        <td className="p-2 text-right font-extrabold text-slate-900 font-mono font-bold">Rs. {c.total_amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
                      <td colSpan={2} className="p-2 text-left uppercase">Total Collections Summary</td>
                      <td className="p-2 text-right">{selectedStats.totalWeight.toFixed(1)} kg</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right font-black text-slate-900 font-mono font-bold">Rs. {selectedStats.totalEarned.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: DETAILED CASH ADVANCES */}
              <div className="mb-8 break-inside-avoid">
                <div className="flex justify-between items-center border-b border-slate-300 pb-1.5 mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-bold">2. Detailed Cash Advances Paid Deductions</h4>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">{farmerAdvances.length} payments</span>
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                      <th className="p-2">Disbursement Date / Time</th>
                      <th className="p-2">Payment Description / Reason</th>
                      <th className="p-2 text-right">Debit Payment (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerAdvances.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400 italic">No advance deductions paid on this cycle.</td>
                      </tr>
                    ) : farmerAdvances.map((a) => (
                      <tr key={a.id} className="border-b border-slate-200 font-medium text-slate-700">
                        <td className="p-2 font-mono text-[9px]">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="p-2 text-slate-900">{a.reason || "Monthly festival payment"}</td>
                        <td className="p-2 text-right font-extrabold text-slate-900 font-mono font-bold">Rs. {a.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
                      <td colSpan={2} className="p-2 text-left uppercase">Total Deducted Advances</td>
                      <td className="p-2 text-right font-black text-slate-900 font-mono font-bold">Rs. {selectedStats.totalAdvanced.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 3: DETAILED FERTILIZER ALLOTMENTS */}
              <div className="mb-8 break-inside-avoid">
                <div className="flex justify-between items-center border-b border-slate-300 pb-1.5 mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-bold">3. Detailed Fertilizer Handouts Allocated</h4>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">{farmerFertilizers.length} issues</span>
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                      <th className="p-2">Issuance Date / Time</th>
                      <th className="p-2">Fertilizer Item Type</th>
                      <th className="p-2 text-right">Qty (Bags)</th>
                      <th className="p-2 text-right">Rate Per Bag</th>
                      <th className="p-2 text-right">Debit Balance (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerFertilizers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">No fertilizer issues recorded.</td>
                      </tr>
                    ) : farmerFertilizers.map((f) => (
                      <tr key={f.id} className="border-b border-slate-200 font-medium text-slate-700">
                        <td className="p-2 font-mono text-[9px]">{new Date(f.timestamp).toLocaleString()}</td>
                        <td className="p-2 font-bold text-slate-900">{f.type}</td>
                        <td className="p-2 text-right">{f.quantity} bags</td>
                        <td className="p-2 text-right font-mono text-[9px]">Rs. {f.cost_per_unit.toLocaleString()}</td>
                        <td className="p-2 text-right font-extrabold text-slate-900 font-mono font-bold">Rs. {f.total_cost.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
                      <td colSpan={4} className="p-2 text-left uppercase font-bold">Total Fertilizer Debt Costs</td>
                      <td className="p-2 text-right font-black text-slate-900 font-mono font-bold">Rs. {selectedStats.totalFertilizer.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AUTHORITATIVE SIGN-OFF AREA FOR PRINT */}
              <div className="pt-10 mt-12 border-t border-dashed border-slate-400 grid grid-cols-3 gap-10 text-center text-[10px] break-inside-avoid">
                <div className="space-y-12">
                  <div className="h-0.5 w-full bg-slate-300"></div>
                  <p className="font-extrabold text-slate-700">Prepared By Manager</p>
                  <p className="text-[9px] text-slate-400">Date: ____/____/20___</p>
                </div>
                <div className="space-y-12">
                  <div className="h-0.5 w-full bg-slate-300"></div>
                  <p className="font-extrabold text-slate-700">Farmer Signature Acknowledged</p>
                  <p className="text-[9px] text-slate-400">Date: ____/____/20___</p>
                </div>
                <div className="space-y-12">
                  <div className="h-0.5 w-full bg-slate-300"></div>
                  <p className="font-extrabold text-slate-700">Verified & Approved Authorized</p>
                  <p className="text-[9px] text-slate-400">Official Stamp Seal</p>
                </div>
              </div>

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
