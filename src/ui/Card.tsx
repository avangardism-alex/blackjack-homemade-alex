import React from "react";

interface CardProps {
  card: { r: string; s: string };
  hidden?: boolean;
  sideBets?: {
    perfectPairs: number;
    pairPlus: number;
  };
  isDoubled?: boolean;
}

export default function Card({ card, hidden, sideBets, isDoubled }: CardProps) {
  if (hidden) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-lg flex items-center justify-center">
        <div className="w-16 h-20 bg-blue-500 rounded border border-blue-300"></div>
      </div>
    );
  }

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "H": return "♥";
      case "D": return "♦";
      case "C": return "♣";
      case "S": return "♠";
      default: return suit;
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === "H" || suit === "D" ? "text-red-600" : "text-black";
  };

  const getRankDisplay = (rank: string) => {
    switch (rank) {
      case "A": return "A";
      case "K": return "K";
      case "Q": return "Q";
      case "J": return "J";
      case "T": return "10";
      default: return rank;
    }
  };

  return (
    <div className="relative">
      {/* Carte principale - GROSSIE pour desktop */}
      <div className={`w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-300 shadow-xl relative overflow-hidden ${isDoubled ? 'ring-4 ring-purple-500' : ''}`}>
        {/* Coin supérieur gauche - PLUS GROS */}
        <div className="absolute top-2 left-2 text-sm sm:text-base font-bold">
          <div className={getSuitColor(card.s)}>{getRankDisplay(card.r)}</div>
          <div className={getSuitColor(card.s)}>{getSuitSymbol(card.s)}</div>
        </div>
        
        {/* Coin inférieur droit (roté) - PLUS GROS */}
        <div className="absolute bottom-2 right-2 text-sm sm:text-base font-bold transform rotate-180">
          <div className={getSuitColor(card.s)}>{getRankDisplay(card.r)}</div>
          <div className={getSuitColor(card.s)}>{getSuitSymbol(card.s)}</div>
        </div>
        
        {/* Symbole central - BEAUCOUP PLUS GROS */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold ${getSuitColor(card.s)}`}>
            {getSuitSymbol(card.s)}
          </div>
        </div>
        
        {/* Indicateur de double down */}
        {isDoubled && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
            DOUBLE
          </div>
        )}
      </div>
      
      {/* Side bets si présents */}
      {sideBets && (sideBets.perfectPairs > 0 || sideBets.pairPlus > 0) && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
          🎰
        </div>
      )}
    </div>
  );
}
