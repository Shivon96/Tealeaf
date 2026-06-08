
import React, { useState } from 'react';
import { CollectionRecord, TeaGrade } from '../types';
import { Download, Filter, FileText, Printer, Search, Calendar } from 'lucide-react';
import { exportCollectionsToExcel } from '../lib/exportUtils';

interface Props {
  collections: CollectionRecord[];
}

const HistoryView: React.FC<Props> = ({ collections }) => {
  const [filterTerm, setFilterTerm] = useState('');

  const getGradeColor = (grade: TeaGrade) => {
    switch (grade) {
      case TeaGrade.SUPER_FINE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case TeaGrade.GRADE_A: return 'bg-teal-100 text-teal-700 border-teal-200';
      case TeaGrade.GRADE_B: return 'bg-amber-100 text-amber-700 border-amber-200';
      case TeaGrade.GRADE_C: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredCollections = collections.filter(c => 
    c.farmer_name.toLowerCase().includes(filterTerm.toLowerCase()) ||
    c.timestamp.includes(filterTerm) ||
    c.farmer_id_at_center.toString() === filterTerm
  );

  const handlePrint = () => {
    window.print();
  };

  const totalWeight = filteredCollections.reduce((acc, c) => acc + c.weight, 0);
  const totalValue = filteredCollections.reduce((acc, c) => acc + c.total_amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collection History</h1>
          <p className="text-slate-500">Search by name, date (YYYY-MM-DD), or ID</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search history..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none w-full md:w-64 transition-all"
              value={filterTerm}
              onChange={e => setFilterTerm(e.target.value)}
            />
          </div>
          <button onClick={() => exportCollectionsToExcel(filteredCollections)} className="flex items-center space-x-2 bg-white border-2 border-emerald-600 text-emerald-700 px-4 py-3 rounded-xl font-bold hover:bg-emerald-50 active:scale-95 transition-all" title="Export current search results to Microsoft Excel">
            <Download size={20} className="text-emerald-600" />
            <span className="hidden md:inline text-xs lg:text-sm">Excel Export</span>
          </button>
          <button onClick={handlePrint} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">
            <Printer size={20} />
            <span className="hidden md:inline text-xs lg:text-sm">Print Report</span>
          </button>
        </div>
      </div>

      {/* Professional Printed Report Header */}
      <div className="hidden print:block border-b-4 border-black pb-6 mb-8">
        <h1 className="text-4xl font-black uppercase">Tea Collection Intake Report</h1>
        <div className="flex justify-between font-bold text-slate-600 mt-4 text-sm">
          <div>
            <p>Filter Applied: <span className="text-black">{filterTerm || 'None (Full History)'}</span></p>
            <p>Center Identity: TeaLeaf Pro Managed Center</p>
          </div>
          <div className="text-right">
            <p>Generation Date: {new Date().toLocaleString()}</p>
            <p>Total Records: {filteredCollections.length}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 border rounded-xl">
            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total Intake Weight</p>
            <p className="text-2xl font-black">{totalWeight.toFixed(2)} kg</p>
          </div>
          <div className="bg-slate-50 p-4 border rounded-xl">
            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total Disbursed Value</p>
            <p className="text-2xl font-black">Rs. {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Ref</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Farmer Name</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Amount (LKR)</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No records found matching your search.</td>
                </tr>
              ) : (
                filteredCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-300">#{c.id.toString().slice(-4)}</td>
                    <td className="px-6 py-4 font-black text-emerald-600">#{c.farmer_id_at_center}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{c.farmer_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{c.weight.toFixed(1)}kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getGradeColor(c.grade)}`}>
                        {c.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">Rs.{c.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-[10px]">
                      {new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="hidden print:block text-center text-[10px] text-slate-400 pt-20">
        <p>End of Collection Intake Report</p>
        <p>© TeaLeaf Pro Management Suite</p>
      </div>
    </div>
  );
};

export default HistoryView;
