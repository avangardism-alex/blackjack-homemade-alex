import React from "react";
import { getOptimalAction, getStrategyExplanation } from "../logic/strategy";

type Actions = { clearBet?:()=>void; deal?:()=>void; disabledDeal?:()=>boolean; hit?:()=>void; stand?:()=>void; double?:()=>void; split?:()=>void; surrender?:()=>void; insurance?:()=>void; next?:()=>void; };

interface ActionsProps {
  phase: string;
  on: Actions;
  currentHand?: {
    cards: Array<{ r: string; s: string }>;
    bet: number;
    doubled?: boolean;
    insured?: boolean;
  };
  dealerUpCard?: { r: string; s: string };
  bank: number;
}

export default function Actions({ phase, on, currentHand, dealerUpCard, bank }: ActionsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2">
      {phase==="betting" && (<>
        <button onClick={on.clearBet} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600">🗑️ Effacer</button>
        <button onClick={on.deal} className="px-4 py-3 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40" disabled={on.disabledDeal?.()}>🎮 Jouer</button>
      </>)}
      {phase==="player" && currentHand && (
        <>
          <button onClick={on.hit} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 button-3d hover:bg-blue-600 transition-all duration-200">🎯 Tirer (T)</button>
          <button onClick={on.stand} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 button-3d hover:bg-green-600 transition-all duration-200">✋ Rester (R)</button>
          
          {!currentHand.doubled && currentHand.cards.length === 2 && bank >= currentHand.bet && (
            <button onClick={on.double} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 button-3d hover:bg-purple-600 transition-all duration-200">⚡ Doubler (D)</button>
          )}
          
          {currentHand.cards.length === 2 && currentHand.cards[0].r === currentHand.cards[1].r && bank >= currentHand.bet && (
            <button onClick={on.split} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 button-3d hover:bg-orange-600 transition-all duration-200">✂️ Diviser (P)</button>
          )}
          
          {currentHand.cards.length === 2 && (
            <button onClick={on.surrender} className="px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 button-3d hover:bg-red-600 transition-all duration-200">🏳️ Abandonner (A)</button>
          )}
          
          {dealerUpCard?.r === "A" && !currentHand.insured && (
                    <button
          onClick={on.insurance}
          className="px-2 py-2 sm:px-4 sm:py-3 rounded bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold button-3d hover:scale-105 transition-all duration-200 shadow-lg border-2 border-yellow-400 text-sm sm:text-base"
        >
          🛡️ ASSURANCE (S) - Coût: {Math.floor(currentHand.bet / 2)}€
        </button>
          )}
          
          {dealerUpCard?.r === "A" && currentHand.insured && (
            <div className="px-4 py-3 rounded bg-green-600 text-white font-bold text-center border-2 border-green-400">
              ✅ Assurance prise pour {Math.floor(currentHand.bet / 2)}€
            </div>
          )}
          
          {/* Bouton "Faire confiance aux maths" */}
          <button 
            onClick={() => {
              const optimalAction = getOptimalAction(
                currentHand,
                dealerUpCard!,
                !currentHand.doubled && currentHand.cards.length === 2 && bank >= currentHand.bet,
                currentHand.cards.length === 2 && currentHand.cards[0].r === currentHand.cards[1].r && bank >= currentHand.bet,
                currentHand.cards.length === 2
              );
              
              const explanation = getStrategyExplanation(currentHand, dealerUpCard!, optimalAction);
              
              // Afficher l'explication
              alert(explanation);
              
              // Exécuter l'action optimale
              switch (optimalAction) {
                case 'hit':
                  on.hit?.();
                  break;
                case 'stand':
                  on.stand?.();
                  break;
                case 'double':
                  on.double?.();
                  break;
                case 'split':
                  on.split?.();
                  break;
                case 'surrender':
                  on.surrender?.();
                  break;
              }
            }}
            className="col-span-3 px-4 py-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold button-3d hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🧮 FAIRE CONFIANCE AUX MATHS
          </button>
        </>
      )}

      {phase==="payout" && (<button onClick={on.next} className="col-span-3 px-4 py-3 rounded bg-emerald-700 hover:bg-emerald-600">Nouvelle main</button>)}
    </div>
  );
}
