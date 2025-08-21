import React from "react";
export default function Rules({ open, onClose }:{ open:boolean; onClose:()=>void }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl p-4 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Stratégie (mémo rapide)</h2>
          <button onClick={onClose} className="px-2 py-1 bg-slate-700 rounded">Fermer</button>
        </div>
        <div className="text-sm grid md:grid-cols-3 gap-3">
          <div><h3 className="font-semibold mb-1">Hard</h3><ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>8- : Tirer</li><li>9 : Doubler vs 3-6 sinon Tirer</li><li>10 : Doubler vs 2-9 sinon Tirer</li>
            <li>11 : Doubler vs 2-10 sinon Tirer vs A</li><li>12 : Rester vs 4-6 sinon Tirer</li>
            <li>13-16 : Rester vs 2-6 sinon Tirer</li><li>17+ : Rester</li></ul></div>
          <div><h3 className="font-semibold mb-1">Soft</h3><ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>A,2/A,3 : Doubler vs 5-6 sinon Tirer</li><li>A,4/A,5 : Doubler vs 4-6 sinon Tirer</li>
            <li>A,6 : Doubler vs 3-6 sinon Tirer</li>
            <li>A,7 : Rester vs 2,7,8 – Doubler vs 3-6 – Tirer vs 9,T,A</li>
            <li>A,8+ : Rester</li></ul></div>
          <div><h3 className="font-semibold mb-1">Paires / Surrender</h3><ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>AA, 88 : Diviser</li><li>22/33 : Diviser vs 2-7</li><li>44 : Diviser vs 5-6</li>
            <li>55 : Jamais diviser (comme 10)</li><li>66 : Diviser vs 2-6</li><li>77 : Diviser vs 2-7</li>
            <li>99 : Diviser vs 2-6,8-9 / Rester vs 7,T,A</li><li>TT : Ne pas diviser</li>
            <li>Abandonner : Hard 16 vs 9/T/A ; Hard 15 vs T</li></ul></div>
        </div>
      </div>
    </div>
  );}
