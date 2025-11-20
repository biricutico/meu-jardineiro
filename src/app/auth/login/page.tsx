'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') as 'cliente' | 'prestador' || 'cliente';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Fazer login diretamente com email e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        
        // Mensagens de erro mais específicas (SEM verificação de email confirmado)
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
        } else if (authError.message.includes('User not found')) {
          setError('Usuário não encontrado. Verifique se você já criou uma conta.');
        } else {
          setError(`Erro ao fazer login: ${authError.message}`);
        }
        
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Erro ao autenticar usuário');
        setLoading(false);
        return;
      }

      console.log('Usuário autenticado:', authData.user.id);

      // Buscar perfil do usuário para verificar o tipo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setError('Erro ao buscar perfil. Entre em contato com o suporte.');
        setLoading(false);
        return;
      }

      if (!profile) {
        console.error('Perfil não encontrado para user_id:', authData.user.id);
        setError('Perfil não encontrado. Entre em contato com o suporte.');
        setLoading(false);
        return;
      }

      console.log('Perfil encontrado:', profile);

      // Verificar se o tipo de usuário corresponde
      if (profile.type !== userType) {
        setError(`Esta conta não é do tipo ${userType}. Tente fazer login na área correta.`);
        setLoading(false);
        return;
      }

      // Salvar sessão no localStorage
      localStorage.setItem('user', JSON.stringify({
        id: profile.id,
        user_id: profile.user_id,
        type: profile.type,
        name: profile.name,
        email: profile.email,
        cpf: profile.cpf_cnpj,
        phone: profile.phone
      }));

      console.log('Login bem-sucedido, redirecionando...');

      // Redirecionar para área correspondente
      if (userType === 'cliente') {
        router.push('/cliente');
      } else {
        router.push('/prestador');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
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
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
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

            {/* Esqueci minha senha */}
            <div className="text-right">
              <Link
                href={`/auth/recuperar-senha?type=${userType}`}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Esqueci minha senha
              </Link>
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
                href={userType === 'cliente' ? '/cadastro/cliente' : '/cadastro/prestador'}
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
