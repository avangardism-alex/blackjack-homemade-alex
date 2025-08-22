import React, { useState } from "react";

export default function TopBar({ bank, onRules, onPlus, onReset }:{ bank:number; onRules:()=>void; onPlus:()=>void; onReset:()=>void }){
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-full bg-emerald-950/60 backdrop-blur sticky top-0 z-50">
      {/* Barre principale - toujours visible */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="font-medium text-emerald-400 text-lg sm:text-xl">
          🎰 BLACKJACK
        </div>
        
        {/* Solde - visible sur tous les écrans */}
        <div className="text-lg sm:text-xl font-bold text-emerald-300">
          {bank.toLocaleString('fr-FR')} €
        </div>
        
        {/* Bouton hamburger sur mobile */}
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="lg:hidden p-2 rounded bg-emerald-700 hover:bg-emerald-600 transition-colors"
        >
          {showMenu ? '✕' : '☰'}
        </button>
        
        {/* Boutons sur desktop */}
        <div className="hidden lg:flex gap-2">
          <button onClick={onPlus} className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 transition-colors">
            +1 000 €
          </button>
          <button onClick={onReset} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors">
            Reset
          </button>
          <button onClick={onRules} className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 transition-colors">
            Règles
          </button>
        </div>
      </div>
      
      {/* Menu mobile - slide down */}
      {showMenu && (
        <div className="lg:hidden border-t border-emerald-700/50 bg-emerald-950/80 backdrop-blur">
          <div className="flex flex-col gap-2 p-4">
            <button 
              onClick={() => { onPlus(); setShowMenu(false); }}
              className="w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 transition-colors text-left"
            >
              💰 Prendre +1 000 €
            </button>
            <button 
              onClick={() => { onReset(); setShowMenu(false); }}
              className="w-full px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              🔄 Reset
            </button>
            <button 
              onClick={() => { onRules(); setShowMenu(false); }}
              className="w-full px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 transition-colors"
            >
              📖 Règles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
