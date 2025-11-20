'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Calendar, Clock, Search, Filter, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

export default function ClientePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login?type=cliente');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!profile || profile.type !== 'cliente') {
        router.push('/auth/login?type=cliente');
        return;
      }

      setUserId(profile.id);
      setUserName(profile.name);
      loadOrders(profile.id);
    };

    checkAuth();
  }, [router]);

  const loadOrders = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      aguardando_aceite: 'Aguardando Aceite',
      negociando: 'Em Negociação',
      aceito: 'Aceito',
      a_caminho: 'Prestador a Caminho',
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

  const activeOrders = orders.filter(o => !['concluido', 'cancelado'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'concluido');

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
                Gerencie seus pedidos de serviço
              </p>
            </div>
            <Link
              href="/cliente/criar-ordem"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Ordem de Serviço</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pedidos Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeOrders.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Pedidos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Minhas Ordens de Serviço
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma ordem de serviço ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Crie sua primeira ordem de serviço para começar
              </p>
              <Link
                href="/cliente/criar-ordem"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Ordem de Serviço</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
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
                    
                    {(order.cliente_proposed_value || order.prestador_proposed_value || order.final_value) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Valores</span>
                        </div>
                        {order.cliente_proposed_value && (
                          <p className="text-sm text-gray-600">
                            Sua proposta: <span className="font-bold text-green-700">R$ {order.cliente_proposed_value.toFixed(2)}</span>
                          </p>
                        )}
                        {order.prestador_proposed_value && (
                          <p className="text-sm text-gray-600">
                            Proposta prestador: <span className="font-bold text-blue-700">R$ {order.prestador_proposed_value.toFixed(2)}</span>
                          </p>
                        )}
                        {order.final_value && (
                          <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-green-300">
                            Valor acordado: <span className="font-bold text-gray-900">R$ {order.final_value.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Ver Detalhes
                    </button>
                    {order.status === 'negociando' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Negociar Valor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
