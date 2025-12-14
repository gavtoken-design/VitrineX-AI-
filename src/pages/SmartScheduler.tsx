
import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { getLibraryItems, getScheduleEntries, saveScheduleEntry, deleteScheduleEntry, updateScheduleEntry, getLibraryItem } from '../services/dbService';
import { ScheduleEntry, LibraryItem } from '../types';
import { PlusIcon, TrashIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PencilIcon, EyeIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';
import { startSchedulerWorker, stopSchedulerWorker } from '../services/schedulerWorker';
import { initializeNotifications, notifyPostPublished, notifyPostFailed, notifyScheduleCreated, notifyScheduleCancelled } from '../services/notificationService';

const SmartScheduler: React.FC = () => {
  const [scheduledItems, setScheduledItems] = useState<ScheduleEntry[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newSchedulePlatform, setNewSchedulePlatform] = useState<string>('');
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');
  const [newScheduleTime, setNewScheduleTime] = useState<string>('');
  const [newScheduleContentId, setNewScheduleContentId] = useState<string>('');
  const [newScheduleContentType, setNewScheduleContentType] = useState<ScheduleEntry['contentType']>('post');
  const [scheduling, setScheduling] = useState<boolean>(false);

  // Estados para edição
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para pré-visualização
  const [previewEntry, setPreviewEntry] = useState<ScheduleEntry | null>(null);
  const [previewContent, setPreviewContent] = useState<LibraryItem | null>(null);

  // Estados para filtros
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const userId = 'mock-user-123';
  const { addToast } = useToast();

  const fetchSchedulerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSchedule = await getScheduleEntries(userId);
      const fetchedLibrary = await getLibraryItems(userId);
      setScheduledItems(fetchedSchedule.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
      setLibraryItems(fetchedLibrary);

      if (fetchedLibrary.length > 0 && !newScheduleContentId) {
        setNewScheduleContentId(fetchedLibrary[0].id);
        setNewScheduleContentType(fetchedLibrary[0].type);
      }
    } catch (err) {
      const errorMessage = `Falha ao carregar dados do agendador: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro de Carregamento', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [userId, newScheduleContentId, addToast]);

  useEffect(() => {
    // Inicializar notificações
    initializeNotifications();

    // Carregar dados
    fetchSchedulerData();

    // Iniciar worker de execução automática
    startSchedulerWorker(
      userId,
      // Callback de sucesso
      async (entry) => {
        const content = await getLibraryItem(entry.contentId);
        notifyPostPublished(entry.platform, content?.name || 'Conteúdo');
        addToast({ type: 'success', message: `Post publicado no ${entry.platform}!` });
        // Recarregar lista
        fetchSchedulerData();
      },
      // Callback de falha
      async (entry, error) => {
        const content = await getLibraryItem(entry.contentId);
        notifyPostFailed(entry.platform, content?.name || 'Conteúdo', error.message);
        addToast({ type: 'error', message: `Falha ao publicar no ${entry.platform}` });
        // Recarregar lista
        fetchSchedulerData();
      }
    );

    // Limpar ao desmontar
    return () => {
      stopSchedulerWorker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScheduleContent = useCallback(async () => {
    if (!newSchedulePlatform || !newScheduleDate || !newScheduleTime || !newScheduleContentId) {
      addToast({ type: 'warning', message: 'Por favor, preencha todos os campos para agendar.' });
      return;
    }

    setScheduling(true);
    setError(null);

    try {
      const combinedDateTime = `${newScheduleDate}T${newScheduleTime}:00`;
      const scheduledDate = new Date(combinedDateTime);
      const now = new Date();

      // Validar se é futuro
      if (scheduledDate <= now) {
        addToast({ type: 'warning', message: 'A data/hora deve ser no futuro!' });
        setScheduling(false);
        return;
      }

      // Validar máximo 1 ano
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (scheduledDate > oneYearFromNow) {
        addToast({ type: 'warning', message: 'Não é possível agendar para mais de 1 ano no futuro!' });
        setScheduling(false);
        return;
      }

      const newEntry: ScheduleEntry = {
        id: `schedule-${Date.now()}`,
        userId: userId,
        datetime: new Date(combinedDateTime).toISOString(),
        platform: newSchedulePlatform,
        contentId: newScheduleContentId,
        contentType: newScheduleContentType,
        status: 'scheduled',
      };
      const savedEntry = await saveScheduleEntry(newEntry);
      setScheduledItems((prev) => [...prev, savedEntry].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));

      setNewSchedulePlatform('');
      setNewScheduleDate('');
      setNewScheduleTime('');
      addToast({ type: 'success', message: 'Conteúdo agendado com sucesso!' });
      notifyScheduleCreated(newSchedulePlatform, savedEntry.datetime);
    } catch (err) {
      const errorMessage = `Falha ao agendar conteúdo: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setScheduling(false);
    }
  }, [newSchedulePlatform, newScheduleDate, newScheduleTime, newScheduleContentId, newScheduleContentType, userId, addToast]);

  const handleDeleteSchedule = useCallback(async (entryId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setError(null);
      try {
        const entry = scheduledItems.find(e => e.id === entryId);
        await deleteScheduleEntry(entryId);
        setScheduledItems((prev) => prev.filter((entry) => entry.id !== entryId));
        addToast({ type: 'success', message: 'Agendamento cancelado.' });
        if (entry) {
          notifyScheduleCancelled(entry.platform);
        }
      } catch (err) {
        const errorMessage = `Falha ao cancelar agendamento: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMessage);
        addToast({ type: 'error', title: 'Erro', message: errorMessage });
      }
    }
  }, [addToast]);

  const getItemDetails = useCallback((contentId: string) => {
    return libraryItems.find(item => item.id === contentId);
  }, [libraryItems]);

  const handleEditSchedule = useCallback((entry: ScheduleEntry) => {
    setEditingEntry(entry);
    const datetime = new Date(entry.datetime);
    setNewScheduleDate(datetime.toISOString().split('T')[0]);
    setNewScheduleTime(datetime.toTimeString().slice(0, 5));
    setNewSchedulePlatform(entry.platform);
    setNewScheduleContentId(entry.contentId);
    setNewScheduleContentType(entry.contentType);
    setShowEditModal(true);
  }, []);

  const handleUpdateSchedule = useCallback(async () => {
    if (!editingEntry || !newSchedulePlatform || !newScheduleDate || !newScheduleTime) {
      addToast({ type: 'warning', message: 'Por favor, preencha todos os campos.' });
      return;
    }

    try {
      const combinedDateTime = `${newScheduleDate}T${newScheduleTime}:00`;
      const scheduledDate = new Date(combinedDateTime);
      const now = new Date();

      // Validar se é futuro
      if (scheduledDate <= now) {
        addToast({ type: 'warning', message: 'A data/hora deve ser no futuro!' });
        return;
      }

      await updateScheduleEntry(editingEntry.id, {
        datetime: scheduledDate.toISOString(),
        platform: newSchedulePlatform,
        contentId: newScheduleContentId,
        contentType: newScheduleContentType,
      });

      // Atualizar lista local
      setScheduledItems((prev) =>
        prev.map((item) =>
          item.id === editingEntry.id
            ? { ...item, datetime: scheduledDate.toISOString(), platform: newSchedulePlatform, contentId: newScheduleContentId, contentType: newScheduleContentType }
            : item
        ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      );

      addToast({ type: 'success', message: 'Agendamento atualizado com sucesso!' });
      setShowEditModal(false);
      setEditingEntry(null);
      setNewSchedulePlatform('');
      setNewScheduleDate('');
      setNewScheduleTime('');
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao atualizar agendamento.' });
    }
  }, [editingEntry, newSchedulePlatform, newScheduleDate, newScheduleTime, newScheduleContentId, newScheduleContentType, addToast]);

  const handlePreview = useCallback(async (entry: ScheduleEntry) => {
    setPreviewEntry(entry);
    const content = await getLibraryItem(entry.contentId);
    setPreviewContent(content);
  }, []);

  const filteredScheduledItems = useCallback(() => {
    let filtered = scheduledItems;

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(item => item.platform === filterPlatform);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered;
  }, [scheduledItems, filterPlatform, filterStatus]);

  const getStatusIcon = (status: ScheduleEntry['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-5 h-5 text-accent" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'scheduled':
      default:
        return <ClockIcon className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Agendador Inteligente (Autopost)</h2>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Agendar Nova Publicação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentSelect" className="block text-sm font-medium text-textlight mb-1">
              Conteúdo para Publicar:
            </label>
            <select
              id="contentSelect"
              value={newScheduleContentId}
              onChange={(e) => {
                setNewScheduleContentId(e.target.value);
                const selectedItem = libraryItems.find(item => item.id === e.target.value);
                if (selectedItem) {
                  setNewScheduleContentType(selectedItem.type);
                }
              }}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-lightbg text-textdark focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm mb-2"
            >
              <option value="">Selecione um item da Biblioteca</option>
              {libraryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
            {newScheduleContentId && getItemDetails(newScheduleContentId)?.thumbnail_url && (
              <img
                src={getItemDetails(newScheduleContentId)?.thumbnail_url || 'https://picsum.photos/100/100'}
                alt="Selected content thumbnail"
                className="w-24 h-24 object-cover rounded-md mt-2 border border-gray-700"
              />
            )}
          </div>
          <div>
            <label htmlFor="platformSelect" className="block text-sm font-medium text-textlight mb-1">
              Plataforma:
            </label>
            <select
              id="platformSelect"
              value={newSchedulePlatform}
              onChange={(e) => setNewSchedulePlatform(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-lightbg text-textdark focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm"
            >
              <option value="">Selecione uma plataforma</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Pinterest">Pinterest</option>
              <option value="GoogleMyBusiness">Google My Business</option>
            </select>
          </div>
          <Input
            id="scheduleDate"
            label="Data:"
            type="date"
            value={newScheduleDate}
            onChange={(e) => setNewScheduleDate(e.target.value)}
          />
          <Input
            id="scheduleTime"
            label="Hora:"
            type="time"
            value={newScheduleTime}
            onChange={(e) => setNewScheduleTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handleScheduleContent}
            isLoading={scheduling}
            variant="primary"
            className="w-full md:w-auto"
            disabled={!newScheduleContentId || !newSchedulePlatform || !newScheduleDate || !newScheduleTime}
          >
            {scheduling ? 'Agendando...' : 'Agendar'}
          </Button>
          <Button
            onClick={() => {
              if (!newSchedulePlatform || !newScheduleContentId) {
                addToast({ type: 'warning', message: 'Selecione conteúdo e plataforma para publicar.' });
                return;
              }
              const now = new Date();
              // Create entry with current time and status 'published'
              const newEntry: ScheduleEntry = {
                id: `schedule-${Date.now()}`,
                userId: userId,
                datetime: now.toISOString(),
                platform: newSchedulePlatform,
                contentId: newScheduleContentId,
                contentType: newScheduleContentType,
                status: 'published',
              };

              saveScheduleEntry(newEntry).then((saved) => {
                setScheduledItems((prev) => [...prev, saved].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
                addToast({ type: 'success', message: 'Conteúdo publicado com sucesso!' });
                // Reset form
                setNewSchedulePlatform('');
                setNewScheduleDate('');
                setNewScheduleTime('');
              }).catch(err => {
                addToast({ type: 'error', message: 'Erro ao publicar.' });
                console.error(err);
              });
            }}
            variant="secondary"
            className="w-full md:w-auto"
            disabled={!newScheduleContentId || !newSchedulePlatform}
          >
            Publicar Agora
          </Button>
        </div>
      </div>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-textlight">Próximos Agendamentos e Histórico</h3>

          {/* Filtros */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-textmuted" />
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-1.5 border border-gray-700 rounded-md bg-darkbg text-textlight text-sm focus:outline-none focus:ring-2 focus:ring-neonGreen"
              >
                <option value="all">Todas as Plataformas</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Pinterest">Pinterest</option>
                <option value="GoogleMyBusiness">Google My Business</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-700 rounded-md bg-darkbg text-textlight text-sm focus:outline-none focus:ring-2 focus:ring-neonGreen"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendados</option>
              <option value="published">Publicados</option>
              <option value="failed">Falhados</option>
            </select>

            {(filterPlatform !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setFilterPlatform('all');
                  setFilterStatus('all');
                }}
                className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
            <p className="ml-2 text-textlight">Carregando agendamentos...</p>
          </div>
        ) : scheduledItems.length === 0 ? (
          <div className="text-center text-textlight p-4">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-darkbg">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-lightbg divide-y divide-gray-700">
                {filteredScheduledItems().map((entry) => {
                  const item = getItemDetails(entry.contentId);
                  const dateTime = new Date(entry.datetime);
                  const isPast = dateTime < new Date();
                  return (
                    <tr key={entry.id} className={isPast ? 'bg-darkbg text-textmuted' : 'text-textlight'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center">
                          {getStatusIcon(entry.status)}
                          <span className="ml-2 capitalize">{entry.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item ? item.name : 'Conteúdo não encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {entry.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {/* Botão Preview */}
                          <Button
                            onClick={() => handlePreview(entry)}
                            variant="secondary"
                            size="sm"
                          >
                            <EyeIcon className="w-4 h-4 text-blue-300" />
                          </Button>

                          {/* Botão Editar (apenas para agendados futuros) */}
                          {!isPast && entry.status === 'scheduled' && (
                            <Button
                              onClick={() => handleEditSchedule(entry)}
                              variant="secondary"
                              size="sm"
                            >
                              <PencilIcon className="w-4 h-4 text-yellow-300" />
                            </Button>
                          )}

                          {/* Botão Cancelar (apenas para agendados futuros) */}
                          {!isPast && entry.status === 'scheduled' && (
                            <Button
                              onClick={() => handleDeleteSchedule(entry.id)}
                              variant="danger"
                              size="sm"
                              className="mr-2"
                            >
                              <TrashIcon className="w-4 h-4 text-red-300" /> Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-lightbg rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-textlight mb-4">Editar Agendamento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-textlight mb-1">Conteúdo:</label>
                <select
                  value={newScheduleContentId}
                  onChange={(e) => {
                    setNewScheduleContentId(e.target.value);
                    const selectedItem = libraryItems.find(item => item.id === e.target.value);
                    if (selectedItem) {
                      setNewScheduleContentType(selectedItem.type);
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-lightbg text-textdark focus:outline-none focus:ring-2 focus:ring-neonGreen"
                >
                  {libraryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textlight mb-1">Plataforma:</label>
                <select
                  value={newSchedulePlatform}
                  onChange={(e) => setNewSchedulePlatform(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-lightbg text-textdark focus:outline-none focus:ring-2 focus:ring-neonGreen"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Pinterest">Pinterest</option>
                  <option value="GoogleMyBusiness">Google My Business</option>
                </select>
              </div>

              <Input
                id="editScheduleDate"
                label="Data:"
                type="date"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
              />

              <Input
                id="editScheduleTime"
                label="Hora:"
                type="time"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                  setNewSchedulePlatform('');
                  setNewScheduleDate('');
                  setNewScheduleTime('');
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateSchedule}
                variant="primary"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização */}
      {previewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-lightbg rounded-lg p-6 max-w-2xl w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-textlight">Pré-visualização</h3>
              <button
                onClick={() => {
                  setPreviewEntry(null);
                  setPreviewContent(null);
                }}
                className="text-textmuted hover:text-textlight"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-darkbg rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {previewEntry.platform[0]}
                </div>
                <div>
                  <p className="text-textlight font-semibold">{previewEntry.platform}</p>
                  <p className="text-textmuted text-sm">
                    {new Date(previewEntry.datetime).toLocaleString()}
                  </p>
                </div>
              </div>

              {previewContent?.thumbnail_url && (
                <img
                  src={previewContent.thumbnail_url}
                  alt={previewContent.name}
                  className="w-full rounded-lg mb-3"
                />
              )}

              <p className="text-textlight">{previewContent?.name || 'Conteúdo'}</p>

              <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-4 text-textmuted text-sm">
                <span>❤️ Curtir</span>
                <span>💬 Comentar</span>
                <span>📤 Compartilhar</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(previewEntry.status)}
                <span className="text-textlight capitalize">{previewEntry.status}</span>
              </div>
              <Button
                onClick={() => {
                  setPreviewEntry(null);
                  setPreviewContent(null);
                }}
                variant="secondary"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartScheduler;
