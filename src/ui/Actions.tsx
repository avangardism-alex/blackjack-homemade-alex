import React from "react";
import { getOptimalAction, getStrategyExplanation } from "../logic/strategy";

type Actions = { clearBet?:()=>void; deal?:()=>void; disabledDeal?:()=>boolean; hit?:()=>void; stand?:()=>void; double?:()=>void; split?:()=>void; surrender?:()=>void; insurance?:()=>void; next?:()=>void; forceOptimalAction?:()=>void; };

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
  cardCounter?: { getTrueCount: () => number };
}

export default function Actions({ phase, on, currentHand, dealerUpCard, bank, cardCounter }: ActionsProps) {
  // Vérifier si l'assurance est obligatoire selon le compteur
  const isInsuranceMandatory = cardCounter && dealerUpCard?.r === "A" && cardCounter.getTrueCount() > 3;
  
  // Vérifier si l'assurance est interdite selon le compteur
  const isInsuranceForbidden = cardCounter && dealerUpCard?.r === "A" && cardCounter.getTrueCount() < -2;

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 max-w-4xl mx-auto">
      {phase==="betting" && (<>
        <button onClick={on.clearBet} className="px-8 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl font-bold transition-all duration-200 shadow-xl hover:shadow-2xl">
          🗑️ Effacer
        </button>
        <button onClick={on.deal} className="px-8 py-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-40 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200 disabled:cursor-not-allowed" disabled={on.disabledDeal?.()}>
          🎮 JOUER
        </button>
      </>)}
      
      {phase==="player" && currentHand && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={on.hit} className="px-6 py-4 rounded-xl bg-slate-700 hover:bg-blue-600 button-3d hover:scale-105 transition-all duration-200 text-xl font-bold shadow-xl">
              🎯 Tirer (T)
            </button>
            <button onClick={on.stand} className="px-6 py-4 rounded-xl bg-slate-700 hover:bg-green-600 button-3d hover:scale-105 transition-all duration-200 text-xl font-bold shadow-xl">
              ✋ Rester (R)
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {!currentHand.doubled && currentHand.cards.length === 2 && bank >= currentHand.bet && (
              <button onClick={on.double} className="px-4 py-4 rounded-xl bg-slate-700 hover:bg-purple-600 button-3d hover:scale-105 transition-all duration-200 text-lg font-bold shadow-xl">
                ⚡ Doubler (D)
              </button>
            )}
            
            {currentHand.cards.length === 2 && currentHand.cards[0].r === currentHand.cards[1].r && bank >= currentHand.bet && (
              <button onClick={on.split} className="px-4 py-4 rounded-xl bg-slate-700 hover:bg-orange-600 button-3d hover:scale-105 transition-all duration-200 text-lg font-bold shadow-xl">
                ✂️ Diviser (P)
              </button>
            )}
            
            {currentHand.cards.length === 2 && (
              <button onClick={on.surrender} className="px-4 py-4 rounded-xl bg-slate-700 hover:bg-red-600 button-3d hover:scale-105 transition-all duration-200 text-lg font-bold shadow-xl">
                🏳️ Abandonner (A)
              </button>
            )}
          </div>
          
          {/* ASSURANCE INTELLIGENTE */}
          {dealerUpCard?.r === "A" && !currentHand.insured && (
            <>
              {isInsuranceMandatory && (
                <div className="px-6 py-4 rounded-xl bg-red-600 text-white font-bold text-center border-2 border-red-400 text-xl">
                  🚨 ASSURANCE OBLIGATOIRE ! Count: +{cardCounter.getTrueCount().toFixed(1)}
                </div>
              )}
              
              {isInsuranceForbidden && (
                <div className="px-6 py-4 rounded-xl bg-orange-600 text-white font-bold text-center border-2 border-orange-400 text-xl">
                  ⚠️ ASSURANCE INTERDITE ! Count: {cardCounter.getTrueCount().toFixed(1)}
                </div>
              )}
              
              {!isInsuranceMandatory && !isInsuranceForbidden && (
                <button
                  onClick={on.insurance}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold button-3d hover:scale-105 transition-all duration-200 shadow-2xl border-2 border-yellow-400 text-xl"
                >
                  🛡️ ASSURANCE (S) - Coût: {Math.floor(currentHand.bet / 2)}€
                </button>
              )}
              
              {/* Bouton d'assurance forcée si obligatoire */}
              {isInsuranceMandatory && (
                <button
                  onClick={on.insurance}
                  className="px-6 py-4 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold button-3d border-2 border-red-400 text-xl"
                >
                  🚨 FORCER L'ASSURANCE ! (S)
                </button>
              )}
            </>
          )}
          
          {dealerUpCard?.r === "A" && currentHand.insured && (
            <div className="px-6 py-4 rounded-xl bg-green-600 text-white font-bold text-center border-2 border-green-400 text-xl">
              ✅ Assurance prise pour {Math.floor(currentHand.bet / 2)}€
            </div>
          )}
          
          {/* Boutons d'aide - Plus gros et espacés */}
          <div className="grid grid-cols-1 gap-4 mt-8">
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
                
                // Afficher l'explication avec info sur les mains soft
                let fullExplanation = explanation;
                if (currentHand.cards.some(c => c.r === 'A')) {
                  const { total, softTotal } = calculateHandScore(currentHand.cards);
                  if (softTotal && softTotal !== total) {
                    fullExplanation += `\n\n🎯 Main avec As : ${total} ou ${softTotal}`;
                    fullExplanation += `\n💡 L'As peut valoir 1 ou 11 selon ce qui est le mieux !`;
                  }
                }
                
                alert(fullExplanation);
                
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
              className="px-8 py-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold button-3d hover:scale-105 transition-all duration-200 shadow-2xl text-xl"
            >
              🧮 FAIRE CONFIANCE AUX MATHS
            </button>
            
            {/* Bouton pour forcer les actions selon le compteur */}
            {cardCounter && (
              <button 
                onClick={() => {
                  // Appeler la fonction de forçage automatique
                  if (on.forceOptimalAction) {
                    on.forceOptimalAction();
                  }
                }}
                className="px-8 py-6 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold button-3d hover:scale-105 transition-all duration-200 shadow-2xl border-2 border-red-400 text-xl"
              >
                🚨 FORCER LES ACTIONS OPTIMALES (COMPTEUR)
              </button>
            )}
          </div>
        </>
      )}

      {phase==="payout" && (
        <button onClick={on.next} className="col-span-1 px-8 py-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-200">
          Nouvelle main
        </button>
      )}
    </div>
  );
}
