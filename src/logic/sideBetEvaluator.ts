import { evaluateSideBet, SideBetResult } from "./sideBets";
import { SideBetRule, TableRules } from "../config/sidebet.rules";
import { Card } from "./game";

// Évaluateur de side bets pour le store
export class SideBetEvaluator {
  
  // Évaluer tous les side bets actifs selon la phase du jeu
  static evaluateSideBets(
    sideBetAmount: number, // Une seule mise pour tous les side bets
    tableRules: TableRules,
    playerCards: Card[],
    dealerCards: Card[],
    phase: string
  ): SideBetResult[] {
    const results: SideBetResult[] = [];
    
    if (sideBetAmount <= 0) return results;
    
    // Parcourir tous les side bets disponibles
    for (const rule of tableRules.sideBets) {
      // Vérifier si c'est le bon moment pour évaluer
      if (this.shouldEvaluateNow(rule, phase)) {
        const evaluation = evaluateSideBet(rule.code, playerCards, dealerCards, rule);
        
        if (evaluation.isWin && evaluation.result) {
          // Calculer le payout avec la mise globale
          const payout = sideBetAmount * evaluation.result.multiplier;
          
          // Créer le résultat final
          const result: SideBetResult = {
            ...evaluation.result,
            amount: sideBetAmount,
            payout
          };
          
          results.push(result);
        }
      }
    }
    
    return results;
  }
  
  // Déterminer si un side bet doit être évalué maintenant
  private static shouldEvaluateNow(rule: SideBetRule, phase: string): boolean {
    switch (rule.settlePhase) {
      case "DEALT":
        return phase === "dealing" || phase === "player" || phase === "dealer";
      case "DEALER_TURN":
        return phase === "dealer" || phase === "payout";
      case "IMMEDIATE":
        return phase === "dealing";
      default:
        return false;
    }
  }
  
  // Vérifier si un side bet est disponible selon les conditions
  static isSideBetAvailable(
    rule: SideBetRule,
    dealerUpCard?: Card,
    canPlaceBets: boolean = true
  ): boolean {
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
  }
  
  // Calculer le total des side bets actifs
  static getTotalSideBets(sideBetAmount: number): number {
    return sideBetAmount;
  }
  
  // Vérifier si un joueur peut placer un side bet
  static canPlaceSideBet(
    amount: number,
    currentSideBetAmount: number,
    tableRules: TableRules,
    bank: number
  ): boolean {
    const newAmount = currentSideBetAmount + amount;
    
    // Vérifier que le joueur a assez d'argent
    if (newAmount > bank) return false;
    
    return true;
  }
}
