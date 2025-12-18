
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ViralDraft, AnalysisInput } from "../types";

// Helper to extract text output and grounding sources
const extractResult = (response: any) => {
  const text = response.text || "{}";
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    result = {};
  }

  // Extract grounding chunks if available from Google Search tool
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        web: {
          uri: chunk.web.uri,
          title: chunk.web.title
        }
      }));
    if (sources.length > 0) {
      result.sources = sources;
    }
  }
  return result;
};

export const analyzeNote = async (input: AnalysisInput): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  
  let basePrompt = `你现在是一名顶级爆款操盘手。请对我提供的素材进行全维度深度拆解。
  
  你的分析必须包含：
  1. 【底层逻辑】：为何能爆？拆解其情绪钩子、视觉冲击或认知偏差。
  2. 【视觉分析】：分析构图、色彩、滤镜如何制造“一眼入魂”的氛围感。
  3. 【文案节奏】：分析文字的留白、语气、及“非博主感”的真实性。
  4. 【评论预测】：用户会怎么“共情”？如何引导用户在评论区留下第一条“神评论”。
  5. 【六个选题实验室】：**必须极致多样化**，包含：
     - 极简备忘录（只有几句话）
     - 反逻辑叙事（开头没头没脑）
     - 情绪碎片（极度私人的瞬间）
     - 抽象流（莫名其妙的联想）
     - 冷静抽离（旁观者视角记录）
     - 否定记录（其实也没发生什么）
  
  当前时间：2025年12月18日。`;

  if (input.url) basePrompt += `\n分析链接：${input.url}`;
  if (input.text) basePrompt += `\n分析文案：${input.text}`;
  
  parts.push({ text: basePrompt });

  if (input.images && input.images.length > 0) {
    input.images.forEach((imgBase64) => {
      const matches = imgBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viralLogic: { type: Type.ARRAY, items: { type: Type.STRING } },
          viralElements: {
            type: Type.OBJECT,
            properties: {
              visualHook: { type: Type.STRING },
              title: { type: Type.STRING },
              cover: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: { type: Type.STRING }
            },
            required: ["visualHook", "title", "cover", "content", "tags"]
          },
          audienceInsights: { type: Type.STRING },
          commentAnalysis: {
            type: Type.OBJECT,
            properties: {
              emotionalTone: { type: Type.STRING },
              communityVibe: { type: Type.STRING },
              discussionPoints: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    userPsychology: { type: Type.STRING }
                  },
                  required: ["point", "frequency", "userPsychology"]
                } 
              },
              replyStrategy: { type: Type.STRING },
              seedComments: { 
                type: Type.ARRAY, 
                items: {
                  type: Type.OBJECT,
                  properties: {
                    content: { type: Type.STRING },
                    purpose: { type: Type.STRING }
                  },
                  required: ["content", "purpose"]
                }
              }
            },
            required: ["emotionalTone", "communityVibe", "discussionPoints", "replyStrategy", "seedComments"]
          },
          actionPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                description: { type: Type.STRING },
                expertTip: { type: Type.STRING }
              },
              required: ["step", "description", "expertTip"]
            }
          },
          topicIdeation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "reason", "difficulty", "suggestedTags"]
            }
          }
        },
        required: ["viralLogic", "viralElements", "audienceInsights", "commentAnalysis", "actionPlan", "topicIdeation"]
      }
    },
  });

  return extractResult(response);
};

export const generateDetailedDraft = async (analysis: AnalysisResult, selectedTopicTitle: string): Promise<ViralDraft> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `基于选题【${selectedTopicTitle}】，利用之前分析出的逻辑，为普通人视角生成一段笔记。
  
  ⚠️ 核心铁律：禁止像博主！禁止有信息量！禁止教导！
  
  【第一部分：文案生成（三删减法）】
  1. 写一段 6 句左右的、逻辑不连贯、甚至有点废话的日常感记录。
  2. 强行删掉：第一句（开场白）、最后一句（结论）、中间随机一句。
  3. 最终文案要保留一种“没写完”、“随手敲完就发了”的断裂感。

  【第二部分：标题生成（人类废话结构）】
  禁用一切“信息型”标题。生成 **5 个** 极其多样的标题：
  1. 情绪未说完型
  2. 自言自语型
  3. 否定+犹豫型
  4. 标题自残法（从正文里截取最不重要、看起来最不聪明的 2-4 个字）
  5. 抽象流标题

  【第三部分：标签】
  精准生成 10 个标签，混合流量词与情绪词。
  
  ⚠️ 输出 JSON 格式。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          content: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          firstCommentStrategy: { type: Type.STRING },
          interactionHook: { type: Type.STRING }
        },
        required: ["titles", "content", "tags", "firstCommentStrategy", "interactionHook"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// New: Refresh topics without re-analyzing
export const refreshTopics = async (analysis: AnalysisResult): Promise<AnalysisResult['topicIdeation']> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `基于此前的深度分析：${JSON.stringify(analysis.viralLogic)}，请再提供 6 个全新的、多样化的选题。
  要求：避开之前的方向，挖掘更冷门、更真实、更“普通人”的瞬间。
  JSON 格式输出，包含 title, reason, difficulty, suggestedTags。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "reason", "difficulty", "suggestedTags"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

// New: Refresh titles without re-generating the whole content
export const refreshTitles = async (topicTitle: string, content: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `基于选题【${topicTitle}】和文案【${content}】，请再生成 5 个全新的“人类废话结构”标题。
  严格执行去博主化，使用情绪未说完、自言自语、否定犹豫、自残法、抽象流。
  直接返回 5 个字符串组成的 JSON 数组。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
