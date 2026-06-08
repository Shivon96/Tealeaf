
import React, { useState } from 'react';
import { Inquiry, AppSettings } from '../types';
import { Mail, CheckCircle, Send, Archive, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translations } from '../translations';

interface Props {
  inquiries: Inquiry[];
  userId: string;
  onUpdateStatus: (id: string, status: Inquiry['status']) => void;
  onRefresh: () => void;
  settings: AppSettings;
}

const InquiryView: React.FC<Props> = ({ inquiries, userId, onUpdateStatus, onRefresh, settings }) => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testForm, setTestForm] = useState({ name: '', email: '', subject: '', message: '' });
  const t = translations[settings.language];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const submitTestInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (userId === '00000000-0000-0000-0000-000000000000') {
      const newInquiry: Inquiry = {
        id: Math.floor(Math.random() * 1000000).toString(),
        user_id: userId,
        name: testForm.name,
        email: testForm.email,
        subject: testForm.subject,
        message: testForm.message,
        status: 'unread',
        timestamp: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('tealeaf_inquiries') || '[]');
      const updated = [newInquiry, ...existing];
      localStorage.setItem('tealeaf_inquiries', JSON.stringify(updated));
      
      setTestForm({ name: '', email: '', subject: '', message: '' });
      setShowTestForm(false);
      onRefresh();
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('inquiries').insert([{
      ...testForm,
      user_id: userId,
      status: 'unread'
    }]);
    
    if (!error) {
      setTestForm({ name: '', email: '', subject: '', message: '' });
      setShowTestForm(false);
      onRefresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquiry Inbox</h1>
          <p className="text-slate-500">Farmer communications</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleRefresh} className={`p-2.5 bg-white border rounded-xl ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={20}/></button>
          <button onClick={() => setShowTestForm(!showTestForm)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">Test Form</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border h-[600px] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y">
            {inquiries.length === 0 ? <p className="p-8 text-center text-slate-400">No messages</p> : inquiries.map(i => (
              <button key={i.id} onClick={() => setSelectedInquiry(i)} className={`w-full p-4 text-left hover:bg-slate-50 transition-all relative ${selectedInquiry?.id === i.id ? 'bg-emerald-50' : ''}`}>
                <p className="font-bold text-slate-900">{i.name}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{i.subject}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border h-[600px] flex flex-col overflow-hidden">
          {selectedInquiry ? (
            <div className="p-8 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-1">{selectedInquiry.subject}</h2>
              <p className="text-sm text-slate-500 mb-6">{selectedInquiry.name} ({selectedInquiry.email})</p>
              <div className="flex-1 bg-slate-50 p-6 rounded-2xl overflow-y-auto whitespace-pre-wrap">{selectedInquiry.message}</div>
              <button onClick={() => window.location.href=`mailto:${selectedInquiry.email}`} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2">
                <Send size={18}/> <span>Reply</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <Mail size={48} className="mb-4 opacity-20"/>
              <p>Select a message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryView;
