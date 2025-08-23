import { Card, Hand } from "./game";
import { SideBetRule, TableRules } from "../config/sidebet.rules";

// Types pour les résultats des side bets
export type SideBetResult = {
  betCode: string;
  betName: string;
  amount: number;
  payout: number;
  multiplier: number;
  combination: string;
  description: string;
};

export type SideBetEvaluation = {
  isWin: boolean;
  result?: SideBetResult;
  reason: string;
};

// Évaluation Perfect Pairs
export function evaluatePerfectPairs(
  playerCards: Card[], 
  rule: SideBetRule
): SideBetEvaluation {
  if (playerCards.length < 2) {
    return { isWin: false, reason: "Pas assez de cartes" };
  }

  const [card1, card2] = playerCards;
  
  // Vérifier si c'est une paire
  if (card1.r !== card2.r) {
    return { isWin: false, reason: "Pas de paire" };
  }

  // Perfect Pair (même rang et même suit)
  if (card1.s === card2.s) {
    const payout = rule.payouts.find(p => p.key === "perfect");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0, // Sera défini par l'appelant
          payout: 0, // Sera calculé par l'appelant
          multiplier: payout.multiplier,
          combination: `${card1.r}${card1.s} + ${card2.r}${card2.s}`,
          description: payout.description || ""
        },
        reason: "Perfect Pair !"
      };
    }
  }

  // Colored Pair (même rang, même couleur, suit différent)
  const isRed1 = card1.s === "♥" || card1.s === "♦";
  const isRed2 = card2.s === "♥" || card2.s === "♦";
  
  if (isRed1 === isRed2 && card1.s !== card2.s) {
    const payout = rule.payouts.find(p => p.key === "colored");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: `${card1.r}${card1.s} + ${card2.r}${card2.s}`,
          description: payout.description || ""
        },
        reason: "Colored Pair !"
      };
    }
  }

  // Mixed Pair (même rang, couleur différente)
  if (isRed1 !== isRed2) {
    const payout = rule.payouts.find(p => p.key === "mixed");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: `${card1.r}${card1.s} + ${card2.r}${card2.s}`,
          description: payout.description || ""
        },
        reason: "Mixed Pair !"
      };
    }
  }

  return { isWin: false, reason: "Pas de combinaison gagnante" };
}

// Évaluation 21+3
export function evaluateTwentyOnePlusThree(
  playerCards: Card[], 
  dealerUpCard: Card, 
  rule: SideBetRule
): SideBetEvaluation {
  if (playerCards.length < 2 || !dealerUpCard) {
    return { isWin: false, reason: "Pas assez de cartes" };
  }

  const allCards = [...playerCards, dealerUpCard];
  
  // Suited Trips (même rang et même suit)
  if (allCards.length >= 3) {
    const ranks = allCards.map(c => c.r);
    const suits = allCards.map(c => c.s);
    
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2] && 
        suits[0] === suits[1] && suits[1] === suits[2]) {
      const payout = rule.payouts.find(p => p.key === "suited_trips");
      if (payout) {
        return {
          isWin: true,
          result: {
            betCode: rule.code,
            betName: rule.name,
            amount: 0,
            payout: 0,
            multiplier: payout.multiplier,
            combination: `${ranks[0]}${suits[0]} + ${ranks[1]}${suits[1]} + ${ranks[2]}${suits[2]}`,
            description: payout.description || ""
          },
          reason: "Suited Trips !"
        };
      }
    }
  }

  // Straight Flush (suite de même couleur)
  if (isStraightFlush(allCards, rule)) {
    const payout = rule.payouts.find(p => p.key === "straight_flush");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: "Straight Flush",
          description: payout.description || ""
        },
        reason: "Straight Flush !"
      };
    }
  }

  // Trips (brelan)
  if (allCards.length >= 3) {
    const ranks = allCards.map(c => c.r);
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
      const payout = rule.payouts.find(p => p.key === "trips");
      if (payout) {
        return {
          isWin: true,
          result: {
            betCode: rule.code,
            betName: rule.name,
            amount: 0,
            payout: 0,
            multiplier: payout.multiplier,
            combination: "Brelan",
            description: payout.description || ""
          },
          reason: "Trips !"
        };
      }
    }
  }

  // Straight (suite)
  if (isStraight(allCards, rule)) {
    const payout = rule.payouts.find(p => p.key === "straight");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: "Suite",
          description: payout.description || ""
        },
        reason: "Straight !"
      };
    }
  }

  // Flush (même couleur)
  if (isFlush(allCards)) {
    const payout = rule.payouts.find(p => p.key === "flush");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: "Flush",
          description: payout.description || ""
        },
        reason: "Flush !"
      };
    }
  }

  return { isWin: false, reason: "Pas de combinaison gagnante" };
}

// Évaluation Lucky Ladies
export function evaluateLuckyLadies(
  playerCards: Card[], 
  dealerCards: Card[], 
  rule: SideBetRule
): SideBetEvaluation {
  if (playerCards.length < 2) {
    return { isWin: false, reason: "Pas assez de cartes" };
  }

  const [card1, card2] = playerCards;
  const total = getCardValue(card1) + getCardValue(card2);
  
  if (total !== 20) {
    return { isWin: false, reason: "Total différent de 20" };
  }

  // QQ of Hearts (Dames de cœur assorties)
  if (card1.r === "Q" && card2.r === "Q" && 
      card1.s === "♥" && card2.s === "♥") {
    const payout = rule.payouts.find(p => p.key === "qq_hearts");
    if (payout) {
      // Vérifier le bonus Dealer BJ si activé
      let multiplier = payout.multiplier;
      if (rule.details.dealerBJBonus && dealerCards.length >= 2) {
        const dealerScore = getHandScore(dealerCards);
        if (dealerScore === 21 && dealerCards.length === 2) {
          multiplier = 1000; // Bonus spécial
        }
      }
      
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier,
          combination: "Q♥ + Q♥",
          description: payout.description || ""
        },
        reason: "QQ of Hearts !"
      };
    }
  }

  // Matched 20 (même rang et même suit)
  if (card1.r === card2.r && card1.s === card2.s) {
    const payout = rule.payouts.find(p => p.key === "matched_20");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: `${card1.r}${card1.s} + ${card2.r}${card2.s}`,
          description: payout.description || ""
        },
        reason: "Matched 20 !"
      };
    }
  }

  // Suited 20 (même couleur)
  const isRed1 = card1.s === "♥" || card1.s === "♦";
  const isRed2 = card2.s === "♥" || card2.s === "♦";
  if (isRed1 === isRed2) {
    const payout = rule.payouts.find(p => p.key === "suited_20");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: "Même couleur = 20",
          description: payout.description || ""
        },
        reason: "Suited 20 !"
      };
    }
  }

  // Any 20
  const payout = rule.payouts.find(p => p.key === "any_20");
  if (payout) {
    return {
      isWin: true,
      result: {
        betCode: rule.code,
        betName: rule.name,
        amount: 0,
        payout: 0,
        multiplier: payout.multiplier,
        combination: "Total = 20",
        description: payout.description || ""
      },
      reason: "Any 20 !"
    };
  }

  return { isWin: false, reason: "Pas de combinaison gagnante" };
}

// Évaluation Bust It
export function evaluateBustIt(
  dealerCards: Card[], 
  rule: SideBetRule
): SideBetEvaluation {
  const total = getHandScore(dealerCards);
  
  if (total <= 21) {
    return { isWin: false, reason: "Croupier n'a pas bust" };
  }

  const cardCount = dealerCards.length;
  
  // Trouver le payout correspondant au nombre de cartes
  const payout = rule.payouts.find(p => {
    const match = p.key.match(/bust_(\d+)/);
    return match && parseInt(match[1]) === cardCount;
  });

  if (payout) {
    return {
      isWin: true,
      result: {
        betCode: rule.code,
        betName: rule.name,
        amount: 0,
        payout: 0,
        multiplier: payout.multiplier,
        combination: `Bust avec ${cardCount} cartes`,
        description: payout.description || ""
      },
      reason: `Bust en ${cardCount} cartes !`
    };
  }

  return { isWin: false, reason: "Payout non trouvé" };
}

// Évaluation Insurance
export function evaluateInsurance(
  dealerCards: Card[], 
  rule: SideBetRule
): SideBetEvaluation {
  if (dealerCards.length < 2) {
    return { isWin: false, reason: "Pas assez de cartes" };
  }

  const dealerScore = getHandScore(dealerCards);
  
  if (dealerScore === 21 && dealerCards.length === 2) {
    const payout = rule.payouts.find(p => p.key === "insurance");
    if (payout) {
      return {
        isWin: true,
        result: {
          betCode: rule.code,
          betName: rule.name,
          amount: 0,
          payout: 0,
          multiplier: payout.multiplier,
          combination: "Dealer Blackjack",
          description: payout.description || ""
        },
        reason: "Insurance gagnée !"
      };
    }
  }

  return { isWin: false, reason: "Dealer n'a pas de Blackjack" };
}

// Fonctions utilitaires
function getCardValue(card: Card): number {
  if (card.r === "A") return 11;
  if (["T", "J", "Q", "K"].includes(card.r)) return 10;
  return parseInt(card.r);
}

function getHandScore(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.r === "A") {
      aces++;
      total += 11;
    } else if (["T", "J", "Q", "K"].includes(card.r)) {
      total += 10;
    } else {
      total += parseInt(card.r);
    }
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
}

function isFlush(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const suits = cards.map(c => c.s);
  return suits.every(s => s === suits[0]);
}

function isStraight(cards: Card[], rule: SideBetRule): boolean {
  if (cards.length < 3) return false;
  
  const values = cards.map(c => {
    if (c.r === "A") return 1; // A = 1 pour les suites
    if (["T", "J", "Q", "K"].includes(c.r)) return 10;
    return parseInt(c.r);
  }).sort((a, b) => a - b);
  
  // Vérifier si c'est une suite consécutive
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i-1] + 1) return false;
  }
  
  return true;
}

function isStraightFlush(cards: Card[], rule: SideBetRule): boolean {
  return isFlush(cards) && isStraight(cards, rule);
}

// Fonction principale d'évaluation des side bets
export function evaluateSideBet(
  betCode: string,
  playerCards: Card[],
  dealerCards: Card[],
  rule: SideBetRule
): SideBetEvaluation {
  switch (betCode) {
    case "PERFECT_PAIRS":
      return evaluatePerfectPairs(playerCards, rule);
    case "TWENTY_ONE_PLUS_THREE":
      return dealerCards.length > 0 ? 
        evaluateTwentyOnePlusThree(playerCards, dealerCards[0], rule) :
        { isWin: false, reason: "Carte du croupier non disponible" };
    case "LUCKY_LADIES":
      return evaluateLuckyLadies(playerCards, dealerCards, rule);
    case "BUST_IT":
      return evaluateBustIt(dealerCards, rule);
    case "INSURANCE":
      return evaluateInsurance(dealerCards, rule);
    default:
      return { isWin: false, reason: "Type de side bet non reconnu" };
  }
}
