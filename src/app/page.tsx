'use client';

import Link from 'next/link';
import { User, Briefcase, Leaf, MapPin, Calendar, Star, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Leaf className="w-20 h-20" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            MEUJARDINEIRO
          </h1>
          <p className="text-xl sm:text-2xl mb-12 text-green-50">
            Conectando jardineiros profissionais com clientes que precisam de serviços de qualidade
          </p>

          {/* Seleção de Perfil */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card Cliente */}
            <Link href="/auth/login?type=cliente">
              <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                    <User className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">Sou Cliente</h2>
                <p className="text-gray-600 mb-4">
                  Preciso de serviços de jardinagem, roçagem ou poda
                </p>
                <div className="bg-green-50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>Encontre profissionais próximos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>Agende serviços facilmente</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-green-600" />
                    <span>Avalie os prestadores</span>
                  </div>
                </div>
                <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Acessar como Cliente
                </button>
              </div>
            </Link>

            {/* Card Prestador */}
            <Link href="/auth/login?type=prestador">
              <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-4 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <Briefcase className="w-12 h-12 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">Sou Prestador</h2>
                <p className="text-gray-600 mb-4">
                  Ofereço serviços de jardinagem e quero conquistar clientes
                </p>
                <div className="bg-emerald-50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Receba pedidos de serviço</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Gerencie sua agenda</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Converse com clientes</span>
                  </div>
                </div>
                <button className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  Acessar como Prestador
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Cadastre-se</h3>
              <p className="text-gray-600">
                Crie sua conta como cliente ou prestador de serviços
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Conecte-se</h3>
              <p className="text-gray-600">
                Encontre profissionais próximos ou receba pedidos de serviço
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Avalie</h3>
              <p className="text-gray-600">
                Avalie o serviço e construa reputação na plataforma
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="w-8 h-8" />
          </div>
          <p className="text-gray-400">
            © 2024 MEUJARDINEIRO - Conectando jardineiros e clientes
          </p>
        </div>
      </footer>
    </div>
  );
}
