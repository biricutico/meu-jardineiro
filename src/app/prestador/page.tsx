'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Calendar, Star, MapPin, Clock, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServiceOrder {
  id: string;
  type: string;
  description: string;
  area: string;
  address: string;
  status: string;
  cliente_proposed_value: number | null;
  prestador_proposed_value: number | null;
  final_value: number | null;
  created_at: string;
}

export default function PrestadorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'disponivel' | 'aceitos' | 'historico'>('disponivel');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [availableOrders, setAvailableOrders] = useState<ServiceOrder[]>([]);
  const [myOrders, setMyOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login?type=prestador');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!profile || profile.type !== 'prestador') {
        router.push('/auth/login?type=prestador');
        return;
      }

      setUserId(profile.id);
      setUserName(profile.name);
      loadOrders(profile.id);
    };

    checkAuth();
  }, [router]);

  const loadOrders = async (prestadorId: string) => {
    try {
      // Carregar ordens disponíveis (sem prestador atribuído)
      const { data: available, error: availableError } = await supabase
        .from('service_orders')
        .select('*')
        .is('prestador_id', null)
        .in('status', ['aguardando_aceite', 'negociando'])
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      // Carregar minhas ordens (aceitas por mim)
      const { data: mine, error: mineError } = await supabase
        .from('service_orders')
        .select('*')
        .eq('prestador_id', prestadorId)
        .order('created_at', { ascending: false });

      if (mineError) throw mineError;
      setMyOrders(mine || []);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          prestador_id: userId,
          status: 'aceito',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      alert('Ordem de serviço aceita com sucesso!');
      loadOrders(userId);
    } catch (error: any) {
      console.error('Erro ao aceitar ordem:', error);
      alert(error.message || 'Erro ao aceitar ordem. Tente novamente.');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      aguardando_aceite: 'Aguardando Aceite',
      negociando: 'Em Negociação',
      aceito: 'Aceito',
      a_caminho: 'A Caminho',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      aguardando_aceite: 'bg-yellow-100 text-yellow-800',
      negociando: 'bg-blue-100 text-blue-800',
      aceito: 'bg-green-100 text-green-800',
      a_caminho: 'bg-purple-100 text-purple-800',
      em_andamento: 'bg-indigo-100 text-indigo-800',
      concluido: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      rocagem: 'Roçagem',
      poda: 'Poda',
      jardinagem: 'Jardinagem',
      limpeza_lote: 'Limpeza de Lote',
      manutencao: 'Manutenção',
      outro: 'Outro',
    };
    return labels[type] || type;
  };

  const activeOrders = myOrders.filter(o => !['concluido', 'cancelado'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'concluido');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Olá, {userName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus serviços e agenda
              </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Sua Avaliação</p>
                <p className="text-lg font-bold text-gray-900">0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Disponíveis</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{availableOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Aceitos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeOrders.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedOrders.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Este Mês</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{myOrders.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('disponivel')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'disponivel'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Serviços Disponíveis
              </button>
              <button
                onClick={() => setActiveTab('aceitos')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'aceitos'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Meus Serviços
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'historico'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'disponivel' && 'Serviços Próximos a Você'}
              {activeTab === 'aceitos' && 'Serviços Aceitos'}
              {activeTab === 'historico' && 'Histórico de Serviços'}
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtrar</span>
            </button>
          </div>

          {/* Serviços Disponíveis */}
          {activeTab === 'disponivel' && (
            <>
              {availableOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum serviço disponível no momento
                  </h3>
                  <p className="text-gray-600">
                    Novos serviços aparecerão aqui quando clientes próximos criarem pedidos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {getTypeLabel(order.type)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{order.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{order.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Área: {order.area}</span>
                            </div>
                          </div>
                        </div>
                        
                        {order.cliente_proposed_value && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-gray-900">Proposta do Cliente</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                              R$ {order.cliente_proposed_value.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Você pode aceitar ou negociar
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          {order.cliente_proposed_value ? 'Aceitar Proposta' : 'Aceitar Serviço'}
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          Fazer Contraproposta
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Meus Serviços */}
          {activeTab === 'aceitos' && (
            <>
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Você ainda não aceitou nenhum serviço
                  </h3>
                  <p className="text-gray-600">
                    Aceite serviços disponíveis para começar a trabalhar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {getTypeLabel(order.type)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{order.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{order.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Área: {order.area}</span>
                            </div>
                          </div>
                        </div>
                        
                        {order.final_value && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Valor Acordado</p>
                            <p className="text-2xl font-bold text-green-700">
                              R$ {order.final_value.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Histórico */}
          {activeTab === 'historico' && (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum serviço concluído ainda
              </h3>
              <p className="text-gray-600">
                Seu histórico de serviços concluídos aparecerá aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
