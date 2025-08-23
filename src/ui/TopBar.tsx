import React from "react";
import { useGame } from "../state/store";
import { verifyGameFairness } from "../logic/game";

export default function TopBar({ bank, onRules, onPlus, onReset }: { 
  bank: number; 
  onRules: () => void; 
  onPlus: () => void; 
  onReset: () => void; 
}) {
  const g = useGame();
  
  const handleAudit = () => {
    const fairness = verifyGameFairness(g.shoe);
    
    let message = `🔍 AUDIT D'ÉQUITÉ DU JEU\n\n`;
    message += `📊 Total cartes: ${fairness.totalCards}\n`;
    message += `🎯 Nombre de decks: ${Math.ceil(fairness.totalCards / 52)}\n`;
    message += `✅ Équité: ${fairness.isFair ? 'GARANTIE' : 'SUSPECTE'}\n\n`;
    
    if (fairness.warnings.length > 0) {
      message += `⚠️ AVERTISSEMENTS:\n`;
      fairness.warnings.forEach(warning => {
        message += `• ${warning}\n`;
      });
    } else {
      message += `🎉 Aucun problème détecté !\n`;
      message += `🔐 Randomisation: ${globalThis.crypto?.getRandomValues ? 'CRYPTO (sécurisé)' : 'Math.random'}\n`;
      message += `🎲 Algorithme: Fisher-Yates (standard)\n`;
    }
    
    message += `\n💡 Ouvrez la console (F12) pour voir les logs détaillés !`;
    
    alert(message);
  };

  return (
    <div className="bg-slate-900 border-b-2 border-emerald-500 p-2">
      <div className="flex items-center justify-between">
        {/* Titre du jeu */}
        <div className="text-lg font-bold text-emerald-400">
          🎰 BLACKJACK
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button onClick={handleAudit} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
            🔍 Audit
          </button>
          <button onClick={onRules} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">
            📖 Règles
          </button>
          <button onClick={onPlus} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
            +1000€
          </button>
          <button onClick={onReset} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
