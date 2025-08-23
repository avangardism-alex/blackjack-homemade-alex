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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 text-white p-8 rounded-2xl border-2 border-purple-400 text-center max-w-2xl w-full mx-4 shadow-2xl">
        <div className="text-4xl mb-4">🎰</div>
        <h3 className="text-2xl font-bold mb-6 text-purple-200">Résultats Side Bets</h3>
        
        {/* Résultats individuels */}
        <div className="space-y-4 mb-6">
          {results.map((result, index) => (
            <div key={index} className="bg-black/40 backdrop-blur rounded-lg border-2 border-purple-500/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200 font-bold">{result.betName}</span>
                <span className="text-yellow-300 font-bold text-lg">
                  +{result.payout.toLocaleString('fr-FR')}{CURRENCY}
                </span>
              </div>
              
              <div className="text-gray-300 text-sm mb-2">
                {result.combination}
              </div>
              
              <div className="text-green-400 text-sm font-bold">
                {result.multiplier}:1 - {result.description}
              </div>
            </div>
          ))}
        </div>

        {/* Total des gains */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg font-bold text-xl mb-6 border-2 border-green-400">
          🎉 TOTAL GAINS: +{totalPayout.toLocaleString('fr-FR')}{CURRENCY}
        </div>

        {/* Bouton fermer */}
        <button 
          onClick={onClose}
          className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
