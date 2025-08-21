import React from 'react';
import { CardCounter as CardCounterClass } from '../logic/cardCounter';

interface CardCounterProps {
  cardCounter: CardCounterClass;
}

export default function CardCounter({ cardCounter }: CardCounterProps) {
  const stats = cardCounter.getStats();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable': return 'text-green-400';
      case 'défavorable': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };
  
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'favorable': return 'bg-green-900/30 border-green-500/50';
      case 'défavorable': return 'bg-red-900/30 border-red-500/50';
      default: return 'bg-yellow-900/30 border-yellow-500/50';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-40 p-4 rounded-lg border-2 ${getStatusBg(stats.status)} backdrop-blur-sm`}>
      <div className="text-center">
        <h3 className="text-lg font-bold mb-3 text-white">🎯 COMPTEUR DE CARTES</h3>
        
        {/* Count principal */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-white">
            {stats.count > 0 ? `+${stats.count}` : stats.count}
          </div>
          <div className="text-sm text-gray-300">Count brut</div>
        </div>
        
        {/* True Count */}
        <div className="mb-3">
          <div className={`text-xl font-bold ${getStatusColor(stats.status)}`}>
            {stats.trueCount > 0 ? `+${stats.trueCount}` : stats.trueCount}
          </div>
          <div className="text-sm text-gray-300">True Count</div>
        </div>
        
        {/* Statut du deck */}
        <div className="mb-3">
          <div className={`text-lg font-semibold ${getStatusColor(stats.status)}`}>
            {stats.status.toUpperCase()}
          </div>
          <div className="text-xs text-gray-400">Statut du deck</div>
        </div>
        
        {/* Cartes restantes */}
        <div className="mb-3">
          <div className="text-sm text-white">
            {Math.round(stats.cardsRemaining)}% cartes restantes
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.cardsRemaining > 70 ? 'bg-green-500' : 
                stats.cardsRemaining > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.cardsRemaining}%` }}
            ></div>
          </div>
        </div>
        
        {/* Conseils */}
        <div className="text-xs text-center text-gray-300 leading-tight">
          {stats.advice}
        </div>
        
        {/* Indicateurs spéciaux */}
        {stats.trueCount > 3 && (
          <div className="mt-2 p-2 bg-green-600/50 rounded text-xs text-white font-bold">
            🎰 PRENDRE L'ASSURANCE !
          </div>
        )}
        
        {stats.trueCount < -3 && (
          <div className="mt-2 p-2 bg-red-600/50 rounded text-xs text-white font-bold">
            ⚠️ RÉDUIRE LES MISES !
          </div>
        )}
      </div>
    </div>
  );
}

