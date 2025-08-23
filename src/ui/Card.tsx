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
      <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-lg flex items-center justify-center">
        <div className="w-12 h-16 bg-blue-500 rounded border border-blue-300"></div>
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
      {/* Carte principale - style plus réaliste */}
      <div className={`w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-300 shadow-xl relative overflow-hidden ${isDoubled ? 'ring-4 ring-purple-500' : ''}`}>
        {/* Coin supérieur gauche */}
        <div className="absolute top-1 left-1 text-xs font-bold">
          <div className={getSuitColor(card.s)}>{getRankDisplay(card.r)}</div>
          <div className={getSuitColor(card.s)}>{getSuitSymbol(card.s)}</div>
        </div>
        
        {/* Coin inférieur droit (roté) */}
        <div className="absolute bottom-1 right-1 text-xs font-bold transform rotate-180">
          <div className={getSuitColor(card.s)}>{getRankDisplay(card.r)}</div>
          <div className={getSuitColor(card.s)}>{getSuitSymbol(card.s)}</div>
        </div>
        
        {/* Symbole central - plus grand et centré */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-3xl sm:text-4xl md:text-5xl font-bold ${getSuitColor(card.s)}`}>
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
