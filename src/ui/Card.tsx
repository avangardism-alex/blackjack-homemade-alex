import React from "react";
import type { Card as TCard } from "../logic/game";

const suitMap: Record<TCard["s"], string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const isRed = (s: TCard["s"]) => s === "H" || s === "D";

const getCardDisplay = (rank: string) => {
  switch (rank) {
    case "T": return "10";
    case "J": return "J";
    case "Q": return "Q";
    case "K": return "K";
    case "A": return "A";
    default: return rank;
  }
};

export default function Card({ card, hidden = false }: { card?: TCard; hidden?: boolean }) {
  if (hidden) return <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 rounded-lg bg-slate-700 card-shadow border border-slate-600" />;
  if (!card) return <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20" />;
  return (
    <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 rounded-lg bg-white card-shadow border border-slate-200 flex flex-col justify-between p-1 transition-transform hover:scale-105">
      <div className={`text-sm font-bold ${isRed(card.s) ? "text-red-600" : "text-slate-900"}`}>{getCardDisplay(card.r)}</div>
      <div className={`text-lg text-center ${isRed(card.s) ? "text-red-600" : "text-slate-900"}`}>{suitMap[card.s]}</div>
      <div className={`text-sm self-end font-bold ${isRed(card.s) ? "text-red-600" : "text-slate-900"}`}>{getCardDisplay(card.r)}</div>
    </div>
  );
}
