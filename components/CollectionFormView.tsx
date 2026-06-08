
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Farmer, TeaGrade, AppSettings } from '../types';
import { translations } from '../translations';
import { Scale, ChevronRight, CheckCircle2, Search } from 'lucide-react';

interface Props {
  farmers: Farmer[];
  basePrice: number;
  onAddCollection: (record: any) => void;
  settings: AppSettings;
}

const CollectionFormView: React.FC<Props> = ({ farmers, basePrice, onAddCollection, settings }) => {
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [weight, setWeight] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const t = translations[settings.language];

  const activeFarmers = useMemo(() => farmers.filter(f => f.is_active), [farmers]);

  const filteredFarmers = useMemo(() => {
    if (!searchQuery) return activeFarmers.slice(0, 10);
    return activeFarmers.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.farmer_id_at_center.toString().includes(searchQuery)
    ).slice(0, 10);
  }, [activeFarmers, searchQuery]);

  const selectedFarmer = useMemo(() => 
    farmers.find(f => f.id === selectedFarmerId), 
  [farmers, selectedFarmerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const estimatedPrice = useMemo(() => {
    const w = parseFloat(weight) || 0;
    return (w * basePrice).toFixed(2);
  }, [weight, basePrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer || !weight) return;

    onAddCollection({
      farmer_id: selectedFarmer.id,
      farmer_id_at_center: selectedFarmer.farmer_id_at_center,
      farmer_name: selectedFarmer.name,
      weight: parseFloat(weight),
      grade: TeaGrade.GRADE_A 
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setWeight('');
      setSelectedFarmerId(null);
      setSearchQuery('');
    }, 2000);
  };

  const handleFarmerSelect = (f: Farmer) => {
    setSelectedFarmerId(f.id);
    setSearchQuery(f.name);
    setShowResults(false);
    setTimeout(() => weightInputRef.current?.focus(), 100);
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold text-slate-900">{t.collect}</h1>
        <p className="text-slate-500">Search by Name or Center ID number</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Scale size={32} />
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Digital Weighing Station</p>
              <h3 className="text-xl font-bold">Entry Session</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Rate</p>
            <p className="text-xl font-bold">Rs. {basePrice.toFixed(2)}/kg</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div ref={searchRef} className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.name}</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 transition-all text-lg font-medium"
                  placeholder="Type Name or ID..."
                  value={searchQuery}
                  onFocus={() => setShowResults(true)}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                    setSelectedFarmerId(null);
                  }}
                />
              </div>
              
              {showResults && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {filteredFarmers.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      onClick={() => handleFarmerSelect(f)}
                    >
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{f.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{f.farmer_id_at_center}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={selectedFarmerId ? 'animate-in fade-in slide-in-from-top-2' : 'opacity-40 pointer-events-none'}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.weight} (kg)</label>
              <div className="relative">
                <input 
                  required
                  ref={weightInputRef}
                  type="number" 
                  step="0.1"
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 transition-all text-4xl font-black text-slate-900"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="0.0"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">KG</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">{t.earnings}</span>
              <span className="text-3xl font-black text-emerald-600">Rs. {estimatedPrice}</span>
            </div>
          </div>

          <button 
            disabled={isSuccess || !selectedFarmerId || !weight}
            type="submit"
            className={`w-full py-5 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]'
            } disabled:opacity-50`}
          >
            {isSuccess ? <CheckCircle2 /> : <ChevronRight size={20} />}
            <span>{isSuccess ? 'Success' : t.save_changes}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollectionFormView;
