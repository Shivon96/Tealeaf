
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Farmer, AdvancePayment } from '../types';
import { WalletCards, Send, Search, History, Banknote, ChevronRight } from 'lucide-react';

interface Props {
  farmers: Farmer[];
  advances: AdvancePayment[];
  onAddAdvance: (record: any) => void;
}

const AdvancePaymentsView: React.FC<Props> = ({ farmers, advances, onAddAdvance }) => {
  // Fix: selectedFarmerId state should accommodate numeric IDs (Farmer.id is number)
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Use is_active
  const activeFarmers = useMemo(() => farmers.filter(f => f.is_active), [farmers]);

  const filteredFarmers = useMemo(() => {
    if (!searchQuery) return activeFarmers.slice(0, 10);
    return activeFarmers.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      // Fix: id is a number, use toString() before comparison
      f.id.toString().includes(searchQuery)
    ).slice(0, 10);
  }, [activeFarmers, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.id === selectedFarmerId);
    if (!farmer || !amount) return;

    // Use farmer_id and farmer_name
    onAddAdvance({
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      amount: parseFloat(amount),
      reason: reason || 'Cash Advance'
    });

    setAmount('');
    setReason('');
    setSelectedFarmerId(null);
    setSearchQuery('');
  };

  const handleFarmerSelect = (f: Farmer) => {
    setSelectedFarmerId(f.id);
    setSearchQuery(f.name);
    setShowResults(false);
  };

  const filteredAdvancesList = advances.filter(a => 
    a.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // Fix: farmer_id is a number, use toString()
    a.farmer_id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advanced Payments</h1>
          <p className="text-slate-500">Record cash advances and credit given to farmers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="bg-amber-500 p-6 text-white flex items-center space-x-3">
              <WalletCards size={24} />
              <h3 className="font-bold text-lg">New Advance Entry</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div ref={searchRef} className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Farmer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition-all"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onFocus={() => setShowResults(true)}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                  />
                </div>
                {showResults && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {filteredFarmers.length > 0 ? (
                      filteredFarmers.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          onClick={() => handleFarmerSelect(f)}
                        >
                          <div>
                            <span className="font-bold text-sm text-slate-900">{f.name}</span>
                            <div className="text-[10px] text-slate-500 font-medium">Farmer ID: {f.id}</div>
                          </div>
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">#{f.id}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-400 text-xs italic">No matching active farmers</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                  <input 
                    required
                    type="number"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 font-bold text-emerald-600 text-lg"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reason / Note</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Fertilizer, School Fees"
                />
              </div>
              <button 
                type="submit"
                disabled={!selectedFarmerId || !amount}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all disabled:opacity-50"
              >
                <span>Process Advance</span>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-700">
                <History size={18} />
                <h3 className="font-bold">Recent Advances</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Search history..."
                  className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Farmer</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdvancesList.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No advanced payment records found</td></tr>
                  ) : (
                    filteredAdvancesList.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{a.farmer_name}</p>
                          <p className="text-[10px] text-emerald-600 font-black uppercase">ID: {a.farmer_id}</p>
                        </td>
                        <td className="px-6 py-4 italic text-slate-500">{a.reason}</td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600">Rs. {a.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-slate-400 text-xs">{new Date(a.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancePaymentsView;
