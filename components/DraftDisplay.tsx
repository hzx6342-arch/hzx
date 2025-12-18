
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViralDraft } from '../types';
import { Copy, MessageCircle, Layout, Bookmark, Sparkles, TrendingUp, RefreshCw, Hash, MousePointer2, CheckCircle2 } from 'lucide-react';

interface Props {
  draft: ViralDraft;
  onRefresh: () => void;
  onRefreshTitles: () => void;
  isRefreshing: boolean;
  isRefreshingTitles: boolean;
}

const DraftDisplay: React.FC<Props> = ({ draft, onRefresh, onRefreshTitles, isRefreshing, isRefreshingTitles }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      alert('已复制到剪贴板');
    }
  };

  return (
    <div className="space-y-24 max-w-7xl mx-auto pb-40">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-5"
      >
        <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] shadow-sm">
          <Sparkles className="w-4 h-4" /> Lab / Fragments Generated
        </div>
        <h3 className="text-5xl font-black text-gray-900 tracking-tighter text-center leading-[0.95]">
          碎碎念生成实验室 <br />
          <span className="text-gray-300 font-medium text-xl leading-relaxed mt-4 block font-serif-zh italic">Humanized Fragment Lab v2.5</span>
        </h3>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* 左侧：高级标题选区 */}
        <div className="lg:col-span-5 space-y-10">
          <motion.section 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                  <Layout className="w-5 h-5" />
                </div>
                <h4 className="text-2xl font-black tracking-tighter">人类废话标题</h4>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefreshTitles}
                disabled={isRefreshingTitles || isRefreshing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-red-500 hover:text-white rounded-full text-[10px] font-black text-gray-400 transition-all uppercase tracking-widest disabled:opacity-30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTitles ? 'animate-spin' : ''}`} />
                换一换
              </motion.button>
            </div>
            
            <div className="space-y-4 relative min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {draft.titles.map((title, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ delay: i * 0.05 }}
                    key={title} 
                    className="group relative p-7 bg-gray-50/50 rounded-[2rem] hover:bg-white border border-transparent hover:border-red-100 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:shadow-red-100/20" 
                    onClick={() => copyToClipboard(title, i)}
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5 xhs-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="font-black text-gray-700 leading-tight pr-12 text-lg italic font-serif-zh tracking-tight">“{title}”</p>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                      {copiedIndex === i ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in" />
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <span className="text-[10px] font-black uppercase">Copy</span>
                          <Copy className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <AnimatePresence>
                {isRefreshingTitles && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 gap-3"
                  >
                    <RefreshCw className="w-10 h-10 text-red-500 animate-spin" />
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Reshaping Hook...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-10 p-6 bg-amber-50 rounded-[2rem] flex items-start gap-4 border border-amber-100/50">
              <MousePointer2 className="w-5 h-5 text-amber-500 mt-1" />
              <p className="text-[11px] text-amber-700/80 font-bold leading-relaxed uppercase tracking-wider">
                实验室建议：选择最不像标题的标题。断裂感越强，用户的“完播率”与“互动欲”越高。
              </p>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-10 transition-opacity duration-1000">
              <MessageCircle className="w-48 h-48 rotate-12" />
            </div>
            <div className="relative z-10 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight">Interaction Loop</h4>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <p className="text-lg italic text-gray-100 leading-relaxed font-serif-zh">“{draft.interactionHook}”</p>
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">破冰自评 / SEED_STRATEGY</p>
                <p className="text-sm leading-relaxed text-gray-400 font-medium">{draft.firstCommentStrategy}</p>
              </div>
            </div>
          </motion.section>
        </div>

        {/* 右侧：文案正文与 10 个标签 */}
        <div className="lg:col-span-7 space-y-10">
          <motion.section 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl shadow-red-100/30 overflow-hidden flex flex-col min-h-[700px] relative group"
          >
            <AnimatePresence>
              {isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-xl z-[40] flex flex-col items-center justify-center gap-6"
                >
                  <RefreshCw className="w-12 h-12 text-red-500 animate-spin" />
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">FRAGMENT_RECONSTRUCTION</p>
                    <p className="text-[10px] text-gray-400 font-bold">Applying 3-Delete Rule & Flow Breakage...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="px-16 py-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/20"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-gray-100"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-gray-50"></div>
              </div>
              <button 
                onClick={() => copyToClipboard(draft.content)} 
                className="group flex items-center gap-3 text-[10px] font-black text-gray-400 hover:text-red-500 transition-all uppercase tracking-[0.25em]"
              >
                <Copy className="w-4 h-4" /> Copy Fragment Stream
              </button>
            </div>

            <div className="p-20 flex-grow relative">
              <div className="mb-16 flex items-center gap-4 text-gray-300">
                <Bookmark className="w-5 h-5 fill-current text-red-500/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">OUTPUT_STREAM / MD-025</span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl md:text-4xl text-gray-800 leading-[1.85] whitespace-pre-wrap font-serif-zh font-black tracking-tight">
                  {draft.content}
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="mt-20 text-[10px] font-black italic text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-8"
              >
                // Logic flow intentionally broken for authenticity. <br />
                // All blogger-style hooks removed. 
              </motion.div>
            </div>

            {/* 10 Tags Section */}
            <div className="px-16 py-12 bg-gray-50/50 border-t border-gray-100/50">
              <div className="flex items-center gap-3 mb-8 opacity-50">
                <Hash className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Metadata / Precise Tags</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {draft.tags.map((tag, i) => (
                  <motion.span 
                    whileHover={{ scale: 1.05, backgroundColor: "#fff", borderColor: "#ff2442" }}
                    key={i} 
                    className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-500 hover:text-red-500 transition-all cursor-pointer shadow-sm"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isRefreshing || isRefreshingTitles}
              className="inline-flex items-center gap-5 px-16 py-8 bg-gray-900 text-white rounded-full shadow-2xl group hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className={`w-3 h-3 rounded-full ${isRefreshing ? 'bg-white/20' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-sm font-black uppercase tracking-[0.3em]">重置实验室草稿 / RESET_DRAFT</span>
              <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-all duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftDisplay;
