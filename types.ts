
export interface AnalysisResult {
  viralLogic: string[];
  viralElements: {
    visualHook: string; // 新增：视觉钩子分析
    title: string;
    cover: string;
    content: string;
    tags: string;
  };
  audienceInsights: string;
  commentAnalysis: {
    emotionalTone: string;
    discussionPoints: { point: string; frequency: '高频' | '中频'; userPsychology: string }[];
    replyStrategy: string;
    seedComments: { content: string; purpose: string }[]; 
    communityVibe: string;
  };
  actionPlan: {
    step: string;
    description: string;
    expertTip: string;
  }[];
  topicIdeation: {
    title: string;
    reason: string;
    difficulty: '入门级' | '进阶级' | '高难挑战';
    suggestedTags: string[];
  }[];
  sources?: { web: { uri: string; title: string } }[];
}

export interface ViralDraft {
  titles: string[];
  content: string;
  tags: string[];
  firstCommentStrategy: string;
  interactionHook: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  url?: string;
  inputImages?: string[];
  inputText?: string;
  analysis: AnalysisResult;
  draft?: ViralDraft;
  topic?: string;
}

export interface AnalysisInput {
  url?: string;
  text?: string;
  images?: string[]; // base64 strings
}
