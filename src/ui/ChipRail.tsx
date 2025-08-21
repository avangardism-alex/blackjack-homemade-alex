import React, { useState } from "react";
const CHIPS = [1,5,10,25,100,500];

export default function ChipRail({ onAdd, bank, onTapis, onRejouer, lastBetAmount }: { onAdd: (n: number) => void; bank: number; onTapis: () => void; onRejouer: () => void; lastBetAmount: number }) {
  const [showTapisConfirm, setShowTapisConfirm] = useState(false);

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

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      {/* Jetons normaux */}
      <div className="flex gap-3 items-center justify-center">
        {CHIPS.map(v=> (
          <button key={v} onClick={()=>onAdd(v)} className="rounded-full w-12 h-12 bg-slate-100 text-slate-900 font-bold chip-glow border-4 border-slate-300 hover:scale-110 transition-all duration-200">
            {v}€
          </button>
        ))}
      </div>
      
      {/* Bouton Rejouer la mise précédente */}
      {lastBetAmount > 0 && bank >= lastBetAmount && (
        <button
          onClick={onRejouer}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold shadow-lg border-2 border-blue-400 hover:scale-105 transition-all duration-200"
        >
          🔄 Rejouer {lastBetAmount.toLocaleString('fr-FR')}€
        </button>
      )}
      
      {/* Bouton TAPIS avec double confirmation */}
      {bank > 0 && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleTapisClick}
            className={`px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 border-2 ${
              showTapisConfirm 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-yellow-400 text-white animate-pulse' 
                : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-red-400 text-white hover:scale-105'
            }`}
          >
            {showTapisConfirm ? '⚠️ CLIQUEZ ENCORE POUR CONFIRMER' : `🎰 TAPIS (${bank.toLocaleString('fr-FR')} €)`}
          </button>
          
          {showTapisConfirm && (
            <div className="text-center text-sm text-yellow-300 bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-600/50">
              💰 Mise totale : <strong>{bank.toLocaleString('fr-FR')} €</strong><br/>
              ⚠️ Cliquez une seconde fois pour confirmer
            </div>
          )}
        </div>
      )}
    </div>
  );
}
