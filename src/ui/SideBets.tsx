import React from "react";
import { SideBetRule, TableRules } from "../config/sidebet.rules";
import { CURRENCY } from "../config";

interface SideBetsProps {
  tableRules: TableRules;
  onSideBetChange: (amount: number) => void;
  currentSideBetAmount: number;
  phase: string;
  dealerUpCard?: { r: string; s: string };
  canPlaceBets: boolean;
}

export default function SideBets({
  tableRules,
  onSideBetChange,
  currentSideBetAmount,
  phase,
  dealerUpCard,
  canPlaceBets
}: SideBetsProps) {
  // Vérifier si un side bet est disponible selon les règles
  const isBetAvailable = (rule: SideBetRule): boolean => {
    if (!canPlaceBets) return false;
    
    switch (rule.availability.type) {
      case "ALWAYS":
        return true;
      case "DEALER_UPCARD_IN":
        return dealerUpCard && rule.availability.ranks.includes(dealerUpCard.r);
      case "INSURANCE_ONLY":
        return dealerUpCard && dealerUpCard.r === "A";
      default:
        return false;
    }
  };

  // Formater le montant avec espaces
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR');
  };

  // Fonction pour ajouter 1€ aux side bets
  const addOneEuro = () => {
    onSideBetChange(currentSideBetAmount + 1);
  };

  // Fonction pour retirer 1€ des side bets
  const removeOneEuro = () => {
    if (currentSideBetAmount > 0) {
      onSideBetChange(currentSideBetAmount - 1);
    }
  };

  // Fonction pour effacer complètement les side bets
  const clearAllSideBets = () => {
    onSideBetChange(0);
  };

  return (
    <div className="relative">
      {/* Zone de mise globale - style jeton de casino */}
      {currentSideBetAmount > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-yellow-300 shadow-lg">
            {formatAmount(currentSideBetAmount)}
          </div>
        </div>
      )}

      {/* Table de side bets - style casino responsive */}
      <div className="bg-green-800 border-4 border-yellow-600 rounded-full p-2 sm:p-3 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative">
        {/* Contour de la table */}
        <div className="absolute inset-0 border-2 border-white rounded-full"></div>
        
        {/* Section Perfect Pairs (haut gauche) */}
        <div className="absolute top-1 left-1 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs sm:text-sm font-bold leading-tight">PERFECT<br/>PAIRS</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "PERFECT_PAIRS")!) && (
              <div className="flex gap-1 justify-center mt-1">
                <button
                  onClick={addOneEuro}
                  disabled={!canPlaceBets}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform disabled:cursor-not-allowed"
                >
                  +
                </button>
                {currentSideBetAmount > 0 && (
                  <button
                    onClick={removeOneEuro}
                    className="bg-red-500 hover:bg-red-400 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  >
                    -
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 21+3 (haut droite) */}
        <div className="absolute top-1 right-1 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs sm:text-sm font-bold leading-tight">21+3</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "TWENTY_ONE_PLUS_THREE")!) && (
              <div className="flex gap-1 justify-center mt-1">
                <button
                  onClick={addOneEuro}
                  disabled={!canPlaceBets}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform disabled:cursor-not-allowed"
                >
                  +
                </button>
                {currentSideBetAmount > 0 && (
                  <button
                    onClick={removeOneEuro}
                    className="bg-red-500 hover:bg-red-400 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  >
                    -
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section Lucky Ladies (bas) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs sm:text-sm font-bold leading-tight">LUCKY<br/>LADIES</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "LUCKY_LADIES")!) && (
              <div className="flex gap-1 justify-center mt-1">
                <button
                  onClick={addOneEuro}
                  disabled={!canPlaceBets}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform disabled:cursor-not-allowed"
                >
                  +
                </button>
                {currentSideBetAmount > 0 && (
                  <button
                    onClick={removeOneEuro}
                    className="bg-red-500 hover:bg-red-400 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                  >
                    -
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles de mise rapide */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {[1, 5, 10, 25].map((value) => (
          <button
            key={value}
            onClick={() => onSideBetChange(currentSideBetAmount + value)}
            disabled={!canPlaceBets}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 text-black rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-yellow-300 shadow-lg hover:scale-105 transition-transform disabled:cursor-not-allowed"
          >
            {value}
          </button>
        ))}
      </div>

      {/* Bouton effacer */}
      {currentSideBetAmount > 0 && (
        <div className="mt-2 text-center">
          <button
            onClick={clearAllSideBets}
            className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:scale-105 transition-transform"
          >
            🗑️ Effacer ({currentSideBetAmount}€)
          </button>
        </div>
      )}
    </div>
  );
}
