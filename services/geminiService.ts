
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ViralDraft, AnalysisInput } from "../types";

// Helper to extract text output and grounding sources with robust JSON parsing
const extractResult = (response: any) => {
  let text = response.text || "{}";
  
  // Strip potential markdown code blocks if the model accidentally includes them
  if (text.includes("```")) {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  }
  
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, text);
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
  5. 【六个选题实验室】：**必须极致多样化**，包含不同视角和切入点。
  
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
  
  文案生成要求：
  1. 写一段 6 句左右的、逻辑不连贯、甚至有点废话的日常感记录。
  2. 强行删掉开场白、结论和中间随机一句。
  3. 保留断裂感。

  标题生成要求：
  生成 5 个废话标题，包含情绪未说完、自言自语、标题自残法等。

  标签：10个。
  
  输出 JSON。`;

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

  return extractResult(response);
};

export const refreshTopics = async (analysis: AnalysisResult): Promise<AnalysisResult['topicIdeation']> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `基于此前的深度分析：${JSON.stringify(analysis.viralLogic)}，请再提供 6 个全新的、多样化的选题。
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

  return extractResult(response);
};

export const refreshTitles = async (topicTitle: string, content: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `基于选题【${topicTitle}】和文案【${content}】，请再生成 5 个全新的“人类废话结构”标题。
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

  return extractResult(response);
};
