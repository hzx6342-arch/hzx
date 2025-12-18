
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types';
import { TrendingUp, Lightbulb, MessageSquare, Zap, Eye, RefreshCw, BarChart3, Fingerprint } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onSelectTopic: (topicTitle: string) => void;
  onRefreshTopics: () => void;
  isDrafting: boolean;
  isRefreshingTopics: boolean;
}

const AnalysisDisplay: React.FC<Props> = ({ result, onSelectTopic, onRefreshTopics, isDrafting, isRefreshingTopics }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-10"
    >
      {/* 视觉钩子分析 - 深度玻璃卡片 */}
      <motion.section 
        variants={itemVariants}
        className="relative p-12 rounded-[3.5rem] bg-indigo-50 border border-indigo-100 overflow-hidden group shadow-inner"
      >
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
          <Eye className="w-64 h-64 -rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-200">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter">视觉逻辑解析 / Visual Hook</h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Eye-Tracking & Composition Analysis</p>
            </div>
          </div>
          <p className="text-indigo-900/80 leading-relaxed font-serif-zh text-2xl max-w-4xl italic">
            “{result.viralElements.visualHook || "未检测到图片素材，建议添加图片以获取视觉点击逻辑分析。"}”
          </p>
        </div>
      </motion.section>

      {/* 操盘手复盘 - 双色布局 */}
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.section 
          variants={itemVariants}
          className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3.5 bg-red-500 rounded-2xl text-white shadow-xl shadow-red-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900">爆款底层逻辑</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {result.viralLogic.map((logic, i) => (
              <motion.div 
                whileHover={{ x: 10 }}
                key={i} 
                className="flex gap-5 items-start group"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center text-xs font-black border border-gray-100 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all duration-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-gray-600 font-bold leading-relaxed pt-1">{logic}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          variants={itemVariants}
          className="lg:col-span-4 bg-gray-900 p-12 rounded-[3.5rem] flex flex-col justify-center text-white relative overflow-hidden"
        >
          <BarChart3 className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] text-red-500" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Audience Insight</p>
              <h4 className="text-2xl font-black tracking-tight leading-tight">{result.audienceInsights}</h4>
            </div>
            <div className="h-px w-12 bg-red-500"></div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              用户不再满足于说教，这种“低防备感”的呈现方式，正是打破推荐算法同质化的钥匙。
            </p>
          </div>
        </motion.section>
      </div>

      {/* 评论区剖析 */}
      <motion.section variants={itemVariants} className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3.5 bg-blue-500 rounded-2xl text-white shadow-xl shadow-blue-100">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter">评论区风向标</h3>
          </div>
          <div className="space-y-6">
            {result.commentAnalysis.discussionPoints.map((point, i) => (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                key={i} 
                className="group p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-blue-100/20"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-black text-gray-800 text-lg tracking-tight">{point.point}</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${point.frequency === '高频' ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {point.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-300" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">心理动机：{point.userPsychology}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex-grow bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Vibe & Strategy</h4>
            <p className="text-xl font-black text-gray-800 leading-tight mb-6">{result.commentAnalysis.communityVibe}</p>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">{result.commentAnalysis.replyStrategy}</p>
          </div>
          <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6">神评论埋点 / SEED_COMMENTS</p>
            <div className="space-y-4">
              {result.commentAnalysis.seedComments.map((seed, i) => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 hover:scale-[1.02] transition-transform cursor-default">
                  <p className="text-sm font-serif-zh italic text-gray-700 mb-2 leading-relaxed">“{seed.content}”</p>
                  <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">Mission: {seed.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 选题库 - 交互感核心 */}
      <motion.section variants={itemVariants} className="space-y-12 relative pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-amber-400 rounded-2xl text-white shadow-xl shadow-amber-100">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter">选题实验室</h3>
            </div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] pl-16">Selected Ideas / 06-Directions</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefreshTopics}
            disabled={isRefreshingTopics || isDrafting}
            className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-amber-500 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingTopics ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
            一键换一换选题
          </motion.button>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          <AnimatePresence mode="popLayout">
            {result.topicIdeation.map((topic, i) => (
              <motion.button 
                layout
                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                transition={{ delay: i * 0.05 }}
                key={topic.title} 
                onClick={() => onSelectTopic(topic.title)}
                disabled={isDrafting || isRefreshingTopics}
                className="group text-left flex flex-col bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-red-500 hover:shadow-2xl hover:shadow-red-200/40 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden h-[420px]"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                    topic.difficulty === '入门级' ? 'bg-green-500 text-white' :
                    topic.difficulty === '进阶级' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {topic.difficulty}
                  </span>
                  <div className="p-2 rounded-xl bg-gray-50 text-gray-300 group-hover:text-red-500 group-hover:bg-red-50 transition-all">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="font-black text-2xl text-gray-900 mb-4 group-hover:text-red-600 transition-colors leading-tight">
                  {topic.title}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-grow font-medium">{topic.reason}</p>
                
                <div className="flex flex-wrap gap-2 mb-10">
                  {topic.suggestedTags.slice(0, 3).map((tag, t) => (
                    <span key={t} className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">#{tag}</span>
                  ))}
                </div>

                <div className="mt-auto w-full py-5 bg-gray-900 group-hover:bg-red-500 group-hover:text-white text-white text-center rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-[0.3em] shadow-xl group-hover:shadow-red-200">
                  {isDrafting ? 'Calculating...' : 'Generate Lab Draft'}
                </div>

                {isRefreshingTopics && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
                  >
                    <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Reshuffling...</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default AnalysisDisplay;
