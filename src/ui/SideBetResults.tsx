import React from "react";
import { SideBetResult } from "../logic/sideBets";
import { CURRENCY } from "../config";

interface SideBetResultsProps {
  results: SideBetResult[];
  onClose: () => void;
}

export default function SideBetResults({ results, onClose }: SideBetResultsProps) {
  if (results.length === 0) return null;

  const totalPayout = results.reduce((sum, result) => sum + result.payout, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 border-purple-400 text-center max-w-2xl w-full shadow-2xl">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎰</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-purple-200">Résultats Side Bets</h3>
        
        {/* Résultats individuels */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {results.map((result, index) => (
            <div key={index} className="bg-black/40 backdrop-blur rounded-lg border-2 border-purple-500/50 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="text-purple-200 font-bold text-sm sm:text-base">{result.betName}</span>
                <span className="text-yellow-300 font-bold text-base sm:text-lg">
                  +{result.payout.toLocaleString('fr-FR')}{CURRENCY}
                </span>
              </div>
              
              <div className="text-gray-300 text-xs sm:text-sm mb-2">
                {result.combination}
              </div>
              
              <div className="text-green-400 text-xs sm:text-sm font-bold">
                {result.multiplier}:1 - {result.description}
              </div>
            </div>
          ))}
        </div>

        {/* Total des gains */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg font-bold text-lg sm:text-xl mb-4 sm:mb-6 border-2 border-green-400">
          🎉 TOTAL GAINS: +{totalPayout.toLocaleString('fr-FR')}{CURRENCY}
        </div>

        {/* Bouton fermer */}
        <button 
          onClick={onClose}
          className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition-colors shadow-lg hover:scale-105"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
