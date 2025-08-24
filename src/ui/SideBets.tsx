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

  return (
    <div className="relative">
      {/* Zone de mise globale - style jeton de casino */}
      {currentSideBetAmount > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs border-2 border-yellow-300 shadow-lg">
            {formatAmount(currentSideBetAmount)}
          </div>
        </div>
      )}

      {/* Table de side bets - style casino */}
      <div className="bg-green-800 border-4 border-yellow-600 rounded-full p-3 w-32 h-32 relative">
        {/* Contour de la table */}
        <div className="absolute inset-0 border-2 border-white rounded-full"></div>
        
        {/* Section Perfect Pairs (haut gauche) */}
        <div className="absolute top-1 left-1 w-12 h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs font-bold leading-tight">PERFECT<br/>PAIRS</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "PERFECT_PAIRS")!) && (
              <button
                onClick={() => onSideBetChange(currentSideBetAmount + 1)}
                className="mt-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-all"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Section 21+3 (haut droite) */}
        <div className="absolute top-1 right-1 w-12 h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs font-bold leading-tight">21+3</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "TWENTY_ONE_PLUS_THREE")!) && (
              <button
                onClick={() => onSideBetChange(currentSideBetAmount + 1)}
                className="mt-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-all"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Section Lucky Ladies (bas) */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black/60 rounded-full border border-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs font-bold leading-tight">LUCKY<br/>LADIES</div>
            {isBetAvailable(tableRules.sideBets.find(s => s.code === "LUCKY_LADIES")!) && (
              <button
                onClick={() => onSideBetChange(currentSideBetAmount + 1)}
                className="mt-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold hover:scale-110 transition-all"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Contrôles de mise - style compact */}
        {canPlaceBets && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[1, 5, 25].map((amount) => (
              <button
                key={amount}
                onClick={() => onSideBetChange(currentSideBetAmount + amount)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:scale-110 transition-all border border-yellow-300"
              >
                {amount}
              </button>
            ))}
            {currentSideBetAmount > 0 && (
              <button
                onClick={() => onSideBetChange(0)}
                className="bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:scale-110 transition-all border border-red-300"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Titre de la table */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold bg-black/80 px-2 py-1 rounded">
          SIDE BETS
        </div>
      </div>
    </div>
  );
}
