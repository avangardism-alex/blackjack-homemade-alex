// Configuration des Side Bets - Règles exactes par table
export type StraightRule = "A_low_only" | "A_high_or_low" | "wrap_allowed";
export type DealerSoft17 = "HIT" | "STAND";

export type SideBetPayout = { 
  key: string; 
  label: string; 
  multiplier: number;
  description?: string;
};

export type AvailabilityRule =
  | { type: "ALWAYS" }
  | { type: "DEALER_UPCARD_IN"; ranks: string[] }
  | { type: "INSURANCE_ONLY" };

export type SideBetRule = {
  code: "PERFECT_PAIRS" | "TWENTY_ONE_PLUS_THREE" | "LUCKY_LADIES" | "BUST_IT" | "INSURANCE";
  name: string;
  min: number; 
  max: number; 
  step: number;
  availability: AvailabilityRule;
  settlePhase: "DEALT" | "DEALER_TURN" | "IMMEDIATE";
  details: Record<string, any>;
  payouts: SideBetPayout[];
};

export type TableRules = {
  name: string;
  decks: number;
  dealerSoft17: DealerSoft17;
  straightRule: StraightRule;
  sideBets: SideBetRule[];
};

// Table classique 6-decks (payouts standards)
export const CLASSIC_TABLE: TableRules = {
  name: "Classic 6-Deck",
  decks: 6,
  dealerSoft17: "HIT",
  straightRule: "A_high_or_low",
  sideBets: [
    {
      code: "PERFECT_PAIRS",
      name: "Perfect Pairs",
      min: 1, 
      max: 100, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: {},
      payouts: [
        { key: "perfect", label: "Perfect Pair", multiplier: 25, description: "Même rang et même suit (ex: Q♥ + Q♥)" },
        { key: "colored", label: "Colored Pair", multiplier: 12, description: "Même rang, même couleur, suit différent (ex: Q♥ + Q♦)" },
        { key: "mixed", label: "Mixed Pair", multiplier: 6, description: "Même rang, couleur différente (ex: Q♥ + Q♠)" },
      ],
    },
    {
      code: "TWENTY_ONE_PLUS_THREE",
      name: "21+3",
      min: 1, 
      max: 100, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: { straightRuleOverride: "A_high_or_low" },
      payouts: [
        { key: "suited_trips", label: "Suited Trips", multiplier: 40, description: "Même rang et même suit (3 cartes)" },
        { key: "straight_flush", label: "Straight Flush", multiplier: 30, description: "Suite de même couleur" },
        { key: "trips", label: "Trips", multiplier: 20, description: "Brelan (même rang)" },
        { key: "straight", label: "Straight", multiplier: 10, description: "Suite (A-2-3 ou Q-K-A autorisés)" },
        { key: "flush", label: "Flush", multiplier: 5, description: "3 cartes de même couleur" },
      ],
    },
    {
      code: "LUCKY_LADIES",
      name: "Lucky Ladies",
      min: 1, 
      max: 100, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: { dealerBJBonus: false },
      payouts: [
        { key: "qq_hearts", label: "QQ of Hearts", multiplier: 200, description: "Q♥ + Q♥ (Dames de cœur assorties)" },
        { key: "matched_20", label: "Matched 20", multiplier: 25, description: "Même rang et même suit = 20" },
        { key: "suited_20", label: "Suited 20", multiplier: 10, description: "Même couleur = 20" },
        { key: "any_20", label: "Any 20", multiplier: 4, description: "N'importe quelle combinaison = 20" },
      ],
    },
    {
      code: "BUST_IT",
      name: "Bust It",
      min: 1, 
      max: 100, 
      step: 1,
      availability: { type: "DEALER_UPCARD_IN", ranks: ["2","3","4","5","6"] },
      settlePhase: "DEALER_TURN",
      details: { bonusOnTenValueThirdCard: false },
      payouts: [
        { key: "bust_7", label: "Bust with 7 cards", multiplier: 25, description: "Croupier bust avec 7 cartes" },
        { key: "bust_6", label: "Bust with 6 cards", multiplier: 15, description: "Croupier bust avec 6 cartes" },
        { key: "bust_5", label: "Bust with 5 cards", multiplier: 10, description: "Croupier bust avec 5 cartes" },
        { key: "bust_4", label: "Bust with 4 cards", multiplier: 6, description: "Croupier bust avec 4 cartes" },
        { key: "bust_3", label: "Bust with 3 cards", multiplier: 3, description: "Croupier bust avec 3 cartes" },
      ],
    },
    {
      code: "INSURANCE",
      name: "Insurance",
      min: 1, 
      max: 99999, 
      step: 1,
      availability: { type: "INSURANCE_ONLY" },
      settlePhase: "IMMEDIATE",
      details: { maxShareOfMainBet: 0.5 },
      payouts: [
        { key: "insurance", label: "Insurance 2:1", multiplier: 2, description: "Contre Blackjack du croupier" }
      ],
    },
  ],
};

// Table haute rémunération (payouts premium)
export const PREMIUM_TABLE: TableRules = {
  name: "Premium 8-Deck",
  decks: 8,
  dealerSoft17: "HIT",
  straightRule: "A_high_or_low",
  sideBets: [
    {
      code: "PERFECT_PAIRS",
      name: "Perfect Pairs",
      min: 1, 
      max: 200, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: {},
      payouts: [
        { key: "perfect", label: "Perfect Pair", multiplier: 30, description: "Même rang et même suit" },
        { key: "colored", label: "Colored Pair", multiplier: 15, description: "Même rang, même couleur" },
        { key: "mixed", label: "Mixed Pair", multiplier: 8, description: "Même rang, couleur différente" },
      ],
    },
    {
      code: "TWENTY_ONE_PLUS_THREE",
      name: "21+3",
      min: 1, 
      max: 200, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: { straightRuleOverride: "A_high_or_low" },
      payouts: [
        { key: "suited_trips", label: "Suited Trips", multiplier: 100, description: "Même rang et même suit" },
        { key: "straight_flush", label: "Straight Flush", multiplier: 40, description: "Suite de même couleur" },
        { key: "trips", label: "Trips", multiplier: 25, description: "Brelan" },
        { key: "straight", label: "Straight", multiplier: 15, description: "Suite" },
        { key: "flush", label: "Flush", multiplier: 8, description: "3 cartes de même couleur" },
      ],
    },
    {
      code: "LUCKY_LADIES",
      name: "Lucky Ladies",
      min: 1, 
      max: 200, 
      step: 1,
      availability: { type: "ALWAYS" },
      settlePhase: "DEALT",
      details: { dealerBJBonus: true },
      payouts: [
        { key: "qq_hearts", label: "QQ of Hearts", multiplier: 1000, description: "Q♥ + Q♥ + Dealer BJ" },
        { key: "matched_20", label: "Matched 20", multiplier: 30, description: "Même rang et même suit = 20" },
        { key: "suited_20", label: "Suited 20", multiplier: 15, description: "Même couleur = 20" },
        { key: "any_20", label: "Any 20", multiplier: 6, description: "N'importe quelle combinaison = 20" },
      ],
    },
    {
      code: "BUST_IT",
      name: "Bust It",
      min: 1, 
      max: 200, 
      step: 1,
      availability: { type: "ALWAYS" }, // Pas de restriction upcard
      settlePhase: "DEALER_TURN",
      details: { bonusOnTenValueThirdCard: true },
      payouts: [
        { key: "bust_7", label: "Bust with 7 cards", multiplier: 50, description: "Bust avec 7 cartes" },
        { key: "bust_6", label: "Bust with 6 cards", multiplier: 25, description: "Bust avec 6 cartes" },
        { key: "bust_5", label: "Bust with 5 cards", multiplier: 15, description: "Bust avec 5 cartes" },
        { key: "bust_4", label: "Bust with 4 cards", multiplier: 10, description: "Bust avec 4 cartes" },
        { key: "bust_3", label: "Bust with 3 cards", multiplier: 5, description: "Bust avec 3 cartes" },
      ],
    },
    {
      code: "INSURANCE",
      name: "Insurance",
      min: 1, 
      max: 99999, 
      step: 1,
      availability: { type: "INSURANCE_ONLY" },
      settlePhase: "IMMEDIATE",
      details: { maxShareOfMainBet: 0.5 },
      payouts: [
        { key: "insurance", label: "Insurance 2:1", multiplier: 2, description: "Contre Blackjack du croupier" }
      ],
    },
  ],
};

// Export des tables disponibles
export const AVAILABLE_TABLES = {
  classic: CLASSIC_TABLE,
  premium: PREMIUM_TABLE,
};

export type TableType = keyof typeof AVAILABLE_TABLES;
