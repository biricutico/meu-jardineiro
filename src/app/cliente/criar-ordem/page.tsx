'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Image as ImageIcon, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CriarOrdemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    area: '',
    address: '',
    desiredDate: '',
    clienteProposedValue: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login?type=cliente');
          return;
        }

        // Buscar perfil do usuário
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error || !profile || profile.type !== 'cliente') {
          router.push('/auth/login?type=cliente');
          return;
        }

        setUserId(profile.id);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/auth/login?type=cliente');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const serviceTypes = [
    { value: 'rocagem', label: 'Roçagem' },
    { value: 'poda', label: 'Poda' },
    { value: 'jardinagem', label: 'Jardinagem' },
    { value: 'limpeza_lote', label: 'Limpeza de Lote' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'outro', label: 'Outro' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Erro: usuário não identificado');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .insert([
          {
            cliente_id: userId,
            type: formData.type,
            description: formData.description,
            area: formData.area,
            address: formData.address,
            desired_date: formData.desiredDate ? new Date(formData.desiredDate).toISOString() : null,
            cliente_proposed_value: formData.clienteProposedValue ? parseFloat(formData.clienteProposedValue) : null,
            status: 'aguardando_aceite',
            photos: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert('Ordem de serviço criada com sucesso! Prestadores próximos serão notificados.');
      router.push('/cliente');
    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      alert(error.message || 'Erro ao criar ordem de serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/cliente"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nova Ordem de Serviço
            </h1>
            <p className="text-gray-600">
              Preencha os detalhes do serviço que você precisa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Serviço
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione o tipo de serviço</option>
                {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição do Serviço
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva detalhadamente o serviço que você precisa..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Área Aproximada
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 100m², 1 terreno, 1 quintal grande"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Endereço do Serviço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Desejada (opcional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.desiredDate}
                  onChange={(e) => setFormData({ ...formData, desiredDate: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Sistema de Negociação de Valores
                  </h3>
                  <p className="text-sm text-gray-600">
                    Informe quanto você pretende pagar pelo serviço. Os prestadores poderão aceitar seu valor ou propor um valor diferente. Vocês negociam até chegarem em um acordo!
                  </p>
                </div>
              </div>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Proposto (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.clienteProposedValue}
                  onChange={(e) => setFormData({ ...formData, clienteProposedValue: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Campo opcional. Se não informar, os prestadores farão suas propostas.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ImageIcon className="w-5 h-5" />
                <span className="font-semibold">Fotos do Local</span>
              </div>
              <p className="text-sm text-gray-500">
                Funcionalidade de upload de fotos será implementada em breve
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando Ordem...' : 'Criar Ordem de Serviço'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
