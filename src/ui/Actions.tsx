import React from "react";

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
  isInsuranceMandatory
}: ActionsProps) {
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
