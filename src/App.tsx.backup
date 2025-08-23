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
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  useEffect(() => {
    console.log("=== DEBUG RACCOURCIS ===");
    console.log("Phase actuelle:", g.phase);
    console.log("Fonctions disponibles:", { hit: !!g.hit, stand: !!g.stand, doubleDown: !!g.doubleDown, split: !!g.split, surrender: !!g.surrender, insurance: !!g.insurance, deal: !!g.deal });
    
    const onKey = (e: KeyboardEvent) => {
      console.log("Touche pressée:", e.key, "Code:", e.code, "Phase:", g.phase);
      
      if (g.phase === "player") {
        console.log("Phase PLAYER - Traitement des raccourcis");
        if (e.key.toLowerCase() === "h") { console.log("→ HIT"); g.hit(); }
        if (e.key.toLowerCase() === "s") { console.log("→ STAND"); g.stand(); }
        if (e.key.toLowerCase() === "d") { console.log("→ DOUBLE"); g.doubleDown(); }
        if (e.key.toLowerCase() === "p") { console.log("→ SPLIT"); g.split(); }
        if (e.key.toLowerCase() === "r") { console.log("→ SURRENDER"); g.surrender(); }
        if (e.key.toLowerCase() === "i") { console.log("→ INSURANCE"); g.insurance(); }
      } else {
        console.log("Phase non-PLAYER:", g.phase);
      }
      
      if (e.code === "Space") { 
        console.log("→ DEAL (Espace)"); 
        g.deal(); 
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [g.phase, g]);

  const dealerFaceDown = g.phase !== "payout" && g.phase !== "dealer";
  const canInsurance = g.phase === "player" && g.dealer[0]?.r === "A";
  const currentHand = g.hands[g.active];
  const playerScore = currentHand ? handScore(currentHand.cards) : null;
  const dealerScore = g.dealer.length > 0 ? handScore(g.dealer) : null;

  // Afficher le modal d'assurance automatiquement
  useEffect(() => {
    // L'assurance n'est proposée qu'une seule fois au début de la main
    // et seulement si le croupier a un As ET qu'on n'a pas encore joué
    if (canInsurance && 
        !currentHand?.insured && 
        g.phase === "player" && 
        currentHand?.cards.length === 2) { // Seulement au début avec 2 cartes
      setShowInsuranceModal(true);
    }
  }, [canInsurance, currentHand?.insured, g.phase, currentHand?.cards.length]);

  // Fermer le modal d'assurance si le joueur commence à jouer
  useEffect(() => {
    if (currentHand && currentHand.cards.length > 2) {
      setShowInsuranceModal(false);
    }
  }, [currentHand?.cards.length]);

  const handleInsurance = (takeInsurance: boolean) => {
    if (takeInsurance) {
      g.insurance();
    }
    setShowInsuranceModal(false);
  };

  return (
    <div className="min-h-screen bg-felt text-white">
      {/* TopBar simplifiée */}
      <TopBar bank={g.bank} onRules={()=>setShowRules(true)} onPlus={()=>g.addBank(1000)} onReset={()=>g.resetBank()} />

      {/* Zone principale du jeu - Tapis vert */}
      <div className="flex-1 p-4">
        
        {/* Zone du croupier */}
        <div className="mb-8">
          {/* Bouton MENU en haut à gauche */}
          <div className="flex justify-between items-start mb-4">
            <button className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              🏠 MENU
            </button>
            
            {/* Sabot de cartes en haut à droite */}
            <div className="bg-black rounded-lg w-16 h-20 flex items-center justify-center border-2 border-gray-600">
              <div className="w-12 h-16 bg-blue-600 rounded border-2 border-blue-400"></div>
            </div>
          </div>
          
          {/* Cartes du croupier */}
          <div className="flex justify-center items-center gap-2 mb-4">
            {g.dealer.map((c, i) => (
              <Card key={i} card={c} hidden={i === 1 && dealerFaceDown} />
            ))}
          </div>
          
          {/* Score du croupier */}
          {g.dealer.length > 0 && (
            <div className="flex justify-center">
              <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xl border-2 border-red-500">
                {dealerFaceDown && dealerScore ? 
                  dealerScore.total - (dealerScore.aces > 0 ? 10 : 0) : 
                  dealerScore?.total || 0}
              </div>
            </div>
          )}
        </div>

        {/* Zone centrale - Règles et mise */}
        <div className="text-center mb-8">
          {/* Affichage de la mise */}
          {g.phase === "betting" && (
            <div className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold text-xl mb-4 border-2 border-gray-500">
              MISE : ${g.betAmount}
            </div>
          )}
          
          {/* Jeton de mise actuelle */}
          {g.betAmount > 0 && (
            <div className="bg-black text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-lg border-2 border-gray-600 mx-auto mb-4 shadow-lg">
              {g.betAmount}<br/>LAS VEGAS
            </div>
          )}
          
          {/* Message de résultat */}
          {g.message && (
            <div className="text-center mb-4">
              {g.message.includes("Victoire") ? (
                <div className="text-green-500 text-3xl font-bold animate-pulse">
                  🎉 WIN!
                </div>
              ) : g.message.includes("Perte") ? (
                <div className="text-red-500 text-3xl font-bold animate-pulse">
                  💔 LOSE...
                </div>
              ) : g.message.includes("Égalité") ? (
                <div className="text-blue-500 text-3xl font-bold animate-pulse">
                  🤝 PUSH!
                </div>
              ) : (
                <div className="text-yellow-500 text-2xl font-bold">
                  {g.message}
                </div>
              )}
              
              {/* Explication du PUSH */}
              {g.message.includes("Égalité") && (
                <div className="text-blue-400 text-sm mt-2">
                  Votre mise vous est remboursée - pas de gain, pas de perte
                </div>
              )}
            </div>
          )}
          
          {/* Règles du jeu - style embossé comme sur l'image */}
          <div className="text-sm text-green-700 space-y-1 font-medium">
            <div className="bg-green-800/20 px-4 py-2 rounded-lg border border-green-600/30">BLACKJACK PAYS 3 TO 2</div>
            <div className="bg-green-800/20 px-4 py-2 rounded-lg border border-green-600/30">Dealer must stand on a 17 and draw to 16</div>
            <div className="bg-green-800/20 px-4 py-2 rounded-lg border border-green-600/30 opacity-80">Insurance pays 2 to 1</div>
          </div>
        </div>

        {/* Zone du joueur */}
        <div className="mb-8">
          {/* Cartes du joueur - gérer les mains divisées */}
          <div className="space-y-4">
            {g.hands.map((hand, handIndex) => {
              const isActive = handIndex === g.active && g.phase === "player";
              const score = handScore(hand.cards);
              
              return (
                <div key={hand.id} className={`text-center ${handIndex > 0 ? 'mt-4' : ''}`}>
                  {/* Titre de la main si divisée */}
                  {g.hands.length > 1 && (
                    <div className="text-white text-sm mb-2 font-bold">
                      Main {handIndex + 1}
                      {isActive && <span className="text-yellow-400 ml-2">(Active)</span>}
                    </div>
                  )}
                  
                  {/* Cartes de cette main */}
                  <div className="flex justify-center items-center gap-2 mb-4">
                    {hand.cards.map((c, i) => (
                      <Card key={i} card={c} />
                    ))}
                  </div>
                  
                  {/* Score de cette main */}
                  <div className="flex justify-center">
                    <div className={`px-4 py-2 rounded-lg font-bold text-xl border-2 shadow-lg ${
                      isActive 
                        ? 'bg-white text-black border-yellow-400' 
                        : 'bg-gray-700 text-white border-gray-500'
                    }`}>
                      {score.total}
                      {score.softTotal && score.softTotal !== score.total && (
                        <span className="text-blue-600 ml-2">/ {score.softTotal}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mise de cette main */}
                  <div className="text-white text-sm mt-2 opacity-80">
                    Mise: ${hand.bet}
                    {hand.doubled && <span className="text-purple-400 ml-2">(Doublée)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone de contrôle - Bande de bois en bas */}
        <div className="bg-amber-700 border-t-4 border-amber-800 p-4 rounded-t-3xl shadow-lg">
          {/* Solde du joueur */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white">
              ${g.bank}
              <button onClick={() => g.addBank(1000)} className="ml-2 text-red-400 text-xl hover:text-red-300">+</button>
            </div>
          </div>
          
          {/* Jetons de mise - style exact des captures d'écran */}
          {g.phase === "betting" && (
            <div className="flex justify-center gap-3 mb-4">
              <button onClick={() => g.addChip(1)} className="bg-gray-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold border-2 border-gray-600 shadow-lg hover:scale-105 transition-transform">
                1<br/>LAS VEGAS
              </button>
              <button onClick={() => g.addChip(10)} className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold border-2 border-blue-700 shadow-lg hover:scale-105 transition-transform">
                10<br/>LAS VEGAS
              </button>
              <button onClick={() => g.addChip(25)} className="bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold border-2 border-green-700 shadow-lg hover:scale-105 transition-transform">
                25<br/>LAS VEGAS
              </button>
              <button onClick={() => g.addChip(100)} className="bg-black text-white rounded-full w-14 h-14 flex items-center justify-center font-bold border-2 border-gray-600 shadow-lg hover:scale-105 transition-transform">
                100<br/>LAS VEGAS
              </button>
            </div>
          )}
          
          {/* Boutons d'action - style exact des captures d'écran */}
          {g.phase === "betting" && (
            <div className="flex justify-center gap-4 mb-4">
              <button onClick={g.deal} disabled={g.betAmount <= 0} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-600 transition-colors shadow-lg">
                🎮 JOUER
              </button>
              <button onClick={g.clearBet} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-lg">
                🗑️ Effacer
              </button>
            </div>
          )}
          
          {g.phase === "player" && currentHand && (
            <div className="flex justify-center gap-3 flex-wrap">
              {!currentHand.doubled && currentHand.cards.length === 2 && g.bank >= currentHand.bet && (
                <button onClick={g.doubleDown} className="bg-gray-700 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg">
                  x2 Doubler
                </button>
              )}
              
              {/* Bouton SPLIT - affiché seulement si on a une paire */}
              {currentHand.cards.length === 2 && 
               currentHand.cards[0].r === currentHand.cards[1].r && 
               g.bank >= currentHand.bet && (
                <button onClick={g.split} className="bg-gray-700 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg">
                  ✂️ Diviser
                </button>
              )}
              
              {/* Bouton SURRENDER - seulement au début avec 2 cartes */}
              {currentHand.cards.length === 2 && (
                <button onClick={g.surrender} className="bg-gray-700 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg">
                  🏳️ Abandonner
                </button>
              )}
              
              <button onClick={g.stand} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg">
                ✋ Rester
              </button>
              <button onClick={g.hit} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-lg">
                🎯 Tirer
              </button>
            </div>
          )}
          
          {g.phase === "payout" && (
            <button onClick={g.nextPhase} className="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-gray-600 transition-colors shadow-lg">
              Nouvelle main
            </button>
          )}
        </div>
      </div>

      {/* Modal d'assurance */}
      {showInsuranceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg border-2 border-gray-300 text-center max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Prendre l'assurance ?</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => handleInsurance(false)}
                className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-lg"
              >
                Non
              </button>
              <button 
                onClick={() => handleInsurance(true)}
                className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-lg"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages et animations */}
      {g.message && !showInsuranceModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white p-6 rounded-xl border-2 border-emerald-500 text-center z-50">
          {g.message}
        </div>
      )}

      <Rules open={showRules} onClose={()=>setShowRules(false)} />
      <Animations showWin={g.showWinAnimation} showTie={g.showTieAnimation} />
      <Help />
    </div>
  );
}
