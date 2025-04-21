import React from 'react'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">BrokerBooster</h1>
          <p className="mt-2 text-gray-600">Sistema de Gamificação para Corretores Imobiliários</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Bem-vindo ao BrokerBooster, sua plataforma de gerenciamento imobiliário com recursos
            avançados de gamificação para aumentar o engajamento e produtividade da sua equipe.
          </p>
          
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-xl font-semibold text-gray-800">Principais Recursos:</h2>
            <ul className="mt-2 space-y-2 list-disc list-inside text-gray-700">
              <li>Dashboard personalizado</li>
              <li>Sistema de pontos e conquistas</li>
              <li>Ranking semanal</li>
              <li>Gerenciamento de atividades</li>
              <li>Controle de negociações</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BrokerBooster - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
