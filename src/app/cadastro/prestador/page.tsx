'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Mail, Phone, Lock, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Upload, Camera, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateCPF, formatCPF, formatPhone, validateEmail, validatePassword } from '@/lib/utils';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS = ['Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-22h)'];

export default function CadastroPrestadorPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    confirmEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    rgPhoto: null as File | null,
    equipmentPhotos: [] as File[],
    availability: {} as Record<string, string[]>,
    serviceRadius: '10',
    serviceCities: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rgPhotoPreview, setRgPhotoPreview] = useState<string | null>(null);
  const [equipmentPreviews, setEquipmentPreviews] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRgPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('rgPhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRgPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEquipmentPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleChange('equipmentPhotos', [...formData.equipmentPhotos, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEquipmentPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEquipmentPhoto = (index: number) => {
    const newPhotos = formData.equipmentPhotos.filter((_, i) => i !== index);
    const newPreviews = equipmentPreviews.filter((_, i) => i !== index);
    handleChange('equipmentPhotos', newPhotos);
    setEquipmentPreviews(newPreviews);
  };

  const toggleAvailability = (dia: string, horario: string) => {
    const current = formData.availability[dia] || [];
    const updated = current.includes(horario)
      ? current.filter(h => h !== horario)
      : [...current, horario];
    
    handleChange('availability', {
      ...formData.availability,
      [dia]: updated
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome completo é obrigatório';
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite seu nome completo';
    }

    // CPF
    const cleanCPF = formData.cpf.replace(/\D/g, '');
    if (!cleanCPF) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(cleanCPF)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Confirmar Email
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Os emails não coincidem';
    }

    // Telefone
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    // Foto RG
    if (!formData.rgPhoto) {
      newErrors.rgPhoto = 'Foto do RG é obrigatória';
    }

    // Senha
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirmar Senha
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    // Disponibilidade
    if (Object.keys(formData.availability).length === 0) {
      newErrors.availability = 'Selecione pelo menos um horário disponível';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const cleanCPF = formData.cpf.replace(/\D/g, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Verificar se CPF já existe
      const { data: existingCPF, error: cpfError } = await supabase
        .from('profiles')
        .select('id')
        .eq('cpf_cnpj', cleanCPF)
        .maybeSingle();

      if (cpfError) {
        console.error('Erro ao verificar CPF:', cpfError);
        throw new Error('Erro ao verificar CPF');
      }

      if (existingCPF) {
        setErrors({ cpf: 'CPF já cadastrado' });
        setLoading(false);
        return;
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            type: 'prestador'
          }
        }
      });

      if (authError) {
        console.error('Erro no Supabase Auth:', authError);
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'Email já cadastrado' });
        } else {
          setErrors({ submit: authError.message });
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Em produção, fazer upload das fotos para storage
      const rgPhotoUrl = 'placeholder_rg.jpg';
      const equipmentPhotosUrls = formData.equipmentPhotos.map((_, i) => `placeholder_equipment_${i}.jpg`);

      // Preparar áreas de atuação
      const serviceAreas = {
        radius: parseInt(formData.serviceRadius),
        cities: formData.serviceCities.split(',').map(c => c.trim()).filter(c => c)
      };

      // Criar perfil na tabela profiles COM EMAIL
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            type: 'prestador',
            name: formData.name.trim(),
            email: formData.email.toLowerCase(),
            cpf_cnpj: cleanCPF,
            phone: cleanPhone,
            address: '',
            availability: formData.availability,
            rating: 0,
            total_services: 0,
            completed_orders: 0,
            portfolio: equipmentPhotosUrls,
            specialties: []
          }
        ]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw new Error('Erro ao criar perfil: ' + profileError.message);
      }

      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/auth/login?type=prestador');
      }, 2000);

    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setErrors({ submit: err.message || 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-4">
            Sua conta foi criada com sucesso. Redirecionando para o login...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Briefcase className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Prestador
          </h1>
          <p className="text-gray-600">
            Preencha seus dados para começar a receber pedidos
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Dados Pessoais
              </h2>
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="João Silva"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.cpf ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cpf}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Confirmar Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.confirmEmail}
                        onChange={(e) => handleChange('confirmEmail', e.target.value)}
                        placeholder="Confirme seu email"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          errors.confirmEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.confirmEmail && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documentação */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Documentação
              </h2>
              <div className="space-y-4">
                {/* Foto RG */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto do RG (segurando o documento) *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-500 transition-colors ${
                        errors.rgPhoto ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        {rgPhotoPreview ? (
                          <img src={rgPhotoPreview} alt="RG Preview" className="max-h-48 mx-auto rounded" />
                        ) : (
                          <>
                            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Clique para adicionar foto</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRgPhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {errors.rgPhoto && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.rgPhoto}
                    </p>
                  )}
                </div>

                {/* Fotos Equipamentos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos dos Equipamentos (opcional, mas recomendado)
                  </label>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Clique para adicionar fotos</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEquipmentPhotosChange}
                      className="hidden"
                    />
                  </label>
                  {equipmentPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {equipmentPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Equipment ${index + 1}`} className="w-full h-32 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeEquipmentPhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Disponibilidade */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Disponibilidade de Horário *
              </h2>
              <div className="space-y-3">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{dia}</p>
                    <div className="flex flex-wrap gap-2">
                      {HORARIOS.map(horario => (
                        <button
                          key={horario}
                          type="button"
                          onClick={() => toggleAvailability(dia, horario)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availability[dia]?.includes(horario)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.availability && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.availability}
                </p>
              )}
            </div>

            {/* Áreas de Atuação */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Áreas de Atuação
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raio de atendimento (km)
                  </label>
                  <select
                    value={formData.serviceRadius}
                    onChange={(e) => handleChange('serviceRadius', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="15">15 km</option>
                    <option value="20">20 km</option>
                    <option value="30">30 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidades específicas (opcional, separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formData.serviceCities}
                    onChange={(e) => handleChange('serviceCities', e.target.value)}
                    placeholder="Ex: São Paulo, Guarulhos, Osasco"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Segurança
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres, com maiúscula, minúscula e número
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirme sua senha"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Geral */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta de Prestador'
              )}
            </button>

            {/* Já tem conta */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/auth/login?type=prestador" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Fazer login
                </Link>
              </p>
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
