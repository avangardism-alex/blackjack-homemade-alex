import React, { useState } from "react";
const CHIPS = [1,5,10,25,100,500];

export default function ChipRail({ onAdd, bank, onTapis, onRejouer, lastBetAmount, onAddSideBet, sideBetAmount, onClearSideBet, currentHand }: { 
  onAdd: (n: number) => void; 
  bank: number; 
  onTapis: () => void; 
  onRejouer: () => void; 
  lastBetAmount: number;
  onAddSideBet: (n: number) => void;
  sideBetAmount: number;
  onClearSideBet: () => void;
  currentHand?: {
    cards: Array<{ r: string; s: string }>;
    bet: number;
    sideBets: {
      perfectPairs: number;
      pairPlus: number;
    };
  };
}) {
  const [showTapisConfirm, setShowTapisConfirm] = useState(false);
  const [isRejouerDisabled, setIsRejouerDisabled] = useState(false);

  const handleTapisClick = () => {
    if (!showTapisConfirm) {
      setShowTapisConfirm(true);
      // Auto-reset après 3 secondes
      setTimeout(() => setShowTapisConfirm(false), 3000);
    } else {
      // Double confirmation - miser tout
      onTapis();
      setShowTapisConfirm(false);
    }
  };

  const handleRejouerClick = () => {
    if (isRejouerDisabled) return;
    
    setIsRejouerDisabled(true);
    onRejouer();
    
    // Réactiver le bouton après 1 seconde
    setTimeout(() => setIsRejouerDisabled(false), 1000);
  };

  // Fonction pour obtenir la couleur des jetons
  const getChipColor = (value: number) => {
    switch (value) {
      case 1: return "bg-white border-gray-300 text-gray-900";
      case 5: return "bg-red-500 border-red-600 text-white";
      case 10: return "bg-blue-500 border-blue-600 text-white";
      case 25: return "bg-green-500 border-green-600 text-white";
      case 100: return "bg-black border-gray-700 text-white";
      case 500: return "bg-purple-500 border-purple-600 text-white";
      default: return "bg-gray-500 border-gray-600 text-white";
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-8">
      {/* Jetons normaux - Plus gros et espacés */}
      <div className="flex gap-6 items-center justify-center">
        {CHIPS.map(v => (
          <button 
            key={v} 
            onClick={() => onAdd(v)} 
            className={`rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${getChipColor(v)} font-bold chip-glow border-4 hover:scale-110 transition-all duration-200 shadow-xl`}
          >
            <div className="text-lg sm:text-xl md:text-2xl font-bold">${v}</div>
          </button>
        ))}
      </div>
      
      {/* Bouton Rejouer la mise précédente - Plus gros */}
      {lastBetAmount > 0 && bank >= lastBetAmount && (
        <button
          onClick={handleRejouerClick}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold text-xl shadow-2xl border-2 border-blue-400 hover:scale-105 transition-all duration-200"
          disabled={isRejouerDisabled}
        >
          🔄 Rejouer {lastBetAmount.toLocaleString('fr-FR')}€
        </button>
      )}
      
      {/* Section Side Bets - Plus espacée */}
      <div className="border-t-4 border-emerald-600/50 pt-8 mt-8 w-full max-w-2xl">
        <div className="text-center text-emerald-300 font-bold text-2xl mb-6">🎰 SIDE BETS</div>
        
        {/* Affichage des side bets de la main actuelle */}
        {currentHand && (
          <div className="text-center mb-6 p-4 bg-emerald-900/20 rounded-xl border-2 border-emerald-600/50">
            <div className="text-emerald-400 font-bold mb-3 text-lg">Main actuelle:</div>
            <div className="text-base text-emerald-300 mb-2">
              Perfect Pairs: {currentHand.sideBets.perfectPairs}€
            </div>
            <div className="text-base text-emerald-300 mb-2">
              Pair Plus: {currentHand.sideBets.pairPlus}€
            </div>
            <div className="text-sm text-emerald-300/80">
              Total side bets: {currentHand.sideBets.perfectPairs + currentHand.sideBets.pairPlus}€
            </div>
          </div>
        )}
        
        {/* Affichage de la mise side bet globale */}
        {sideBetAmount > 0 && (
          <div className="text-center mb-6">
            <div className="text-emerald-400 font-bold text-lg">Mise Side Bet globale: {sideBetAmount.toLocaleString('fr-FR')}€</div>
            <button
              onClick={onClearSideBet}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-base font-bold mt-2"
            >
              ❌ Effacer
            </button>
          </div>
        )}
        
        {/* Jetons pour side bets - Plus gros */}
        <div className="flex gap-4 items-center justify-center mb-6">
          {CHIPS.map(v => (
            <button 
              key={v} 
              onClick={() => onAddSideBet(v)} 
              className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${getChipColor(v)} font-bold chip-glow border-2 hover:scale-110 transition-all duration-200 text-sm sm:text-base`}
            >
              ${v}
            </button>
          ))}
        </div>
        
        {/* Info des gains - Plus lisible */}
        <div className="text-sm text-emerald-300/80 text-center space-y-2">
          <div className="text-lg">🎯 Perfect Pairs: 5:1 / 10:1 / 25:1</div>
          <div className="text-lg">🎲 Pair Plus: 1:1 / 3:1</div>
          <div className="text-emerald-400/60 mt-3 text-base">
            Les side bets sont placés sur chaque main individuellement
          </div>
        </div>
      </div>
      
      {/* Bouton TAPIS avec double confirmation - Plus gros et espacé */}
      {bank > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={handleTapisClick}
            className={`px-8 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-200 border-4 ${
              showTapisConfirm 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-yellow-400 text-white animate-pulse' 
                : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-red-400 text-white hover:scale-105'
            }`}
          >
            {showTapisConfirm ? '⚠️ CLIQUEZ ENCORE POUR CONFIRMER' : `🎰 TAPIS (${bank.toLocaleString('fr-FR')} €)`}
          </button>
          
          {showTapisConfirm && (
            <div className="text-center text-base text-yellow-300 bg-yellow-900/20 px-6 py-4 rounded-xl border-2 border-yellow-600/50">
              💰 Mise totale : <strong className="text-2xl">{bank.toLocaleString('fr-FR')} €</strong><br/>
              ⚠️ Cliquez une seconde fois pour confirmer
            </div>
          )}
        </div>
      )}
    </div>
  );
}
