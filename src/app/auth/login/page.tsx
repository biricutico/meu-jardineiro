'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateCPF, formatCPF } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') as 'cliente' | 'prestador' || 'cliente';

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar CPF
      const cleanCPF = cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        setError('CPF inválido');
        setLoading(false);
        return;
      }

      // Buscar usuário no banco
      const { data: users, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('cpf', cleanCPF)
        .eq('type', userType)
        .single();

      if (dbError || !users) {
        setError('CPF ou senha incorretos');
        setLoading(false);
        return;
      }

      // Verificar senha (em produção, use bcrypt)
      // Por enquanto, comparação simples para desenvolvimento
      if (users.password_hash !== password) {
        setError('CPF ou senha incorretos');
        setLoading(false);
        return;
      }

      // Salvar sessão no localStorage
      localStorage.setItem('user', JSON.stringify({
        id: users.id,
        type: users.type,
        name: users.name,
        email: users.email,
        cpf: users.cpf
      }));

      // Redirecionar para área correspondente
      if (userType === 'cliente') {
        router.push('/cliente');
      } else {
        router.push('/prestador');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {userType === 'cliente' ? (
              <div className="bg-green-100 p-4 rounded-full">
                <User className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="bg-emerald-100 p-4 rounded-full">
                <Briefcase className="w-12 h-12 text-emerald-600" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Login {userType === 'cliente' ? 'Cliente' : 'Prestador'}
          </h1>
          <p className="text-gray-600">
            Entre com suas credenciais para acessar
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                userType === 'cliente'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Criar Conta */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 mb-3">Ainda não tem uma conta?</p>
              <Link
                href={`/cadastro/${userType}`}
                className={`inline-block px-6 py-2 rounded-lg font-medium transition-colors ${
                  userType === 'cliente'
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Criar Conta
              </Link>
            </div>
          </form>
        </div>

        {/* Voltar */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  );
}
