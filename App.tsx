
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader2, RotateCcw, Clock, Image as ImageIcon, Text as TextIcon, Link as LinkIcon, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeNote, generateDetailedDraft, refreshTopics, refreshTitles } from './services/geminiService';
import { AnalysisResult, ViralDraft, HistoryItem } from './types';
import AnalysisDisplay from './components/AnalysisDisplay';
import DraftDisplay from './components/DraftDisplay';

function App() {
  const [url, setUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRefreshingTopics, setIsRefreshingTopics] = useState(false);
  const [isRefreshingTitles, setIsRefreshingTitles] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [draft, setDraft] = useState<ViralDraft | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('redviral_history');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData)) {
          setHistory(parsedData as HistoryItem[]);
        }
      } catch (e: unknown) {
        console.error('Failed to parse history from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('redviral_history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !inputText && images.length === 0) return;
    
    setLoading(true);
    setResult(null);
    setDraft(null);
    try {
      const data = await analyzeNote({ url, text: inputText, images });
      setResult(data);
      
      const newHistory: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        url,
        inputText,
        inputImages: images,
        analysis: data,
      };
      setHistory(prev => [newHistory, ...prev].slice(0, 20));
    } catch (error: unknown) {
      console.error('Analysis failed:', error);
      alert("全维度分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topicTitle: string) => {
    if (!result) return;
    setIsDrafting(true);
    setActiveTopic(topicTitle);
    try {
      const draftData = await generateDetailedDraft(result, topicTitle);
      setDraft(draftData);
      setHistory(prev => prev.map(item => item.analysis === result ? { ...item, draft: draftData, topic: topicTitle } : item));
      setTimeout(() => {
        const el = document.getElementById('draft-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error: unknown) {
      console.error('Failed to generate draft:', error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleRefreshDraft = async () => {
    if (!result || !activeTopic) return;
    setIsDrafting(true);
    try {
      const draftData = await generateDetailedDraft(result, activeTopic);
      setDraft(draftData);
    } catch (error: unknown) {
      console.error('Failed to refresh draft:', error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleRefreshTopics = async () => {
    if (!result) return;
    setIsRefreshingTopics(true);
    try {
      const newTopics = await refreshTopics(result);
      setResult({ ...result, topicIdeation: newTopics });
    } catch (error: unknown) {
      console.error('Failed to refresh topics:', error);
    } finally {
      setIsRefreshingTopics(false);
    }
  };

  const handleRefreshTitles = async () => {
    if (!draft || !activeTopic) return;
    setIsRefreshingTitles(true);
    try {
      const newTitles = await refreshTitles(activeTopic, draft.content);
      setDraft({ ...draft, titles: newTitles });
    } catch (error: unknown) {
      console.error('Failed to refresh titles:', error);
    } finally {
      setIsRefreshingTitles(false);
    }
  };

  const reset = () => {
    setResult(null);
    setDraft(null);
    setUrl('');
    setInputText('');
    setImages([]);
    setActiveTopic(null);
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-red-100">
      <header className="sticky top-0 z-50 glass-card border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={reset}
          >
            <div className="w-10 h-10 xhs-gradient rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-200 group-hover:rotate-6 transition-transform">R</div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-xl font-black xhs-text tracking-tighter">RedViral AI</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Laboratory v2.5</span>
            </div>
          </motion.div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="group relative p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all"
            >
              <Clock className="w-5 h-5 group-hover:text-red-500 transition-colors" />
              {history.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <AnimatePresence>
              {result && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={reset} 
                  className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Fresh
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 space-y-24 relative">
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-0 right-6 z-[60] w-96 max-h-[80vh] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Archive / 历史存档</h4>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <Clock className="w-8 h-8 text-gray-100 mx-auto" />
                    <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">No history yet</p>
                  </div>
                ) : (
                  history.map(item => (
                    <motion.div 
                      whileHover={{ x: 5 }}
                      key={item.id} 
                      onClick={() => { setResult(item.analysis); setDraft(item.draft || null); setShowHistory(false); }} 
                      className="p-5 bg-gray-50/50 hover:bg-white border border-transparent hover:border-red-100 rounded-[1.5rem] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] text-gray-300 font-black tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                         <ArrowRight className="w-3 h-3 text-red-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                      <p className="text-xs font-black text-gray-700 truncate">{item.url || item.inputText || 'Multimedia Analysis'}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-16 py-10"
          >
            <div className="space-y-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 text-red-600 text-[10px] font-black tracking-[0.3em] uppercase"
              >
                <Sparkles className="w-4 h-4" /> Multi-Modal Analysis Lab
              </motion.div>
              <h2 className="text-6xl md:text-7xl font-black text-gray-900 leading-[0.95] tracking-tighter">
                丢入素材，深度拆解 <br />
                <span className="xhs-text italic font-serif-zh">全维度爆款推理</span>
              </h2>
              <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto">
                支持链接解析、视觉权重拆解与文案断裂感重塑， <br />
                用顶级操盘手视角，重新审视你的每一次发布。
              </p>
            </div>

            <motion.div 
              layoutId="lab-card"
              className="max-w-3xl mx-auto bg-white rounded-[3.5rem] shadow-2xl shadow-red-100/40 border border-gray-100 p-12 space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 focus-within:border-red-200 focus-within:bg-white transition-all">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><LinkIcon className="w-5 h-5 text-red-500" /></div>
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="粘贴笔记链接 (XHS URL)"
                    className="bg-transparent outline-none flex-grow text-sm font-bold placeholder:text-gray-300"
                  />
                </div>

                <div className="flex items-start gap-5 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 focus-within:border-red-200 focus-within:bg-white transition-all">
                  <div className="p-3 bg-white rounded-xl shadow-sm mt-1"><TextIcon className="w-5 h-5 text-gray-400" /></div>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="粘贴文案内容、标签或脚本片段..."
                    className="bg-transparent outline-none flex-grow text-sm font-bold placeholder:text-gray-300 min-h-[140px] resize-none py-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      <ImageIcon className="w-4 h-4" /> Visual Assets (Max 4)
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                    >
                      + Add Frames
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-5">
                    {images.map((img, i) => (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={i} 
                        className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden group border border-gray-100 shadow-sm"
                      >
                        <img src={img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {images.length < 4 && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[4/5] rounded-[1.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:border-red-200 hover:text-red-400 hover:bg-red-50/30 transition-all group"
                      >
                        <ImageIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Drop Image</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={loading || (!url && !inputText && images.length === 0)}
                className={`w-full py-7 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl ${
                  loading || (!url && !inputText && images.length === 0)
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                  : 'xhs-gradient text-white shadow-red-200 hover:shadow-red-300'
                }`}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6" /> 执行实验室全维拆解</>}
              </motion.button>
            </div>
          </motion.section>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-8"
            >
              <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-4 border-red-50 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-red-500 rounded-full animate-spin"></div>
                 <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-500/10 rounded-full blur-xl"
                ></motion.div>
              </div>
              <div className="space-y-3 text-center">
                <p className="text-2xl font-black text-gray-900 tracking-tighter">RED_OPERATOR_ALIGNMENT</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-150"></span>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] ml-2">分析视觉钩子、呼吸节奏与转化漏斗</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-32"
          >
            <AnalysisDisplay 
              result={result} 
              onSelectTopic={handleSelectTopic} 
              onRefreshTopics={handleRefreshTopics}
              isDrafting={isDrafting} 
              isRefreshingTopics={isRefreshingTopics}
            />
            
            <AnimatePresence>
              {isDrafting && !draft && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-24 gap-6"
                >
                  <div className="w-16 h-1 w-48 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-full h-full xhs-gradient"
                    />
                  </div>
                  <p className="font-black text-gray-900 uppercase tracking-widest text-xs">执行三删减规则 · 断裂感注入中...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {draft && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                id="draft-section" 
                className="pt-24 border-t border-dashed border-gray-200"
              >
                <DraftDisplay 
                  draft={draft} 
                  onRefresh={handleRefreshDraft} 
                  onRefreshTitles={handleRefreshTitles}
                  isRefreshing={isDrafting} 
                  isRefreshingTitles={isRefreshingTitles}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
      
      <footer className="mt-40 py-20 border-t border-gray-100 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">RedViral Laboratory / Human-Centric AI Modeling</p>
      </footer>
    </div>
  );
}

export default App;
