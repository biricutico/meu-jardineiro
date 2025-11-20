'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateCPF, formatCPF } from '@/lib/utils';

export default function RecuperarSenhaPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') as 'cliente' | 'prestador' || 'cliente';

  const [step, setStep] = useState<'cpf' | 'email' | 'nova-senha'>('cpf');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const handleCPFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        setError('CPF inválido');
        setLoading(false);
        return;
      }

      // Buscar usuário pelo CPF
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('cpf_cnpj', cleanCPF)
        .eq('user_type', userType)
        .single();

      if (dbError || !profile) {
        setError('CPF não encontrado');
        setLoading(false);
        return;
      }

      setUserId(profile.id);
      setStep('email');
    } catch (err) {
      setError('Erro ao buscar CPF. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar se o email corresponde ao CPF
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (dbError || !profile || profile.email !== email) {
        setError('Email não corresponde ao CPF informado');
        setLoading(false);
        return;
      }

      setStep('nova-senha');
    } catch (err) {
      setError('Erro ao verificar email. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar senha
      if (newPassword.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Atualizar senha no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ password_hash: newPassword })
        .eq('id', userId);

      if (updateError) {
        setError('Erro ao atualizar senha. Tente novamente.');
        setLoading(false);
        return;
      }

      setSuccess('Senha alterada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        window.location.href = `/auth/login?type=${userType}`;
      }, 2000);
    } catch (err) {
      setError('Erro ao alterar senha. Tente novamente.');
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
            Recuperar Senha
          </h1>
          <p className="text-gray-600">
            {step === 'cpf' && 'Informe seu CPF para começar'}
            {step === 'email' && 'Confirme seu email cadastrado'}
            {step === 'nova-senha' && 'Crie uma nova senha'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Etapa 1: CPF */}
          {step === 'cpf' && (
            <form onSubmit={handleCPFSubmit} className="space-y-6">
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

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
                    Verificando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </form>
          )}

          {/* Etapa 2: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

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
                    Verificando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </form>
          )}

          {/* Etapa 3: Nova Senha */}
          {step === 'nova-senha' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

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
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </button>
            </form>
          )}

          {/* Voltar para Login */}
          <div className="text-center pt-4 border-t border-gray-200 mt-6">
            <Link
              href={`/auth/login?type=${userType}`}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              ← Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
