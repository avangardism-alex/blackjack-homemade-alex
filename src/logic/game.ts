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
  for (let i = a.length - 1; i > 0; i--) {
    const u = (globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0] ?? Math.floor(Math.random()*2**32)) / 2**32;
    const j = Math.floor(u * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
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
  return { total, soft: aces > 0, isBJ, isBust: total > 21 };
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
  if (player.surrendered) return -player.bet / 2;
  if (ps.isBust) return -player.bet;
  if (ps.isBJ && !ds.isBJ) return Math.floor(player.bet * 1.5);
  if (ds.isBJ && !ps.isBJ) return -player.bet;
  if (ds.isBust) return player.bet;
  if (ps.total > ds.total) return player.bet;
  if (ps.total < ds.total) return -player.bet;
  return 0;
}
