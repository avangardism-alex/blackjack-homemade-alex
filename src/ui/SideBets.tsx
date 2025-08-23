import React, { useState } from "react";
import { SideBetRule, TableRules } from "../config/sidebet.rules";
import { CURRENCY } from "../config";

interface SideBetsProps {
  tableRules: TableRules;
  onSideBetChange: (betCode: string, amount: number) => void;
  currentSideBets: Record<string, number>;
  phase: string;
  dealerUpCard?: { r: string; s: string };
  canPlaceBets: boolean;
}

export default function SideBets({
  tableRules,
  onSideBetChange,
  currentSideBets,
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
    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-600/50 rounded-lg p-4 mb-4">
      <div className="text-center text-purple-200 text-lg font-bold mb-4">
        🎰 SIDE BETS - {tableRules.name}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableRules.sideBets.map((rule) => {
          const isAvailable = isBetAvailable(rule);
          const currentAmount = currentSideBets[rule.code] || 0;
          const isExpanded = expandedBet === rule.code;
          
          return (
            <div key={rule.code} className="bg-black/40 backdrop-blur rounded-lg border-2 border-purple-500/50 p-3">
              {/* En-tête du side bet */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-purple-200 font-bold text-sm">{rule.name}</h3>
                <button
                  onClick={() => setExpandedBet(isExpanded ? null : rule.code)}
                  className="text-purple-300 hover:text-purple-100 text-lg"
                >
                  {isExpanded ? "−" : "+"}
                </button>
              </div>

              {/* Montant actuel */}
              {currentAmount > 0 && (
                <div className="text-center mb-3">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                    {formatAmount(currentAmount)}{CURRENCY}
                  </div>
                  <div className="text-purple-200 text-xs mt-1">Mise actuelle</div>
                </div>
              )}

              {/* Contrôles de mise */}
              {isAvailable && (
                <div className="space-y-2 mb-3">
                  {/* Boutons de mise rapide */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 5, 25].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onSideBetChange(rule.code, currentAmount + amount)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-2 py-1 rounded text-xs font-bold hover:scale-105 transition-all"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                  
                  {/* Bouton effacer */}
                  {currentAmount > 0 && (
                    <button
                      onClick={() => onSideBetChange(rule.code, 0)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:scale-105 transition-all"
                    >
                      🗑️ Effacer
                    </button>
                  )}
                </div>
              )}

              {/* Indicateur de disponibilité */}
              {!isAvailable && (
                <div className="text-center text-gray-400 text-xs mb-3">
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
                <div className="border-t border-purple-500/30 pt-3 mt-3">
                  <div className="text-purple-200 text-xs font-bold mb-2">PAYOUTS :</div>
                  <div className="space-y-1">
                    {rule.payouts.map((payout) => (
                      <div key={payout.key} className="flex justify-between text-xs">
                        <span className="text-gray-300">{payout.label}:</span>
                        <span className="text-yellow-300 font-bold">{payout.multiplier}:1</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Description détaillée */}
                  <div className="mt-3 text-gray-400 text-xs">
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
              <div className={`text-center text-xs mt-2 ${
                isAvailable ? 'text-green-400' : 'text-gray-500'
              }`}>
                {isAvailable ? '✅ Disponible' : '❌ Non disponible'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé des mises */}
      {Object.keys(currentSideBets).length > 0 && (
        <div className="mt-4 text-center">
          <div className="text-purple-200 text-sm font-bold mb-2">
            TOTAL SIDE BETS: {formatAmount(
              Object.values(currentSideBets).reduce((sum, amount) => sum + amount, 0)
            )}{CURRENCY}
          </div>
        </div>
      )}
    </div>
  );
}
