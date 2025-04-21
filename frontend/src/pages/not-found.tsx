import React from 'react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-6xl font-bold text-gray-400">404</h1>
        <h2 className="text-2xl font-medium text-gray-600">Página Não Encontrada</h2>
        <p className="text-gray-500">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="pt-6">
          <Link href="/">
            <a className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Voltar ao Início
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
