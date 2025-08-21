import { create } from "zustand";
import { buildDeck, shuffle, type Card, type Hand, dealerPlay, payoutOne, handScore } from "../logic/game";
import { CardCounter } from "../logic/cardCounter";
import { START_BANK } from "../config";
import { SFX } from "../sfx";

type State = {
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
  showLoseAnimation: boolean;
  showTieAnimation: boolean;
  cardCounter: CardCounter;
};

type Actions = {
  addBank: (amt:number)=>void;
  resetBank: ()=>void;
  addChip: (amt: number) => void;
  addSideBet: (amt: number) => void; // Ajouter aux side bets
  tapis: () => void;
  clearBet: () => void;
  clearSideBet: () => void; // Effacer les side bets
  rejouerMise: () => void; // Rejouer la dernière mise
  deal: () => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  split: () => void;
  surrender: () => void;
  insurance: () => void;
  nextPhase: () => void;
};

const LS_KEY = "bj_bank_v1";
const TABLE_MIN = 1;
const TABLE_MAX = 999999; // Pas de limite pratique

export const useGame = create<State & Actions>((set, get) => ({
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
  showLoseAnimation: false,
  showTieAnimation: false,
  cardCounter: new CardCounter(),

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
  clearSideBet: () => set({ sideBetAmount: 0 }),
  
  // Ajouter aux side bets
  addSideBet: (amt) => set((st) => {
    SFX.chip();
    const next = Math.min(Math.max(st.sideBetAmount + amt, TABLE_MIN), TABLE_MAX);
    if (next > st.bank) return st;
    const bank = st.bank - amt;
    localStorage.setItem(LS_KEY, String(bank));
    return { sideBetAmount: next, bank };
  }),
  
  // Rejouer la dernière mise
  rejouerMise: () => {
    const st = get();
    console.log("=== DEBUG REJOUER ===");
    console.log("lastBetAmount:", st.lastBetAmount);
    console.log("bank:", st.bank);
    console.log("Condition:", st.lastBetAmount > 0 && st.bank >= st.lastBetAmount);
    
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
                  
                  // Pair Plus (si on a 3 cartes)
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
              const bank = Math.max(0, finalSt.bank + totalGains + finalSt.betAmount);
              localStorage.setItem(LS_KEY, String(bank));
              if (delta>0) { 
                SFX.win(); 
                set({ showWinAnimation: true, bank });
                setTimeout(() => set({ showWinAnimation: false }), 2000);
                set({ message: `🎉 BLACKJACK ! Gain net : +${delta}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else if (delta<0) { 
                SFX.lose(); 
                set({ showLoseAnimation: true, bank });
                setTimeout(() => set({ showLoseAnimation: false }), 2000);
                set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else {
                set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
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
    const sc = handScore(hands[st.active].cards);
    if (sc.isBust) { 
      SFX.bust(); 
      get().stand(); 
    }
  },

  stand: () => {
    const st = get();
    if (st.phase !== "player") return;
    const hands = st.hands.slice();
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
                  
                  // Pair Plus (si on a 3 cartes)
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
              const bank = Math.max(0, finalSt.bank + totalGains + finalSt.betAmount);
              localStorage.setItem(LS_KEY, String(bank));
              if (delta>0) { 
                SFX.win(); 
                set({ showWinAnimation: true, bank });
                setTimeout(() => set({ showWinAnimation: false }), 2000);
                set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else if (delta<0) { 
                SFX.lose(); 
                set({ showLoseAnimation: true, bank });
                setTimeout(() => set({ showLoseAnimation: false }), 2000);
                set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
                setTimeout(() => set({ message: undefined }), 4000);
              } else {
                set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
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
    h.bet *= 2; h.doubled = true;
    const shoe = st.shoe.slice();
    h.cards.push(shoe.shift()!);
    const bank = st.bank - h.bet / 2;
    localStorage.setItem(LS_KEY, String(bank));
    const hands = st.hands.slice();
    hands[st.active] = h;
    SFX.deal();
    set({ hands, shoe, bank });
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
          const bank = Math.max(0, currentSt.bank + delta + currentSt.betAmount);
          localStorage.setItem(LS_KEY, String(bank));
          if (delta>0) { 
            SFX.win(); 
            set({ showWinAnimation: true, bank });
            setTimeout(() => set({ showWinAnimation: false }), 2000);
            set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
            setTimeout(() => set({ message: undefined }), 4000);
          } else if (delta<0) { 
            SFX.lose(); 
            set({ showLoseAnimation: true, bank });
            setTimeout(() => set({ showLoseAnimation: false }), 2000);
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
      const bank = Math.max(0, st.bank + delta + st.betAmount);
      localStorage.setItem(LS_KEY, String(bank));
      if (delta>0) { 
        SFX.win(); 
        set({ showWinAnimation: true, bank });
        setTimeout(() => set({ showWinAnimation: false }), 2000);
        set({ message: `🎉 Victoire ! Gain net : +${delta}€ !` });
        setTimeout(() => set({ message: undefined }), 4000);
      } else if (delta<0) { 
        SFX.lose(); 
        set({ showLoseAnimation: true, bank });
        setTimeout(() => set({ showLoseAnimation: false }), 2000);
        set({ message: `💔 T'es nul PD ! Perte nette : ${Math.abs(delta)}€ !` });
        setTimeout(() => set({ message: undefined }), 4000);
      } else {
        set({ message: "🤝 Égalité ! Votre mise vous est remboursée !", bank });
        setTimeout(() => set({ message: undefined }), 3000);
      }
      set({ bank, phase: "betting", hands: [], dealer: [], betAmount: 0, active: 0 });
      if (st.shoe.length < 20) { SFX.shuffle(); set({ shoe: shuffle(buildDeck(1)) }); }
    }
  },
}));
