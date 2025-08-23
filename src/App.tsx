import React, { useEffect, useState } from "react";
import TopBar from "./ui/TopBar";
import Card from "./ui/Card";
import { useGame } from "./state/store";
import { handScore } from "./logic/game";
import { CURRENCY } from "./config";
import ChipRail from "./ui/ChipRail";
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
      // Effacer la mise side bet
      g.clearSideBet();
    } else {
      // Vérifier si on peut placer la mise side bet
      if (SideBetEvaluator.canPlaceSideBet(amount, g.sideBetAmount, g.tableRules, g.bank)) {
        // Ajouter à la mise side bet globale
        g.addSideBetAmount(amount);
      }
    }
  };

  // Fonction pour changer de table
  const changeTable = () => {
    if (g.tableRules.name === "Classic 6-Deck") {
      g.setTableRules(PREMIUM_TABLE);
    } else {
      g.setTableRules(PREMIUM_TABLE); // Pour l'instant, on garde Premium
    }
  };

  // Évaluer les side bets quand c'est le bon moment
  React.useEffect(() => {
    if (g.hands.length > 0 && g.dealer.length > 0) {
      const playerCards = g.hands[0]?.cards || [];
      const dealerCards = g.dealer;
      
      // Évaluer les side bets selon la phase
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
  }, [g.phase, g.hands, g.dealer, g.sideBetAmount, g.tableRules]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{
      backgroundImage: 'url("https://media.cnn.com/api/v1/images/stellar/prod/171122180841-macao-casinos-grand-lisboa-first-floor-gaming-area-1.jpg?q=w_1110,c_fill")'
    }}>
      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Texte MACAO CASINO par-dessus l'image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
        <div className="text-amber-200 text-8xl md:text-9xl font-bold opacity-30 blur-sm select-none text-center">
          MACAO<br />CASINO
        </div>
      </div>
      
      {/* Contenu du jeu avec position relative */}
      <div className="relative z-10">
        {/* TopBar simplifiée */}
        <TopBar 
          bank={g.bank} 
          betAmount={g.betAmount}
          onTableChange={changeTable}
          currentTable={g.tableRules.name}
        />

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-8">
          {/* Side Bets - affiché seulement en phase betting */}
          {g.phase === "betting" && (
                      <SideBets
            tableRules={g.tableRules}
            onSideBetChange={handleSideBetChange}
            currentSideBetAmount={g.sideBetAmount}
            phase={g.phase}
            dealerUpCard={g.dealer[0]}
            canPlaceBets={g.bank > 0}
          />
          )}

          {/* Zone de jeu principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Cartes du joueur */}
            <div className="lg:col-span-2">
              {/* Zone du croupier */}
              <div className="mb-6">
                {/* En-tête avec sabot et solde */}
                <div className="flex justify-between items-start mb-4">
                  {/* Solde du joueur en haut à gauche */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-green-300 shadow-lg">
                    SOLDE: {g.bank.toLocaleString('fr-FR')}{CURRENCY}
                  </div>
                </div>
                
                {/* Cartes du croupier - GROSSIES */}
                <div className="flex justify-center items-center gap-3 mb-4">
                  {g.dealer.map((c, i) => (
                    <div key={i} className="transform hover:scale-105 transition-transform">
                      <Card card={c} hidden={i === 1 && g.phase !== "payout" && g.phase !== "dealer"} />
                    </div>
                  ))}
                </div>
                
                {/* Score du croupier - PLUS GROS */}
                {g.dealer.length > 0 && (
                  <div className="flex justify-center">
                    <div className="bg-white text-black px-6 py-3 rounded-lg font-bold text-2xl border-2 border-red-500 shadow-lg">
                      {g.phase !== "payout" && g.phase !== "dealer" ? 
                        handScore([g.dealer[0]]).total : 
                        handScore(g.dealer).total}
                    </div>
                  </div>
                )}
              </div>

              {/* Zone centrale - Mise actuelle - PLUS GROSSE */}
              <div className="text-center mb-6">
                {/* Jeton de mise actuelle */}
                {g.betAmount > 0 && (
                  <div className="text-center mb-4">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full w-28 h-28 md:w-32 md:h-32 flex items-center justify-center font-bold text-xl md:text-2xl border-4 border-yellow-300 mx-auto shadow-xl animate-pulse">
                      {g.betAmount.toLocaleString('fr-FR')}{CURRENCY}
                    </div>
                    <div className="text-yellow-200 text-sm mt-2 font-medium">MISE ACTUELLE</div>
                  </div>
                )}
                
                {/* Messages de résultat - EXPRESSIFS */}
                {g.message && (
                  <div className="text-center mb-4">
                    {g.message.includes("Victoire") || g.message.includes("WIN") ? (
                      <div className="text-green-500 text-4xl md:text-5xl font-bold animate-pulse bg-green-900/20 px-8 py-4 rounded-2xl border-2 border-green-400 shadow-2xl">
                        🎉 WIN ✨
                      </div>
                    ) : g.message.includes("Perte") || g.message.includes("BUST") || g.message.includes("BUSTED") ? (
                      <div className="text-green-500 text-4xl md:text-5xl font-bold animate-pulse bg-green-900/20 px-8 py-4 rounded-2xl border-2 border-green-400 shadow-2xl">
                        💔 BUSTED 🥹
                      </div>
                    ) : g.message.includes("Égalité") || g.message.includes("PUSH") ? (
                      <div className="text-blue-500 text-4xl md:text-5xl font-bold animate-pulse bg-blue-900/20 px-8 py-4 rounded-2xl border-2 border-blue-400 shadow-2xl">
                        🤝 PUSH!
                      </div>
                    ) : (
                      <div className="text-yellow-500 text-3xl md:text-4xl font-bold bg-yellow-900/20 px-6 py-3 rounded-xl border-2 border-yellow-400 shadow-xl">
                        {g.message}
                      </div>
                    )}
                    
                    {/* Explication du PUSH */}
                    {g.message.includes("Égalité") && (
                      <div className="text-blue-400 text-base mt-3">
                        Votre mise vous est remboursée - pas de gain, pas de perte
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Zone du joueur - GROSSIE */}
              <div className="mb-6">
                {/* Cartes du joueur */}
                <div className="space-y-3">
                  {g.hands.map((hand, handIndex) => {
                    const isActive = handIndex === g.active && g.phase === "player";
                    const score = handScore(hand.cards);
                    
                    return (
                      <div key={hand.id} className={`text-center ${handIndex > 0 ? 'mt-6' : ''}`}>
                        {/* Titre de la main si divisée */}
                        {g.hands.length > 1 && (
                          <div className="text-white text-base mb-3 font-bold">
                            Main {handIndex + 1}
                            {isActive && <span className="text-yellow-400 ml-2">(Active)</span>}
                          </div>
                        )}
                        
                        {/* Cartes de cette main - GROSSIES */}
                        <div className="flex justify-center items-center gap-3 mb-3">
                          {hand.cards.map((c, i) => (
                            <div key={i} className="transform hover:scale-105 transition-transform">
                              <Card card={c} />
                            </div>
                          ))}
                        </div>
                        
                        {/* Score de cette main - PLUS GROS */}
                        <div className="flex justify-center">
                          <div className={`px-6 py-3 rounded-lg font-bold text-2xl border-2 shadow-lg ${
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
                        
                        {/* Mise de cette main - PLUS GROSSE */}
                        <div className="text-white text-sm mt-2 opacity-80">
                          Mise: {hand.bet.toLocaleString('fr-FR')}{CURRENCY}
                          {hand.doubled && <span className="text-purple-400 ml-1">(Doublée)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Colonne droite - Actions et informations */}
            <div className="space-y-6">
              {/* Bouton AUDIT avec conseil stratégique */}
              {g.phase === "player" && g.hands[g.active] && (
                <div className="mb-4">
                  <button 
                    onClick={() => setShowStrategy(!showStrategy)}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-bold text-sm shadow-lg border-2 border-orange-400 hover:scale-105 transition-all"
                  >
                    🔍 AUDIT - Conseils Stratégiques
                  </button>
                  
                  {showStrategy && (
                    <div className="mt-3 bg-black/80 backdrop-blur p-3 rounded-lg border-2 border-orange-400">
                      <div className="text-orange-300 text-xs font-bold mb-2">📊 CONSEIL STRATÉGIQUE</div>
                      <div className="text-white text-sm font-bold mb-2">
                        {getStrategyAdvice()}
                      </div>
                      <div className="text-gray-300 text-xs opacity-80">
                        Basé sur vos cartes et la carte du croupier
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons d'action du joueur */}
              {g.phase === "player" && g.hands[g.active] && (
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-600/50 rounded-lg p-3">
                  <div className="text-center text-blue-200 text-xs font-bold mb-3">🎮 ACTIONS DISPONIBLES</div>
                  <div className="space-y-2">
                    {/* Bouton DOUBLER - seulement si on a 2 cartes et assez d'argent */}
                    {!g.hands[g.active].doubled && g.hands[g.active].cards.length === 2 && g.bank >= g.hands[g.active].bet && (
                      <button onClick={g.doubleDown} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg border-2 border-purple-400">
                        <span className="text-sm">x2</span>
                        <span>Doubler</span>
                      </button>
                    )}
                    
                    {/* Bouton SPLIT - seulement si on a une paire et assez d'argent */}
                    {g.hands[g.active].cards.length === 2 && 
                     g.hands[g.active].cards[0].r === g.hands[g.active].cards[1].r && 
                     g.bank >= g.hands[g.active].bet && (
                      <button onClick={g.split} className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg border-2 border-orange-400">
                        <span className="text-sm">✂️</span>
                        <span>Diviser</span>
                      </button>
                    )}
                    
                    {/* Bouton SURRENDER - seulement au début avec 2 cartes */}
                    {g.hands[g.active].cards.length === 2 && (
                      <button onClick={g.surrender} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:from-red-500 hover:to-red-600 transition-all shadow-lg border-2 border-red-400">
                        <span className="text-sm">🏳️</span>
                        <span>Abandonner</span>
                      </button>
                    )}
                    
                    <button onClick={g.stand} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg border-2 border-blue-400">
                      <span className="text-sm">✋</span>
                      <span>Rester</span>
                    </button>
                    
                    <button onClick={g.hit} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:from-green-500 hover:to-green-600 transition-all shadow-lg border-2 border-green-400">
                      <span className="text-sm">🎯</span>
                      <span>Tirer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zone de contrôle - Bande de bois en bas */}
        <div className="bg-amber-700 border-t-4 border-amber-800 p-3 rounded-t-3xl shadow-lg">
          {/* Jetons de mise */}
          {g.phase === "betting" && g.betAmount < g.bank && (
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
          
          {/* Message quand ALL IN - Plus de jetons visibles */}
          {g.phase === "betting" && g.betAmount >= g.bank && g.bank > 0 && (
            <div className="text-center mb-4">
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-red-400 shadow-lg">
                🚀 ALL IN - Plus de jetons disponibles
              </div>
              <div className="text-red-200 text-xs mt-2 opacity-80">
                Votre mise est au maximum - Cliquez sur JOUER !
              </div>
            </div>
          )}
          
          {/* Bouton ALL IN - REMIS */}
          {g.phase === "betting" && g.bank > 0 && g.betAmount === 0 && (
            <div className="text-center mb-4">
              <button 
                onClick={() => g.addChip(g.bank)}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg border-2 border-red-400 hover:scale-105 transition-all hover:shadow-xl animate-pulse"
              >
                🚀 ALL IN - {g.bank.toLocaleString('fr-FR')}{CURRENCY}
              </button>
              <div className="text-red-200 text-xs mt-2 opacity-80">Misez tout votre solde !</div>
            </div>
          )}
          
          {/* Boutons d'action principaux */}
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

        {/* Modal de prêt bancaire - NOUVEAU */}
        {showLoanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8 rounded-2xl border-2 border-blue-400 text-center max-w-md w-full mx-4 shadow-2xl">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-2xl font-bold mb-6 text-blue-200">Gina Bank</h3>
              <div className="text-gray-300 mb-6">
                Vous n'avez plus d'argent ! Empruntez à Gina Bank pour continuer à jouer.
              </div>
              
              {/* Options de prêt rapides */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button 
                  onClick={() => borrowMoney(1000)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg border-2 border-green-400"
                >
                  1000€
                </button>
                <button 
                  onClick={() => borrowMoney(2000)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg border-2 border-blue-400"
                >
                  2000€
                </button>
                <button 
                  onClick={() => borrowMoney(5000)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg border-2 border-purple-400"
                >
                  5000€
                </button>
              </div>
              
              {/* Montant personnalisé */}
              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-bold mb-2">Montant personnalisé :</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={customLoanAmount} 
                    onChange={(e) => setCustomLoanAmount(parseInt(e.target.value) || 1000)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-blue-400 focus:border-blue-300 focus:outline-none"
                    min="100"
                    max="50000"
                    step="100"
                  />
                  <button 
                    onClick={() => borrowMoney(customLoanAmount)}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg border-2 border-orange-400"
                  >
                    Emprunter
                  </button>
                </div>
              </div>
              
              {/* Bouton fermer */}
              <button 
                onClick={() => setShowLoanModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Bouton d'emprunt quand solde = 0 ET en phase betting ET pas de partie en cours */}
        {g.bank === 0 && g.phase === "betting" && g.hands.length === 0 && g.betAmount === 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="bg-black/20 backdrop-blur-sm absolute inset-0"></div>
            <div className="relative z-50">
              <button 
                onClick={() => setShowLoanModal(true)}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-6 rounded-2xl font-bold text-2xl shadow-2xl border-4 border-red-400 hover:scale-110 transition-all animate-pulse"
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
    </div>
  );
}
