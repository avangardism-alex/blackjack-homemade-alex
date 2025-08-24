import React, { useEffect, useState } from "react";
import TopBar from "./ui/TopBar";
import Card from "./ui/Card";
import { useGame } from "./state/store";
import { handScore } from "./logic/game";
import { CURRENCY } from "./config";
import Actions from "./ui/Actions";
import SideBets from "./ui/SideBets";
import SideBetResults from "./ui/SideBetResults";
import { SideBetEvaluator } from "./logic/sideBetEvaluator";
import { PREMIUM_TABLE } from "./config/sidebet.rules";

export default function App() {
  const g = useGame();
  const [showStrategy, setShowStrategy] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [customLoanAmount, setCustomLoanAmount] = useState(1000);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showSideBetResults, setShowSideBetResults] = useState(false);

  // Forcer la mise à jour quand g.bank change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [g.bank]);

  // Fonction pour obtenir le conseil de stratégie
  const getStrategyAdvice = () => {
    if (!g.hands[g.active] || g.phase !== "player") return "Pas de conseil disponible";
    
    const playerCards = g.hands[g.active].cards;
    const dealerCard = g.dealer[0];
    
    if (!dealerCard || playerCards.length === 0) return "Pas de conseil disponible";
    
    const playerScore = handScore(playerCards);
    const dealerUpCard = dealerCard.r === 'A' ? 11 : Math.min(10, parseInt(dealerCard.r) || 10);
    
    // Logique de stratégie basique
    if (playerScore.total >= 17) return "🟢 RESTER - Score élevé";
    if (playerScore.total <= 8) return "🔴 TIRER - Score trop bas";
    
    if (dealerUpCard >= 7) {
      if (playerScore.total <= 16) return "🔴 TIRER - Croupier fort";
    } else {
      if (playerScore.total >= 12) return "🟢 RESTER - Croupier faible";
    }
    
    if (playerScore.total === 11) return "🟡 DOUBLER - Bonne opportunité";
    if (playerScore.total === 10 && dealerUpCard <= 9) return "🟡 DOUBLER - Contre croupier faible";
    
    return "🟡 TIRER - Situation neutre";
  };

  // Fonction pour emprunter de l'argent
  const borrowMoney = (amount: number) => {
    g.addBank(amount);
    setShowLoanModal(false);
  };

  // Fonction pour gérer la mise side bet globale
  const handleSideBetChange = (amount: number) => {
    if (amount === 0) {
      g.clearSideBet();
    } else {
      // Vérifier si on peut placer cette mise
      if (SideBetEvaluator.canPlaceSideBet(amount, 0, g.tableRules, g.bank)) {
        // Définir directement le nouveau montant (pas d'ajout)
        g.setSideBetAmount(amount);
      }
    }
  };

  // Fonction pour changer de table
  const changeTable = () => {
    if (g.tableRules.name === "Classic 6-Deck") {
      g.setTableRules(PREMIUM_TABLE);
    } else {
      g.setTableRules(PREMIUM_TABLE);
    }
  };

  // Évaluer les side bets quand c'est le bon moment
  React.useEffect(() => {
    if (g.hands.length > 0 && g.dealer.length > 0) {
      const playerCards = g.hands[0]?.cards || [];
      const dealerCards = g.dealer;
      
      const results = SideBetEvaluator.evaluateSideBets(
        g.sideBetAmount,
        g.tableRules,
        playerCards,
        dealerCards,
        g.phase
      );
      
      if (results.length > 0) {
        g.setSideBetResults(results);
        setShowSideBetResults(true);
      }
    }
  }, [g.hands, g.dealer, g.phase, g.sideBetAmount, g.tableRules]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden">
      {/* TopBar */}
      <TopBar 
        bank={g.bank} 
        betAmount={g.betAmount}
        onTableChange={changeTable}
        currentTable={g.tableRules.name}
      />

      {/* Zone de jeu principale - Layout responsive sans scroll */}
      <div className="h-[calc(100vh-80px)] flex flex-col p-2 sm:p-4">
        
        {/* Zone du croupier - En haut */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Solde du joueur */}
          <div className="absolute top-20 left-4 z-20">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg font-bold text-sm sm:text-base border-2 border-green-300 shadow-lg">
              SOLDE: {g.bank.toLocaleString('fr-FR')}{CURRENCY}
            </div>
          </div>

          {/* Cartes du croupier */}
          {g.dealer.length > 0 && (
            <div className="flex flex-col items-center mb-2">
              <div className="flex justify-center items-center gap-2 mb-2">
                {g.dealer.map((c, i) => (
                  <div key={i} className="transform hover:scale-105 transition-transform">
                    <Card card={c} hidden={i === 1 && g.phase !== "payout" && g.phase !== "dealer"} />
                  </div>
                ))}
              </div>
              
              {/* Score du croupier */}
              <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-lg sm:text-xl border-2 border-red-500 shadow-lg">
                {g.phase !== "payout" && g.phase !== "dealer" ? 
                  handScore([g.dealer[0]]).total : 
                  (() => {
                    const dealerScore = handScore(g.dealer);
                    return dealerScore.isBJ ? "BLACKJACK ✨" : dealerScore.total;
                  })()}
              </div>
            </div>
          )}
        </div>

        {/* Zone centrale - Mise et messages */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Jeton de mise actuelle */}
          {g.betAmount > 0 && (
            <div className="text-center mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl border-4 border-yellow-300 mx-auto shadow-xl">
                {g.betAmount.toLocaleString('fr-FR')}{CURRENCY}
              </div>
              <div className="text-yellow-200 text-xs sm:text-sm mt-2 font-medium">MISE ACTUELLE</div>
            </div>
          )}

          {/* Messages de résultat */}
          {g.message && (
            <div className="text-center mb-4">
              {g.message.includes("Victoire") || g.message.includes("WIN") ? (
                <div className="text-green-500 text-2xl sm:text-3xl md:text-4xl font-bold bg-green-900/20 px-6 py-3 rounded-xl border-2 border-green-400 shadow-xl">
                  🎉 WIN ✨
                </div>
              ) : g.message.includes("Perte") || g.message.includes("BUST") || g.message.includes("BUSTED") ? (
                <div className="text-red-500 text-2xl sm:text-3xl md:text-4xl font-bold bg-red-900/20 px-6 py-3 rounded-xl border-2 border-red-400 shadow-xl">
                  💔 BUSTED 🥹
                </div>
              ) : g.message.includes("Égalité") || g.message.includes("PUSH") ? (
                <div className="text-blue-500 text-2xl sm:text-3xl md:text-4xl font-bold bg-blue-900/20 px-6 py-3 rounded-xl border-2 border-blue-400 shadow-xl">
                  🤝 PUSH!
                </div>
              ) : (
                <div className="text-yellow-500 text-xl sm:text-2xl md:text-3xl font-bold bg-yellow-900/20 px-4 py-2 rounded-lg border-2 border-yellow-400 shadow-lg">
                  {g.message}
                </div>
              )}
              
              {g.message.includes("Égalité") && (
                <div className="text-blue-400 text-sm mt-2">
                  Votre mise vous est remboursée - pas de gain, pas de perte
                </div>
              )}
            </div>
          )}

          {/* Side Bets - Intégré à droite */}
          {g.phase === "betting" && (
            <div className="absolute top-20 right-4 z-20">
              <SideBets
                tableRules={g.tableRules}
                onSideBetChange={handleSideBetChange}
                currentSideBetAmount={g.sideBetAmount}
                phase={g.phase}
                dealerUpCard={g.dealer[0]}
                canPlaceBets={g.bank > 0}
              />
            </div>
          )}
        </div>

        {/* Zone du joueur - En bas */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Cartes du joueur */}
          {g.hands.length > 0 && (
            <div className="space-y-2 mb-4">
              {g.hands.map((hand, handIndex) => {
                const isActive = handIndex === g.active && g.phase === "player";
                const score = handScore(hand.cards);
                
                return (
                  <div key={hand.id} className="text-center">
                    {/* Titre de la main si divisée */}
                    {g.hands.length > 1 && (
                      <div className="text-white text-sm mb-2 font-bold">
                        Main {handIndex + 1}
                        {isActive && <span className="text-yellow-400 ml-2">(Active)</span>}
                      </div>
                    )}
                    
                    {/* Cartes de cette main */}
                    <div className="flex justify-center items-center gap-2 mb-2">
                      {hand.cards.map((c, i) => (
                        <div key={i} className="transform hover:scale-105 transition-transform">
                          <Card card={c} />
                        </div>
                      ))}
                    </div>
                    
                    {/* Score de cette main */}
                    <div className="flex justify-center mb-2">
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg border-2 shadow-lg ${
                        isActive 
                          ? 'bg-white text-black border-yellow-400' 
                          : 'bg-gray-700 text-white border-gray-500'
                      }`}>
                        {score.isBJ ? "BLACKJACK ✨" : (
                          <>
                            {score.total}
                            {score.softTotal && score.softTotal !== score.total && (
                              <span className="text-blue-600 ml-2">/ {score.softTotal}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Mise de cette main */}
                    <div className="text-white text-xs opacity-80">
                      Mise: {hand.bet.toLocaleString('fr-FR')}{CURRENCY}
                      {hand.doubled && <span className="text-purple-400 ml-1">(Doublée)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions du joueur */}
          {g.phase === "player" && g.hands[g.active] && (
            <Actions 
              onHit={g.hit}
              onStand={g.stand}
              onDoubleDown={g.doubleDown}
              onSplit={g.split}
              onSurrender={g.surrender}
              onInsurance={g.insurance}
              canDoubleDown={!g.hands[g.active].doubled && g.hands[g.active].cards.length === 2 && g.bank >= g.hands[g.active].bet}
              canSplit={g.hands[g.active].cards.length === 2 && g.hands[g.active].cards[0].r === g.hands[g.active].cards[1].r && g.bank >= g.hands[g.active].bet}
              canSurrender={g.hands[g.active].cards.length === 2}
              canInsurance={g.dealer[0]?.r === "A" && !g.hands[g.active].insured}
              cardCounter={g.cardCounter}
              isInsuranceMandatory={false}
              currentHand={g.hands[g.active]}
              dealerUpCard={g.dealer[0]}
              bank={g.bank}
            />
          )}
        </div>

        {/* Zone de contrôle - En bas, fixe */}
        <div className="bg-amber-700 border-t-4 border-amber-800 p-2 sm:p-3 rounded-t-2xl shadow-lg">
          {/* Jetons de mise rapide */}
          {g.phase === "betting" && g.betAmount < g.bank && (
            <div className="grid grid-cols-4 gap-2 mb-3 max-w-xs mx-auto">
              {[1, 10, 25, 100].map((value) => (
                <button 
                  key={value}
                  onClick={() => g.addChip(value)} 
                  className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-sm border-2 border-yellow-300 shadow-lg hover:scale-105 transition-transform"
                >
                  {value}
                </button>
              ))}
            </div>
          )}
          
          {/* Message ALL IN */}
          {g.phase === "betting" && g.betAmount === g.bank && g.bank > 0 && (
            <div className="text-center mb-3">
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base border-2 border-red-400 shadow-lg">
                🚀 ALL IN - Plus de jetons disponibles
              </div>
              <div className="text-red-200 text-xs mt-1 opacity-80">
                Votre mise est au maximum - Cliquez sur JOUER !
              </div>
            </div>
          )}
          
          {/* Bouton ALL IN */}
          {g.phase === "betting" && g.bank > 0 && g.betAmount === 0 && (
            <div className="text-center mb-3">
              <button 
                onClick={() => g.addChip(g.bank)}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-6 py-3 rounded-lg font-bold text-base sm:text-lg shadow-lg border-2 border-red-400 hover:scale-105 transition-transform"
              >
                🚀 ALL IN - {g.bank.toLocaleString('fr-FR')}{CURRENCY}
              </button>
              <div className="text-red-200 text-xs mt-1 opacity-80">Misez tout votre solde !</div>
            </div>
          )}
          
          {/* Boutons d'action principaux */}
          {g.phase === "betting" && (
            <div className="flex justify-center gap-3">
              <button 
                onClick={g.deal} 
                disabled={g.betAmount <= 0} 
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base disabled:opacity-50 hover:from-green-500 hover:to-green-600 transition-colors shadow-lg border-2 border-green-400 disabled:hover:from-green-600 disabled:hover:to-green-700"
              >
                🎮 JOUER
              </button>
              <button 
                onClick={g.clearBet} 
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base hover:from-red-500 hover:to-red-600 transition-colors shadow-lg border-2 border-red-400"
              >
                🗑️ Effacer
              </button>
            </div>
          )}
          
          {g.phase === "payout" && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600/50 rounded-lg p-3">
              <div className="text-center text-green-200 text-xs font-bold mb-2">🎉 FIN DE PARTIE</div>
              <button 
                onClick={g.nextPhase} 
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold text-base w-full hover:from-green-500 hover:to-green-600 transition-colors shadow-lg border-2 border-green-400"
              >
                🎮 NOUVELLE MAIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de prêt bancaire */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 text-white p-6 sm:p-8 rounded-2xl border-2 border-blue-400 text-center max-w-md w-full mx-4 shadow-2xl">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-blue-200">Gina Bank</h3>
            <div className="text-gray-300 mb-6 text-sm sm:text-base">
              Vous n'avez plus d'argent ! Empruntez à Gina Bank pour continuer à jouer.
            </div>
            
            {/* Options de prêt rapides */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1000, 2000, 5000].map((amount) => (
                <button 
                  key={amount}
                  onClick={() => borrowMoney(amount)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-lg border-2 border-green-400"
                >
                  {amount}€
                </button>
              ))}
            </div>
            
            {/* Montant personnalisé */}
            <div className="mb-6">
              <label className="block text-blue-200 text-sm font-bold mb-2">Montant personnalisé :</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={customLoanAmount} 
                  onChange={(e) => setCustomLoanAmount(parseInt(e.target.value) || 1000)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border-2 border-blue-400 focus:border-blue-300 focus:outline-none text-sm"
                  min="100"
                  max="50000"
                  step="100"
                />
                <button 
                  onClick={() => borrowMoney(customLoanAmount)}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-lg border-2 border-orange-400"
                >
                  Emprunter
                </button>
              </div>
            </div>
            
            {/* Bouton fermer */}
            <button 
              onClick={() => setShowLoanModal(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Bouton d'emprunt quand solde = 0 */}
      {g.bank === 0 && g.phase === "betting" && g.hands.length === 0 && g.betAmount === 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="bg-black/20 backdrop-blur-sm absolute inset-0"></div>
          <div className="relative z-50">
            <button 
              onClick={() => setShowLoanModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-6 py-4 rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl border-4 border-red-400 hover:scale-105 transition-transform"
            >
              🏦 Emprunter à Gina Bank
            </button>
          </div>
        </div>
      )}

      {/* Modal des résultats des side bets */}
      {showSideBetResults && (
        <SideBetResults
          results={g.sideBetResults}
          onClose={() => {
            setShowSideBetResults(false);
            g.clearSideBetResults();
          }}
        />
      )}
    </div>
  );
}
