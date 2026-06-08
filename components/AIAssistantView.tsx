
import React, { useState, useRef, useEffect } from 'react';
import { CollectionRecord } from '../types';
import { getTeaInsights } from '../services/geminiService';
import { BrainCircuit, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';

interface Props {
  collections: CollectionRecord[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistantView: React.FC<Props> = ({ collections }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: "Hello! I'm your TeaLeaf Pro Agronomy Assistant. I can analyze your collection data, predict yield trends, or offer advice on improving tea leaf quality. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const insight = await getTeaInsights(collections, userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: insight || 'I am sorry, I could not generate a response.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'An error occurred while connecting to the AI services.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <BrainCircuit className="text-emerald-600" />
            <span>AI Agronomy Insights</span>
          </h1>
          <p className="text-slate-500">Personalized data analysis powered by Gemini AI</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 border border-emerald-100">
          <Sparkles size={14} />
          <span>Intelligent Agent Active</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-50 text-slate-400 text-sm italic flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>AI is analyzing your data...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center space-x-2 bg-white rounded-2xl border border-slate-300 p-1.5 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
            <input 
              type="text" 
              placeholder="Ask about grade trends, farmer performance, or weather impact..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder:text-slate-400"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <SuggestionChip 
              label="Analyze Quality Trends" 
              onClick={() => setInput("Can you summarize the tea grade quality distribution for the last week?")} 
            />
            <SuggestionChip 
              label="Top Farmers" 
              onClick={() => setInput("Who are our most consistent farmers by weight and quality?")} 
            />
            <SuggestionChip 
              label="Improvement Tips" 
              onClick={() => setInput("How can farmers move from Grade B to Grade A?")} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestionChip: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
  >
    {label}
  </button>
);

export default AIAssistantView;
