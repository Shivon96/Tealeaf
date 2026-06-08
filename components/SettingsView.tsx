
import React, { useState } from 'react';
import { AppSettings, Language } from '../types';
import { translations } from '../translations';
import { Settings, Save, Layout, ShieldCheck, CheckCircle2, Banknote, Sprout, Plus, Trash2, Mail, Languages } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<AppSettings>({
    ...settings
  });
  const [newType, setNewType] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[settings.language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...formData
    });
    
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const addFertilizerType = () => {
    if (newType.trim() && !formData.fertilizerTypes.includes(newType.trim())) {
      setFormData({
        ...formData,
        fertilizerTypes: [...formData.fertilizerTypes, newType.trim()]
      });
      setNewType('');
    }
  };

  const removeFertilizerType = (typeToRemove: string) => {
    setFormData({
      ...formData,
      fertilizerTypes: formData.fertilizerTypes.filter(t => t !== typeToRemove)
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t.settings}</h1>
        <p className="text-slate-500">Configure your center preferences and language.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Languages size={20} className="text-emerald-600" />
              <span>{t.language}</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">{t.select_language}</p>
          </div>
          
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex space-x-4">
             <button 
                type="button"
                onClick={() => setFormData({ ...formData, language: 'en' })}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${formData.language === 'en' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
             >
               English
             </button>
             <button 
                type="button"
                onClick={() => setFormData({ ...formData, language: 'si' })}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${formData.language === 'si' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
             >
               සිංහල (Sinhala)
             </button>
          </div>
        </div>

        {/* Identity & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Layout size={20} className="text-emerald-600" />
              <span>Center Identity</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">Set the public name of your collection center and current market rates.</p>
          </div>
          
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Center Display Name</label>
              <input 
                required
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-800"
                value={formData.appName}
                onChange={e => setFormData({ ...formData, appName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Buying Rate per KG (LKR)</label>
              <div className="relative">
                <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-emerald-600"
                  value={formData.basePricePerKg}
                  onChange={e => setFormData({ ...formData, basePricePerKg: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fertilizer Distribution Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sprout size={20} className="text-emerald-600" />
              <span>Available Inventory</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">Manage fertilizer types distributed to farmers.</p>
          </div>
          
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex space-x-2">
              <input 
                type="text"
                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium"
                placeholder="Add new fertilizer type..."
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFertilizerType())}
              />
              <button 
                type="button"
                onClick={addFertilizerType}
                className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.fertilizerTypes.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">No specific fertilizers configured.</p>
              ) : (
                formData.fertilizerTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="font-medium text-slate-700">{type}</span>
                    <button 
                      type="button"
                      onClick={() => removeFertilizerType(type)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          {isSuccess && (
            <div className="flex items-center space-x-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 size={18} />
              <span>Profile updated!</span>
            </div>
          )}
          <button 
            type="submit"
            className="flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-[0.98]"
          >
            <Save size={20} />
            <span>{t.save_changes}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
