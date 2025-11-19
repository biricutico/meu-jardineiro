'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, User, Briefcase, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isCliente = pathname?.startsWith('/cliente');
  const isPrestador = pathname?.startsWith('/prestador');

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Leaf className="w-8 h-8" />
            <span className="text-xl font-bold">MEUJARDINEIRO</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Início</span>
            </Link>

            {isCliente && (
              <Link
                href="/cliente"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Área do Cliente</span>
              </Link>
            )}

            {isPrestador && (
              <Link
                href="/prestador"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 font-medium"
              >
                <Briefcase className="w-5 h-5" />
                <span className="hidden sm:inline">Área do Prestador</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
