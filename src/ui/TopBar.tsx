import React from "react";
import { useGame } from "../state/store";

export default function TopBar({ 
  bank, 
  betAmount,
  onTableChange, 
  currentTable 
}: { 
  bank: number; 
  betAmount: number;
  onTableChange: () => void; 
  currentTable: string; 
}) {
  const g = useGame();

  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-purple-500 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Titre du jeu et table actuelle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-lg sm:text-xl font-bold text-purple-200">
            🎰 BLACKJACK MACAO
          </div>
          <div className="text-xs sm:text-sm text-purple-300 bg-purple-800/50 px-2 py-1 sm:px-3 sm:py-1 rounded-lg border border-purple-400">
            {currentTable}
          </div>
        </div>
        
        {/* Informations du joueur */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mise actuelle */}
          {betAmount > 0 && (
            <div className="text-yellow-300 text-xs sm:text-sm bg-yellow-900/20 px-2 py-1 sm:px-3 sm:py-1 rounded-lg border border-yellow-400">
              Mise: {betAmount.toLocaleString('fr-FR')}€
            </div>
          )}
          
          {/* Solde */}
          <div className="text-green-300 text-sm sm:text-lg font-bold bg-green-900/20 px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-green-400">
            SOLDE: {bank.toLocaleString('fr-FR')}€
          </div>
          
          {/* Bouton changer de table */}
          <button 
            onClick={onTableChange}
            className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold border border-purple-400 transition-colors hover:scale-105"
          >
            🔄 Changer
          </button>
        </div>
      </div>
    </div>
  );
}
