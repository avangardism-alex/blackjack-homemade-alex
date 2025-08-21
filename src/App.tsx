import React, { useEffect, useState } from "react";
import TopBar from "./ui/TopBar";
import Card from "./ui/Card";
import ChipRail from "./ui/ChipRail";
import Actions from "./ui/Actions";
import Rules from "./ui/Rules";
import Animations from "./ui/Animations";
import Help from "./ui/Help";
import CardCounter from "./ui/CardCounter";

import { useGame } from "./state/store";
import { handScore } from "./logic/game";

export default function App() {
  const g = useGame();
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (g.phase === "player") {
        if (e.key.toLowerCase() === "h") g.hit();
        if (e.key.toLowerCase() === "s") g.stand();
        if (e.key.toLowerCase() === "d") g.doubleDown();
        if (e.key.toLowerCase() === "p") g.split();
        if (e.key.toLowerCase() === "r") g.surrender();
        if (e.key.toLowerCase() === "i") g.insurance();
      }
      if (e.code === "Space") g.deal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [g.phase]);

  const dealerFaceDown = g.phase !== "payout" && g.phase !== "dealer";
  const canInsurance = g.phase === "player" && g.dealer[0]?.r === "A";

  return (
    <div className="min-h-screen text-slate-100 bg-felt">
      <TopBar bank={g.bank} onRules={()=>setShowRules(true)} onPlus={()=>g.addBank(1000)} onReset={()=>g.resetBank()} />

      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center opacity-80 mb-2">
          HOMEMADE BLACKJACK
        </div>
        <div className="text-center opacity-80 mb-2">
          BLACKJACK PAYE 3 POUR 2 · LE CROUPIER RESTE SUR 17 · L'ASSURANCE PAYE 2 POUR 1
        </div>


        {/* Dealer */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Card card={g.dealer[0]} />
          <Card card={g.dealer[1]} hidden={dealerFaceDown} />
          {g.dealer.slice(2).map((c, i) => (<Card key={i} card={c} />))}
          {g.dealer.length > 0 && (
            <div className="ml-3 text-sm opacity-80">
              Total: {dealerFaceDown ? "?" : handScore(g.dealer).total}
            </div>
          )}

        </div>

        {/* Player hands */}
        <div className="space-y-3">
          {g.hands.map((h, idx) => {
            const score = handScore(h.cards);
            const isActive = idx === g.active && g.phase === "player";
            return (
              <div key={h.id} className={`rounded-xl p-3 bg-emerald-950/30 border transition-all duration-300 ${isActive ? "border-emerald-400 bg-emerald-950/50 scale-105 shadow-lg shadow-emerald-500/20" : "border-emerald-900"}`}>
                <div className="flex items-center gap-2">
                  <div className="text-sm opacity-80">💰 Mise: {h.bet.toLocaleString('fr-FR')} €</div>
                  <div className="text-sm opacity-80">
                    🎯 Total: {score.total}{score.isBJ ? " 🎉 (BLACKJACK!)" : ""}{score.isBust ? " 💥 (DÉPASSÉ!)" : ""}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {h.cards.map((c, i) => (<Card key={i} card={c} />))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Betting rail */}
        {g.phase === "betting" && (<>
          <div className="mt-6 text-center text-2xl">💰 MISE : {g.betAmount.toLocaleString('fr-FR')} €</div>

          <ChipRail onAdd={(n) => g.addChip(n)} onTapis={g.tapis} bank={g.bank} onRejouer={g.rejouerMise} lastBetAmount={g.lastBetAmount} />
          
          {/* Message d'aide pour le bouton IA */}
          <div className="mt-4 text-center text-sm text-blue-300 opacity-80">
            💡 <strong>Conseil :</strong> Pendant le jeu, utilise le bouton "🧮 FAIRE CONFIANCE AUX MATHS" pour jouer parfaitement !
          </div>
        </>)}

        {/* Actions */}
        <Actions 
          phase={g.phase} 
          on={{
            clearBet: g.clearBet,
            deal: g.deal,
            disabledDeal: () => g.betAmount <= 0 || (g.betAmount > g.bank && g.bank > 0),
            hit: g.hit,
            stand: g.stand,
            double: g.doubleDown,
            split: g.split,
            surrender: g.surrender,
            insurance: canInsurance ? g.insurance : () => {},
            next: g.nextPhase,
          }}
          currentHand={g.hands[g.active]}
          dealerUpCard={g.dealer[0]}
          bank={g.bank}
        />

        {g.message && (
          <div className="mt-3 text-center opacity-90 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
            {g.message === "Égalité" ? "🤝 Égalité - Mise remboursée" : 
             g.message.startsWith("+") ? `🎉 Victoire ! +${g.message.substring(1)}` :
             g.message.startsWith("-") ? `💔 Défaite ${g.message}` :
             g.message}
          </div>
        )}

        <div className="mt-10 text-center text-xs opacity-60">
          V1 — 1 jeu — mélange automatique &lt; 20 cartes — Alex Kiffe project
        </div>
      </div>

      <Rules open={showRules} onClose={()=>setShowRules(false)} />
      
      <Animations showWin={g.showWinAnimation} showLose={g.showLoseAnimation} />
      <Help />
      
    </div>
  );
}
