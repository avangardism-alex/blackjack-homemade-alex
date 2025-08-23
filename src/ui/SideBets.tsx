import React, { useState } from "react";
import { SideBetRule, TableRules } from "../config/sidebet.rules";
import { CURRENCY } from "../config";

interface SideBetsProps {
  tableRules: TableRules;
  onSideBetChange: (amount: number) => void;
  currentSideBetAmount: number;
  phase: string;
  dealerUpCard?: { r: string; s: string };
  canPlaceBets: boolean;
}

export default function SideBets({
  tableRules,
  onSideBetChange,
  currentSideBetAmount,
  phase,
  dealerUpCard,
  canPlaceBets
}: SideBetsProps) {
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

  // Vérifier si un side bet est disponible selon les règles
  const isBetAvailable = (rule: SideBetRule): boolean => {
    if (!canPlaceBets) return false;
    
    switch (rule.availability.type) {
      case "ALWAYS":
        return true;
      case "DEALER_UPCARD_IN":
        return dealerUpCard && rule.availability.ranks.includes(dealerUpCard.r);
      case "INSURANCE_ONLY":
        return dealerUpCard && dealerUpCard.r === "A";
      default:
        return false;
    }
  };

  // Formater le montant avec espaces
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR');
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-600/50 rounded-lg p-3 mb-3">
      <div className="text-center text-purple-200 text-base font-bold mb-3">
        🎰 SIDE BETS - {tableRules.name}
      </div>
      
      {/* Mise Side Bet Globale */}
      <div className="text-center mb-4">
        <div className="text-purple-200 text-sm mb-2">MISE SIDE BET GLOBALE</div>
        {currentSideBetAmount > 0 ? (
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-base mx-auto shadow-lg">
            {formatAmount(currentSideBetAmount)}{CURRENCY}
          </div>
        ) : (
          <div className="text-gray-400 text-xs">Aucune mise placée</div>
        )}
      </div>
      
      {/* Contrôles de mise globale */}
      {canPlaceBets && (
        <div className="text-center mb-4">
          <div className="text-purple-200 text-xs mb-2">AJOUTER À LA MISE GLOBALE :</div>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 5, 25, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => onSideBetChange(currentSideBetAmount + amount)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:scale-105 transition-all"
              >
                +{amount}
              </button>
            ))}
          </div>
          
          {currentSideBetAmount > 0 && (
            <button
              onClick={() => onSideBetChange(0)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-1 rounded text-xs font-bold hover:scale-105 transition-all"
            >
              🗑️ Effacer Mise Globale
            </button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tableRules.sideBets.map((rule) => {
          const isAvailable = isBetAvailable(rule);
          const isExpanded = expandedBet === rule.code;
          
          return (
            <div key={rule.code} className="bg-black/40 backdrop-blur rounded-lg border-2 border-purple-500/50 p-2">
              {/* En-tête du side bet */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-purple-200 font-bold text-xs">{rule.name}</h3>
                <button
                  onClick={() => setExpandedBet(isExpanded ? null : rule.code)}
                  className="text-purple-300 hover:text-purple-100 text-sm"
                >
                  {isExpanded ? "−" : "+"}
                </button>
              </div>

              {/* Indicateur de disponibilité */}
              {!isAvailable && (
                <div className="text-center text-gray-400 text-xs mb-2">
                  {rule.availability.type === "DEALER_UPCARD_IN" && 
                   `Disponible si croupier: ${rule.availability.ranks.join(", ")}`
                  }
                  {rule.availability.type === "INSURANCE_ONLY" && 
                   "Disponible si croupier: As"
                  }
                </div>
              )}

              {/* Détails des payouts (si développé) */}
              {isExpanded && (
                <div className="border-t border-purple-500/30 pt-2 mt-2">
                  <div className="text-purple-200 text-xs font-bold mb-1">PAYOUTS :</div>
                  <div className="space-y-1">
                    {rule.payouts.map((payout) => (
                      <div key={payout.key} className="flex justify-between text-xs">
                        <span className="text-gray-300">{payout.label}:</span>
                        <span className="text-yellow-300 font-bold">{payout.multiplier}:1</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Description détaillée */}
                  <div className="mt-2 text-gray-400 text-xs">
                    <div className="font-bold mb-1">RÈGLES :</div>
                    {rule.payouts.map((payout) => (
                      <div key={payout.key} className="mb-1">
                        <span className="text-yellow-300">{payout.label}</span>
                        {payout.description && (
                          <span className="text-gray-400"> - {payout.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statut de disponibilité */}
              <div className={`text-center text-xs mt-1 ${
                isAvailable ? 'text-green-400' : 'text-gray-500'
              }`}>
                {isAvailable ? '✅ Disponible' : '❌ Non disponible'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé des side bets */}
      {currentSideBetAmount > 0 && (
        <div className="mt-4 text-center">
          <div className="text-purple-200 text-sm font-bold mb-2">
            MISE SIDE BET GLOBALE: {formatAmount(currentSideBetAmount)}{CURRENCY}
          </div>
          <div className="text-purple-300 text-xs">
            Cette mise s'applique à TOUS les side bets disponibles
          </div>
        </div>
      )}
    </div>
  );
}
