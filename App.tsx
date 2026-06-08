
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  History, 
  Leaf, 
  Menu, 
  WalletCards,
  Sprout,
  Settings,
  LogOut,
  Loader2,
  Download,
  BarChart3,
  Mail,
  RefreshCw
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { CollectionRecord, Farmer, AdvancePayment, FertilizerIssue, AppSettings, Language, Inquiry } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { translations } from './translations';
import DashboardView from './components/DashboardView';
import FarmerListView from './components/FarmerListView';
import CollectionFormView from './components/CollectionFormView';
import HistoryView from './components/HistoryView';
import AdvancePaymentsView from './components/AdvancePaymentsView';
import FertilizerView from './components/FertilizerView';
import SettingsView from './components/SettingsView';
import ReportsView from './components/ReportsView';
import InquiryView from './components/InquiryView';
import SupabaseLoginView from './components/SupabaseLoginView';

const MOCK_SESSION = {
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'local-manager@tealeaf.pro'
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(MOCK_SESSION);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'farmers' | 'collect' | 'history' | 'advances' | 'fertilizer' | 'settings' | 'reports' | 'inquiries'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [fertilizerIssues, setFertilizerIssues] = useState<FertilizerIssue[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS, language: 'en' });

  const t = translations[settings.language];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    fetchUserData();
  }, []);

  const loadFromLocalStorage = () => {
    let savedSettings = localStorage.getItem('tealeaf_settings');
    let loadedSettings = savedSettings ? JSON.parse(savedSettings) : null;
    if (!loadedSettings) {
      loadedSettings = {
        appName: 'TeaLeaf Pro Center',
        basePricePerKg: 350,
        fertilizerTypes: ['T-65 Urea Blend', 'K-MAX Potassium', 'Organic Tea Compost'],
        language: 'en'
      };
      localStorage.setItem('tealeaf_settings', JSON.stringify(loadedSettings));
    }
    setSettings(loadedSettings);

    const getPastDateStr = (daysAgo: number, hour = 9) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, 30, 0, 0);
      return d.toISOString();
    };

    let savedFarmers = localStorage.getItem('tealeaf_farmers');
    let loadedFarmers = savedFarmers ? JSON.parse(savedFarmers) : null;
    if (!loadedFarmers) {
      loadedFarmers = [
        { id: 101, user_id: '00000000-0000-0000-0000-000000000000', farmer_id_at_center: 1, name: "Amara Silva", phone: "0771234567", joined_at: getPastDateStr(100), notes: "Plentiful grower in Upper Division", is_active: true },
        { id: 102, user_id: '00000000-0000-0000-0000-000000000000', farmer_id_at_center: 2, name: "Kasun Perera", phone: "0719876543", joined_at: getPastDateStr(90), notes: "High quality fine leaves", is_active: true },
        { id: 103, user_id: '00000000-0000-0000-0000-000000000000', farmer_id_at_center: 3, name: "Nimal Jayasinghe", phone: "0725556677", joined_at: getPastDateStr(80), notes: "Regular deliveries, preferred Grade A", is_active: true },
        { id: 104, user_id: '00000000-0000-0000-0000-000000000000', farmer_id_at_center: 4, name: "Sanduni Fernando", phone: "0763334455", joined_at: getPastDateStr(60), notes: "New organic fields", is_active: true }
      ];
      localStorage.setItem('tealeaf_farmers', JSON.stringify(loadedFarmers));
    }
    setFarmers(loadedFarmers);

    let savedCollections = localStorage.getItem('tealeaf_collections');
    let loadedCollections = savedCollections ? JSON.parse(savedCollections) : null;
    if (!loadedCollections) {
      loadedCollections = [
        { id: 201, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 101, farmer_id_at_center: 1, farmer_name: "Amara Silva", weight: 45.5, grade: "Super Fine", price_per_kg: 350, total_amount: 45.5 * 350, timestamp: getPastDateStr(0, 8) },
        { id: 202, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 102, farmer_id_at_center: 2, farmer_name: "Kasun Perera", weight: 32.0, grade: "Grade A", price_per_kg: 350, total_amount: 32.0 * 350, timestamp: getPastDateStr(0, 10) },
        { id: 203, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 103, farmer_id_at_center: 3, farmer_name: "Nimal Jayasinghe", weight: 58.2, grade: "Super Fine", price_per_kg: 350, total_amount: 58.2 * 350, timestamp: getPastDateStr(0, 11) },
        { id: 204, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 101, farmer_id_at_center: 1, farmer_name: "Amara Silva", weight: 42.0, grade: "Super Fine", price_per_kg: 350, total_amount: 42.0 * 350, timestamp: getPastDateStr(1, 9) },
        { id: 205, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 104, farmer_id_at_center: 4, farmer_name: "Sanduni Fernando", weight: 28.5, grade: "Grade B", price_per_kg: 350, total_amount: 28.5 * 350, timestamp: getPastDateStr(1, 14) },
        { id: 206, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 102, farmer_id_at_center: 2, farmer_name: "Kasun Perera", weight: 35.0, grade: "Grade A", price_per_kg: 350, total_amount: 35.0 * 350, timestamp: getPastDateStr(2, 9) },
        { id: 207, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 103, farmer_id_at_center: 3, farmer_name: "Nimal Jayasinghe", weight: 61.0, grade: "Super Fine", price_per_kg: 350, total_amount: 61.0 * 350, timestamp: getPastDateStr(2, 11) },
        { id: 208, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 101, farmer_id_at_center: 1, farmer_name: "Amara Silva", weight: 48.0, grade: "Super Fine", price_per_kg: 350, total_amount: 48.0 * 350, timestamp: getPastDateStr(3) },
        { id: 209, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 104, farmer_id_at_center: 4, farmer_name: "Sanduni Fernando", weight: 30.0, grade: "Grade B", price_per_kg: 350, total_amount: 30.0 * 350, timestamp: getPastDateStr(3) },
        { id: 210, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 102, farmer_id_at_center: 2, farmer_name: "Kasun Perera", weight: 31.5, grade: "Grade A", price_per_kg: 350, total_amount: 31.5 * 350, timestamp: getPastDateStr(4) },
        { id: 211, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 103, farmer_id_at_center: 3, farmer_name: "Nimal Jayasinghe", weight: 55.4, grade: "Super Fine", price_per_kg: 350, total_amount: 55.4 * 350, timestamp: getPastDateStr(4) },
        { id: 212, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 101, farmer_id_at_center: 1, farmer_name: "Amara Silva", weight: 44.0, grade: "Super Fine", price_per_kg: 350, total_amount: 44.0 * 350, timestamp: getPastDateStr(5) },
        { id: 213, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 102, farmer_id_at_center: 2, farmer_name: "Kasun Perera", weight: 34.0, grade: "Grade A", price_per_kg: 350, total_amount: 34.0 * 350, timestamp: getPastDateStr(5) },
        { id: 214, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 103, farmer_id_at_center: 3, farmer_name: "Nimal Jayasinghe", weight: 59.0, grade: "Super Fine", price_per_kg: 350, total_amount: 59.0 * 350, timestamp: getPastDateStr(6) },
        { id: 215, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 104, farmer_id_at_center: 4, farmer_name: "Sanduni Fernando", weight: 27.0, grade: "Grade B", price_per_kg: 350, total_amount: 27.0 * 350, timestamp: getPastDateStr(6) }
      ];
      localStorage.setItem('tealeaf_collections', JSON.stringify(loadedCollections));
    }
    setCollections(loadedCollections);

    let savedAdvances = localStorage.getItem('tealeaf_advances');
    let loadedAdvances = savedAdvances ? JSON.parse(savedAdvances) : null;
    if (!loadedAdvances) {
      loadedAdvances = [
        { id: 301, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 101, farmer_id_at_center: 1, farmer_name: "Amara Silva", amount: 5000, reason: "Festival advance", timestamp: getPastDateStr(2) },
        { id: 302, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 103, farmer_id_at_center: 3, farmer_name: "Nimal Jayasinghe", amount: 8000, reason: "Urgent medical expense", timestamp: getPastDateStr(5) }
      ];
      localStorage.setItem('tealeaf_advances', JSON.stringify(loadedAdvances));
    }
    setAdvances(loadedAdvances);

    let savedFertilizers = localStorage.getItem('tealeaf_fertilizers');
    let loadedFertilizers = savedFertilizers ? JSON.parse(savedFertilizers) : null;
    if (!loadedFertilizers) {
      loadedFertilizers = [
        { id: 401, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 102, farmer_id_at_center: 2, farmer_name: "Kasun Perera", type: "T-65 Urea Blend", quantity: 2, cost_per_unit: 2500, total_cost: 5000, timestamp: getPastDateStr(3) },
        { id: 402, user_id: '00000000-0000-0000-0000-000000000000', farmer_id: 104, farmer_id_at_center: 4, farmer_name: "Sanduni Fernando", type: "Organic Tea Compost", quantity: 5, cost_per_unit: 1200, total_cost: 6000, timestamp: getPastDateStr(4) }
      ];
      localStorage.setItem('tealeaf_fertilizers', JSON.stringify(loadedFertilizers));
    }
    setFertilizerIssues(loadedFertilizers);

    let savedInquiries = localStorage.getItem('tealeaf_inquiries');
    let loadedInquiries = savedInquiries ? JSON.parse(savedInquiries) : null;
    if (!loadedInquiries) {
      loadedInquiries = [
        { id: '1001', user_id: '00000000-0000-0000-0000-000000000000', name: "Amara Silva", email: "amara@gmail.com", subject: "Request for higher bag limit", message: "Hi Center, can I request to bring 5 extra bags next Monday?", status: "unread", timestamp: getPastDateStr(1) },
        { id: '1002', user_id: '00000000-0000-0000-0000-000000000000', name: "Nimal Jayasinghe", email: "nimal@test.com", subject: "Fertilizer price query", message: "When will the next shipment of T-65 arrive?", status: "read", timestamp: getPastDateStr(3) }
      ];
      localStorage.setItem('tealeaf_inquiries', JSON.stringify(loadedInquiries));
    }
    setInquiries(loadedInquiries);
  };

  const fetchUserData = async () => {
    setLoading(true);
    const userId = session.user.id;

    if (userId === '00000000-0000-0000-0000-000000000000') {
      loadFromLocalStorage();
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        setSettings({
          appName: profile.app_name || 'Tea Center',
          basePricePerKg: profile.base_price_per_kg || 350,
          fertilizerTypes: profile.fertilizer_types || DEFAULT_SETTINGS.fertilizerTypes,
          language: (profile.language as Language) || 'en'
        });
      }

      const [
        { data: farmersData },
        { data: collectionsData },
        { data: advancesData },
        { data: fertilizersData },
        { data: inquiriesData }
      ] = await Promise.all([
        supabase.from('farmers').select('*').eq('user_id', userId).order('farmer_id_at_center', { ascending: true }),
        supabase.from('collections').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
        supabase.from('advances').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
        supabase.from('fertilizers').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
        supabase.from('inquiries').select('*').eq('user_id', userId).order('timestamp', { ascending: false })
      ]);

      if (farmersData) setFarmers(farmersData);
      if (collectionsData) setCollections(collectionsData);
      if (advancesData) setAdvances(advancesData);
      if (fertilizersData) setFertilizerIssues(fertilizersData);
      if (inquiriesData) setInquiries(inquiriesData);
    } catch (err) {
      console.error("Error loading center data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addFarmer = async (newFarmer: any) => {
    const maxId = farmers.length > 0 ? Math.max(...farmers.map(f => f.farmer_id_at_center)) : 0;
    const farmerIdAtCenter = newFarmer.manualId || (maxId + 1);

    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const newRec: Farmer = {
        id: Math.floor(Math.random() * 1000000),
        user_id: session.user.id,
        farmer_id_at_center: farmerIdAtCenter,
        name: newFarmer.name,
        phone: newFarmer.phone,
        joined_at: new Date().toISOString(),
        notes: newFarmer.notes,
        is_active: true
      };
      const updated = [...farmers, newRec].sort((a,b) => a.farmer_id_at_center - b.farmer_id_at_center);
      setFarmers(updated);
      localStorage.setItem('tealeaf_farmers', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase.from('farmers').insert([{ 
      name: newFarmer.name,
      phone: newFarmer.phone,
      notes: newFarmer.notes,
      is_active: true,
      user_id: session.user.id,
      farmer_id_at_center: farmerIdAtCenter,
      joined_at: new Date().toISOString()
    }]).select();

    if (data) setFarmers(prev => [...prev, data[0]].sort((a,b) => a.farmer_id_at_center - b.farmer_id_at_center));
  };

  const toggleFarmerStatus = async (id: number) => {
    const f = farmers.find(x => x.id === id);
    if (!f) return;

    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const updated = farmers.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x);
      setFarmers(updated);
      localStorage.setItem('tealeaf_farmers', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('farmers')
      .update({ is_active: !f.is_active })
      .eq('id', id)
      .eq('user_id', session.user.id);
    if (!error) setFarmers(prev => prev.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
  };

  const removeFarmer = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;

    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const updated = farmers.filter(f => f.id !== id);
      setFarmers(updated);
      localStorage.setItem('tealeaf_farmers', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from('farmers').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) setFarmers(prev => prev.filter(f => f.id !== id));
  };

  const addCollection = async (record: any) => {
    const total_amount = record.weight * settings.basePricePerKg;

    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const newRec: CollectionRecord = {
        id: Math.floor(Math.random() * 1000000),
        user_id: session.user.id,
        farmer_id: record.farmer_id,
        farmer_id_at_center: record.farmer_id_at_center,
        farmer_name: record.farmer_name,
        weight: record.weight,
        grade: record.grade,
        price_per_kg: settings.basePricePerKg,
        total_amount,
        timestamp: new Date().toISOString()
      };
      const updated = [newRec, ...collections];
      setCollections(updated);
      localStorage.setItem('tealeaf_collections', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase.from('collections').insert([{
      ...record,
      user_id: session.user.id,
      price_per_kg: settings.basePricePerKg,
      total_amount,
      timestamp: new Date().toISOString()
    }]).select();
    if (data) setCollections(prev => [data[0], ...prev]);
  };

  const addAdvance = async (record: any) => {
    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const newRec: AdvancePayment = {
        id: Math.floor(Math.random() * 1000000),
        user_id: session.user.id,
        farmer_id: record.farmer_id,
        farmer_id_at_center: record.farmer_id_at_center,
        farmer_name: record.farmer_name,
        amount: record.amount,
        reason: record.reason,
        timestamp: new Date().toISOString()
      };
      const updated = [newRec, ...advances];
      setAdvances(updated);
      localStorage.setItem('tealeaf_advances', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase.from('advances').insert([{ 
      ...record, 
      user_id: session.user.id, 
      timestamp: new Date().toISOString() 
    }]).select();
    if (data) setAdvances(prev => [data[0], ...prev]);
  };

  const addFertilizer = async (record: any) => {
    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      const newRec: FertilizerIssue = {
        id: Math.floor(Math.random() * 1000000),
        user_id: session.user.id,
        farmer_id: record.farmer_id,
        farmer_id_at_center: record.farmer_id_at_center,
        farmer_name: record.farmer_name,
        type: record.type,
        quantity: record.quantity,
        cost_per_unit: record.cost_per_unit,
        total_cost: record.total_cost,
        timestamp: new Date().toISOString()
      };
      const updated = [newRec, ...fertilizerIssues];
      setFertilizerIssues(updated);
      localStorage.setItem('tealeaf_fertilizers', JSON.stringify(updated));
      return;
    }

    const { data, error } = await supabase.from('fertilizers').insert([{ 
      ...record, 
      user_id: session.user.id, 
      timestamp: new Date().toISOString() 
    }]).select();
    if (data) setFertilizerIssues(prev => [data[0], ...prev]);
  };

  const updateSettings = async (newSettings: AppSettings) => {
    if (session.user.id === '00000000-0000-0000-0000-000000000000') {
      setSettings(newSettings);
      localStorage.setItem('tealeaf_settings', JSON.stringify(newSettings));
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      app_name: newSettings.appName,
      base_price_per_kg: newSettings.basePricePerKg,
      fertilizer_types: newSettings.fertilizerTypes,
      language: newSettings.language
    });
    if (!error) setSettings(newSettings);
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium tracking-tight">Syncing Cloud...</p>
      </div>
    );
  }

  if (!session) return <SupabaseLoginView />;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center space-x-2 px-2 py-6 mb-4">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg"><Leaf size={24} /></div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xl font-black text-slate-900 truncate tracking-tight">{settings.appName}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Authorized Center</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem id="dashboard" icon={LayoutDashboard} label={t.dashboard} active={activeTab} onClick={setActiveTab} />
            <NavItem id="farmers" icon={Users} label={t.farmers} active={activeTab} onClick={setActiveTab} />
            <NavItem id="collect" icon={PlusCircle} label={t.collect} active={activeTab} onClick={setActiveTab} />
            <NavItem id="reports" icon={BarChart3} label={t.reports} active={activeTab} onClick={setActiveTab} />
            <NavItem id="advances" icon={WalletCards} label={t.advances} active={activeTab} onClick={setActiveTab} />
            <NavItem id="fertilizer" icon={Sprout} label={t.fertilizer} active={activeTab} onClick={setActiveTab} />
            <NavItem id="inquiries" icon={Mail} label="Inbox" active={activeTab} onClick={setActiveTab} />
            <NavItem id="history" icon={History} label={t.history} active={activeTab} onClick={setActiveTab} />
            <NavItem id="settings" icon={Settings} label={t.settings} active={activeTab} onClick={setActiveTab} />
          </nav>
          
          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <button 
              onClick={() => {
                if (window.confirm("This will clear all local modifications and reset the collection center to the default demo data. Proceed?")) {
                  localStorage.removeItem('tealeaf_settings');
                  localStorage.removeItem('tealeaf_farmers');
                  localStorage.removeItem('tealeaf_collections');
                  localStorage.removeItem('tealeaf_advances');
                  localStorage.removeItem('tealeaf_fertilizers');
                  localStorage.removeItem('tealeaf_inquiries');
                  window.location.reload();
                }
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <RefreshCw size={20} /> 
              <span className="font-medium text-sm text-[15px]">Reset Demo Data</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <header className="md:hidden flex items-center justify-between mb-6 no-print">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Leaf size={18} /></div>
            <span className="font-black text-slate-900 tracking-tight truncate max-w-[150px]">{settings.appName}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm"><Menu size={20}/></button>
        </header>

        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && <DashboardView collections={collections} farmers={farmers} onNavigateToReports={() => setActiveTab('reports')} settings={settings} />}
          {activeTab === 'farmers' && <FarmerListView farmers={farmers} collections={collections} advances={advances} fertilizerIssues={fertilizerIssues} onAddFarmer={addFarmer} onRemoveFarmer={removeFarmer} onToggleStatus={toggleFarmerStatus} settings={settings} />}
          {activeTab === 'collect' && <CollectionFormView farmers={farmers} basePrice={settings.basePricePerKg} onAddCollection={addCollection} settings={settings} />}
          {activeTab === 'reports' && <ReportsView collections={collections} advances={advances} fertilizers={fertilizerIssues} farmers={farmers} settings={settings} />}
          {activeTab === 'inquiries' && <InquiryView inquiries={inquiries} userId={session.user.id} onUpdateStatus={() => {}} onRefresh={fetchUserData} settings={settings} />}
          {activeTab === 'advances' && <AdvancePaymentsView farmers={farmers} advances={advances} onAddAdvance={addAdvance} />}
          {activeTab === 'fertilizer' && <FertilizerView farmers={farmers} issues={fertilizerIssues} fertilizerTypes={settings.fertilizerTypes} onAddIssue={addFertilizer} />}
          {activeTab === 'history' && <HistoryView collections={collections} />}
          {activeTab === 'settings' && <SettingsView settings={settings} onUpdateSettings={updateSettings} />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ id, icon: Icon, label, active, onClick }: any) => (
  <button onClick={() => onClick(id)} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all relative ${active === id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}`}>
    <Icon size={20} /> <span className="font-medium">{label}</span>
  </button>
);

export default App;
