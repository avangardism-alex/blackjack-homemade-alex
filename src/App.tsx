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
import { CURRENCY } from "./config";

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
                      {/* En-tête avec sabot et solde */}
          <div className="flex justify-between items-start mb-4">
            {/* Solde du joueur en haut à gauche */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-green-300 shadow-lg">
              SOLDE: {g.bank}{CURRENCY}
            </div>
            
            {/* Sabot de cartes en haut à droite - AMÉLIORÉ */}
            <div className="bg-black rounded-lg w-16 h-20 flex items-center justify-center border-2 border-gray-600 shadow-lg">
              <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded border-2 border-blue-300 flex items-center justify-center">
                <div className="text-white text-xs font-bold">🎴</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded border border-blue-200 transform rotate-12"></div>
            </div>
          </div>
          
          {/* Cartes du croupier */}
          <div className="flex justify-center items-center gap-2 mb-4">
            {g.dealer.map((c, i) => (
              <Card key={i} card={c} hidden={i === 1 && dealerFaceDown} />
            ))}
          </div>
          
          {/* Score du croupier - LOGIQUE SIMPLIFIÉE */}
          {g.dealer.length > 0 && (
            <div className="flex justify-center">
              <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xl border-2 border-red-500">
                {dealerFaceDown ? 
                  // Si la deuxième carte est cachée, afficher seulement la première carte
                  handScore([g.dealer[0]]).total : 
                  // Sinon afficher le score total
                  (dealerScore?.total || 0)}
              </div>
            </div>
          )}
        </div>

        {/* Zone centrale - Bouton Rejouer et mise actuelle - OPTIMISÉE */}
        <div className="text-center mb-4">
          {/* Bouton Rejouer la mise précédente - COMPRESSÉ */}
          {g.phase === "betting" && g.lastBetAmount > 0 && g.bank >= g.lastBetAmount && (
            <div className="text-center mb-3">
              <button 
                onClick={g.rejouerMise}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 rounded-lg font-bold text-base shadow-lg border-2 border-blue-400 hover:scale-105 transition-all duration-200"
              >
                🔄 Rejouer {g.lastBetAmount.toLocaleString('fr-FR')}{CURRENCY}
              </button>
            </div>
          )}
          
          {/* Jeton de mise actuelle - PLUS PETIT */}
          {g.betAmount > 0 && (
            <div className="text-center mb-3">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center font-bold text-lg md:text-xl border-4 border-yellow-300 mx-auto shadow-xl animate-pulse">
                {g.betAmount}{CURRENCY}
              </div>
              <div className="text-yellow-200 text-xs mt-1 font-medium">MISE ACTUELLE</div>
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
          
          {/* Règles, IA, Math et Aide - OPTIMISÉES ET COMPRESSÉES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            {/* Règles du jeu - COMPRESSÉES */}
            <div className="text-xs text-green-700 space-y-1 font-medium">
              <div className="bg-green-800/20 px-2 py-1 rounded border border-green-600/30">BLACKJACK PAYS 3 TO 2</div>
              <div className="bg-green-800/20 px-2 py-1 rounded border border-green-600/30">Dealer must stand on a 17 and draw to 16</div>
              <div className="bg-green-800/20 px-2 py-1 rounded border border-green-600/30 opacity-80">Insurance pays 2 to 1</div>
            </div>
            
            {/* IA qui compte - COMPRESSÉE */}
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-2">
              <div className="text-blue-300 text-xs font-bold mb-1">🤖 IA ASSISTANT</div>
              <div className="text-blue-200 text-xs">
                <div className="mb-1">Count: <span className="font-bold">{g.cardCounter.getCount()}</span></div>
                <div className="mb-1">True Count: <span className="font-bold">{g.cardCounter.getTrueCount()}</span></div>
                <div className="text-xs opacity-80">{g.cardCounter.getAdvice()}</div>
              </div>
            </div>
            
            {/* Mathématiques - COMPRESSÉES */}
            <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-2">
              <div className="text-purple-300 text-xs font-bold mb-1">🧮 MATHÉMATIQUES</div>
              <div className="text-purple-200 text-xs">
                <div className="mb-1">Probabilité: <span className="font-bold">48%</span></div>
                <div className="mb-1">Combinaisons: <span className="font-bold">2.6M</span></div>
                <div className="text-xs opacity-80">Taux de retour optimal</div>
              </div>
            </div>
            
            {/* Aide et conseils - COMPRESSÉS */}
            <div className="bg-emerald-900/30 border border-emerald-600/50 rounded-lg p-2">
              <div className="text-emerald-300 text-xs font-bold mb-1">💡 AIDE</div>
              <div className="text-emerald-200 text-xs">
                <div className="mb-1">H: Tirer, S: Rester</div>
                <div className="mb-1">D: Doubler, P: Diviser</div>
                <div className="text-xs opacity-80">Espace: Distribuer</div>
              </div>
            </div>
          </div>
          
          {/* Boutons d'action du joueur - OPTIMISÉS ET COMPRESSÉS */}
          {g.phase === "player" && currentHand && (
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-600/50 rounded-lg p-3 mb-4">
              <div className="text-center text-blue-200 text-xs font-bold mb-2">🎮 ACTIONS DISPONIBLES</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-w-4xl mx-auto">
                {!currentHand.doubled && currentHand.cards.length === 2 && g.bank >= currentHand.bet && (
                  <button onClick={g.doubleDown} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg border-2 border-purple-400">
                    <span className="text-sm">x2</span>
                    <span className="hidden sm:inline">Doubler</span>
                  </button>
                )}
                
                {/* Bouton SPLIT - affiché seulement si on a une paire */}
                {currentHand.cards.length === 2 && 
                 currentHand.cards[0].r === currentHand.cards[1].r && 
                 g.bank >= currentHand.bet && (
                  <button onClick={g.split} className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg border-2 border-orange-400">
                    <span className="text-sm">✂️</span>
                    <span className="hidden sm:inline">Diviser</span>
                  </button>
                )}
                
                {/* Bouton SURRENDER - seulement au début avec 2 cartes */}
                {currentHand.cards.length === 2 && (
                  <button onClick={g.surrender} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:from-red-500 hover:to-red-600 transition-all shadow-lg border-2 border-red-400">
                    <span className="text-sm">🏳️</span>
                    <span className="hidden sm:inline">Abandonner</span>
                  </button>
                )}
                
                <button onClick={g.stand} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg border-2 border-blue-400">
                  <span className="text-sm">✋</span>
                  <span className="hidden sm:inline">Rester</span>
                </button>
                
                <button onClick={g.hit} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:from-green-500 hover:to-green-600 transition-all shadow-lg border-2 border-green-400">
                  <span className="text-sm">🎯</span>
                  <span className="hidden sm:inline">Tirer</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zone du joueur - OPTIMISÉE */}
        <div className="mb-4">
          {/* Cartes du joueur - gérer les mains divisées - COMPRESSÉES */}
          <div className="space-y-2">
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
                  
                  {/* Cartes de cette main - COMPRESSÉES */}
                  <div className="flex justify-center items-center gap-1 mb-2">
                    {hand.cards.map((c, i) => (
                      <Card key={i} card={c} />
                    ))}
                  </div>
                  
                  {/* Score de cette main - COMPRESSÉ */}
                  <div className="flex justify-center">
                    <div className={`px-3 py-1 rounded-lg font-bold text-lg border-2 shadow-lg ${
                      isActive 
                        ? 'bg-white text-black border-yellow-400' 
                        : 'bg-gray-700 text-white border-gray-500'
                    }`}>
                      {score.total}
                      {score.softTotal && score.softTotal !== score.total && (
                        <span className="text-blue-600 ml-1">/ {score.softTotal}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mise de cette main - COMPRESSÉE */}
                  <div className="text-white text-xs mt-1 opacity-80">
                    Mise: {hand.bet}{CURRENCY}
                    {hand.doubled && <span className="text-purple-400 ml-1">(Doublée)</span>}
                  </div>
                </div>
              );
            })}
          </div>
          

        </div>

        {/* Zone de contrôle - Bande de bois en bas - OPTIMISÉE */}
        <div className="bg-amber-700 border-t-4 border-amber-800 p-3 rounded-t-3xl shadow-lg">
          {/* Solde du joueur - COMPRESSÉ */}
          <div className="text-center mb-3">
            <div className="text-xl font-bold text-white">
              {g.bank}{CURRENCY}
              <button onClick={() => g.addBank(1000)} className="ml-2 text-red-400 text-lg hover:text-red-300">+</button>
            </div>
          </div>
          
          {/* Jetons de mise - OPTIMISÉS ET COMPRESSÉS */}
          {g.phase === "betting" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 max-w-2xl mx-auto">
              <button onClick={() => g.addChip(1)} className="bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-bold text-base md:text-lg border-3 border-gray-300 shadow-lg hover:scale-110 transition-all hover:shadow-xl">
                1
              </button>
              <button onClick={() => g.addChip(10)} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-bold text-base md:text-lg border-3 border-blue-300 shadow-lg hover:scale-110 transition-all hover:shadow-xl">
                10
              </button>
              <button onClick={() => g.addChip(25)} className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-bold text-base md:text-lg border-3 border-green-300 shadow-lg hover:scale-110 transition-all hover:shadow-xl">
                25
              </button>
              <button onClick={() => g.addChip(100)} className="bg-gradient-to-br from-gray-800 to-black text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-bold text-base md:text-lg border-3 border-gray-500 shadow-lg hover:scale-110 transition-all hover:shadow-xl">
                100
              </button>
            </div>
          )}
          
          {/* Boutons d'action principaux - OPTIMISÉS ET COMPRESSÉS */}
          {g.phase === "betting" && (
            <div className="flex justify-center gap-3 mb-4">
              <button onClick={g.deal} disabled={g.betAmount <= 0} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold text-base disabled:opacity-50 hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-xl border-2 border-green-400 disabled:hover:from-green-600 disabled:hover:to-green-700">
                🎮 JOUER
              </button>
              <button onClick={g.clearBet} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-bold text-base hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-xl border-2 border-red-400">
                🗑️ Effacer
              </button>
            </div>
          )}
          

          
          {g.phase === "payout" && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600/50 rounded-lg p-3 mb-4">
              <div className="text-center text-green-200 text-xs font-bold mb-2">🎉 FIN DE PARTIE</div>
              <button onClick={g.nextPhase} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold text-base w-full hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-xl border-2 border-green-400">
                🎮 NOUVELLE MAIN
              </button>
            </div>
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
      <FunFacts />
    </div>
  );
}
