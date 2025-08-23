export type Card = { r: string; s: "S" | "H" | "D" | "C" };
export type Hand = {
  id: string;
  cards: Card[];
  bet: number;
  done?: boolean;
  doubled?: boolean;
  surrendered?: boolean;
  insured?: boolean;
  payout?: number;
};
export type Phase = "betting" | "dealing" | "player" | "dealer" | "payout";

export function buildDeck(decks = 1): Card[] {
  const ranks = ["A","2","3","4","5","6","7","8","9","T","J","Q","K"];
  const suits: Card["s"][] = ["S","H","D","C"];
  const d: Card[] = [];
  for (let k = 0; k < decks; k++) for (const s of suits) for (const r of ranks) d.push({ r, s });
  return d;
}

export function shuffle(deck: Card[]): Card[] {
  const a = deck.slice();
  console.log("🎲 MÉLANGE EN COURS - Vérification de l'équité...");
  
  // Vérifier la source de randomisation
  const hasCrypto = !!globalThis.crypto?.getRandomValues;
  console.log(`🔐 Source de randomisation: ${hasCrypto ? 'CRYPTO (sécurisé)' : 'Math.random (fallback)'}`);
  
  // Compter les cartes avant mélange
  const cardCounts = {};
  a.forEach(card => {
    const key = `${card.r}${card.s}`;
    cardCounts[key] = (cardCounts[key] || 0) + 1;
  });
  console.log("📊 Cartes avant mélange:", cardCounts);
  
  // Mélanger avec Fisher-Yates
  for (let i = a.length - 1; i > 0; i--) {
    let u;
    if (hasCrypto) {
      // Utiliser crypto.getRandomValues pour une vraie randomisation cryptographique
      u = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);
    } else {
      // Fallback vers Math.random (moins sécurisé mais fonctionnel)
      u = Math.random();
    }
    
    const j = Math.floor(u * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  
  // Vérifier que toutes les cartes sont toujours présentes
  const cardCountsAfter = {};
  a.forEach(card => {
    const key = `${card.r}${card.s}`;
    cardCountsAfter[key] = (cardCountsAfter[key] || 0) + 1;
  });
  
  const isFair = JSON.stringify(cardCounts) === JSON.stringify(cardCountsAfter);
  console.log(`✅ Mélange ${isFair ? 'ÉQUITABLE' : 'PROBLÉMATIQUE'}: toutes les cartes sont présentes`);
  
  // Afficher les premières cartes du deck mélangé
  console.log("🎯 Premières cartes du deck:", a.slice(0, 5).map(c => `${c.r}${c.s}`));
  
  return a;
}

export function handScore(cards: Card[]) {
  let total = 0, aces = 0;
  for (const c of cards) {
    if (c.r === "A") { aces++; total += 11; }
    else if (["T","J","Q","K"].includes(c.r)) total += 10;
    else total += parseInt(c.r, 10);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  const isBJ = cards.length === 2 && total === 21;
  
  // Calculer le total "soft" (avec As compté comme 1)
  let softTotal = total;
  if (aces > 0) {
    softTotal = total - (aces * 10); // Convertir tous les As en 1
  }
  
  return { 
    total, 
    soft: aces > 0, 
    isBJ, 
    isBust: total > 21,
    softTotal: softTotal !== total ? softTotal : undefined,
    aces: aces
  };
}

// Fonction pour vérifier l'équité du jeu
export function verifyGameFairness(shoe: Card[]): {
  isFair: boolean;
  totalCards: number;
  cardDistribution: Record<string, number>;
  expectedCount: number;
  warnings: string[];
} {
  const warnings = [];
  const cardDistribution = {};
  
  // Compter toutes les cartes
  shoe.forEach(card => {
    const key = `${card.r}${card.s}`;
    cardDistribution[key] = (cardDistribution[key] || 0) + 1;
  });
  
  const totalCards = shoe.length;
  const expectedCount = totalCards / 52; // Nombre de decks
  
  // Vérifier la distribution
  let isFair = true;
  Object.entries(cardDistribution).forEach(([card, count]) => {
    if (count !== expectedCount) {
      warnings.push(`⚠️ Carte ${card}: ${count} au lieu de ${expectedCount}`);
      isFair = false;
    }
  });
  
  // Vérifier le nombre total
  if (totalCards !== 52 * Math.ceil(totalCards / 52)) {
    warnings.push(`⚠️ Nombre total de cartes suspect: ${totalCards}`);
    isFair = false;
  }
  
  return {
    isFair,
    totalCards,
    cardDistribution,
    expectedCount,
    warnings
  };
}

export function dealerPlay(shoe: Card[], dealer: Card[]) {
  const dd = dealer.slice();
  while (true) {
    const s = handScore(dd);
    if (s.total < 17) dd.push(shoe.shift()!);
    else break; // stand on all 17
  }
  return { dealer: dd, shoe };
}

export function payoutOne(player: Hand, dealer: Card[]): number {
  const ps = handScore(player.cards);
  const ds = handScore(dealer);
  
  // CORRECTION : Gestion des mains soft
  let playerTotal = ps.total;
  
  // Si le joueur a une main soft et qu'elle dépasse 21, utiliser la valeur soft
  if (ps.isBust && ps.softTotal && ps.softTotal <= 21) {
    playerTotal = ps.softTotal;
    console.log(`🎯 Main soft utilisée pour le payout: ${ps.total} → ${playerTotal}`);
  }
  
  if (player.surrendered) return -player.bet / 2;
  if (ps.isBust && playerTotal > 21) return -player.bet; // Vraiment bust
  if (ps.isBJ && !ds.isBJ) return Math.floor(player.bet * 1.5);
  if (ds.isBJ && !ps.isBJ) return -player.bet;
  if (ds.isBust) return player.bet;
  if (playerTotal > ds.total) return player.bet;
  if (playerTotal < ds.total) return -player.bet;
  return 0;
}
