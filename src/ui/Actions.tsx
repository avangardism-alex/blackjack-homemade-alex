import React, { useState } from "react";
import { getOptimalAction, getStrategyExplanation } from "../logic/strategy";

interface ActionsProps {
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onInsurance: () => void;
  canDoubleDown: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  canInsurance: boolean;
  cardCounter?: { getTrueCount: () => number };
  isInsuranceMandatory: boolean;
  currentHand?: {
    cards: Array<{ r: string; s: string }>;
    bet: number;
    doubled?: boolean;
    insured?: boolean;
  };
  dealerUpCard?: { r: string; s: string };
  bank: number;
}

export default function Actions({
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
  onSurrender,
  onInsurance,
  canDoubleDown,
  canSplit,
  canSurrender,
  canInsurance,
  cardCounter,
  isInsuranceMandatory,
  currentHand,
  dealerUpCard,
  bank
}: ActionsProps) {
  const [showStrategy, setShowStrategy] = useState(false);
  const [strategyAdvice, setStrategyAdvice] = useState("");

  // Fonction pour obtenir le conseil stratégique
  const getStrategyAdvice = () => {
    if (!currentHand || !dealerUpCard) return "Pas de conseil disponible";
    
    const optimalAction = getOptimalAction(
      currentHand,
      dealerUpCard,
      canDoubleDown,
      canSplit,
      canSurrender
    );
    
    const explanation = getStrategyExplanation(currentHand, dealerUpCard, optimalAction);
    return explanation;
  };

  // Fonction pour exécuter l'action optimale
  const executeOptimalAction = () => {
    if (!currentHand || !dealerUpCard) return;
    
    const optimalAction = getOptimalAction(
      currentHand,
      dealerUpCard,
      canDoubleDown,
      canSplit,
      canSurrender
    );
    
    // Exécuter l'action optimale
    switch (optimalAction) {
      case 'hit':
        onHit();
        break;
      case 'stand':
        onStand();
        break;
      case 'double':
        if (canDoubleDown) onDoubleDown();
        break;
      case 'split':
        if (canSplit) onSplit();
        break;
      case 'surrender':
        if (canSurrender) onSurrender();
        break;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Actions principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button 
          onClick={onHit}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border-2 border-green-400"
        >
          <span className="text-sm">🎯</span>
          <span>Tirer</span>
        </button>
        
        <button 
          onClick={onStand}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border-2 border-blue-400"
        >
          <span className="text-sm">✋</span>
          <span>Rester</span>
        </button>
      </div>

      {/* Actions spéciales */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {canDoubleDown && (
          <button 
            onClick={onDoubleDown}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-2 py-2 rounded-lg font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform shadow-lg border-2 border-purple-400"
          >
            <span className="text-xs">x2</span>
            <span>Doubler</span>
          </button>
        )}
        
        {canSplit && (
          <button 
            onClick={onSplit}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-2 py-2 rounded-lg font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform shadow-lg border-2 border-orange-400"
          >
            <span className="text-xs">✂️</span>
            <span>Diviser</span>
          </button>
        )}
        
        {canSurrender && (
          <button 
            onClick={onSurrender}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-2 py-2 rounded-lg font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform shadow-lg border-2 border-red-400"
          >
            <span className="text-xs">🏳️</span>
            <span>Abandonner</span>
          </button>
        )}
      </div>

      {/* Assurance */}
      {canInsurance && (
        <div className="mb-3">
          {isInsuranceMandatory && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm text-center border-2 border-red-400 mb-2">
              🚨 ASSURANCE OBLIGATOIRE !
              {cardCounter && (
                <div className="text-xs opacity-80">
                  Count: +{cardCounter.getTrueCount().toFixed(1)}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={onInsurance}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border-2 ${
              isInsuranceMandatory
                ? 'bg-red-700 hover:bg-red-600 text-white border-red-400'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-yellow-400'
            }`}
          >
            <span className="text-sm">🛡️</span>
            <span>
              {isInsuranceMandatory ? 'FORCER L\'ASSURANCE !' : 'ASSURANCE'}
            </span>
          </button>
        </div>
      )}

      {/* AUDIT STRATÉGIQUE - NOUVEAU */}
      <div className="mb-3">
        <button 
          onClick={() => {
            const advice = getStrategyAdvice();
            setStrategyAdvice(advice);
            setShowStrategy(!showStrategy);
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border-2 border-purple-400"
        >
          <span className="text-sm">🧮</span>
          <span>AUDIT STRATÉGIQUE</span>
        </button>
        
        {showStrategy && strategyAdvice && (
          <div className="mt-3 bg-black/80 backdrop-blur p-3 rounded-lg border-2 border-purple-400">
            <div className="text-purple-300 text-xs font-bold mb-2">📊 CONSEIL STRATÉGIQUE</div>
            <div className="text-white text-sm font-bold mb-2 whitespace-pre-line">
              {strategyAdvice}
            </div>
            <div className="text-gray-300 text-xs opacity-80">
              Basé sur vos cartes et la carte du croupier
            </div>
          </div>
        )}
      </div>

      {/* Bouton "FAIRE CONFIANCE AUX MATHS" */}
      <div className="mb-3">
        <button 
          onClick={executeOptimalAction}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border-2 border-green-400"
        >
          <span className="text-sm">🚀</span>
          <span>FAIRE CONFIANCE AUX MATHS</span>
        </button>
        <div className="text-gray-300 text-xs text-center mt-1 opacity-80">
          Exécute automatiquement l'action optimale
        </div>
      </div>

      {/* Conseils stratégiques */}
      {cardCounter && (
        <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
          <div className="text-white text-xs font-bold mb-1">📊 COMPTEUR DE CARTES</div>
          <div className="text-yellow-400 text-lg font-bold">
            {cardCounter.getTrueCount().toFixed(1)}
          </div>
          <div className="text-white text-xs opacity-80">
            {cardCounter.getTrueCount() > 3 ? '🟢 Avantage joueur' : 
             cardCounter.getTrueCount() < -2 ? '🔴 Avantage casino' : 
             '🟡 Neutre'}
          </div>
        </div>
      )}
    </div>
  );
}
