
import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserProfile, updateUserProfile } from '../services/dbService';
import { testGeminiConnection } from '../services/geminiService';
import { UserProfile } from '../types';
import { DEFAULT_BUSINESS_PROFILE, HARDCODED_API_KEY } from '../constants';
// FIX: Add missing import for Cog6ToothIcon
import { KeyIcon, ServerStackIcon, InformationCircleIcon, ArrowDownOnSquareIcon, PaintBrushIcon, GlobeAltIcon, SunIcon, MoonIcon, UserCircleIcon, Cog6ToothIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from '../hooks/useNavigate';

const Settings: React.FC = () => {
  // Profile State
  const [businessProfileForm, setBusinessProfileForm] = useState<UserProfile['businessProfile']>(DEFAULT_BUSINESS_PROFILE);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Media APIs State
  const [pexelsKey, setPexelsKey] = useState('');
  const [pixabayKey, setPixabayKey] = useState('');
  const [unsplashKey, setUnsplashKey] = useState('');
  const [showMediaKeys, setShowMediaKeys] = useState(false);

  const { addToast } = useToast();
  // ... (hooks)
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { navigateTo } = useNavigate();
  const userId = 'mock-user-123';

  useEffect(() => {
    const fetchInitialData = async () => {
      setProfileLoading(true);
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setBusinessProfileForm(profile.businessProfile);
        }
        const savedKey = localStorage.getItem('vitrinex_gemini_api_key');
        if (savedKey) {
          setApiKey(savedKey);
          setIsKeySaved(true);
        } else if (HARDCODED_API_KEY) {
          setApiKey(HARDCODED_API_KEY);
          setIsKeySaved(true);
        }

        setPexelsKey(localStorage.getItem('vitrinex_pexels_key') || '');
        setPixabayKey(localStorage.getItem('vitrinex_pixabay_key') || '');
        setUnsplashKey(localStorage.getItem('vitrinex_unsplash_key') || '');

      } catch (err) {
        addToast({ type: 'error', message: 'Falha ao carregar dados iniciais.' });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchInitialData();
  }, [userId, addToast]);

  const validateAndSetKey = (key: string) => {
    setApiKey(key);
    if (!key.trim()) {
      setKeyError(null);
      return;
    }
    if (!key.startsWith('AIzaSy')) {
      setKeyError('Formato inválido. A chave deve começar com "AIzaSy".');
    } else if (key.length < 38) {
      setKeyError('Chave muito curta.');
    } else if (/\s/.test(key)) {
      setKeyError('A chave não pode conter espaços.');
    } else {
      setKeyError(null);
    }
  };

  const handleSaveKey = async () => {
    if (keyError || !apiKey.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma chave de API válida.' });
      return;
    }
    setIsTesting(true);
    try {
      await testGeminiConnection(apiKey.trim());
      localStorage.setItem('vitrinex_gemini_api_key', apiKey.trim());
      setIsKeySaved(true);
      addToast({ type: 'success', title: 'Chave Salva!', message: 'O motor de IA foi ativado com sucesso.' });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Chave Inválida', message: `A conexão falhou: ${e.message}` });
      setIsKeySaved(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      addToast({ type: 'warning', message: 'Por favor, insira uma chave de API para testar.' });
      return;
    }
    setIsTesting(true);
    try {
      const result = await testGeminiConnection(apiKey.trim());
      addToast({ type: 'success', title: 'Conexão bem-sucedida!', message: `Resposta da IA: "${result.substring(0, 50)}..."` });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Falha na Conexão', message: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const profileData = { businessProfile: businessProfileForm };
      await updateUserProfile(userId, profileData);
      addToast({ type: 'success', message: 'Perfil do negócio salvo com sucesso!' });
    } catch (err) {
      addToast({ type: 'error', message: `Falha ao salvar perfil: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveMediaKeys = () => {
    if (pexelsKey) localStorage.setItem('vitrinex_pexels_key', pexelsKey);
    if (pixabayKey) localStorage.setItem('vitrinex_pixabay_key', pixabayKey);
    if (unsplashKey) localStorage.setItem('vitrinex_unsplash_key', unsplashKey);
    addToast({ type: 'success', message: 'Chaves de mídia salvas!' });
    // Force reload to apply new instances in services (simple way)
    setTimeout(() => window.location.reload(), 1000);
  };


  return (
    <div className="animate-fade-in duration-500 space-y-10 max-w-3xl mx-auto pb-10">
      <h2 className="text-3xl font-bold text-title">Configurações</h2>

      {/* API Key Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-primary" /> Motor de Inteligência (Gemini)
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-title mb-1.5">
              Chave API
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => validateAndSetKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`block w-full px-3 py-2.5 bg-surface border rounded-lg shadow-sm text-body placeholder-muted transition-colors sm:text-sm focus:outline-none pr-10 ${keyError ? 'border-error ring-1 ring-error' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-title transition-colors"
                title={showApiKey ? "Ocultar chave" : "Mostrar chave"}
              >
                {showApiKey ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {keyError && <p className="mt-2 text-xs text-error">{keyError}</p>}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Recursos avançados como <strong>Geração de Vídeo (Veo)</strong> e <strong>Imagens de Alta Qualidade</strong> exigem uma chave de API de um projeto Google Cloud com o faturamento ativo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleSaveKey}
              isLoading={isTesting && !keyError}
              disabled={!!keyError || !apiKey.trim()}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <ServerStackIcon className="w-4 h-4 mr-2" />
              {isKeySaved ? 'Salvar & Reativar' : 'Salvar & Ativar'}
            </Button>
            <Button
              onClick={handleTestKey}
              isLoading={isTesting}
              disabled={!apiKey.trim()}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Testar Conexão
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-primary" /> Bancos de Imagem e Vídeo
        </h3>
        <p className="text-sm text-muted mb-4">
          Conecte chaves de API opcionais para buscar mídias gratuitas direto no editor.
        </p>

        <div className="space-y-4">
          {/* Pexels */}
          <div>
            <label className="block text-sm font-medium text-title mb-1">Chave Pexels</label>
            <div className="relative">
              <input
                type={showMediaKeys ? "text" : "password"}
                value={pexelsKey}
                onChange={(e) => setPexelsKey(e.target.value)}
                placeholder="Cole sua chave Pexels aqui"
                className="block w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Pixabay */}
          <div>
            <label className="block text-sm font-medium text-title mb-1">Chave Pixabay</label>
            <div className="relative">
              <input
                type={showMediaKeys ? "text" : "password"}
                value={pixabayKey}
                onChange={(e) => setPixabayKey(e.target.value)}
                placeholder="Cole sua chave Pixabay aqui"
                className="block w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Unsplash */}
          <div>
            <label className="block text-sm font-medium text-title mb-1">Chave Unsplash (Access Key)</label>
            <div className="relative">
              <input
                type={showMediaKeys ? "text" : "password"}
                value={unsplashKey}
                onChange={(e) => setUnsplashKey(e.target.value)}
                placeholder="Cole sua Access Key do Unsplash aqui"
                className="block w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Button onClick={handleSaveMediaKeys} variant="secondary" className="w-full sm:w-auto">
              Salvar Chaves de Mídia
            </Button>
            <button
              type="button"
              onClick={() => setShowMediaKeys(!showMediaKeys)}
              className="text-sm text-muted hover:text-primary underline"
            >
              {showMediaKeys ? "Ocultar chaves" : "Mostrar chaves"}
            </button>
          </div>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 text-primary" /> Perfil do Negócio
        </h3>
        {profileLoading ? <LoadingSpinner /> : (
          <div className="space-y-4">
            <Input
              id="businessName"
              label="Nome da Empresa"
              value={businessProfileForm.name}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, name: e.target.value })}
            />
            <Textarea
              id="industry"
              label="Indústria / Nicho"
              value={businessProfileForm.industry}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, industry: e.target.value })}
              rows={2}
              placeholder="Ex: E-commerce de moda sustentável"
            />
            <Textarea
              id="targetAudience"
              label="Público-alvo"
              value={businessProfileForm.targetAudience}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, targetAudience: e.target.value })}
              rows={3}
              placeholder="Ex: Mulheres de 25-40 anos, conscientes ambientalmente..."
            />
            <Input
              id="visualStyle"
              label="Estilo Visual"
              value={businessProfileForm.visualStyle}
              onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, visualStyle: e.target.value })}
              placeholder="Ex: Minimalista, vibrante, retrô..."
            />

            <div>
              <label className="block text-sm font-medium text-title mb-2">Logo da Marca (Overlay Automático)</label>
              <div className="flex items-center gap-4">
                {businessProfileForm.logoUrl ? (
                  <div className="relative group">
                    <img src={businessProfileForm.logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain bg-gray-100 rounded-lg border border-border" />
                    <button
                      onClick={() => setBusinessProfileForm({ ...businessProfileForm, logoUrl: undefined })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      title="Remover logo"
                    >
                      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSIxOCIgeTE9IjYiIHgyPSI2IiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iNiIgeTE9IjYiIHgyPSIxOCIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+" alt="X" className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted">
                    <PhotoIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBusinessProfileForm(prev => ({ ...prev, logoUrl: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-muted
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary-dark
                      cursor-pointer"
                  />
                  <p className="text-xs text-muted mt-1">Carregue um PNG com fundo transparente para melhores resultados.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="location"
                label="Localização (Cidade/Estado)"
                value={businessProfileForm.location || ''}
                onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, location: e.target.value })}
                placeholder="Ex: São Paulo, SP"
              />
              <div className="md:col-span-2">
                <Textarea
                  id="brandPersonality"
                  label="Personalidade da Marca (Como você fala?)"
                  value={businessProfileForm.brandPersonality || ''}
                  onChange={(e) => setBusinessProfileForm({ ...businessProfileForm, brandPersonality: e.target.value })}
                  rows={2}
                  placeholder="Ex: Somos engraçados, jovens e usamos gírias locais. Ou: Somos sérios, luxuosos e formais."
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} isLoading={savingProfile} variant="primary" className="w-full sm:w-auto">
              Salvar Perfil
            </Button>
          </div>
        )}
      </div>

      {/* System Preferences Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5 text-primary" /> Preferências do Sistema
        </h3>
        <div className="space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-medium text-title mb-2 flex items-center gap-2">
              <PaintBrushIcon className="w-4 h-4" /> Tema da Interface
            </label>
            <div className="flex gap-2 rounded-lg bg-background p-1 border border-border w-fit">
              <button onClick={() => toggleTheme()} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                <SunIcon className="w-4 h-4 inline mr-1.5" /> Claro
              </button>
              <button onClick={() => toggleTheme()} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted hover:text-title'}`}>
                <MoonIcon className="w-4 h-4 inline mr-1.5" /> Escuro
              </button>
            </div>
          </div>
          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-title mb-2 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" /> Idioma
            </label>
            <div className="flex gap-2 rounded-lg bg-background p-1 border border-border w-fit">
              <button onClick={() => setLanguage('pt-BR')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'pt-BR' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                Português
              </button>
              <button onClick={() => setLanguage('en-US')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'en-US' ? 'bg-white text-title shadow-sm' : 'text-muted hover:text-title'}`}>
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Access Section */}
      <div className="bg-surface p-8 rounded-xl shadow-card border border-border opacity-60 hover:opacity-100 transition-opacity">
        <h3 className="text-lg font-semibold text-title mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-gray-400" /> Acesso Administrativo
        </h3>
        <p className="text-sm text-muted mb-4">
          Acesse o painel de controle mestre para gerenciar usuários, configurações globais e logs do sistema.
          Requer senha mestre.
        </p>
        <Button
          onClick={() => navigateTo('Admin')}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          Acessar Painel Mestre
        </Button>
      </div>

    </div>
  );
};

export default Settings;
