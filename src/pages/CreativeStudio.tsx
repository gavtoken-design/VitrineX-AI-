
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Textarea from '../components/Textarea';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import SaveToLibraryButton from '../components/SaveToLibraryButton';
import MediaActionsToolbar from '../components/MediaActionsToolbar';
import { generateImage, editImage, generateVideo, analyzeImage } from '../services/geminiService';
import { overlayLogo } from '../services/imageUtils';
import ImageComposer from '../components/ImageComposer'; // NEW
import { getUserProfile } from '../services/dbService';
import { downloadImage } from '../utils/mediaUtils';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilSquareIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import {
  GEMINI_IMAGE_PRO_MODEL,
  GEMINI_IMAGE_FLASH_MODEL,
  VEO_FAST_GENERATE_MODEL,
  PLACEHOLDER_IMAGE_BASE64,
  IMAGE_ASPECT_RATIOS,
  IMAGE_SIZES,
  VIDEO_ASPECT_RATIOS,
  VIDEO_RESOLUTIONS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_VIDEO_RESOLUTION,
  SEASONAL_TEMPLATES,
  PRODUCT_SCENARIOS
} from '../constants';
import { useToast } from '../contexts/ToastContext';

type MediaType = 'image' | 'video' | 'product';

const CreativeStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Custom File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [imageAspectRatio, setImageAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [imageSize, setImageSize] = useState<string>(DEFAULT_IMAGE_SIZE);
  const [useHighQuality, setUseHighQuality] = useState<boolean>(false); // NEW Toggle
  const [videoAspectRatio, setVideoAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [videoResolution, setVideoResolution] = useState<string>(DEFAULT_VIDEO_RESOLUTION);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const [savedItemName, setSavedItemName] = useState<string>('');
  const [savedItemTags, setSavedItemTags] = useState<string>('');

  const [showComposer, setShowComposer] = useState(false); // NEW
  const [composerInitialImage, setComposerInitialImage] = useState<string | null>(null); // NEW

  const { addToast } = useToast();
  const userId = 'mock-user-123';

  // --- Handlers ---

  const applyTemplate = (template: typeof SEASONAL_TEMPLATES[0]) => {
    setPrompt(template.basePrompt);
    setMediaType('image');
    setFile(null); // Templates são para geração do zero
    setPreviewUrl(null);
    addToast({
      type: 'info',
      title: 'Template Aplicado',
      message: 'Personalize o nome do produto no prompt.'
    });
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    // Reset states
    setFile(null);
    setPreviewUrl(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);
    setError(null);
    setSavedItemName('');

    // Validation
    const MAX_SIZE_MB = 20;
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast({ type: 'error', title: 'Arquivo muito grande', message: `Máximo permitido: ${MAX_SIZE_MB}MB.` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      addToast({ type: 'error', title: 'Formato inválido', message: 'Apenas imagens ou vídeos.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);

    try {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } catch (e) {
      console.error("Error creating object URL", e);
      addToast({ type: 'error', message: 'Erro ao visualizar arquivo.' });
      return;
    }

    setSavedItemName(selectedFile.name.split('.').slice(0, -1).join('.'));

    // Auto-detect type
    if (selectedFile.type.startsWith('image')) {
      setMediaType('image');
    } else if (selectedFile.type.startsWith('video')) {
      setMediaType('video');
    }
  }, [addToast]);

  const getFriendlyErrorMessage = (err: any, context: string) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('API key')) return 'Chave de API inválida ou ausente.';
    if (msg.includes('quota') || msg.includes('429')) return 'Limite de uso da API excedido.';
    if (msg.includes('safety') || msg.includes('block')) return 'Bloqueado pelos filtros de segurança.';
    return `Falha em ${context}: ${msg}`;
  };

  const handleGenerateMedia = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Insira um prompt para gerar.' });
      setError('A descrição (Prompt) é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedMediaUrl(null);
    setGeneratedAnalysis(null);

    try {
      if (mediaType === 'image') {
        const response = await generateImage(prompt, {
          model: GEMINI_IMAGE_PRO_MODEL, // High quality generation
          aspectRatio: imageAspectRatio,
          imageSize: imageSize,
          useVertexHighQuality: useHighQuality, // PASS THE TOGGLE
        });
        if (!response.imageUrl) throw new Error('A API não retornou imagem.');

        // Apply Logo Overlay
        let finalImageUrl = response.imageUrl;
        try {
          const profile = await getUserProfile(userId);
          if (profile?.businessProfile?.logoUrl) {
            finalImageUrl = await overlayLogo(response.imageUrl, profile.businessProfile.logoUrl);
            addToast({ type: 'info', message: 'Logo aplicada automaticamente.' });
          }
        } catch (overlayErr) {
          console.warn('Erro ao aplicar logo:', overlayErr);
        }

        setGeneratedMediaUrl(finalImageUrl);
      } else {
        const response = await generateVideo(prompt, {
          model: VEO_FAST_GENERATE_MODEL,
          config: {
            numberOfVideos: 1,
            resolution: videoResolution as "720p" | "1080p",
            aspectRatio: videoAspectRatio as "16:9" | "9:16"
          }
        });
        if (!response) throw new Error('A API não retornou vídeo.');
        setGeneratedMediaUrl(response);
      }
      setSavedItemName(`Gerado ${mediaType} - ${prompt.substring(0, 20)}...`);
      addToast({ type: 'success', title: 'Sucesso', message: 'Mídia gerada com sucesso.' });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'geração'));
      addToast({ type: 'error', message: 'Erro na geração.' });
    } finally {
      setLoading(false);
    }
  }, [prompt, mediaType, imageAspectRatio, imageSize, videoAspectRatio, videoResolution, addToast]);

  const handleEditMedia = useCallback(async () => {
    if (!file || !previewUrl) {
      addToast({ type: 'warning', message: 'Carregue um arquivo para editar.' });
      return;
    }
    if (!prompt.trim()) {
      addToast({ type: 'warning', message: 'Descreva a edição desejada.' });
      return;
    }

    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setGeneratedMediaUrl(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;

      const base64Data = reader.result.split(',')[1];
      const mimeType = file.type;

      try {
        if (mediaType === 'image') {
          // Feature: Use Gemini 2.5 Flash Image for editing via text prompt
          const response = await editImage(prompt, base64Data, mimeType, GEMINI_IMAGE_FLASH_MODEL);
          if (!response.imageUrl) throw new Error('Falha na edição da imagem.');
          setGeneratedMediaUrl(response.imageUrl);
        } else {
          // Video editing (generation with start image)
          const response = await generateVideo(prompt, {
            model: VEO_FAST_GENERATE_MODEL,
            image: { imageBytes: base64Data, mimeType: mimeType },
            config: { resolution: videoResolution as any, aspectRatio: videoAspectRatio as any }
          });
          if (!response) throw new Error('Falha na edição do vídeo.');
          setGeneratedMediaUrl(response);
        }
        setSavedItemName(`Editado - ${prompt.substring(0, 20)}`);
        addToast({ type: 'success', message: 'Edição concluída.' });
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'edição'));
        addToast({ type: 'error', message: 'Erro na edição.' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [file, previewUrl, prompt, mediaType, videoAspectRatio, videoResolution, addToast]);

  const openComposer = () => {
    if (generatedMediaUrl) {
      setComposerInitialImage(generatedMediaUrl);
      setShowComposer(true);
    } else if (previewUrl) {
      setComposerInitialImage(previewUrl);
      setShowComposer(true);
    } else {
      addToast({ type: 'warning', message: 'Gere ou carregue uma imagem primeiro.' });
    }
  };

  const handleAnalyzeMedia = useCallback(async () => {
    if (!file) {
      addToast({ type: 'warning', message: 'Carregue um arquivo para analisar.' });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
      const base64Data = reader.result.split(',')[1];
      const analysisPrompt = prompt.trim() || "Analise detalhadamente esta imagem/vídeo.";

      try {
        const analysis = await analyzeImage(base64Data, file.type, analysisPrompt);
        setGeneratedAnalysis(analysis);
        addToast({ type: 'success', message: 'Análise concluída.' });
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'análise'));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [file, prompt, addToast]);

  const handleSpecificDownload = useCallback(async () => {
    if (generatedMediaUrl) {
      const success = await downloadImage(generatedMediaUrl, `vitrinex-creative-${Date.now()}.png`);
      if (!success) addToast({ type: 'error', message: 'Falha no download.' });
    }
  }, [generatedMediaUrl, addToast]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  return (
    <div className="container mx-auto py-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-title flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            Estúdio Criativo
          </h2>
          <p className="text-muted mt-1">Crie, Edite e Analise mídias com o poder do Gemini 2.5 e Veo.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span className="font-bold">Erro:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

        {showComposer && composerInitialImage ? (
          <div className="col-span-12 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Editor Avançado</h3>
              <Button variant="secondary" onClick={() => setShowComposer(false)}>Fechar Editor</Button>
            </div>
            <ImageComposer
              mainImage={composerInitialImage}
              onCompositionComplete={(result) => {
                setGeneratedMediaUrl(result);
                setMediaType('image');
                setShowComposer(false);
                addToast({ type: 'success', message: 'Composição salva como resultado!' });
              }}
            />
          </div>
        ) : (
          <>
            {/* Left Control Panel */}
            <div className="lg:col-span-4 space-y-6">


              {/* Seasonal Templates Section - NEW */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Modelos de Fim de Ano 🎄</h3>
                <div className="grid grid-cols-2 gap-2">
                  {SEASONAL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl)}
                      className="relative group overflow-hidden rounded-xl border border-border hover:border-primary transition-all text-left h-24"
                    >
                      {/* Background Image (Hidden Link usage) */}
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                        style={{ backgroundImage: `url(${tpl.referenceImage})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      <div className="relative p-3 z-10 flex flex-col justify-end h-full">
                        <div className="text-xl mb-1 filter drop-shadow-lg">{tpl.icon}</div>
                        <div className="text-xs font-bold text-white leading-tight drop-shadow-md">{tpl.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div className="bg-surface p-1 rounded-xl border border-border flex shadow-sm">
                <button
                  onClick={() => { setMediaType('image'); setFile(null); setPreviewUrl(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mediaType === 'image' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-title hover:bg-background'}`}
                >
                  <PhotoIcon className="w-4 h-4" /> Imagem
                </button>
                <button
                  onClick={() => { setMediaType('video'); setFile(null); setPreviewUrl(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mediaType === 'video' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-title hover:bg-background'}`}
                >
                  <VideoCameraIcon className="w-4 h-4" /> Vídeo
                </button>
                <button
                  onClick={() => { setMediaType('product'); setFile(null); setPreviewUrl(null); setSelectedScenario(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mediaType === 'product' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-title hover:bg-background'}`}
                >
                  <CubeIcon className="w-4 h-4" /> Produto
                </button>
              </div>

              {/* Upload Area - Custom Button */}
              <div
                onClick={handleUploadClick}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden
              ${previewUrl
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-primary hover:bg-background'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-40 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video src={previewUrl} className="max-h-full max-w-full rounded shadow-lg" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded shadow-lg" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                      <p className="text-white font-medium text-sm flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4" /> Trocar Arquivo</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-background rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-title">
                      {mediaType === 'product' ? 'Carregue a foto do seu Produto' :
                        mediaType === 'image' ? 'Clique para carregar uma Imagem' : 'Clique para carregar um Vídeo'}
                    </p>
                    <p className="text-xs text-muted mt-1">ou arraste e solte aqui</p>
                  </>
                )}
              </div>

              {/* Configuration */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
                <h3 className="text-sm font-bold text-title mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" /> Configurações
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {mediaType === 'image' ? (
                    <>
                      <div>
                        <label className="text-xs text-muted font-medium mb-1 block">Proporção</label>
                        <select value={imageAspectRatio} onChange={e => setImageAspectRatio(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                          {IMAGE_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted font-medium mb-1 block">Tamanho</label>
                        <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                          {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="col-span-2 flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-title flex items-center gap-1">
                            <SparklesIcon className="w-4 h-4 text-primary" /> Modo Ultra Quality
                          </span>
                          <span className="text-xs text-muted">Usa modelo Vertex (mais créditos)</span>
                        </div>
                        <button
                          onClick={() => setUseHighQuality(!useHighQuality)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${useHighQuality ? 'bg-primary' : 'bg-gray-600'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useHighQuality ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-muted font-medium mb-1 block">Proporção</label>
                        <select value={videoAspectRatio} onChange={e => setVideoAspectRatio(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                          {VIDEO_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted font-medium mb-1 block">Resolução</label>
                        <select value={videoResolution} onChange={e => setVideoResolution(e.target.value)} className="w-full text-sm bg-background border border-border rounded-lg px-2 py-2 text-body focus:ring-1 focus:ring-primary outline-none">
                          {VIDEO_RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Product Studio Scenarios - NEW */}
              {mediaType === 'product' && (
                <div className="mb-6 animate-fade-in">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Escolha um Cenário Mágico ✨</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PRODUCT_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenario(scenario.id);
                          setPrompt(scenario.prompt); // Auto-fill prompt
                        }}
                        className={`relative p-3 rounded-xl text-left border transition-all flex items-center gap-3 overflow-hidden
                      ${selectedScenario === scenario.id
                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                            : 'border-border hover:border-gray-300 dark:hover:border-gray-600 bg-surface'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scenario.previewColor} flex items-center justify-center text-xl shadow-sm`}>
                          {scenario.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-title">{scenario.label}</div>
                          <div className="text-[10px] text-muted leading-tight">Clique para aplicar</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
                <Textarea
                  id="creativePrompt"
                  label={mediaType === 'product' ? "Instruções do Cenário (Personalizável)" : (file ? "Instruções de Edição / Análise" : "Descrição para Geração")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder={mediaType === 'product' ? "Escolha um cenário acima ou descreva um novo..." : (file ? "Ex: 'Adicione um filtro neon', 'Remova o fundo', 'Descreva a imagem'" : "Ex: 'Um robô futurista em uma cidade cyberpunk'")}
                  className="text-sm"
                />

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {file ? (
                    <>
                      <Button
                        onClick={handleEditMedia}
                        isLoading={loading}
                        variant="primary"
                        disabled={loading}
                        className={mediaType === 'product' ? 'col-span-2' : ''}
                      >
                        {mediaType === 'product' ? (
                          <><SparklesIcon className="w-4 h-4 mr-2" /> Gerar Foto de Produto</>
                        ) : (
                          <><PencilSquareIcon className="w-4 h-4 mr-2" /> Editar</>
                        )}
                      </Button>
                      {mediaType !== 'product' && (
                        <Button onClick={handleAnalyzeMedia} isLoading={loading} variant="outline" disabled={loading}>
                          <EyeIcon className="w-4 h-4 mr-2" /> Analisar
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 flex flex-col gap-2">
                      <Button onClick={handleGenerateMedia} isLoading={loading} variant="primary" className="w-full">
                        <SparklesIcon className="w-4 h-4 mr-2" /> Gerar {mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                      </Button>
                      {loading && (
                        <Button
                          onClick={() => {
                            if (abortControllerRef.current) abortControllerRef.current.abort();
                            setLoading(false);
                          }}
                          variant="outline"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          Cancelar 🛑
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Preview Panel */}
            <div className="lg:col-span-8 flex flex-col h-full space-y-6">

              {/* Main Viewer */}
              <div className="flex-1 bg-surface rounded-2xl border border-border shadow-card overflow-hidden relative flex items-center justify-center min-h-[400px] bg-grid-pattern">
                {loading && !generatedMediaUrl && !generatedAnalysis ? (
                  <div className="text-center">
                    <LoadingSpinner className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-muted animate-pulse">Processando com IA...</p>
                  </div>
                ) : generatedMediaUrl ? (
                  mediaType === 'image' ? (
                    <img src={generatedMediaUrl} alt="Result" className="max-w-full max-h-full object-contain shadow-2xl" />
                  ) : (
                    <video src={generatedMediaUrl} controls className="max-w-full max-h-full shadow-2xl" />
                  )
                ) : generatedAnalysis ? (
                  <div className="p-8 max-w-2xl w-full h-full overflow-y-auto">
                    <h3 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                      <EyeIcon className="w-6 h-6 text-primary" /> Análise Visual
                    </h3>
                    <div className="prose prose-invert max-w-none text-body bg-background/50 p-6 rounded-xl border border-border">
                      {generatedAnalysis}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted opacity-50">
                    <PhotoIcon className="w-20 h-20 mx-auto mb-2" />
                    <p>O resultado aparecerá aqui</p>
                  </div>
                )}
              </div>

              {/* Results Toolbar */}
              {(generatedMediaUrl || generatedAnalysis) && (
                <div className="bg-surface rounded-xl border border-border p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-in-from-bottom">
                  <div className="flex-1 w-full">
                    <Input
                      id="saveName"
                      placeholder="Nome para salvar..."
                      value={savedItemName}
                      onChange={e => setSavedItemName(e.target.value)}
                      className="mb-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {mediaType === 'image' && (
                      <Button variant="outline" onClick={openComposer} className="text-xs">
                        🎨 Editar Camadas
                      </Button>
                    )}
                    <SaveToLibraryButton
                      content={generatedMediaUrl || generatedAnalysis}
                      type={generatedAnalysis ? 'text' : (mediaType === 'product' ? 'image' : mediaType)}
                      userId={userId}
                      initialName={savedItemName}
                      tags={['creative-studio', mediaType]}
                      variant="secondary"
                      className="w-full md:w-auto"
                    />
                    {generatedMediaUrl && (
                      <MediaActionsToolbar mediaUrl={generatedMediaUrl} fileName="creative.png" />
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreativeStudio;
