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
  lastBetAmount: number;
  sideBetAmount: number;
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
  
  // Fonctions de vérification des actions disponibles
  canDoubleDown: () => boolean;
  canSplit: () => boolean;
  canSurrender: () => boolean;
  canInsurance: () => boolean;
  isInsuranceMandatory: () => boolean;
}

const LS_KEY = "bj_bank_v1";
const TABLE_MIN = 1;
const TABLE_MAX = 999999;

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
      lastBetAmount: 0,
      sideBetAmount: 0,
      message: undefined,
      showWinAnimation: false,
      showTieAnimation: false,
      cardCounter: new CardCounter(),
      
      // Side Bets - initialisation
      tableRules: CLASSIC_TABLE,
      sideBetResults: [],

      // === FONCTIONS DE VÉRIFICATION DES ACTIONS ===
      canDoubleDown: () => {
        const st = get();
        if (st.phase !== "player" || !st.hands[st.active]) return false;
        const hand = st.hands[st.active];
        return hand.cards.length === 2 && !hand.doubled && st.bank >= hand.bet;
      },

      canSplit: () => {
        const st = get();
        if (st.phase !== "player" || !st.hands[st.active]) return false;
        const hand = st.hands[st.active];
        return hand.cards.length === 2 && 
               hand.cards[0].r === hand.cards[1].r && 
               st.bank >= hand.bet;
      },

      canSurrender: () => {
        const st = get();
        if (st.phase !== "player" || !st.hands[st.active]) return false;
        const hand = st.hands[st.active];
        return hand.cards.length === 2 && !hand.surrendered;
      },

      canInsurance: () => {
        const st = get();
        if (st.phase !== "player" || !st.hands[st.active]) return false;
        const hand = st.hands[st.active];
        return st.dealer[0]?.r === "A" && !hand.insured;
      },

      isInsuranceMandatory: () => {
        const st = get();
        return st.cardCounter.getTrueCount() > 3; // Assurance obligatoire si count > 3
      },

      // === ACTIONS DE BASE ===
      addBank: (amt) => set((st) => {
        const bank = st.bank + amt;
        localStorage.setItem(LS_KEY, String(bank));
        return { bank };
      }),

      resetBank: () => {
        localStorage.setItem(LS_KEY, String(START_BANK));
        set({ bank: START_BANK });
      },

      addChip: (amt) => set((st) => {
        SFX.chip();
        const next = Math.min(Math.max(st.betAmount + amt, TABLE_MIN), TABLE_MAX);
        // Permettre de miser exactement la banque (ALL IN)
        if (next > st.bank) return st;
        const bank = st.bank - amt;
        localStorage.setItem(LS_KEY, String(bank));
        return { betAmount: next, bank };
      }),

      tapis: () => {
        const st = get();
        SFX.chip();
        const betAmount = st.bank;
        const bank = 0;
        localStorage.setItem(LS_KEY, String(bank));
        set({ betAmount, bank });
        
        // Lancer automatiquement le jeu
        setTimeout(() => {
          const currentSt = get();
          if (currentSt.phase === "betting" && currentSt.betAmount > 0) {
            currentSt.deal();
          }
        }, 500);
      },

      clearBet: () => set((st) => {
        if (st.betAmount > 0) {
          const bank = st.bank + st.betAmount;
          localStorage.setItem(LS_KEY, String(bank));
          return { betAmount: 0, bank };
        }
        return st;
      }),

      clearSideBet: () => set((st) => {
        if (st.sideBetAmount > 0) {
          const bank = st.bank + st.sideBetAmount;
          localStorage.setItem(LS_KEY, String(bank));
          return { sideBetAmount: 0, bank };
        }
        return st;
      }),

      rejouerMise: () => {
        const st = get();
        if (st.betAmount > 0) return; // Déjà une mise en cours
        
        if (st.lastBetAmount > 0 && st.bank >= st.lastBetAmount) {
          SFX.chip();
          const betAmount = st.lastBetAmount;
          const bank = st.bank - st.lastBetAmount;
          localStorage.setItem(LS_KEY, String(bank));
          set({ betAmount, bank });
        }
      },

      // === FONCTION DEAL CORRIGÉE ===
      deal: () => {
        const st = get();
        if (st.phase !== "betting" || st.betAmount <= 0) return;
        
        // Reshuffle si nécessaire
        if (st.shoe.length < 20) {
          console.log("🔄 Reshuffle automatique");
          const newShoe = shuffle(buildDeck(1));
          st.cardCounter.reset();
          set({ shoe: newShoe });
          return;
        }
        
        const shoe = st.shoe.slice();
        const playerCard1 = shoe.shift()!;
        const playerCard2 = shoe.shift()!;
        const dealerCard1 = shoe.shift()!;
        const dealerCard2 = shoe.shift()!;
        
        console.log("🎯 DISTRIBUTION DES CARTES:");
        console.log(`👤 Joueur: ${playerCard1.r}${playerCard1.s} + ${playerCard2.r}${playerCard2.s}`);
        console.log(`🎰 Croupier: ${dealerCard1.r}${dealerCard1.s} + ${dealerCard2.r}${dealerCard2.s}`);
        
        // Mettre à jour le compteur
        st.cardCounter.updateCount(playerCard1);
        st.cardCounter.updateCount(playerCard2);
        st.cardCounter.updateCount(dealerCard1);
        st.cardCounter.updateCount(dealerCard2);
        
        const player: Hand = { 
          id: crypto.randomUUID(), 
          cards: [playerCard1, playerCard2], 
          bet: st.betAmount 
        };
        const dealer: Card[] = [dealerCard1, dealerCard2];
        
        // Sauvegarder la mise
        set({ lastBetAmount: st.betAmount });
        
        SFX.deal();
        
        // Vérifier Blackjack
        const playerScore = handScore([playerCard1, playerCard2]);
        if (playerScore.isBJ) {
          // Blackjack - passer au croupier
          set({ phase: "dealer", hands: [player], active: 0, dealer, shoe });
          
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "dealer") {
              const { dealer: finalDealer, shoe: finalShoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
              set({ dealer: finalDealer, shoe: finalShoe, phase: "payout" });
              
              // Calculer le résultat
              setTimeout(() => {
                const finalSt = get();
                if (finalSt.phase === "payout") {
                  let delta = 0;
                  finalSt.hands.forEach((h) => { 
                    const payout = payoutOne(h, finalSt.dealer); 
                    delta += payout; 
                  });
                  
                  // Side bets
                  let sideBetGains = 0;
                  if (finalSt.sideBetAmount > 0) {
                    const results = SideBetEvaluator.evaluateSideBets(
                      finalSt.sideBetAmount,
                      finalSt.tableRules,
                      finalSt.hands[0]?.cards || [],
                      finalSt.dealer,
                      finalSt.phase
                    );
                    sideBetGains = results.reduce((total, result) => total + result.payout, 0);
                  }
                  
                  const totalGains = delta + sideBetGains;
                  let bank = finalSt.bank;
                  
                  // Gérer l'égalité
                  if (delta > 0 && delta === finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    console.log("🤝 Égalité");
                  }
                  
                  bank += totalGains;
                  bank = Math.max(0, bank);
                  localStorage.setItem(LS_KEY, String(bank));
                  
                  // Messages et animations
                  if (delta > 0 && delta !== finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    SFX.win();
                    set({ showWinAnimation: true, bank });
                    setTimeout(() => set({ showWinAnimation: false }), 2000);
                    
                    const isBlackjack = finalSt.hands.some(h => handScore(h.cards).isBJ);
                    set({ message: isBlackjack ? `🎉 BLACKJACK ✨ ! Gain net : +${delta}€ !` : `🎉 Victoire ! Gain net : +${delta}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else if (delta === 0) {
                    SFX.lose();
                    set({ bank, message: `💔 Perte ! Votre mise est perdue !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else {
                    // CORRECTION : Vérifier si c'est vraiment une égalité en comparant les scores
                    const playerScore = handScore(finalSt.hands[0]?.cards || []);
                    const dealerScore = handScore(finalSt.dealer);
                    const isRealTie = playerScore.total === dealerScore.total && !playerScore.isBust && !dealerScore.isBust;
                    
                    if (isRealTie) {
                      set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
                      setTimeout(() => set({ message: undefined }), 3000);
                    } else {
                      // Ce n'est pas une égalité, c'est une victoire
                      SFX.win();
                      set({ showWinAnimation: true, bank });
                      setTimeout(() => set({ showWinAnimation: false }), 2000);
                      set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                      setTimeout(() => set({ message: undefined }), 4000);
                    }
                  }
                  
                  set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                  if (finalSt.shoe.length < 20) { 
                    SFX.shuffle(); 
                    set({ shoe: shuffle(buildDeck(1)) }); 
                  }
                }
              }, 2000);
            }
          }, 1000);
        } else {
          // Phase normale
          set({ phase: "player", hands: [player], active: 0, dealer, shoe });
        }
      },

      // === FONCTIONS DE JEU CORRIGÉES ===
      hit: () => {
        const st = get();
        if (st.phase !== "player") return;
        
        const shoe = st.shoe.slice();
        const hands = st.hands.slice();
        const newCard = shoe.shift()!;
        
        st.cardCounter.updateCount(newCard);
        hands[st.active].cards.push(newCard);
        
        SFX.deal();
        set({ hands, shoe });
        
        // Vérifier le score
        const score = handScore(hands[st.active].cards);
        if (score.isBust && (!score.softTotal || score.softTotal > 21)) {
          // Vraiment bust
          SFX.bust();
          hands[st.active].done = true;
          set({ hands });
          
          // Passer à la main suivante ou au croupier
          const next = hands.findIndex((h, i) => !h.done && i > st.active);
          if (next !== -1) {
            set({ active: next });
          } else {
            // Le croupier joue
            set({ phase: "dealer" });
            setTimeout(() => {
              const currentSt = get();
              if (currentSt.phase === "dealer") {
                const { dealer, shoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
                set({ dealer, shoe, phase: "payout" });
                
                // Calculer le résultat
                setTimeout(() => {
                  const finalSt = get();
                  if (finalSt.phase === "payout") {
                    let delta = 0;
                    finalSt.hands.forEach((h) => { 
                      const payout = payoutOne(h, finalSt.dealer); 
                      delta += payout; 
                    });
                    
                    // Side bets
                    let sideBetGains = 0;
                    if (finalSt.sideBetAmount > 0) {
                      const results = SideBetEvaluator.evaluateSideBets(
                        finalSt.sideBetAmount,
                        finalSt.tableRules,
                        finalSt.hands[0]?.cards || [],
                        finalSt.dealer,
                        finalSt.phase
                      );
                      sideBetGains = results.reduce((total, result) => total + result.payout, 0);
                    }
                    
                    const totalGains = delta + sideBetGains;
                    let bank = finalSt.bank;
                    
                    if (delta > 0 && delta === finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                      console.log("🤝 Égalité");
                    }
                    
                    bank += totalGains;
                    bank = Math.max(0, bank);
                    localStorage.setItem(LS_KEY, String(bank));
                    
                    if (delta > 0 && delta !== finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                      SFX.win();
                      set({ showWinAnimation: true, bank });
                      setTimeout(() => set({ showWinAnimation: false }), 2000);
                      set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                      setTimeout(() => set({ message: undefined }), 4000);
                    } else if (delta === 0) {
                      SFX.lose();
                      set({ bank, message: `💔 Perte ! Votre mise est perdue !` });
                      setTimeout(() => set({ message: undefined }), 4000);
                    } else {
                      // CORRECTION : Vérifier si c'est vraiment une égalité en comparant les scores
                      const playerScore = handScore(finalSt.hands[0]?.cards || []);
                      const dealerScore = handScore(finalSt.dealer);
                      const isRealTie = playerScore.total === dealerScore.total && !playerScore.isBust && !dealerScore.isBust;
                      
                      if (isRealTie) {
                        set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
                        setTimeout(() => set({ message: undefined }), 3000);
                      } else {
                        // Ce n'est pas une égalité, c'est une victoire
                        SFX.win();
                        set({ showWinAnimation: true, bank });
                        setTimeout(() => set({ showWinAnimation: false }), 2000);
                        set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                        setTimeout(() => set({ message: undefined }), 4000);
                      }
                    }
                    
                    set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                    if (finalSt.shoe.length < 20) { 
                      SFX.shuffle(); 
                      set({ shoe: shuffle(buildDeck(1)) }); 
                    }
                  }
                }, 2000);
              }
            }, 1000);
          }
        }
      },

      stand: () => {
        const st = get();
        if (st.phase !== "player") return;
        
        const hands = st.hands.slice();
        const currentHand = hands[st.active];
        const score = handScore(currentHand.cards);
        
        // Gérer les mains soft
        if (score.isBust && score.softTotal && score.softTotal <= 21) {
          console.log(`🎯 Main soft convertie : ${score.total} → ${score.softTotal}`);
          return;
        }
        
        hands[st.active].done = true;
        const next = hands.findIndex((h, i) => !h.done && i > st.active);
        
        if (next !== -1) {
          set({ hands, active: next });
        } else {
          // Le croupier joue
          set({ hands, phase: "dealer" });
          
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "dealer") {
              const { dealer, shoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
              set({ dealer, shoe, phase: "payout" });
              
              // Calculer le résultat
              setTimeout(() => {
                const finalSt = get();
                if (finalSt.phase === "payout") {
                  let delta = 0;
                  finalSt.hands.forEach((h) => { 
                    const payout = payoutOne(h, finalSt.dealer); 
                    delta += payout; 
                  });
                  
                  // Side bets
                  let sideBetGains = 0;
                  if (finalSt.sideBetAmount > 0) {
                    const results = SideBetEvaluator.evaluateSideBets(
                      finalSt.sideBetAmount,
                      finalSt.tableRules,
                      finalSt.hands[0]?.cards || [],
                      finalSt.dealer,
                      finalSt.phase
                    );
                    sideBetGains = results.reduce((total, result) => total + result.payout, 0);
                  }
                  
                  const totalGains = delta + sideBetGains;
                  let bank = finalSt.bank;
                  
                  if (delta > 0 && delta === finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    console.log("🤝 Égalité");
                  }
                  
                  bank += totalGains;
                  bank = Math.max(0, bank);
                  localStorage.setItem(LS_KEY, String(bank));
                  
                  if (delta > 0 && delta !== finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    SFX.win();
                    set({ showWinAnimation: true, bank });
                    setTimeout(() => set({ showWinAnimation: false }), 2000);
                    set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else if (delta === 0) {
                    SFX.lose();
                    set({ bank, message: `💔 Perte ! Votre mise est perdue !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else {
                    set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
                    setTimeout(() => set({ message: undefined }), 3000);
                  }
                  
                  set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                  if (finalSt.shoe.length < 20) { 
                    SFX.shuffle(); 
                    set({ shoe: shuffle(buildDeck(1)) }); 
                  }
                }
              }, 2000);
            }
          }, 1000);
        }
      },

      doubleDown: () => {
        const st = get();
        if (st.phase !== "player" || !st.canDoubleDown()) return;
        
        const h = st.hands[st.active];
        if (st.bank < h.bet) return;
        
        const originalBet = h.bet;
        h.bet *= 2;
        h.doubled = true;
        
        const additionalBet = originalBet;
        const bank = st.bank - additionalBet;
        localStorage.setItem(LS_KEY, String(bank));
        
        const shoe = st.shoe.slice();
        const newCard = shoe.shift()!;
        h.cards.push(newCard);
        st.cardCounter.updateCount(newCard);
        
        const hands = st.hands.slice();
        hands[st.active] = h;
        
        set({ hands, shoe, bank, message: `⚡ DOUBLE DOWN ! Mise doublée à ${h.bet}€` });
        setTimeout(() => set({ message: undefined }), 3000);
        
        SFX.deal();
        get().stand();
      },

      split: () => {
        const st = get();
        if (st.phase !== "player" || !st.canSplit()) return;
        
        const h = st.hands[st.active];
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
        if (st.phase !== "player" || !st.canSurrender()) return;
        
        const hands = st.hands.slice();
        hands[st.active].surrendered = true;
        hands[st.active].done = true;
        
        const next = hands.findIndex((h, i) => !h.done && i > st.active);
        if (next !== -1) {
          set({ hands, active: next });
        } else {
          // Le croupier joue
          set({ hands, phase: "dealer" });
          
          setTimeout(() => {
            const currentSt = get();
            if (currentSt.phase === "dealer") {
              const { dealer, shoe } = dealerPlay(currentSt.shoe.slice(), currentSt.dealer.slice());
              set({ dealer, shoe, phase: "payout" });
              
              // Calculer le résultat
              setTimeout(() => {
                const finalSt = get();
                if (finalSt.phase === "payout") {
                  let delta = 0;
                  finalSt.hands.forEach((h) => { 
                    const payout = payoutOne(h, finalSt.dealer); 
                    delta += payout; 
                  });
                  
                  // Side bets
                  let sideBetGains = 0;
                  if (finalSt.sideBetAmount > 0) {
                    const results = SideBetEvaluator.evaluateSideBets(
                      finalSt.sideBetAmount,
                      finalSt.tableRules,
                      finalSt.hands[0]?.cards || [],
                      finalSt.dealer,
                      finalSt.phase
                    );
                    sideBetGains = results.reduce((total, result) => total + result.payout, 0);
                  }
                  
                  const totalGains = delta + sideBetGains;
                  let bank = finalSt.bank;
                  
                  if (delta > 0 && delta === finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    console.log("🤝 Égalité");
                  }
                  
                  bank += totalGains;
                  bank = Math.max(0, bank);
                  localStorage.setItem(LS_KEY, String(bank));
                  
                  if (delta > 0 && delta !== finalSt.hands.reduce((sum, h) => sum + h.bet, 0)) {
                    SFX.win();
                    set({ showWinAnimation: true, bank });
                    setTimeout(() => set({ showWinAnimation: false }), 2000);
                    set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else if (delta === 0) {
                    SFX.lose();
                    set({ bank, message: `💔 Perte ! Votre mise est perdue !` });
                    setTimeout(() => set({ message: undefined }), 4000);
                  } else {
                    // CORRECTION : Vérifier si c'est vraiment une égalité en comparant les scores
                    const playerScore = handScore(finalSt.hands[0]?.cards || []);
                    const dealerScore = handScore(finalSt.dealer);
                    const isRealTie = playerScore.total === dealerScore.total && !playerScore.isBust && !dealerScore.isBust;
                    
                    if (isRealTie) {
                      set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
                      setTimeout(() => set({ message: undefined }), 3000);
                    } else {
                      // Ce n'est pas une égalité, c'est une victoire
                      SFX.win();
                      set({ showWinAnimation: true, bank });
                      setTimeout(() => set({ showWinAnimation: false }), 2000);
                      set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                      setTimeout(() => set({ message: undefined }), 4000);
                    }
                  }
                  
                  set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
                  if (finalSt.shoe.length < 20) { 
                    SFX.shuffle(); 
                    set({ shoe: shuffle(buildDeck(1)) }); 
                  }
                }
              }, 2000);
            }
          }, 1000);
        }
      },

      insurance: () => {
        const st = get();
        if (st.phase !== "player" || !st.canInsurance()) return;
        
        const hands = st.hands.slice();
        hands[st.active].insured = true;
        
        const insuranceCost = Math.floor(hands[st.active].bet / 2);
        const bank = st.bank - insuranceCost;
        localStorage.setItem(LS_KEY, String(bank));
        
        set({ hands, bank, message: `🛡️ Assurance placée : ${insuranceCost}€` });
        setTimeout(() => set({ message: undefined }), 3000);
      },

      nextPhase: () => {
        const st = get();
        if (st.phase === "payout") {
          set({ phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
        }
      },

      // === SIDE BETS ===
      setTableRules: (rules: TableRules) => set({ tableRules: rules }),
      
      addSideBetAmount: (amount: number) => set((st) => {
        SFX.chip();
        const next = st.sideBetAmount + amount;
        if (next > st.bank) return st;
        const bank = st.bank - amount;
        localStorage.setItem(LS_KEY, String(bank));
        return { sideBetAmount: next, bank };
      }),
      
      setSideBetAmount: (amount: number) => set((st) => {
        SFX.chip();
        const difference = amount - st.sideBetAmount;
        if (difference > st.bank) return st;
        
        const bank = st.bank - difference;
        localStorage.setItem(LS_KEY, String(bank));
        return { sideBetAmount: amount, bank };
      }),
      
      setSideBetResults: (results: SideBetResult[]) => set({ sideBetResults: results }),
      
      clearSideBetResults: () => set({ sideBetResults: [] }),
    }),
    {
      name: LS_KEY,
      partialize: (state) => ({ bank: state.bank }),
    }
  )
);
