
import {
  GoogleGenAI,
  GenerateContentResponse,
  VideoGenerationReferenceImage,
  Type,
  FunctionDeclaration,
  LiveServerMessage,
  Blob,
  Content,
  File as GenAIFile,
  Modality,
  Tool,
  Part,
  GenerateContentParameters
} from '@google/genai';
import {
  GEMINI_FLASH_MODEL,
  GEMINI_TOOLS_MODEL,
  GEMINI_PRO_MODEL,
  GEMINI_IMAGE_FLASH_MODEL,
  GEMINI_IMAGE_PRO_MODEL,
  VEO_FAST_GENERATE_MODEL,
  GEMINI_LIVE_AUDIO_MODEL,
  GEMINI_TTS_MODEL,
  ENV_GEMINI_API_KEY,
  VITRINEX_SYSTEM_INSTRUCTION,
  IMAGE_PROMPT_ENHANCEMENT,
} from '../../constants';
import {
  UserProfile,
  Post,
  Ad,
  Campaign,
  Trend,
  ChatMessage,
  KnowledgeBaseQueryResponse,
  OrganizationMembership,
} from '../../types';
import { getAuthToken, getActiveOrganization, getCurrentUser } from '../core/authService';
import { generateEnhancedSystemInstruction } from './appKnowledgeBase';
import { trackUsage } from '../core/usageTracker';
import { logger } from '../../utils/logger';
import { decode, decodeAudioData, createBlob } from '../../utils/audio';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const LOCAL_KB_STORAGE_KEY = 'vitrinex_kb_local_content';

async function getApiKey(type: 'standard' | 'vertex' = 'standard'): Promise<string> {
  if (type === 'vertex') {
    const vertexKey = localStorage.getItem('vitrinex_vertex_api_key');
    if (vertexKey) return vertexKey;
    // Fallback: If no specific Vertex key, try the standard one (it might be a singular Pro key)
  }

  const localKey = localStorage.getItem('vitrinex_gemini_api_key');
  if (localKey) return localKey;

  if (ENV_GEMINI_API_KEY) return ENV_GEMINI_API_KEY;
  throw new Error('Chave de API nÃ£o encontrada.');
}

async function getGenAIClient(explicitKey?: string, type: 'standard' | 'vertex' = 'standard'): Promise<GoogleGenAI> {
  const apiKey = explicitKey || await getApiKey(type);
  return new GoogleGenAI({ apiKey });
}

// Helper to get active organization ID or default
const getActiveOrganizationId = (): string => {
  const activeOrg: OrganizationMembership | undefined = getActiveOrganization();
  return activeOrg ? activeOrg.organization.id : 'mock-org-default';
};

async function proxyFetch<T>(endpoint: string, method: string, body: any, signal?: AbortSignal): Promise<T> {
  const organizationId = getActiveOrganizationId();
  const idToken = await getAuthToken();
  const response = await fetch(`${BACKEND_URL}/organizations/${organizationId}/ai-proxy/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    throw new Error(errorData.message || `Backend proxy request failed with status ${response.status}`);
  }
  return response.json();
}

export const testGeminiConnection = async (explicitKey?: string): Promise<string> => {
  const ai = await getGenAIClient(explicitKey);
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: "Explain how AI works in a few words",
  });
  return response.text || 'No response text received';
};

export interface GenerateTextOptions {
  model?: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  tools?: Tool[];
  thinkingBudget?: number;
  useThinkingMode?: boolean; // NEW: Explicit toggle for Thinking Mode
  signal?: AbortSignal;
}

const getTrackableUserId = (): string => {
  const user = getCurrentUser();
  return user ? user.id : 'mock-user-123';
};

export const generateText = async (prompt: string, options?: GenerateTextOptions): Promise<string> => {
  trackUsage(getTrackableUserId(), 'text');

  // Fetch user profile for context (Merchant Reality)
  const userId = 'mock-user-123'; // In prod, get from auth context
  let userProfile: any;

  try {
    try {
      // Dynamic import to avoid circular dependency if dbService imports geminiService
      const { getUserProfile } = await import('../core/dbService');
      userProfile = await getUserProfile(userId);
    } catch (e) { logger.warn("Could not load user profile for context", e); }

    // --- THINKING MODE AND MODEL LOGIC ---
    let finalModel = options?.model || GEMINI_FLASH_MODEL;
    let generationConfig: any = { ...options };

    // If Thinking Mode is enabled, switch to experimental model and add thinking config
    if (options?.useThinkingMode) {
      finalModel = "gemini-2.0-flash-exp";
      generationConfig.thinking_config = {
        thinking_budget: 4096,
        thinking_level: "HIGH"
      };
      // Note: 'thinking_config' might require specific API versions or vertex logic
    }

    // Select correct key type based on options (Thinking Mode implies Vertex/Advanced usage)
    const keyType = options?.useThinkingMode ? 'vertex' : 'standard';

    const response = await proxyFetch<any>('call-gemini', 'POST', {
      model: finalModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        ...generationConfig,
        systemInstruction: options?.systemInstruction || generateEnhancedSystemInstruction(undefined, userProfile) || VITRINEX_SYSTEM_INSTRUCTION,
      },
    }, options?.signal);
    return response.response?.text || '';
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    logger.warn("Backend proxy failed for generateText, falling back to client-side SDK.", error);

    // Select correct key type based on options
    const keyType = options?.useThinkingMode ? 'vertex' : 'standard';
    const ai = await getGenAIClient(undefined, keyType);

    // Prepare config for Client SDK
    // Note: The google-genai SDK types for thinking_config might vary, treating as 'any' for safety here or constructing carefully
    const sdkConfig: any = {
      ...options,
      systemInstruction: options?.systemInstruction || generateEnhancedSystemInstruction(undefined, userProfile) || VITRINEX_SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }]
    };

    let clientModel = options?.model || GEMINI_FLASH_MODEL;
    if (options?.useThinkingMode) {
      clientModel = "gemini-2.0-flash-exp";
      // SDK specific thinking config structure if different, assume matching API spec for now or omit if SDK doesn't support it typed yet
      // The user snippet suggests: config = types.GenerateContentConfig(thinking_config=...)
      // In JS SDK this usually maps to the config object passed to generateContent
      sdkConfig.thinkingConfig = {
        thinkingBudget: 4096,
        thinkingLevel: "HIGH"
      };
    }

    const response = await ai.models.generateContent({
      model: clientModel,
      contents: prompt,
      config: sdkConfig,
    });
    return response.text || '';
  }
};

export interface GenerateImageOptions {
  model?: string;
  aspectRatio?: string;
  imageSize?: string;
  tools?: Tool[];
  signal?: AbortSignal;
  useVertexHighQuality?: boolean; // NEW: Explicit toggle
}

export const generateImage = async (prompt: string, options?: GenerateImageOptions): Promise<{ imageUrl?: string; text?: string }> => {
  trackUsage(getTrackableUserId(), 'image');

  // Logic: If Vertex High Quality is requested, we FORCE the Pro model and specific enhancements.
  // Otherwise we respect the passed model (usually Flash) for economy.
  const model = options?.useVertexHighQuality ? GEMINI_IMAGE_PRO_MODEL : (options?.model || GEMINI_IMAGE_FLASH_MODEL);

  const enhancedPrompt = options?.useVertexHighQuality
    ? `${prompt} ${IMAGE_PROMPT_ENHANCEMENT} photorealistic, 8k, highly detailed`
    : `${prompt} ${IMAGE_PROMPT_ENHANCEMENT}`;

  // FIX: imageSize is ONLY supported by Gemini 3 Pro Image.
  const imageConfig: any = {
    aspectRatio: options?.aspectRatio,
  };

  if (model === GEMINI_IMAGE_PRO_MODEL && options?.imageSize) {
    imageConfig.imageSize = options.imageSize;
  }

  try {
    const response = await proxyFetch<any>('generate-image', 'POST', {
      prompt: enhancedPrompt,
      model,
      imageConfig,
      options: {},
    }, options?.signal);
    return { imageUrl: `data:${response.mimeType};base64,${response.base64Image}` };
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    logger.warn("Backend proxy failed for generateImage, falling back to client-side SDK.", error);

    // Select correct key type based on options
    const keyType = options?.useVertexHighQuality ? 'vertex' : 'standard';
    const ai = await getGenAIClient(undefined, keyType);

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: enhancedPrompt }] },
      config: {
        imageConfig
      } as any
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (imageUrl) return { imageUrl };
    return { text: response.text || 'Imagem gerada, mas formato nÃ£o reconhecido no fallback.' };
  }
};

export const editImage = async (prompt: string, base64ImageData: string, mimeType: string, model: string = GEMINI_IMAGE_FLASH_MODEL, signal?: AbortSignal): Promise<{ imageUrl?: string; text?: string }> => {
  trackUsage(getTrackableUserId(), 'image');
  try {
    const response = await proxyFetch<any>('call-gemini', 'POST', {
      model,
      contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
    }, signal);
    const imagePart = response.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart) {
      return { imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` };
    }
    return { text: response.response?.text || 'Nenhuma ediÃ§Ã£o retornada.' };
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    logger.warn("Backend proxy failed for editImage, falling back to client-side SDK.", error);
    const ai = await getGenAIClient();
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
      }
    }
    return { text: response.text || 'Nenhuma ediÃ§Ã£o retornada no fallback.' };
  }
};

export interface GenerateVideoOptions {
  model?: string;
  image?: { imageBytes: string; mimeType: string };
  lastFrame?: { imageBytes: string; mimeType: string };
  referenceImages?: VideoGenerationReferenceImage[];
  config?: any;
}

export const generateVideo = async (prompt: string, options?: GenerateVideoOptions): Promise<string> => {
  trackUsage(getTrackableUserId(), 'video');
  try {
    const response = await proxyFetch<{ videoUri: string }>('generate-video', 'POST', {
      prompt,
      model: options?.model || VEO_FAST_GENERATE_MODEL,
      videoConfig: options?.config,
      ...options,
    });
    return response.videoUri;
  } catch (error) {
    logger.warn("Backend proxy failed for generateVideo, falling back to client-side SDK.", error);
    const ai = await getGenAIClient();

    const request: any = {
      model: options?.model || VEO_FAST_GENERATE_MODEL,
      prompt,
      image: options?.image,
      lastFrame: options?.lastFrame,
      config: options?.config
    };

    Object.keys(request).forEach(key => request[key] === undefined && delete request[key]);

    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video generated but no URI returned in fallback.");
    return uri;
  }
};

export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string, model: string = GEMINI_PRO_MODEL): Promise<string> => {
  try {
    const response = await proxyFetch<any>('call-gemini', 'POST', {
      model,
      contents: [{ role: 'user', parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] }],
    });
    return response.response?.text || 'Sem anÃ¡lise.';
  } catch (error) {
    logger.warn("Backend proxy failed for analyzeImage, falling back to client-side SDK.", error);
    const ai = await getGenAIClient();
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text || 'Sem anÃ¡lise no fallback.';
  }
};

export const queryArchitect = async (query: string): Promise<string> => {
  return generateText(query, { model: GEMINI_PRO_MODEL, systemInstruction: 'You are the Senior Software Architect...' });
};

export const searchTrends = async (query: string, language: string = 'en-US'): Promise<Trend[]> => {
  const prompt = language === 'pt-BR'
    ? `Encontre as tendÃªncias de marketing atuais para "${query}". ForneÃ§a um resumo detalhado em portuguÃªs e cite as fontes.`
    : `Find current marketing trends for "${query}". Provide a detailed summary and cite sources.`;

  try {
    // Attempt to use Backend Proxy if available (Vertex AI Search)
    const response = await proxyFetch<any>('call-gemini', 'POST', {
      model: GEMINI_TOOLS_MODEL, // Use robust model for grounding
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }], // ACTIVATES VERTEX AI GROUNDING
        groundingConfig: { semanticSearch: true } // Attempt enterprise search if configured
      },
    });
    const text = response.response?.text;
    const groundingMetadata = response.response?.candidates?.[0]?.groundingMetadata;

    // Extract sources from grounding metadata
    const sources = groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri || c.web?.title).filter(Boolean) || [];

    return [{
      id: `trend-${Date.now()}`,
      query,
      score: 85,
      data: text || '',
      sources: sources,
      createdAt: new Date().toISOString(),
      userId: 'mock-user-123'
    }];
  } catch (error) {
    logger.warn("Backend proxy failed for searchTrends, falling back to client-side SDK.", error);
    // Client-side fallback with standard Google Search Tool
    const ai = await getGenAIClient();
    const response = await ai.models.generateContent({
      model: GEMINI_TOOLS_MODEL, // Use robust model for grounding
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];

    return [{
      id: `trend-${Date.now()}`,
      query,
      score: 85,
      data: text || '',
      sources: sources,
      createdAt: new Date().toISOString(),
      userId: 'mock-user-123'
    }];
  }
};

export const campaignBuilder = async (campaignPrompt: string): Promise<{ campaign: Campaign; videoUrl?: string }> => {
  const planPrompt = `Create a detailed marketing campaign plan...`;
  const planJsonStr = await generateText(planPrompt, {
    model: GEMINI_PRO_MODEL,
    responseMimeType: 'application/json',
    responseSchema: { type: Type.OBJECT, properties: { campaignName: { type: Type.STRING } } },
  });

  let plan;
  try {
    plan = JSON.parse(planJsonStr);
  } catch (e) {
    plan = { campaignName: "Campaign " + Date.now() };
  }

  let videoUrl: string | undefined = undefined;
  try {
    videoUrl = await generateVideo(`A short promo video for ${plan.campaignName}`);
  } catch (e) {
    logger.warn("Video generation failed for campaign", e);
  }

  return { campaign: { id: `c-${Date.now()}`, name: plan.campaignName, type: 'general', posts: [], ads: [], timeline: '', createdAt: new Date().toISOString(), userId: 'mock-user-123' }, videoUrl };
};

export const aiManagerStrategy = async (prompt: string, userProfile: UserProfile['businessProfile']): Promise<{ strategyText: string; suggestions: string[] }> => {
  const systemInstruction = `You are a marketing expert...`;
  // Enable Thinking Mode for Strategy to allow deep reasoning (Model will switch to gemini-2.0-flash-exp)
  const response = await generateText(prompt, { model: GEMINI_FLASH_MODEL, systemInstruction, tools: [{ googleSearch: {} }], thinkingBudget: 2048, useThinkingMode: true });
  return { strategyText: response, suggestions: ["Suggestion 1", "Suggestion 2"] };
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | undefined> => {
  try {
    const response = await proxyFetch<any>('generate-speech', 'POST', {
      text,
      model: GEMINI_TTS_MODEL,
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    });
    return response.base64Audio;
  } catch (error) {
    logger.warn("Backend proxy failed for generateSpeech, falling back to client-side SDK.", error);
    const ai = await getGenAIClient();
    const response = await ai.models.generateContent({
      model: GEMINI_TTS_MODEL,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
};

export const sendMessageToChat = async (
  history: ChatMessage[],
  message: string | (string | Part)[],
  onChunk: (text: string) => void,
  options: { model?: string; systemInstruction?: string; useKnowledgeBase?: boolean },
  signal?: AbortSignal
): Promise<string> => {
  try {
    const organizationId = getActiveOrganizationId();
    const idToken = await getAuthToken();

    const body = {
      prompt: typeof message === 'string' ? message : message.find(p => typeof p === 'string') || '',
      history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      model: options.model || GEMINI_PRO_MODEL,
      options: {
        systemInstruction: options.systemInstruction,
        tools: [{ googleSearch: {} }] // Enable Grounding
      },
    };

    const response = await fetch(`${BACKEND_URL}/organizations/${organizationId}/ai-proxy/stream-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok || !response.body) throw new Error(`Streaming request failed: ${response.statusText}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal?.aborted) { reader.cancel(); break; }
      const chunkStr = decoder.decode(value);
      try {
        const chunkJson = JSON.parse(chunkStr);
        if (chunkJson.text) {
          fullText += chunkJson.text;
          onChunk(fullText);
        }
      } catch (e) { fullText += chunkStr; onChunk(fullText); }
    }
    return fullText;
  } catch (error) {
    if (!signal?.aborted) {
      logger.warn("Backend proxy failed for sendMessageToChat, falling back to client-side SDK.", error);

      const ai = await getGenAIClient();
      const model = options.model || GEMINI_PRO_MODEL;
      const chatHistory = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      const chat = ai.chats.create({ model, history: chatHistory, config: { systemInstruction: options.systemInstruction } });
      const msgContent = typeof message === 'string'
        ? message
        : (message as Part[]);
      const resultStream = await chat.sendMessageStream({ message: msgContent });

      let fullText = '';
      for await (const chunk of resultStream) {
        if (signal?.aborted) break;
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          onChunk(fullText);
        }
      }
      return fullText;
    }
    throw error;
  }
};

export interface LiveSessionCallbacks { }
export const connectLiveSession = async (callbacks: LiveSessionCallbacks) => { };

export const createFileSearchStore = async (displayName?: string): Promise<any> => {
  try { return await proxyFetch('knowledge-base/store', 'POST', { displayName }); }
  catch (e) { logger.warn("Fallback: CreateStore", e); return { storeName: 'mock-store', displayName: displayName || 'Mock' }; }
};

export const uploadFileToSearchStore = async (file: File, metadata: any): Promise<any> => {
  try {
    const orgId = getActiveOrganizationId();
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BACKEND_URL}/organizations/${orgId}/knowledge-base/upload-file`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
    });
    if (!res.ok) throw new Error("Backend upload failed");
    return res.json();
  } catch (e) { logger.warn("Fallback: uploadFile", e); return { fileId: 'mock-file-id' }; }
};

export const queryFileSearchStore = async (prompt: string): Promise<KnowledgeBaseQueryResponse> => {
  try { return await proxyFetch('knowledge-base/query', 'POST', { prompt }); }
  catch (e) {
    logger.warn("Fallback: queryFileSearchStore", e);
    const text = await generateText(prompt);
    return { resposta: text, arquivos_usados: [], trechos_referenciados: [], confianca: 0 };
  }
};


