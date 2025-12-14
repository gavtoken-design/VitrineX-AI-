import React, { useState, useCallback } from 'react';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import Input from '../components/Input';
import SaveToLibraryButton from '../components/SaveToLibraryButton';
import LoadingSpinner from '../components/LoadingSpinner';
import MediaActionsToolbar from '../components/MediaActionsToolbar'; // NOVO
import { generateText, generateImage } from '../services/ai/geminiService';
import { savePost } from '../services/core/firestoreService';
import { Post } from '../types';
import { GEMINI_FLASH_MODEL, GEMINI_IMAGE_FLASH_MODEL, PLACEHOLDER_IMAGE_BASE64 } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { reviewContent, formatReviewResult, ContentReviewResult } from '../services/contentReviewService';
import { CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(PLACEHOLDER_IMAGE_BASE64);
  const [loadingText, setLoadingText] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<ContentReviewResult | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState<boolean>(false); // NEW: State for Thinking Mode

  // Library Save State
  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  const { addToast } = useToast();

  // Mock user ID
  const userId = 'mock-user-123';

  // Abort Controller for cancellation
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const generateContent = useCallback(async (isWeekly: boolean = false) => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', title: 'Atenção', message: 'Por favor, insira um prompt para gerar conteúdo.' });
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingText(true);
    setLoadingImage(true);
    setGeneratedPost(null);
    setGeneratedImageUrl(PLACEHOLDER_IMAGE_BASE64);
    setSavedItemName('');
    setSavedItemTags('');

    try {
      let fullPrompt = `Generate a compelling social media post for: "${prompt}".`;
      let textOptions: any = {
        model: GEMINI_FLASH_MODEL,
        signal: controller.signal,
        useThinkingMode: useThinkingMode // Pass the state
      };

      if (isWeekly) {
        // Use Native JSON Mode for Weekly Generation
        fullPrompt = `Generate 7 unique social media post ideas based on: "${prompt}".
        Schema: Array of objects with keys: "text" (string) and "image_description" (string).`;
        textOptions.responseMimeType = 'application/json';
        // Disable thinking mode for JSON/Weekly if incompatible, or warn user. For now, we trust the backend handles it or we override.
        // Actually, let's keep it if enabled, as "thinking" can help structure the JSON better.
      } else {
        fullPrompt = `Generate a compelling social media post (text only) for: "${prompt}". Include relevant hashtags.`;
      }

      const textResponse = await generateText(fullPrompt, textOptions);

      // Check if aborted during text gen
      if (controller.signal.aborted) return;

      let postContent: string = '';
      let imageDescription: string = '';
      let weeklyPosts: { text: string; image_description: string }[] = [];

      if (isWeekly) {
        try {
          weeklyPosts = JSON.parse(textResponse);
          if (Array.isArray(weeklyPosts) && weeklyPosts.length > 0) {
            postContent = weeklyPosts[0].text;
            imageDescription = weeklyPosts[0].image_description || prompt;
          } else {
            postContent = "JSON format error. Raw: " + textResponse;
            imageDescription = prompt;
          }
        } catch (jsonError) {
          console.warn("Failed to parse JSON, using raw text.", jsonError);
          postContent = textResponse;
          imageDescription = prompt;
        }
      } else {
        postContent = textResponse;
        imageDescription = `An image illustrating the post content: "${postContent.substring(0, 100)}..."`;
      }

      setLoadingText(false);

      // Run Content Review
      if (postContent && !isWeekly) {
        const review = reviewContent(postContent);
        setReviewResult(review);
        if (review.score < 80) {
          addToast({ type: 'warning', message: `Atenção: A qualidade do texto foi avaliada em ${review.score}/100. Verifique as sugestões.` });
        }
      } else {
        setReviewResult(null);
      }

      // Check if aborted before image gen
      if (controller.signal.aborted) return;

      const imageResponse = await generateImage(imageDescription, {
        model: GEMINI_IMAGE_FLASH_MODEL,
        signal: controller.signal
      });

      if (controller.signal.aborted) return;

      setGeneratedImageUrl(imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64);
      setLoadingImage(false);

      const newPost: Post = {
        id: `post-${Date.now()}`,
        userId: userId,
        content_text: postContent,
        image_url: imageResponse.imageUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      setGeneratedPost(newPost);
      addToast({ type: 'success', title: 'Conteúdo Gerado', message: 'Texto e imagem foram gerados com sucesso.' });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation cancelled by user');
        addToast({ type: 'info', message: 'Geração cancelada.' });
      } else {
        console.error('Error generating content:', err);
        addToast({ type: 'error', title: 'Erro na Geração', message: `Falha: ${err instanceof Error ? err.message : String(err)}` });
      }
      setLoadingText(false);
      setLoadingImage(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, [prompt, userId, addToast]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoadingText(false);
      setLoadingImage(false);
    }
  }, []);

  const handleGenerateOnePost = useCallback(() => generateContent(false), [generateContent]);
  const handleGenerateWeek = useCallback(() => generateContent(true), [generateContent]);

  const handleRegenerateImage = useCallback(async () => {
    if (!generatedPost) {
      addToast({ type: 'error', message: 'Por favor gere um post primeiro.' });
      return;
    }

    // Cancel prev
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingImage(true);
    try {
      const imageDescription = `An alternative image for: "${generatedPost.content_text.substring(0, 100)}..."`;
      const imageResponse = await generateImage(imageDescription, {
        model: GEMINI_IMAGE_FLASH_MODEL,
        signal: controller.signal
      });

      if (controller.signal.aborted) return;

      setGeneratedImageUrl(imageResponse.imageUrl || PLACEHOLDER_IMAGE_BASE64);
      // Update the stored post with the new image URL
      if (generatedPost) {
        const updatedPost = { ...generatedPost, image_url: imageResponse.imageUrl || undefined };
        setGeneratedPost(updatedPost);
      }
      addToast({ type: 'success', message: 'Imagem regenerada com sucesso.' });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addToast({ type: 'info', message: 'Regeneração cancelada.' });
      } else {
        console.error('Error regenerating image:', err);
        addToast({ type: 'error', title: 'Erro', message: 'Falha ao regenerar imagem.' });
      }
    } finally {
      setLoadingImage(false);
      abortControllerRef.current = null;
    }
  }, [generatedPost, addToast]);

  const handleSavePost = useCallback(async () => {
    if (!generatedPost) {
      addToast({ type: 'warning', message: 'Nenhum post para salvar.' });
      return;
    }
    setLoadingText(true); // Re-use loading state for saving
    try {
      const savedPost = await savePost(generatedPost); // Save to mock Firestore
      addToast({
        type: 'success',
        title: 'Salvo na Biblioteca',
        message: `Post "${savedPost.content_text.substring(0, 20)}..." salvo com sucesso!`
      });
    } catch (err) {
      console.error('Error saving post:', err);
      addToast({ type: 'error', title: 'Erro ao Salvar', message: 'Não foi possível salvar o post na biblioteca.' });
    } finally {
      setLoadingText(false);
    }
  }, [generatedPost, addToast]);

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Content Generator</h2>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Gerar Novo Conteúdo</h3>
        <Textarea
          id="contentPrompt"
          label="Descreva o conteúdo que você deseja gerar:"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Ex: 'Um post sobre os benefícios da meditação para o bem-estar mental', ou 'Ideias para 7 posts semanais sobre dicas de produtividade no trabalho.'"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-4 items-center">
          <Button
            onClick={handleGenerateOnePost}
            isLoading={loadingText && !generatedPost}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {loadingText && !generatedPost ? 'Gerando Post...' : 'Gerar 1 Post'}
          </Button>
          <Button
            onClick={handleGenerateWeek}
            isLoading={loadingText && !generatedPost && prompt.includes('semanal')}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {loadingText && !generatedPost ? 'Gerando Semana...' : 'Gerar Semana'}
          </Button>

          {/* THINKING MODE TOGGLE */}
          <button
            onClick={() => setUseThinkingMode(!useThinkingMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${useThinkingMode
              ? 'bg-purple-900/30 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            title="Ativar Modo Raciocínio (Vertex AI)"
          >
            <span className="text-xl">🧠</span>
            <span className="text-sm font-bold">Thinking Mode</span>
            <span className={`w-2 h-2 rounded-full ${useThinkingMode ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`}></span>
          </button>

          {(loadingText || loadingImage) && (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Cancelar 🛑
            </Button>
          )}
        </div>
      </div>

      {generatedPost && (
        <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 animate-slide-in-from-bottom duration-500">
          <h3 className="text-xl font-semibold text-textlight mb-5">Conteúdo Gerado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold text-textlight mb-3">Texto do Post</h4>
              {loadingText && !generatedPost.content_text ? ( // Check content_text specifically for text loading
                <LoadingSpinner />
              ) : (
                <div className="prose max-w-none text-textlight leading-relaxed bg-darkbg p-4 rounded-md h-full min-h-[150px]" style={{ whiteSpace: 'pre-wrap' }}>
                  {generatedPost.content_text}
                  {generatedPost.content_text}
                </div>
              )}

              {/* Content Review Feedback */}
              {reviewResult && !loadingText && (
                <div className={`mt-4 p-4 rounded-md border ${reviewResult.score >= 80 ? 'bg-green-900/10 border-green-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold flex items-center gap-2 text-sm text-textlight">
                      {reviewResult.score >= 80 ? <CheckBadgeIcon className="w-5 h-5 text-green-500" /> : <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
                      Análise de Qualidade (IA)
                    </h5>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${reviewResult.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      Nota: {reviewResult.score}
                    </span>
                  </div>
                  <div className="text-xs text-textmuted whitespace-pre-line">
                    {formatReviewResult(reviewResult).split('\n').slice(2).join('\n')}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h4 className="text-lg font-semibold text-textlight mb-3">Imagem do Post</h4>
              {loadingImage ? (
                <div className="flex items-center justify-center h-48 bg-gray-900 rounded-md">
                  <LoadingSpinner />
                </div>
              ) : (
                <img
                  src={generatedImageUrl}
                  alt="Generated content visual"
                  className="w-full h-48 object-contain rounded-md border border-gray-700 mb-4"
                />
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRegenerateImage} isLoading={loadingImage} variant="outline" className="w-full sm:w-auto">
                  {loadingImage ? 'Regenerando...' : 'Regenerar Imagem'}
                </Button>
                {/* NOVO: Ações de Mídia */}
                <MediaActionsToolbar
                  mediaUrl={generatedImageUrl}
                  fileName={`vitrinex-post.png`}
                  shareTitle="Confira este post!"
                  shareText={generatedPost.content_text}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-lg font-semibold text-textlight mb-4">Salvar na Biblioteca</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="saveName"
                label="Nome do Item"
                value={savedItemName}
                onChange={(e) => setSavedItemName(e.target.value)}
                placeholder="Ex: Post Campanha Verão"
              />
              <Input
                id="saveTags"
                label="Tags (separadas por vírgula)"
                value={savedItemTags}
                onChange={(e) => setSavedItemTags(e.target.value)}
                placeholder="Ex: instagram, verão, promoção"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSavePost} variant="primary" isLoading={loadingText} disabled={!generatedPost} className="w-full sm:w-auto">
                {loadingText ? 'Salvando Post Completo...' : 'Salvar Post Completo'}
              </Button>
              <SaveToLibraryButton
                content={generatedImageUrl}
                type="image"
                userId={userId}
                initialName={savedItemName || 'Imagem Gerada'}
                tags={savedItemTags.split(',').map(t => t.trim()).filter(Boolean)}
                label="Salvar Apenas Imagem"
                variant="secondary"
                disabled={!generatedImageUrl || generatedImageUrl === PLACEHOLDER_IMAGE_BASE64}
                className="w-full sm:w-auto"
              />
              <SaveToLibraryButton
                content={generatedPost.content_text}
                type="text"
                userId={userId}
                initialName={savedItemName ? `${savedItemName} (Texto)` : 'Texto do Post'}
                tags={savedItemTags.split(',').map(t => t.trim()).filter(Boolean)}
                label="Salvar Apenas Texto"
                variant="outline"
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
