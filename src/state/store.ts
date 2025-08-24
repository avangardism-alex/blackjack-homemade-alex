import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildDeck, shuffle, type Card, type Hand, dealerPlay, payoutOne, handScore, verifyGameFairness } from "../logic/game";
import { CardCounter } from "../logic/cardCounter";
import { START_BANK } from "../config";
import { SFX } from "../sfx";
import { SideBetResult } from "../logic/sideBets";
import { SideBetEvaluator } from "../logic/sideBetEvaluator";
import { CLASSIC_TABLE, TableRules } from "../config/sidebet.rules";

// Interface unifiée pour le jeu avec side bets

interface GameState {
  bank: number;
  shoe: Card[];
  phase: "betting" | "dealing" | "player" | "dealer" | "payout";
  hands: Hand[];
  active: number;
  dealer: Card[];
  betAmount: number;
  lastBetAmount: number; // Sauvegarder la dernière mise
  sideBetAmount: number; // Mise pour les side bets
  message?: string;
  showWinAnimation: boolean;
  showTieAnimation: boolean;
  cardCounter: CardCounter;
  
  // Side Bets
  tableRules: TableRules;
  sideBetResults: SideBetResult[];
  
  // Actions
  addBank: (amt: number) => void;
  resetBank: () => void;
  addChip: (amt: number) => void;
  tapis: () => void;
  clearBet: () => void;
  clearSideBet: () => void;
  rejouerMise: () => void;
  deal: () => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  split: () => void;
  surrender: () => void;
  insurance: () => void;
  nextPhase: () => void;
  
  // Side Bet actions
  setTableRules: (rules: TableRules) => void;
  addSideBetAmount: (amount: number) => void;
  setSideBetAmount: (amount: number) => void;
  setSideBetResults: (results: SideBetResult[]) => void;
  clearSideBetResults: () => void;
}

const LS_KEY = "bj_bank_v1";
const TABLE_MIN = 1;
const TABLE_MAX = 999999; // Pas de limite pratique

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      bank: Number(localStorage.getItem(LS_KEY) ?? START_BANK),
      shoe: shuffle(buildDeck(1)),
      phase: "betting",
      hands: [],
      active: 0,
      dealer: [],
      betAmount: 0,
      lastBetAmount: 0, // Initialiser la dernière mise
      sideBetAmount: 0, // Initialiser les side bets
      message: undefined,
      showWinAnimation: false,
      showTieAnimation: false,
      cardCounter: new CardCounter(),
      
      // Side Bets - initialisation
      tableRules: CLASSIC_TABLE,
      sideBetResults: [],

      addBank: (amt)=> set((st)=>{
        const bank = st.bank + amt;
        localStorage.setItem(LS_KEY, String(bank));
        return { bank };
      }),

      resetBank: ()=> {
        localStorage.setItem(LS_KEY, String(START_BANK));
        set({ bank: START_BANK });
      },

      addChip: (amt) => set((st) => {
        SFX.chip();
        const next = Math.min(Math.max(st.betAmount + amt, TABLE_MIN), TABLE_MAX);
        // Vérifier que le joueur a assez d'argent (permettre de miser exactement la banque)
        if (next > st.bank) return st;
        // Retirer l'argent du solde immédiatement
        const bank = st.bank - amt;
        localStorage.setItem(LS_KEY, String(bank));
        return { betAmount: next, bank };
      }),

      // Fonction spéciale pour le TAPIS (miser tout)
      tapis: () => {
        const st = get();
        SFX.chip();
        const betAmount = st.bank;
        const bank = 0;
        localStorage.setItem(LS_KEY, String(bank));
        
        // Mettre à jour l'état
        set({ betAmount, bank });
        
        // Lancer automatiquement le jeu après un court délai
        setTimeout(() => {
          const currentSt = get();
          if (currentSt.phase === "betting" && currentSt.betAmount > 0) {
            currentSt.deal();
          }
        }, 500); // Délai de 500ms pour laisser le temps à l'interface de se mettre à jour
      },

      clearBet: () => set({ betAmount: 0 }),
      // Ajouter aux side bets (nouvelle logique)
      addSideBetAmount: (amt) => set((st) => {
        SFX.chip();
        const next = st.sideBetAmount + amt;
        if (next > st.bank) return st;
        const bank = st.bank - amt;
        localStorage.setItem(LS_KEY, String(bank));
        return { sideBetAmount: next, bank };
      }),
      
      // Définir directement le montant des side bets
      setSideBetAmount: (amount: number) => set((st) => {
        SFX.chip();
        // Calculer la différence pour mettre à jour la banque
        const difference = amount - st.sideBetAmount;
        if (difference > st.bank) return st; // Pas assez d'argent
        
        const bank = st.bank - difference;
        localStorage.setItem(LS_KEY, String(bank));
        return { sideBetAmount: amount, bank };
      }),
      
      // Effacer les side bets ET rembourser l'argent
      clearSideBet: () => set((st) => {
        if (st.sideBetAmount > 0) {
          const bank = st.bank + st.sideBetAmount;
          localStorage.setItem(LS_KEY, String(bank));
          return { sideBetAmount: 0, bank };
        }
        return st;
      }),
      
      // Rejouer la dernière mise
      rejouerMise: () => {
        const st = get();
        console.log("=== DEBUG REJOUER ===");
        console.log("lastBetAmount:", st.lastBetAmount);
        console.log("bank:", st.bank);
        console.log("betAmount actuel:", st.betAmount);
        console.log("Condition:", st.lastBetAmount > 0 && st.bank >= st.lastBetAmount);
        
        // CORRECTION : Empêcher de rejouer si une mise est déjà en cours
        if (st.betAmount > 0) {
          console.log("Impossible de rejouer : mise déjà en cours");
          return;
        }
        
        if (st.lastBetAmount > 0 && st.bank >= st.lastBetAmount) {
          SFX.chip();
          const betAmount = st.lastBetAmount;
          const bank = st.bank - st.lastBetAmount;
          console.log("Mise rejouée:", betAmount, "€, nouvelle banque:", bank, "€");
          localStorage.setItem(LS_KEY, String(bank));
          set({ betAmount, bank });
        } else {
          console.log("Impossible de rejouer la mise");
        }
      },

      deal: () => {
        const st = get();
        if (st.phase !== "betting" || st.betAmount <= 0 || (st.betAmount > st.bank && st.bank > 0)) return;
        
        // Vérifier si on doit reshuffler
        if (st.shoe.length < 20) {
          console.log("🔄 Reshuffle automatique - moins de 20 cartes restantes");
          const newShoe = shuffle(buildDeck(1));
          st.cardCounter.reset(); // Reset le compteur pour nouveau deck
          set({ shoe: newShoe });
          return;
        }
        
        const shoe = st.shoe.slice();
        const playerCard1 = shoe.shift()!;
        const playerCard2 = shoe.shift()!;
        const dealerCard1 = shoe.shift()!;
        const dealerCard2 = shoe.shift()!;
        
        // 🔍 VÉRIFICATION DE TRANSPARENCE - Logs détaillés
        console.log("🎯 DISTRIBUTION DES CARTES:");
        console.log(`👤 Joueur: ${playerCard1.r}${playerCard1.s} + ${playerCard2.r}${playerCard2.s}`);
        console.log(`🎰 Croupier: ${dealerCard1.r}${dealerCard1.s} + ${dealerCard2.r}${dealerCard2.s} (cachée)`);
        console.log(`📊 Cartes restantes dans le shoe: ${shoe.length}`);
        
        // Vérifier l'équité après distribution
        const fairness = verifyGameFairness(shoe);
        if (!fairness.isFair) {
          console.warn("⚠️ PROBLÈME D'ÉQUITÉ DÉTECTÉ:", fairness.warnings);
        } else {
          console.log("✅ Distribution équitable confirmée");
        }
        
        // Mettre à jour le compteur
        st.cardCounter.updateCount(playerCard1);
        st.cardCounter.updateCount(playerCard2);
        st.cardCounter.updateCount(dealerCard1);
        st.cardCounter.updateCount(dealerCard2);
        
        const player: Hand = { id: crypto.randomUUID(), cards: [playerCard1, playerCard2], bet: st.betAmount };
        const dealer: Card[] = [dealerCard1, dealerCard2];
        
        // Sauvegarder la mise pour pouvoir la rejouer
        console.log("Sauvegarde de la mise:", st.betAmount, "€");
        set({ lastBetAmount: st.betAmount });
        
        SFX.deal();
        
        // Vérifier si le joueur a un Blackjack
        const playerScore = handScore([playerCard1, playerCard2]);
        if (playerScore.isBJ) {
          // Blackjack ! Passer directement à la phase du croupier
          set({ phase: "dealer", hands: [player], active: 0, dealer, shoe, message: undefined });
          
          // Faire jouer le croupier automatiquement après un délai
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "dealer") {
              const { dealer: finalDealer, shoe: finalShoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
              set({ dealer: finalDealer, shoe: finalShoe, phase: "payout" });
              
              // Calculer le résultat automatiquement
              setTimeout(() => {
                const finalSt = get();
                if (finalSt.phase === "payout") {
                  let delta = 0; console.log("=== DEBUG PAYOUT ===");
                  finalSt.hands.forEach((h) => { const payout = payoutOne(h, finalSt.dealer); console.log("Main payout:", payout, "€ (bet:", h.bet, "€)"); delta += payout; });
                  const dealerBJ = handScore(finalSt.dealer).isBJ;
                  finalSt.hands.forEach((h) => {
                    if (h.insured) {
                      if (dealerBJ) {
                        // Assurance paie 2:1 sur le coût (moitié de la mise)
                        const insuranceCost = Math.floor(h.bet / 2);
                        delta += insuranceCost * 2; // Gain = coût × 2
                      } else {
                        // Assurance perdue si pas de Blackjack
                        delta += 0; // Pas de gain, coût déjà déduit
                      }
                    }
                  });
                  
                  // Calculer les gains des side bets
                  let sideBetGains = 0;
                  if (finalSt.sideBetAmount > 0) {
                    const playerCards = finalSt.hands[0]?.cards || [];
                    if (playerCards.length >= 2) {
                      const card1 = playerCards[0];
                      const card2 = playerCards[1];
                      
                      // Perfect Pairs
                      if (card1.r === card2.r) {
                        if (card1.s === card2.s) {
                          // Paire parfaite (même carte) - 25:1
                          sideBetGains += finalSt.sideBetAmount * 25;
                          console.log("🎯 Paire parfaite ! +", finalSt.sideBetAmount * 25, "€");
                        } else if (card1.s === "H" || card1.s === "D" || card2.s === "H" || card2.s === "D") {
                          // Paire de couleur (rouge) - 10:1
                          sideBetGains += finalSt.sideBetAmount * 10;
                          console.log("🎨 Paire de couleur ! +", finalSt.sideBetAmount * 10, "€");
                        } else {
                          // Paire mixte - 5:1
                          sideBetGains += finalSt.sideBetAmount * 5;
                          console.log("🃏 Paire mixte ! +", finalSt.sideBetAmount * 5, "€");
                        }
                      }
                      
                      // Pair Plus (vraie logique casino - toutes les combinaisons)
                      if (playerCards.length >= 3) {
                        const card3 = playerCards[2];
                        const ranks = [card1.r, card2.r, card3.r];
                        const suits = [card1.s, card2.s, card3.s];
                        
                        // Vérifier les combinaisons
                        if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
                          // Brelan - 3:1
                          sideBetGains += finalSt.sideBetAmount * 3;
                          console.log("🎲 Brelan ! +", finalSt.sideBetAmount * 3, "€");
                        } else if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
                          // Paire - 1:1
                          sideBetGains += finalSt.sideBetAmount * 1;
                          console.log("🃏 Paire ! +", finalSt.sideBetAmount * 1, "€");
                        }
                      }
                    }
                  }
                  
                  // CORRECTION : Calculer le gain/perte total
                  const totalGains = delta + sideBetGains;
                  console.log("Delta final:", delta, "€, Side bets:", sideBetGains, "€, Total:", totalGains, "€");
                  
                  // CORRECTION : La mise est déjà déduite du solde
                  // Si delta > 0 : gain (on récupère la mise + gain)
                  // Si delta < 0 : perte (on récupère rien, mise déjà perdue)  
                  // Si delta = 0 : égalité (on récupère la mise)
                  let bank = finalSt.bank;
                  
                  // En cas d'égalité, rembourser la mise
                  if (delta === 0) {
                    const totalBet = finalSt.hands.reduce((sum, h) => sum + h.bet, 0);
                    bank += totalBet;
                    console.log("🤝 Égalité : remboursement de la mise", totalBet, "€");
                  }
                  
                  // Ajouter les gains/pertes
                  bank += totalGains;
                  bank = Math.max(0, bank);
                  localStorage.setItem(LS_KEY, String(bank));
                  
                  if (delta>0) { 
                    SFX.win(); 
                    set({ showWinAnimation: true, bank });
                    setTimeout(() => set({ showWinAnimation: false }), 2000);
                    set({ message: `🎉 BLACKJACK ! Gain net : +${delta}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else if (delta<0) { 
                    SFX.lose(); 
                    set({ bank });
                    // Animation supprimée
                    set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else {
                    // Égalité : rembourser la mise initiale
                    const bankWithRefund = currentSt.bank + finalSt.betAmount;
                    localStorage.setItem(LS_KEY, String(bankWithRefund));
                    set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank: bankWithRefund });
                    setTimeout(() => set({ message: undefined }), 3000);
                  }
                  set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                  if (finalSt.shoe.length < 20) { SFX.shuffle(); set({ shoe: shuffle(buildDeck(1)) }); }
                }
              }, 2000);
            }
          }, 1000);
        } else {
          // Pas de Blackjack, phase normale
          set({ phase: "player", hands: [player], active: 0, dealer, shoe, message: undefined });
        }
      },

      hit: () => {
        const st = get();
        if (st.phase !== "player") return;
        const shoe = st.shoe.slice();
        const hands = st.hands.slice();
        const newCard = shoe.shift()!;
        
        // Mettre à jour le compteur
        st.cardCounter.updateCount(newCard);
        
        hands[st.active].cards.push(newCard);
        SFX.deal();
        set({ hands, shoe });
        
        // Vérifier le score après avoir tiré
        const sc = handScore(hands[st.active].cards);
        
        // CORRECTION : Gestion intelligente des mains soft
        if (sc.isBust) {
          // Si on dépasse 21, vérifier s'il y a une valeur soft valide
          if (sc.softTotal && sc.softTotal <= 21) {
            // On a une valeur soft valide, on continue
            console.log(`🎯 Main soft : ${sc.total} → ${sc.softTotal} (As converti en 1)`);
          } else {
            // Vraiment bust, fin de la main
            SFX.bust(); 
            get().stand(); 
          }
        }
      },

      stand: () => {
        const st = get();
        if (st.phase !== "player") return;
        const hands = st.hands.slice();
        
        // CORRECTION : Marquer la main comme terminée avec le bon score
        const currentHand = hands[st.active];
        const score = handScore(currentHand.cards);
        
        // Si on a une main soft et qu'on dépasse 21, utiliser la valeur soft
        if (score.isBust && score.softTotal && score.softTotal <= 21) {
          console.log(`🎯 Main soft convertie : ${score.total} → ${score.softTotal}`);
          // La main n'est pas vraiment bust, on peut continuer
          return;
        }
        
        hands[st.active].done = true;
        const next = hands.findIndex((h, i) => !h.done && i > st.active);
        if (next !== -1) set({ hands, active: next });
        else {
          // Le croupier joue automatiquement
          set({ hands, phase: "dealer" });
          
          // Attendre un peu puis faire jouer le croupier
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "dealer") {
              const { dealer, shoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
              set({ dealer, shoe, phase: "payout" });
              
              // Attendre encore un peu puis calculer le résultat
              setTimeout(() => {
                const finalSt = get();
                if (finalSt.phase === "payout") {
                  let delta = 0; console.log("=== DEBUG PAYOUT ===");
                  finalSt.hands.forEach((h) => { const payout = payoutOne(h, finalSt.dealer); console.log("Main payout:", payout, "€ (bet:", h.bet, "€)"); delta += payout; });
                  const dealerBJ = handScore(finalSt.dealer).isBJ;
                  finalSt.hands.forEach((h) => {
                    if (h.insured) {
                      if (dealerBJ) {
                        // Assurance paie 2:1 sur le coût (moitié de la mise)
                        const insuranceCost = Math.floor(h.bet / 2);
                        delta += insuranceCost * 2; // Gain = coût × 2
                      } else {
                        // Assurance perdue si pas de Blackjack
                        delta += 0; // Pas de gain, coût déjà déduit
                      }
                    }
                  });
                  
                  // Calculer les gains des side bets
                  let sideBetGains = 0;
                  if (finalSt.sideBetAmount > 0) {
                    const playerCards = finalSt.hands[0]?.cards || [];
                    if (playerCards.length >= 2) {
                      const card1 = playerCards[0];
                      const card2 = playerCards[1];
                      
                      // Perfect Pairs
                      if (card1.r === card2.r) {
                        if (card1.s === card2.s) {
                          // Paire parfaite (même carte) - 25:1
                          sideBetGains += finalSt.sideBetAmount * 25;
                          console.log("🎯 Paire parfaite ! +", finalSt.sideBetAmount * 25, "€");
                        } else if (card1.s === "H" || card1.s === "D" || card2.s === "H" || card2.s === "D") {
                          // Paire de couleur (rouge) - 10:1
                          sideBetGains += finalSt.sideBetAmount * 10;
                          console.log("🎨 Paire de couleur ! +", finalSt.sideBetAmount * 10, "€");
                        } else {
                          // Paire mixte - 5:1
                          sideBetGains += finalSt.sideBetAmount * 5;
                          console.log("🃏 Paire mixte ! +", finalSt.sideBetAmount * 5, "€");
                        }
                      }
                      
                      // Pair Plus (vraie logique casino - toutes les combinaisons)
                      if (playerCards.length >= 3) {
                        const card3 = playerCards[2];
                        const ranks = [card1.r, card2.r, card3.r];
                        const suits = [card1.s, card2.s, card3.s];
                        
                        // Vérifier les combinaisons
                        if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
                          // Brelan - 3:1
                          sideBetGains += finalSt.sideBetAmount * 3;
                          console.log("🎲 Brelan ! +", finalSt.sideBetAmount * 3, "€");
                        } else if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
                          // Paire - 1:1
                          sideBetGains += finalSt.sideBetAmount * 1;
                          console.log("🃏 Paire ! +", finalSt.sideBetAmount * 1, "€");
                        }
                      }
                    }
                  }
                  
                  // CORRECTION : Rembourser la mise + ajouter le gain/perte + side bets
                  const totalGains = delta + sideBetGains;
                  console.log("Delta final:", delta, "€, Side bets:", sideBetGains, "€, Total:", totalGains, "€");
                  
                  // CORRECTION : La mise est déjà déduite du solde, donc on ajoute seulement le delta
                  // Si delta > 0 : gain (on récupère la mise + gain)
                  // Si delta < 0 : perte (on récupère rien, mise déjà perdue)
                  // Si delta = 0 : égalité (on récupère la mise)
                  const bank = Math.max(0, finalSt.bank + totalGains);
                  localStorage.setItem(LS_KEY, String(bank));
                  if (delta>0) { 
                    SFX.win(); 
                    set({ showWinAnimation: true, bank });
                    setTimeout(() => set({ showWinAnimation: false }), 2000);
                    set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else if (delta<0) { 
                    SFX.lose(); 
                    set({ bank });
                    // Animation supprimée
                    set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else {
                    // Égalité : rembourser la mise initiale
                    const bankWithRefund = finalSt.bank + finalSt.betAmount;
                    localStorage.setItem(LS_KEY, String(bankWithRefund));
                    set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank: bankWithRefund });
                    setTimeout(() => set({ message: undefined }), 3000);
                  }
                  set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                  if (finalSt.shoe.length < 20) { SFX.shuffle(); set({ shoe: shuffle(buildDeck(1)) }); }
                }
              }, 2000);
            }
          }, 1000);
        }
      },

      doubleDown: () => {
        const st = get();
        if (st.phase !== "player") return;
        const h = st.hands[st.active];
        if (st.bank < h.bet) return;
        
        // Sauvegarder la mise originale
        const originalBet = h.bet;
        
        // Doubler la mise
        h.bet *= 2; 
        h.doubled = true;
        
        // Retirer la mise supplémentaire de la banque
        const additionalBet = originalBet;
        const bank = st.bank - additionalBet;
        
        // Mettre à jour la banque
        localStorage.setItem(LS_KEY, String(bank));
        
        // Tirer une carte
        const shoe = st.shoe.slice();
        const newCard = shoe.shift()!;
        h.cards.push(newCard);
        
        // Mettre à jour le compteur de cartes
        st.cardCounter.updateCount(newCard);
        
        // Mettre à jour l'état
        const hands = st.hands.slice();
        hands[st.active] = h;
        
        // Message de confirmation
        set({ 
          hands, 
          shoe, 
          bank,
          message: `⚡ DOUBLE DOWN ! Mise doublée à ${h.bet}€` 
        });
        
        // Effacer le message après 3 secondes
        setTimeout(() => set({ message: undefined }), 3000);
        
        // Jouer le son et passer au croupier
        SFX.deal();
        get().stand();
      },

      split: () => {
        const st = get();
        if (st.phase !== "player") return;
        const h = st.hands[st.active];
        if (h.cards.length !== 2 || h.cards[0].r !== h.cards[1].r) return;
        if (st.bank < h.bet) return;
        const shoe = st.shoe.slice();
        const h1: Hand = { id: crypto.randomUUID(), cards: [h.cards[0], shoe.shift()!], bet: h.bet };
        const h2: Hand = { id: crypto.randomUUID(), cards: [h.cards[1], shoe.shift()!], bet: h.bet };
        const hands = st.hands.slice();
        hands.splice(st.active, 1, h1, h2);
        const bank = st.bank - h.bet;
        localStorage.setItem(LS_KEY, String(bank));
        SFX.deal();
        set({ hands, shoe, bank });
      },

      surrender: () => {
        const st = get(); 
        if (st.phase !== "player") return;
        const hands = st.hands.slice();
        hands[st.active].surrendered = true; 
        hands[st.active].done = true;
        set({ hands });
        get().stand();
      },

      insurance: () => {
        const st = get(); 
        if (st.phase !== "player") return;
        if (st.dealer[0]?.r !== "A") return;
        
        const hands = st.hands.slice();
        const h = hands[st.active];
        
        // Vérifier que la main n'est pas déjà assurée
        if (h.insured) return;
        
        // Coût de l'assurance = moitié de la mise
        const cost = Math.floor(h.bet / 2);
        
        // Vérifier que le joueur a assez d'argent
        if (st.bank < cost) return;
        
        // Activer l'assurance
        h.insured = true;
        const bank = st.bank - cost;
        
        // Sauvegarder et mettre à jour
        localStorage.setItem(LS_KEY, String(bank));
        set({ hands, bank });
        
        // Message de confirmation
        set({ message: `🛡️ Assurance prise pour ${cost}€` });
        setTimeout(() => set({ message: undefined }), 2000);
        
        // Passer automatiquement au croupier après l'assurance
        setTimeout(() => {
          const currentSt = get();
          if (currentSt.phase === "player" && currentSt.hands[currentSt.active]?.insured) {
            currentSt.stand();
          }
        }, 1000);
      },

      nextPhase: () => {
        const st = get();
        if (st.phase === "dealer") {
          // Le croupier joue automatiquement
          const { dealer, shoe } = dealerPlay(st.shoe.slice(), st.dealer.slice());
          set({ dealer, shoe, phase: "payout" });
          
          // Attendre un peu pour que le joueur voie les cartes du croupier
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "payout") {
              // Calculer le résultat automatiquement
              let delta = 0; console.log("=== DEBUG PAYOUT ===");
              currentSt.hands.forEach((h) => (delta += payoutOne(h, currentSt.dealer)));
              const dealerBJ = handScore(currentSt.dealer).isBJ;
              currentSt.hands.forEach((h) => {
                if (h.insured) {
                  if (dealerBJ) {
                    // Assurance paie 2:1 sur le coût (moitié de la mise)
                    const insuranceCost = Math.floor(h.bet / 2);
                    delta += insuranceCost * 2; // Gain = coût × 2
                  } else {
                    // Assurance perdue si pas de Blackjack
                    delta += 0; // Pas de gain, coût déjà déduit
                  }
                }
              });
              
              // CORRECTION : Rembourser la mise + ajouter le gain/perte
              const bank = Math.max(0, currentSt.bank + delta);
              localStorage.setItem(LS_KEY, String(bank));
              if (delta>0) { 
                SFX.win(); 
                set({ showWinAnimation: true, bank });
                setTimeout(() => set({ showWinAnimation: false }), 2000);
                set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else if (delta<0) { 
                SFX.lose(); 
                set({ bank });
                // Animation supprimée
                set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else {
                set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
                setTimeout(() => set({ message: undefined }), 3000);
              }
              set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
              if (currentSt.shoe.length < 20) { SFX.shuffle(); set({ shoe: shuffle(buildDeck(1)) }); }
            }
          }, 2000);
        } else if (st.phase === "payout") {
          let delta = 0; console.log("=== DEBUG PAYOUT ===");
          st.hands.forEach((h) => (delta += payoutOne(h, st.dealer)));
          const dealerBJ = handScore(st.dealer).isBJ;
          st.hands.forEach((h) => {
            if (h.insured) {
              if (dealerBJ) {
                // Assurance paie 2:1 sur le coût (moitié de la mise)
                const insuranceCost = Math.floor(h.bet / 2);
                delta += insuranceCost * 2; // Gain = coût × 2
              } else {
                // Assurance perdue si pas de Blackjack
                delta += 0; // Pas de gain, coût déjà déduit
              }
            }
          });
          
          // CORRECTION : Rembourser la mise + ajouter le gain/perte
          const bank = Math.max(0, st.bank + delta);
          localStorage.setItem(LS_KEY, String(bank));
          if (delta>0) { 
            SFX.win(); 
            set({ showWinAnimation: true, bank });
            setTimeout(() => set({ showWinAnimation: false }), 2000);
            set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
            setTimeout(() => set({ message: undefined }), 4000);
          } else if (delta<0) { 
            SFX.lose(); 
            set({ bank });
            // Animation supprimée
            set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
            setTimeout(() => set({ message: undefined }), 4000);
          } else {
            set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
            setTimeout(() => set({ message: undefined }), 3000);
          }
          set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
          if (st.shoe.length < 20) { SFX.shuffle(); set({ shoe: shuffle(buildDeck(1)) }); }
        }
      },

      // Side Bet actions
      setTableRules: (rules: TableRules) => set({ tableRules: rules }),
      

      
      setSideBetResults: (results: SideBetResult[]) => set({ sideBetResults: results }),
      
      clearSideBetResults: () => set({ sideBetResults: [] }),
    }),
    {
      name: "blackjack-game",
      partialize: (state) => ({
        bank: state.bank,
        tableRules: state.tableRules,
        // Ne pas persister les side bets actifs
      }),
    }
  )
);
