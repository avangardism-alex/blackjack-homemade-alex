// Types pour la stratégie
export interface Card {
  r: string;
  s: string;
}

export interface Hand {
  cards: Card[];
  bet: number;
  doubled?: boolean;
}

export type Action = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

// Fonction pour calculer le score d'une main
export function calculateHandScore(cards: Card[]): { total: number; isSoft: boolean; isPair: boolean } {
  let total = 0;
  let aces = 0;
  
  // Compter les cartes
  for (const card of cards) {
    if (card.r === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', 'T'].includes(card.r)) {
      total += 10;
    } else {
      total += parseInt(card.r);
    }
  }
  
  // Ajuster les As
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  const isSoft = aces > 0 && total <= 21;
  const isPair = cards.length === 2 && cards[0].r === cards[1].r;
  
  return { total, isSoft, isPair };
}

// Fonction pour obtenir la valeur numérique d'une carte
function getCardValue(card: Card): number {
  if (card.r === 'A') return 11;
  if (['K', 'Q', 'J', 'T'].includes(card.r)) return 10;
  return parseInt(card.r);
}

// Fonction principale de stratégie
export function getOptimalAction(
  playerHand: Hand,
  dealerUpCard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): Action {
  const { total, isSoft, isPair } = calculateHandScore(playerHand.cards);
  const dealerValue = getCardValue(dealerUpCard);
  
  // 1. GESTION DES PAIRS
  if (isPair && canSplit) {
    const pairRank = playerHand.cards[0].r;
    
    // Pairs spéciales
    if (pairRank === 'A' || pairRank === '8') return 'split';
    if (pairRank === '10') return 'stand';
    if (pairRank === '5') return 'double';
    
    // Autres pairs selon la carte du croupier
    if (pairRank === '9') {
      if (dealerValue === 7 || dealerValue === 10 || dealerValue === 11) return 'stand';
      return 'split';
    }
    if (pairRank === '7') {
      if (dealerValue >= 2 && dealerValue <= 7) return 'split';
      return 'hit';
    }
    if (pairRank === '6') {
      if (dealerValue >= 2 && dealerValue <= 6) return 'split';
      return 'hit';
    }
    if (pairRank === '4') {
      if (dealerValue === 5 || dealerValue === 6) return 'split';
      return 'hit';
    }
    if (pairRank === '3' || pairRank === '2') {
      if (dealerValue >= 4 && dealerValue <= 7) return 'split';
      return 'hit';
    }
  }
  
  // 2. GESTION DES SOFT TOTALS (avec As)
  if (isSoft) {
    if (total >= 20) return 'stand';
    if (total === 19) {
      if (dealerValue === 6) return 'double';
      return 'stand';
    }
    if (total === 18) {
      if (dealerValue >= 3 && dealerValue <= 6) return 'double';
      if (dealerValue >= 9 && dealerValue <= 11) return 'hit';
      return 'stand';
    }
    if (total === 17) {
      if (dealerValue >= 3 && dealerValue <= 6) return 'double';
      return 'hit';
    }
    if (total <= 16) {
      if (dealerValue >= 4 && dealerValue <= 6) return 'double';
      return 'hit';
    }
  }
  
  // 3. GESTION DES HARD TOTALS
  if (total >= 17) return 'stand';
  
  if (total === 16) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    if (canSurrender && (dealerValue === 9 || dealerValue === 10 || dealerValue === 11)) return 'surrender';
    return 'hit';
  }
  
  if (total === 15) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    if (canSurrender && dealerValue === 10) return 'surrender';
    return 'hit';
  }
  
  if (total === 14 || total === 13) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  
  if (total === 12) {
    if (dealerValue >= 4 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  
  if (total === 11) return 'double';
  
  if (total === 10) {
    if (dealerValue >= 2 && dealerValue <= 9) return 'double';
    return 'hit';
  }
  
  if (total === 9) {
    if (dealerValue >= 3 && dealerValue <= 6) return 'double';
    return 'hit';
  }
  
  // 8 et moins : toujours tirer
  return 'hit';
}

// Fonction pour obtenir le message d'explication
export function getStrategyExplanation(
  playerHand: Hand,
  dealerUpCard: Card,
  action: Action
): string {
  const { total, isSoft, isPair } = calculateHandScore(playerHand.cards);
  const dealerValue = getCardValue(dealerUpCard);
  
  let explanation = `🎯 Main: ${total}${isSoft ? ' (soft)' : ''}${isPair ? ' (paire)' : ''} vs Croupier: ${dealerUpCard.r}`;
  
  switch (action) {
    case 'hit':
      explanation += ` → Tirer (T)`;
      break;
    case 'stand':
      explanation += ` → Rester (R)`;
      break;
    case 'double':
      explanation += ` → Doubler (D)`;
      break;
    case 'split':
      explanation += ` → Diviser (P)`;
      break;
    case 'surrender':
      explanation += ` → Abandonner (A)`;
      break;
  }
  
  return explanation;
}
