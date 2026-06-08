
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Farmer, FertilizerIssue } from '../types';
import { Sprout, Send, Search, History, LeafyGreen } from 'lucide-react';

interface Props {
  farmers: Farmer[];
  issues: FertilizerIssue[];
  fertilizerTypes: string[];
  onAddIssue: (record: any) => void;
}

const FertilizerView: React.FC<Props> = ({ farmers, issues, fertilizerTypes, onAddIssue }) => {
  // Fix: selectedFarmerId state should accommodate numeric IDs (Farmer.id is number)
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [type, setType] = useState(fertilizerTypes[0] || '');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('2500');
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!type && fertilizerTypes.length > 0) {
      setType(fertilizerTypes[0]);
    }
  }, [fertilizerTypes]);

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
    const q = parseFloat(quantity) || 0;
    const cpu = parseFloat(costPerUnit) || 0;
    
    if (!farmer || q <= 0 || !type) return;

    // Use farmer_id and farmer_name
    onAddIssue({
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      type,
      quantity: q,
      cost_per_unit: cpu,
      total_cost: q * cpu
    });

    setQuantity('');
    setSelectedFarmerId(null);
    setSearchQuery('');
  };

  const handleFarmerSelect = (f: Farmer) => {
    setSelectedFarmerId(f.id);
    setSearchQuery(f.name);
    setShowResults(false);
  };

  const filteredIssuesList = issues.filter(i => 
    i.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // Fix: farmer_id is a number, use toString()
    i.farmer_id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fertilizer Management</h1>
          <p className="text-slate-500">Distribute fertilizers and manage input credit for growers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="bg-emerald-600 p-6 text-white flex items-center space-x-3">
              <Sprout size={24} />
              <h3 className="font-bold text-lg">Distribute Fertilizer</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div ref={searchRef} className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Farmer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-all"
                    placeholder="Search name or ID..."
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
                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                          onClick={() => handleFarmerSelect(f)}
                        >
                          <div>
                            <span className="font-bold text-sm text-slate-900">{f.name}</span>
                            <div className="text-[10px] text-slate-500 font-medium">Farmer ID: {f.id}</div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ID {f.id}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-400 text-xs italic">No active farmers match</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fertilizer Type</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  {fertilizerTypes.length === 0 && <option disabled value="">No types available</option>}
                  {fertilizerTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity (Bags)</label>
                  <input 
                    required
                    type="number"
                    step="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price (Rs.)</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-emerald-600"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(e.target.value)}
                    placeholder="2500"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase">Estimated Total</span>
                  <span className="text-xl font-black text-emerald-700">
                    Rs. {(parseFloat(quantity) || 0) * (parseFloat(costPerUnit) || 0)}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!selectedFarmerId || !quantity || fertilizerTypes.length === 0}
                className="w-full py-4 bg-emerald-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all disabled:opacity-50"
              >
                <span>Record Distribution</span>
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
                <h3 className="font-bold">Distribution Logs</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Filter by farmer..."
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
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4 text-right">Total Debt</th>
                    <th className="px-6 py-4 text-right">Issued Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssuesList.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No fertilizer records found</td></tr>
                  ) : (
                    filteredIssuesList.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{i.farmer_name}</p>
                          <p className="text-[10px] text-emerald-600 font-black uppercase">ID: {i.farmer_id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <LeafyGreen size={14} className="text-emerald-500" />
                            <span className="font-medium text-slate-700">{i.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{i.quantity} bags @ Rs. {i.cost_per_unit}/ea</p>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600">Rs. {i.total_cost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-slate-400 text-xs">{new Date(i.timestamp).toLocaleDateString()}</td>
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

export default FertilizerView;
