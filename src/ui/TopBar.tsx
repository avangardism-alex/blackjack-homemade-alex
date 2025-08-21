import React from "react";

export default function TopBar({ bank, onRules, onPlus, onReset }:{ bank:number; onRules:()=>void; onPlus:()=>void; onReset:()=>void }){
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/60 backdrop-blur sticky top-0">
      <div className="font-medium text-emerald-400">
        🎰 BLACKJACK
      </div>
      <div className="text-xl">Solde: {bank.toLocaleString('fr-FR')} €</div>
      <div className="flex gap-2">
        <button onClick={onPlus} className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600">Prendre +1 000 €</button>
        <button onClick={onReset} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">Reset</button>
        <button onClick={onRules} className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600">Règles</button>
      </div>
    </div>
  );
}
